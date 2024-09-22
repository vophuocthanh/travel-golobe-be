import { Injectable } from '@nestjs/common';
import { Flight, Prisma } from '@prisma/client';
import { CreateFlightDto } from 'src/modules/flight/dto/create.dto';
import {
  FlightDto,
  FlightPaginationResponseType,
} from 'src/modules/flight/dto/flight.dto';
import { UpdateFlightDto } from 'src/modules/flight/dto/update.dto'; // Import UpdateFlightDto
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class FlightService {
  constructor(private prismaService: PrismaService) {}

  private formatDate(dateStr: string): string {
    const [day, month, year] = dateStr.split('-');
    return `${year}-${month}-${day}`; // Chuyển đổi thành ISO-8601
  }

  async getFlights(filters: FlightDto): Promise<FlightPaginationResponseType> {
    const items_per_page = Number(filters.items_per_page) || 10;
    const page = Number(filters.page) || 1;
    const search = filters.search || '';
    const rating = filters.rating;
    const airline = filters.airlineId;
    const priceRange = filters.price;
    const skip = page > 1 ? (page - 1) * items_per_page : 0;

    const whereConditions: Prisma.FlightWhereInput = {
      OR: [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ],
    };

    if (rating && rating > 0) {
      whereConditions.rating = {
        gte: rating,
      };
    }

    if (airline) {
      whereConditions.airlineId = airline;
    }

    if (priceRange && priceRange.length === 2) {
      const [minPrice, maxPrice] = priceRange;
      whereConditions.price = {
        gte: minPrice,
        lte: maxPrice,
      };
    }

    const flights = await this.prismaService.flight.findMany({
      take: items_per_page,
      skip,
      where: whereConditions,
      orderBy: {
        createAt: 'desc',
      },
    });

    const total = await this.prismaService.flight.count({
      where: whereConditions,
    });

    return {
      data: flights,
      total,
      currentPage: page,
      itemsPerPage: items_per_page,
    };
  }

  async getFlightById(id: string): Promise<Flight> {
    return this.prismaService.flight.findFirst({
      where: {
        id,
      },
    });
  }

  async createFlight(data: CreateFlightDto, userId: string): Promise<Flight> {
    return this.prismaService.flight.create({
      data: {
        ...data,
        userId,
        airline: { connect: { id: data.airline } },
      },
    });
  }

  async updateFlight(id: string, data: UpdateFlightDto): Promise<Flight> {
    return this.prismaService.flight.update({
      where: {
        id,
      },
      data: {
        ...data,
        updateAt: new Date(),
        price: Number(data.price),
      },
    });
  }

  async deleteFlight(id: string): Promise<{ message: string }> {
    await this.prismaService.flight.delete({
      where: {
        id,
      },
    });
    return { message: 'Flight deleted successfully' };
  }

  // Toggle favorite

  async toggleFavorite(flightId: string, userId: string): Promise<string> {
    // Kiểm tra xem người dùng đã tym chuyến bay này chưa
    const favorite = await this.prismaService.userFlightFavorite.findUnique({
      where: {
        userId_flightId: {
          userId,
          flightId,
        },
      },
    });

    if (favorite) {
      // Nếu đã tym, thì xóa tym (bỏ tym)
      await this.prismaService.userFlightFavorite.delete({
        where: {
          id: favorite.id,
        },
      });
      return 'Bỏ tym chuyến bay thành công';
    } else {
      // Nếu chưa tym, thì thêm mới
      await this.prismaService.userFlightFavorite.create({
        data: {
          userId,
          flightId,
        },
      });
      return 'Tym chuyến bay thành công';
    }
  }

  async countFavorites(flightId: string): Promise<number> {
    return this.prismaService.userFlightFavorite.count({
      where: {
        flightId,
      },
    });
  }
}
