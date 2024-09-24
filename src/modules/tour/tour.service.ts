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

    // Fetch flightCrawl and hotelCrawl data
    const flightCrawls = await this.prismaService.flightCrawl.findMany();
    const hotelCrawls = await this.prismaService.hotelCrawl.findMany();

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

    const getRandomItem = (items: any[]) => {
      return items[Math.floor(Math.random() * items.length)];
    };

    const toursWithRandomData = tours.map((tour) => {
      const randomFlight = getRandomItem(flightCrawls);
      const randomHotel = getRandomItem(hotelCrawls);

      return {
        ...tour,
        randomFlightCrawl: randomFlight || null,
        randomHotelCrawl: randomHotel || null,
      };
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
      data: toursWithRandomData,
      total,
      currentPage: page,
      itemsPerPage: items_per_page,
    };
  }

  async getTourById(id: string) {
    const tourId = await this.prismaService.tour.findUnique({
      where: {
        id,
      },
    });
    if (!tourId) {
      throw new Error('Tour not found');
    }

    const flightCrawls = await this.prismaService.flightCrawl.findMany();
    const hotelCrawls = await this.prismaService.hotelCrawl.findMany();

    const getRandomItem = (items: any[]) => {
      return items[Math.floor(Math.random() * items.length)];
    };

    const randomFlight = getRandomItem(flightCrawls);
    const randomHotel = getRandomItem(hotelCrawls);
    return {
      ...tourId,
      randomFlightCrawl: randomFlight || null,
      randomHotelCrawl: randomHotel || null,
    };
  }

  async createTours(data: CreateDtoTour, userId: string): Promise<Tour> {
    return this.prismaService.tour.create({
      data: {
        ...data,
        userId,
        price: data.price,
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
        price: data.price,
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
}
