import { Injectable } from '@nestjs/common';
import {
  FlightDto,
  FlightPaginationResponseType,
} from 'src/modules/flight/dto/flight.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class FlightService {
  constructor(private prismaService: PrismaService) {}

  async getFlights(params: FlightDto): Promise<FlightPaginationResponseType> {
    const { items_per_page, page, search } = params;
    const take = Number(items_per_page) || 10;
    const skip = page > 1 ? (page - 1) * take : 0;
    const flights = await this.prismaService.flight.findMany({
      take,
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
      itemsPerPage: take, // 10
    };
  }
}
