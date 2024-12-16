import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { HotelCrawlReview, ReviewReplyHotel } from '@prisma/client';
import { CreateHotelReviewDto } from 'src/modules/hotel-comment/dto/create-hotel-review.dto';
import { HotelReviewWithUserDto } from 'src/modules/hotel-comment/dto/reply.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class HotelCommentService {
  constructor(private prismaService: PrismaService) {}

  async getHotelReviews(
    hotelCrawlId: string,
  ): Promise<{ data: HotelReviewWithUserDto[]; total: number }> {
    const reviews = await this.prismaService.hotelCrawlReview.findMany({
      where: {
        hotelCrawlId,
      },
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

    const totalReview = await this.prismaService.hotelCrawlReview.count({
      where: {
        hotelCrawlId,
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
      total: totalReview,
    };
  }
  async addReviewToHotel(
    hotelCrawlId: string,
    data: CreateHotelReviewDto,
    userId: string,
  ): Promise<HotelCrawlReview> {
    const booking = await this.prismaService.booking.findFirst({
      where: {
        userId,
        hotelCrawlId,
        status: 'CONFIRMED',
      },
    });
    console.log('booking:', booking);

    if (!booking) {
      throw new ForbiddenException('You are not allowed to review this hotel');
    }

    // Thêm review nếu user đã mua hotel
    return this.prismaService.hotelCrawlReview.create({
      data: {
        content: data.content,
        rating: data.rating,
        hotelCrawls: {
          connect: { id: hotelCrawlId },
        },
        users: {
          connect: { id: userId },
        },
      },
    });
  }

  async updateHotelReview(
    reviewId: string,
    data: CreateHotelReviewDto,
  ): Promise<HotelCrawlReview> {
    return this.prismaService.hotelCrawlReview.update({
      where: {
        id: reviewId,
      },
      data: {
        ...data,
        updateAt: new Date(),
      },
    });
  }

  async deleteHotelReview(
    hotelCrawlId: string,
    reviewId: string,
    userId: string,
  ): Promise<{ message: string }> {
    const hotel = await this.prismaService.hotelCrawl.findUnique({
      where: { id: hotelCrawlId },
    });

    if (!hotel) {
      throw new NotFoundException('Hotel not found');
    }

    const review = await this.prismaService.hotelCrawlReview.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== userId && hotel.userId !== userId) {
      throw new ForbiddenException('You are not allowed to delete this review');
    }

    await this.prismaService.hotelCrawlReview.delete({
      where: {
        id: reviewId,
      },
    });
    return { message: 'Review deleted successfully' };
  }

  // Review reply

  async addReplyToReview(
    reviewId: string,
    content: string,
    userId: string,
  ): Promise<ReviewReplyHotel> {
    return this.prismaService.reviewReplyHotel.create({
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

  async getRepliesForReview(
    reviewId: string,
  ): Promise<{ data: ReviewReplyHotel[] }> {
    const replyRview = await this.prismaService.reviewReplyHotel.findMany({
      where: {
        reviewId,
      },
      orderBy: {
        createAt: 'desc',
      },
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
      data: replyRview,
    };
  }

  async addReplyToReply(
    parentReplyId: string,
    content: string,
    userId: string,
  ): Promise<ReviewReplyHotel> {
    const parentReply = await this.prismaService.reviewReplyHotel.findUnique({
      where: { id: parentReplyId },
    });

    if (!parentReply) {
      throw new NotFoundException('Parent reply not found');
    }

    return this.prismaService.reviewReplyHotel.create({
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
