import { Injectable } from '@nestjs/common';
import { Flight } from '@prisma/client';
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

  async getFlights(filters: FlightDto): Promise<FlightPaginationResponseType> {
    const items_per_page = Number(filters.items_per_page) || 10;
    const page = Number(filters.page) || 1;
    const search = filters.search || '';
    const skip = page > 1 ? (page - 1) * items_per_page : 0;

    const flights = await this.prismaService.flight.findMany({
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
    const total = await this.prismaService.flight.count({
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
      data: flights,
      total,
      currentPage: page,
      itemsPerPage: items_per_page,
    };
  }

  async getFlightById(id: string): Promise<Flight | null> {
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
      },
    });
  }

  async deleteFlight(id: string): Promise<Flight> {
    return this.prismaService.flight.delete({
      where: {
        id,
      },
    });
  }
}
