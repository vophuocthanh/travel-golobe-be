import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { HotelReview, ReviewReplyHotel } from '@prisma/client';
import { CreateHotelReviewDto } from 'src/modules/hotel-comment/dto/create-hotel-review.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class HotelCommentService {
  constructor(private prismaService: PrismaService) {}

  async getHotelReviews(hotelId: string): Promise<{ data: HotelReview[] }> {
    const reviews = await this.prismaService.hotelReview.findMany({
      where: {
        hotelId,
      },
      orderBy: {
        createAt: 'desc',
      },
    });

    return {
      data: reviews,
    };
  }

  async addReviewToHotel(
    hotelId: string,
    data: CreateHotelReviewDto,
    userId: string,
  ): Promise<HotelReview> {
    return this.prismaService.hotelReview.create({
      data: {
        content: data.content,
        rating: data.rating,
        hotels: {
          connect: { id: hotelId },
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
  ): Promise<HotelReview> {
    return this.prismaService.hotelReview.update({
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
    hotelId: string,
    reviewId: string,
    userId: string,
  ): Promise<{ message: string }> {
    const hotel = await this.prismaService.hotel.findUnique({
      where: { id: hotelId },
    });

    if (!hotel) {
      throw new NotFoundException('Hotel not found');
    }

    if (hotel.userId !== userId) {
      throw new ForbiddenException('You are not allowed to delete this review');
    }

    await this.prismaService.hotelReview.delete({
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
