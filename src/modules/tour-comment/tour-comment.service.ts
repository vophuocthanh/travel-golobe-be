import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReviewReplyTour, TourReview } from '@prisma/client';
import { CreateTourReviewDto } from 'src/modules/tour-comment/dto/create-tour-review.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TourCommentService {
  constructor(private prismaService: PrismaService) {}

  async addReviewToTour(
    tourId: string,
    data: CreateTourReviewDto,
    userId: string,
  ): Promise<TourReview> {
    return this.prismaService.tourReview.create({
      data: {
        content: data.content,
        rating: data.rating,
        tours: {
          connect: { id: tourId },
        },
        users: {
          connect: { id: userId },
        },
      },
    });
  }

  async getTourReviews(
    tourId: string,
  ): Promise<{ data: TourReview[]; total: number }> {
    const reviews = await this.prismaService.tourReview.findMany({
      where: {
        tourId,
      },
      orderBy: {
        createAt: 'desc',
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

    const total = await this.prismaService.tourReview.count({
      where: {
        tourId,
      },
    });
    return {
      data: reviews,
      total,
    };
  }

  async updateTourReview(
    reviewId: string,
    data: CreateTourReviewDto,
  ): Promise<TourReview> {
    return this.prismaService.tourReview.update({
      where: {
        id: reviewId,
      },
      data: {
        ...data,
        updateAt: new Date(),
      },
    });
  }

  async deleteTourReview(
    tourId: string,
    reviewId: string,
    userId: string,
  ): Promise<{ message: string }> {
    const tour = await this.prismaService.tour.findUnique({
      where: { id: tourId },
    });

    if (!tour) {
      throw new NotFoundException('Tour not found');
    }

    if (tour.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this review',
      );
    }

    await this.prismaService.tourReview.delete({
      where: { id: reviewId },
    });
    return { message: 'Review deleted successfully' };
  }

  // Reply review
  async getRepliesForReview(
    reviewId: string,
  ): Promise<{ data: ReviewReplyTour[] }> {
    const replyReview = await this.prismaService.reviewReplyTour.findMany({
      where: {
        reviewId,
      },
      orderBy: {
        createAt: 'desc',
      },
    });
    return {
      data: replyReview,
    };
  }

  async addReplyToReview(
    reviewId: string,
    content: string,
    userId: string,
  ): Promise<ReviewReplyTour> {
    return this.prismaService.reviewReplyTour.create({
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

  async addReplyToReply(
    parentReplyId: string,
    content: string,
    userId: string,
  ): Promise<ReviewReplyTour> {
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
