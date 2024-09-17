import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Airline,
  Flight,
  FlightReview,
  Prisma,
  ReviewReplyFlight,
} from '@prisma/client';
import {
  AirlineDto,
  AirlinePaginationResponseType,
  AirlineTypeDto,
} from 'src/modules/flight/dto/airline.dto';
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
    const rating = filters.rating;
    const airline = filters.airlineId;
    const priceRange = filters.price;
    const skip = page > 1 ? (page - 1) * items_per_page : 0;

    const whereConditions: any = {
      OR: [
        {
          name: {
            contains: search,
          },
        },
      ],
    };

    if (rating) {
      whereConditions.rating = rating;
    }

    if (airline) {
      whereConditions.airline = {
        contains: airline,
      };
    }

    if (priceRange) {
      whereConditions.price = {
        gte: priceRange[0],
        lte: priceRange[1],
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

  // Reply review

  async addReplyToReview(
    reviewId: string,
    content: string,
    userId: string,
  ): Promise<ReviewReplyFlight> {
    return this.prismaService.reviewReplyFlight.create({
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

  // Function to get replies for a specific review
  async getRepliesForReview(reviewId: string): Promise<ReviewReplyFlight[]> {
    return this.prismaService.reviewReplyFlight.findMany({
      where: { reviewId },
      orderBy: { createAt: 'desc' },
    });
  }

  // Function to add reply to a reply
  async addReplyToReply(
    parentReplyId: string,
    content: string,
    userId: string,
  ): Promise<ReviewReplyFlight> {
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

  // Airline
  async getAirlines(
    filters: AirlineTypeDto,
  ): Promise<AirlinePaginationResponseType> {
    const itemsPerPage = Number(filters.items_per_page) || 10;
    const page = Number(filters.page) || 1;
    const search = filters.search || '';
    const skip = (page - 1) * itemsPerPage;

    // Define filter conditions
    const whereConditions: Prisma.AirlineWhereInput = {
      OR: [
        {
          name: {
            contains: search,
            mode: 'insensitive', // Optional: case-insensitive search
          },
        },
        // Add other fields to search if needed
      ],
    };

    // Fetch airlines with pagination and filtering
    const airlines = await this.prismaService.airline.findMany({
      take: itemsPerPage,
      skip,
      where: whereConditions,
      orderBy: {
        createAt: 'desc', // Sort by creation date in descending order
      },
    });

    // Get total count of airlines matching the filter conditions
    const total = await this.prismaService.airline.count({
      where: whereConditions,
    });

    return {
      data: airlines,
      total,
      currentPage: page,
      itemsPerPage,
    };
  }

  async createAirline(data: AirlineDto): Promise<Airline> {
    return this.prismaService.airline.create({
      data: {
        ...data,
      },
    });
  }

  async filterFlights(
    airlineId?: string,
    minPrice?: number,
    maxPrice?: number,
    minRating?: number,
  ): Promise<Flight[]> {
    return this.prismaService.flight.findMany({
      where: {
        airlineId: airlineId ? { equals: airlineId } : undefined,
        price: {
          gte: minPrice,
          lte: maxPrice,
        },
        rating: {
          gte: minRating,
        },
      },
    });
  }
}
