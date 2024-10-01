import { Injectable } from '@nestjs/common';
import { Tour } from '@prisma/client';
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
    const tour = await this.prismaService.tour.findUnique({
      where: { id },
    });

    if (!tour) {
      throw new Error(`Tour with ID ${id} not found`);
    }

    return tour;
  }

  async createTours(data: CreateDtoTour, userId: string): Promise<Tour> {
    return this.prismaService.tour.create({
      data: {
        ...data,
        userId,
        price: data.price,
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
        price: data.price,
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

  // isFavorite

  async markAsFavorite(userId: string, tourId: string): Promise<void> {
    await this.prismaService.tourFavorite.upsert({
      where: {
        userId_tourId: {
          userId,
          tourId,
        },
      },
      create: {
        userId,
        tourId,
        isFavorite: true,
      },
      update: {
        isFavorite: true,
      },
    });
  }

  async unmarkAsFavorite(userId: string, tourId: string): Promise<void> {
    await this.prismaService.tourFavorite.updateMany({
      where: {
        userId,
        tourId,
      },
      data: {
        isFavorite: false,
      },
    });
  }

  async getFavoriteTours(userId: string) {
    const isFavoriteTour = await this.prismaService.tour.findMany({
      where: {
        tourFavorites: {
          some: {
            userId,
            isFavorite: true,
          },
        },
      },
      include: {
        tourFavorites: {
          where: {
            userId,
          },
        },
      },
    });

    const totalFavoriteTour = await this.prismaService.tourFavorite.count({
      where: {
        userId,
        isFavorite: true,
      },
    });

    return {
      data: isFavoriteTour,
      total: totalFavoriteTour,
    };
  }
}
