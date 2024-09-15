import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Hotel, HotelReview } from '@prisma/client';
import { CreateHotelReviewDto } from 'src/modules/hotel/dto/create-hotel-review.dto';
import { CreateHotelDto } from 'src/modules/hotel/dto/create.dto';
import {
  HotelDto,
  HotelPaginationResponseType,
} from 'src/modules/hotel/dto/hotel.dto';
import { UpdateHotelDto } from 'src/modules/hotel/dto/update.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class HotelService {
  constructor(private prismaServie: PrismaService) {}

  async getHotels(filters: HotelDto): Promise<HotelPaginationResponseType> {
    const items_per_page = Number(filters.items_per_page) || 10;
    const page = Number(filters.page) || 1;
    const search = filters.search || '';
    const skip = page > 1 ? (page - 1) * items_per_page : 0;

    const hotles = await this.prismaServie.hotel.findMany({
      take: items_per_page,
      skip,
      where: {
        OR: [
          {
            name: {
              contains: search,
            },
          },
          {
            address: {
              contains: search,
            },
          },
        ],
      },
      orderBy: {
        createAt: 'desc',
      },
    });
    const total = await this.prismaServie.hotel.count({
      where: {
        OR: [
          {
            name: {
              contains: search,
            },
          },
          {
            address: {
              contains: search,
            },
          },
        ],
      },
    });
    return {
      data: hotles,
      total,
      currentPage: page,
      itemsPerPage: items_per_page,
    };
  }

  async getHotelById(id: string): Promise<Hotel> {
    return this.prismaServie.hotel.findFirst({
      where: {
        id: id,
      },
    });
  }

  async createHotel(data: CreateHotelDto, userId: string): Promise<Hotel> {
    return this.prismaServie.hotel.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async updateHotel(id: string, data: UpdateHotelDto): Promise<Hotel> {
    return this.prismaServie.hotel.update({
      where: {
        id,
      },
      data,
    });
  }

  async deleteHotel(id: string): Promise<{ message: string }> {
    await this.prismaServie.hotel.delete({
      where: {
        id,
      },
    });
    return { message: 'Hotel deleted successfully' };
  }

  // Review

  async getHotelReviews(hotelId: string): Promise<HotelReview[]> {
    return this.prismaServie.hotelReview.findMany({
      where: {
        hotelId,
      },
      orderBy: {
        createAt: 'desc',
      },
    });
  }

  async addReviewToHotel(
    hotelId: string,
    data: CreateHotelReviewDto,
    userId: string,
  ): Promise<HotelReview> {
    return this.prismaServie.hotelReview.create({
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
    return this.prismaServie.hotelReview.update({
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
    const hotel = await this.prismaServie.hotel.findUnique({
      where: { id: hotelId },
    });

    if (!hotel) {
      throw new NotFoundException('Hotel not found');
    }

    if (hotel.userId !== userId) {
      throw new ForbiddenException('You are not allowed to delete this review');
    }

    await this.prismaServie.hotelReview.delete({
      where: {
        id: reviewId,
      },
    });
    return { message: 'Review deleted successfully' };
  }
}
