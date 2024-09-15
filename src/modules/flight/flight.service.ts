import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Flight, FlightReview } from '@prisma/client';
import { CreateFlightReviewDto } from 'src/modules/flight/dto/create-flight-review.dto';
import { CreateFlightDto } from 'src/modules/flight/dto/create.dto';
import {
  FlightDto,
  FlightPaginationResponseType,
} from 'src/modules/flight/dto/flight.dto';
import { UpdateFlightReviewDto } from 'src/modules/flight/dto/update-flight-review.dto';
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

  async deleteFlight(id: string): Promise<{ message: string }> {
    await this.prismaService.flight.delete({
      where: {
        id,
      },
    });
    return { message: 'Flight deleted successfully' };
  }
  // Review

  async addReviewToFlight(
    flightId: string,
    data: CreateFlightReviewDto,
    userId: string,
  ): Promise<FlightReview> {
    return this.prismaService.flightReview.create({
      data: {
        content: data.content,
        rating: data.rating,
        flights: {
          connect: { id: flightId },
        },
        users: {
          connect: { id: userId },
        },
      },
    });
  }

  async getFlightReviews(flightId: string): Promise<FlightReview[]> {
    return this.prismaService.flightReview.findMany({
      where: { flightId },
      orderBy: { createAt: 'desc' },
    });
  }

  async updateFlightReview(
    reviewId: string,
    data: UpdateFlightReviewDto,
  ): Promise<FlightReview> {
    return this.prismaService.flightReview.update({
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
    flightId: string,
    reviewId: string,
    userId: string,
  ): Promise<{ message: string }> {
    const flight = await this.prismaService.flight.findUnique({
      where: { id: flightId },
    });

    if (!flight) {
      throw new NotFoundException('Flight not found');
    }

    if (flight.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this review',
      );
    }

    await this.prismaService.flightReview.delete({
      where: { id: reviewId },
    });
    return { message: 'Review deleted successfully' };
  }
}
