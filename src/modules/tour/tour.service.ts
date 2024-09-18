import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReviewReplyTour, Tour, TourReview } from '@prisma/client';
import { CreateTourReviewDto } from 'src/modules/tour/dto/create-tour-review.dto';
import { CreateDtoTour } from 'src/modules/tour/dto/create.dto';
import {
  TourDto,
  TourPaginationResponseType,
} from 'src/modules/tour/dto/tour.dto';
import { UpdateDtoTour } from 'src/modules/tour/dto/update.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TourService {
  constructor(private prismaService: PrismaService) {}

  async getTours(filters: TourDto): Promise<TourPaginationResponseType> {
    const items_per_page = Number(filters.items_per_page) || 10;
    const page = Number(filters.page) || 1;
    const search = filters.search || '';
    const skip = page > 1 ? (page - 1) * items_per_page : 0;

    const tours = await this.prismaService.tour.findMany({
      take: items_per_page,
      skip,
      where: {
        OR: [
          {
            name: {
              contains: search,
            },
          },
        ],
      },
      orderBy: {
        createAt: 'desc',
      },
    });

    const total = await this.prismaService.tour.count({
      where: {
        OR: [
          {
            name: {
              contains: search,
            },
          },
        ],
      },
    });

    return {
      data: tours,
      total,
      currentPage: page,
      itemsPerPage: items_per_page,
    };
  }

  async getTourById(id: string) {
    return this.prismaService.tour.findUnique({
      where: {
        id,
      },
    });
  }

  async createTours(data: CreateDtoTour, userId: string): Promise<Tour> {
    return this.prismaService.tour.create({
      data: {
        ...data,
        userId,
        price: data.price.toString(),
        location: {
          connect: { id: data.location },
        },
        images: { set: data.image.split(',') },
      },
    });
  }

  async updateTour(id: string, data: UpdateDtoTour): Promise<Tour> {
    return this.prismaService.tour.update({
      where: {
        id,
      },
      data: {
        ...data,
        price: data.price.toString(),
        location: {
          connect: { id: data.location },
        },
        images: { set: data.image.split(',') },
      },
    });
  }

  async deleteTour(id: string): Promise<{ message: string }> {
    await this.prismaService.tour.delete({
      where: {
        id,
      },
    });
    return { message: 'Tour deleted successfully' };
  }

  async findToursByLocation(startLocation: string, endLocation: string) {
    return this.prismaService.tour.findMany({
      where: {
        startLocation,
        endLocation,
      },
    });
  }

  // Review

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

  async getTourReviews(tourId: string): Promise<{ data: TourReview[] }> {
    const reviews = await this.prismaService.tourReview.findMany({
      where: {
        tourId,
      },
      orderBy: {
        createAt: 'desc',
      },
    });
    return {
      data: reviews,
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
