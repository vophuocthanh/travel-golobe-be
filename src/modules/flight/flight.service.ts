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
import * as csv from 'csv-parser';
import * as fs from 'fs';
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

  async getFlightReviews(flightId: string): Promise<{ data: FlightReview[] }> {
    const reviews = await this.prismaService.flightReview.findMany({
      where: { flightId },
      orderBy: { createAt: 'desc' },
    });
    return {
      data: reviews,
    };
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
  async getRepliesForReview(
    reviewId: string,
  ): Promise<{ data: ReviewReplyFlight[] }> {
    const replyReview = await this.prismaService.reviewReplyFlight.findMany({
      where: { reviewId },
      orderBy: { createAt: 'desc' },
    });
    return {
      data: replyReview,
    };
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

    const whereConditions: Prisma.AirlineWhereInput = {
      OR: [
        {
          name: {
            contains: search,
            mode: 'insensitive', // Optional: case-insensitive search
          },
        },
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
    const whereConditions: Prisma.FlightWhereInput = {};

    if (airlineId) {
      whereConditions.airlineId = airlineId;
    }

    if (minPrice !== undefined && maxPrice !== undefined) {
      whereConditions.price = {
        gte: minPrice,
        lte: maxPrice,
      };
    }

    if (minRating !== undefined && minRating > 0) {
      whereConditions.rating = {
        gte: minRating,
      };
    }

    return this.prismaService.flight.findMany({
      where: whereConditions,
    });
  }

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

  async importFlightsFromCSV(filePath: string): Promise<void> {
    const flights = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          const flight1 = {
            brand: row.brand || '',
            price: parseFloat(row.price || '0'),
            start_time: row.start_time || '',
            start_day: new Date(this.formatDate(row.start_day)),
            end_day: new Date(this.formatDate(row.end_day)),
            end_time: row.end_time || '',
            trip_time: row.trip_time || '',
            take_place: row.take_place || '',
            destination: row.destination || '',
            trip_to: row.trip_to || '',
          };

          flights.push(flight1);
        })
        .on('end', async () => {
          try {
            // Insert each flight into the Flight table
            for (const flight1 of flights) {
              await this.prismaService.flightCrawl.create({
                data: flight1,
              });
            }
            resolve();
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }
}
