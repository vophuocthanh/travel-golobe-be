import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FlightCrawlReview, ReviewReplyFlight } from '@prisma/client';
import { CreateFlightReviewDto } from 'src/modules/flight-comment/dto/create-flight-review.dto';
import { FlightReviewWithUserDto } from 'src/modules/flight-comment/dto/reply.dto';
import { UpdateFlightReviewDto } from 'src/modules/flight-comment/dto/update-flight-review.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class FlightCommentService {
  constructor(private prismaService: PrismaService) {}

  async addReviewToFlight(
    flightCrawlId: string,
    createFlightReviewDto: CreateFlightReviewDto,
    userId: string,
  ): Promise<FlightReviewWithUserDto> {
    const review = await this.prismaService.flightCrawlReview.create({
      data: {
        ...createFlightReviewDto,
        flightCrawlId,
        userId,
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return {
      id: review.id,
      content: review.content,
      rating: review.rating,
      createdAt: review.createAt,
      user: review.users,
    };
  }

  async getFlightReviews(
    flightCrawlId: string,
  ): Promise<{ data: FlightReviewWithUserDto[] }> {
    const reviews = await this.prismaService.flightCrawlReview.findMany({
      where: { flightCrawlId },
      orderBy: { createAt: 'desc' },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    const reviewWithUser = reviews.map((review) => ({
      id: review.id,
      content: review.content,
      rating: review.rating,
      createdAt: review.createAt,
      user: review.users,
    }));

    return {
      data: reviewWithUser,
    };
  }

  async updateFlightReview(
    reviewId: string,
    data: UpdateFlightReviewDto,
  ): Promise<FlightCrawlReview> {
    return this.prismaService.flightCrawlReview.update({
      where: {
        id: reviewId,
      },
      data: {
        ...data,
        updateAt: new Date(),
      },
    });
  }

  async deleteFlightReview(
    flightCrawlId: string,
    reviewId: string,
    userId: string,
  ): Promise<{ message: string }> {
    const flight = await this.prismaService.flightCrawl.findUnique({
      where: { id: flightCrawlId },
    });

    if (!flight) {
      throw new NotFoundException('Flight not found');
    }

    if (flight.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this review',
      );
    }

    await this.prismaService.flightCrawlReview.delete({
      where: { id: reviewId },
    });
    return { message: 'Review deleted successfully' };
  }

  // Reply review

  async addReplyToReview(
    reviewId: string,
    content: string,
    userId: string,
  ): Promise<ReviewReplyFlight> {
    return this.prismaService.reviewReplyFlight.create({
      data: {
        content,
        review: {
          connect: { id: reviewId },
        },
        user: {
          connect: { id: userId },
        },
      },
    });
  }

  // Function to get replies for a specific review
  async getRepliesForReview(
    reviewId: string,
  ): Promise<{ data: ReviewReplyFlight[] }> {
    const replyReview = await this.prismaService.reviewReplyFlight.findMany({
      where: { reviewId },
      orderBy: { createAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
    return {
      data: replyReview,
    };
  }

  // Function to add reply to a reply
  async addReplyToReply(
    parentReplyId: string,
    content: string,
    userId: string,
  ): Promise<ReviewReplyFlight> {
    const parentReply = await this.prismaService.reviewReplyFlight.findUnique({
      where: { id: parentReplyId },
    });

    if (!parentReply) {
      throw new NotFoundException('Parent reply not found');
    }

    return this.prismaService.reviewReplyFlight.create({
      data: {
        content,
        review: {
          connect: { id: parentReply.reviewId },
        },
        parentReply: {
          connect: { id: parentReplyId },
        },
        user: {
          connect: { id: userId },
        },
      },
    });
  }
}
