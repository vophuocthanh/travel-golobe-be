import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Airline,
  Flight,
  FlightCrawlReview,
  Prisma,
  ReviewReplyFlight,
} from '@prisma/client';
import { CreateFlightReviewDto } from 'src/modules/flight-comment/dto/create-flight-review.dto';
import { FlightReviewWithUserDto } from 'src/modules/flight-comment/dto/reply.dto';
import { UpdateFlightReviewDto } from 'src/modules/flight-comment/dto/update-flight-review.dto';
import {
  AirlineDto,
  AirlinePaginationResponseType,
  AirlineTypeDto,
} from 'src/modules/flight/dto/airline.dto';
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

  // Airline
  async getAirlines(
    filters: AirlineTypeDto,
  ): Promise<AirlinePaginationResponseType> {
    const itemsPerPage = Number(filters.items_per_page) || 10;
    const page = Number(filters.page) || 1;
    const search = filters.search || '';
    const skip = (page - 1) * itemsPerPage;

    const whereConditions: Prisma.AirlineWhereInput = {
      OR: [
        {
          name: {
            contains: search,
            mode: 'insensitive', // Optional: case-insensitive search
          },
        },
      ],
    };

    // Fetch airlines with pagination and filtering
    const airlines = await this.prismaService.airline.findMany({
      take: itemsPerPage,
      skip,
      where: whereConditions,
      orderBy: {
        createAt: 'desc', // Sort by creation date in descending order
      },
    });

    // Get total count of airlines matching the filter conditions
    const total = await this.prismaService.airline.count({
      where: whereConditions,
    });

    return {
      data: airlines,
      total,
      currentPage: page,
      itemsPerPage,
    };
  }

  async createAirline(data: AirlineDto): Promise<Airline> {
    return this.prismaService.airline.create({
      data: {
        ...data,
      },
    });
  }

  async filterFlights(
    airlineId?: string,
    minPrice?: number,
    maxPrice?: number,
    minRating?: number,
  ): Promise<Flight[]> {
    const whereConditions: Prisma.FlightWhereInput = {};

    if (airlineId) {
      whereConditions.airlineId = airlineId;
    }

    if (minPrice !== undefined && maxPrice !== undefined) {
      whereConditions.price = {
        gte: minPrice,
        lte: maxPrice,
      };
    }

    if (minRating !== undefined && minRating > 0) {
      whereConditions.rating = {
        gte: minRating,
      };
    }

    return this.prismaService.flight.findMany({
      where: whereConditions,
    });
  }
}
