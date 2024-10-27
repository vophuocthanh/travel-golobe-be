import { Injectable } from '@nestjs/common';
import { BaggageWeight, FlightCrawl, TicketType } from '@prisma/client';
import * as csv from 'csv-parser';
import * as fs from 'fs';
import { CreateFlightCrawlDto } from 'src/modules/flight-crawl/dto/create.dto';
import {
  FlightCrawlDto,
  FlightCrawlPaginationResponseType,
} from 'src/modules/flight-crawl/dto/flight.dto';
import { UpdateFlightCrawlDto } from 'src/modules/flight-crawl/dto/update.dto';

import { PrismaService } from 'src/prisma.service';

@Injectable()
export class FlightCrawlService {
  constructor(private prismaService: PrismaService) {}

  private parseDateString(dateString: string): Date | undefined {
    if (!dateString) return undefined;
    const [day, month, year] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private getBaggagePrice(weight: BaggageWeight): number {
    switch (weight) {
      case BaggageWeight.FREE_7KG:
        return 0;
      case BaggageWeight.WEIGHT_15KG:
        return 200000;
      case BaggageWeight.WEIGHT_25KG:
        return 400000;
      case BaggageWeight.WEIGHT_32KG:
        return 500000;
      default:
        return 0;
    }
  }

  async importFlightsFromCSV(filePath: string): Promise<void> {
    const flights = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          const basePrice = parseFloat(row.price || '0');

          const flightEntry = {
            brand: row.brand || '',
            start_time: row.start_time || '',
            start_day: this.parseDateString(row.start_day),
            end_day: this.parseDateString(row.end_day),
            end_time: row.end_time || '',
            trip_time: row.trip_time || '',
            take_place: row.take_place || '',
            destination: row.destination || '',
            trip_to: row.trip_to,
            tickets: [],
          };

          const ticketTypes = [
            { type: TicketType.ECONOMY, multiplier: 1 },
            { type: TicketType.BUSINESS, multiplier: 1.5 },
            { type: TicketType.FIRST_CLASS, multiplier: 2 },
          ];

          for (const ticket of ticketTypes) {
            const baggageWeight = BaggageWeight.FREE_7KG;
            const baggagePrice = this.getBaggagePrice(baggageWeight);
            const calculatedPrice =
              basePrice * ticket.multiplier + baggagePrice;

            flightEntry.tickets.push({
              type_ticket: ticket.type,
              price: calculatedPrice,
              baggage_weight: baggageWeight,
              baggage_price: baggagePrice,
            });
          }

          flights.push(flightEntry);
        })
        .on('end', async () => {
          try {
            for (const flight of flights) {
              const createdFlight = await this.prismaService.flightCrawl.create(
                {
                  data: {
                    brand: flight.brand,
                    start_time: flight.start_time,
                    start_day: flight.start_day,
                    end_day: flight.end_day,
                    end_time: flight.end_time,
                    trip_time: flight.trip_time,
                    take_place: flight.take_place,
                    destination: flight.destination,
                    trip_to: flight.trip_to,
                    price: flight.tickets[0].price,
                    type_ticket: flight.tickets[0].type_ticket,
                    baggage_weight: flight.tickets[0].baggage_weight,
                  },
                },
              );

              for (const ticket of flight.tickets) {
                await this.prismaService.ticket.create({
                  data: {
                    type_ticket: ticket.type_ticket,
                    price: ticket.price,
                    baggage_weight: ticket.baggage_weight,
                    baggage_price: ticket.baggage_price,
                    flightId: createdFlight.id,
                  },
                });
              }
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

  async getFlightsCrawl(
    filters: FlightCrawlDto,
    userId?: string,
  ): Promise<FlightCrawlPaginationResponseType> {
    const itemsPerPage = Number(filters.items_per_page) || 10;
    const page = Number(filters.page) || 1;
    const skip = (page - 1) * itemsPerPage;

    const minPrice = parseFloat(filters.min_price?.toString() || '0');
    const maxPrice = parseFloat(
      filters.max_price?.toString() || `${Number.MAX_SAFE_INTEGER}`,
    );
    const startDate =
      this.parseDateString(filters.start_day) || new Date('1970-01-01');
    const endDate = this.parseDateString(filters.end_day) || new Date();

    const whereConditions = {
      price: { gte: minPrice, lte: maxPrice },
      brand: filters.brand ? { equals: filters.brand } : undefined,
      take_place: filters.search_from
        ? { contains: filters.search_from }
        : undefined,
      destination: filters.search_to
        ? { contains: filters.search_to }
        : undefined,
      start_day: { gte: startDate, lte: endDate },
      OR: filters.search
        ? [{ brand: { contains: filters.search } }]
        : undefined,
    };

    const flights = await this.prismaService.flightCrawl.findMany({
      take: itemsPerPage,
      skip,
      where: whereConditions,
      include: {
        flightFavorites: {
          where: { userId },
          select: { isFavorite: true },
        },
      },
      orderBy: { price: filters.sort_by_price || 'asc' },
    });

    const total = await this.prismaService.flightCrawl.count({
      where: whereConditions,
    });

    return {
      data: flights,
      total,
      currentPage: page,
      itemsPerPage,
    };
  }

  async getFlightCrawlById(id: string, userId?: string) {
    const flight = await this.prismaService.flightCrawl.findFirst({
      where: {
        id,
      },
      include: {
        Ticket: true,
        flightFavorites: {
          where: {
            userId,
          },
          select: {
            isFavorite: true,
          },
        },
      },
    });

    const isFavorite =
      flight.flightFavorites.length > 0 && flight.flightFavorites[0].isFavorite;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { flightFavorites, ...flightWithoutFavorites } = flight;

    return {
      ...flightWithoutFavorites,
      isFavorite,
    };
  }

  async putFlightCrawl(
    id: string,
    flightCrawl: UpdateFlightCrawlDto,
  ): Promise<FlightCrawl> {
    return this.prismaService.flightCrawl.update({
      where: {
        id,
      },
      data: flightCrawl,
    });
  }

  async deleteFlightCrawl(id: string): Promise<{ message: string }> {
    await this.prismaService.flightFavorite.deleteMany({
      where: {
        flightId: id,
      },
    });

    await this.prismaService.ticket.deleteMany({
      where: {
        flightId: id,
      },
    });

    await this.prismaService.flightCrawl.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Successfully deleted the flight',
    };
  }

  // isFavorite

  // Đánh dấu chuyến bay là yêu thích

  async markAsFavorite(userId: string, flightId: string): Promise<void> {
    await this.prismaService.flightFavorite.upsert({
      where: {
        userId_flightId: {
          userId,
          flightId,
        },
      },
      create: {
        userId,
        flightId,
        isFavorite: true,
      },
      update: {
        isFavorite: true,
      },
    });
  }

  // Bỏ đánh dấu yêu thích

  async unmarkAsFavorite(userId: string, flightId: string): Promise<void> {
    await this.prismaService.flightFavorite.updateMany({
      where: {
        userId,
        flightId,
      },
      data: {
        isFavorite: false,
      },
    });
  }

  // Lấy danh sách các chuyến bay yêu thích của người dùng

  async getFavoriteFlights(userId: string) {
    const isFavoriteFlight = await this.prismaService.flightCrawl.findMany({
      where: {
        flightFavorites: {
          some: {
            userId,
            isFavorite: true,
          },
        },
      },
      include: {
        flightFavorites: {
          where: {
            userId,
          },
        },
      },
    });

    const totalFavoriteFlight = await this.prismaService.flightFavorite.count({
      where: {
        userId,
        isFavorite: true,
      },
    });

    return {
      data: isFavoriteFlight,
      total: totalFavoriteFlight,
    };
  }

  async createFlight(flightData: CreateFlightCrawlDto): Promise<FlightCrawl> {
    const createdFlight = await this.prismaService.flightCrawl.create({
      data: {
        brand: flightData.brand,
        start_time: flightData.start_time,
        start_day: this.parseDateString(flightData.start_day),
        end_day: this.parseDateString(flightData.end_day),
        end_time: flightData.end_time,
        trip_time: flightData.trip_time,
        take_place: flightData.take_place,
        destination: flightData.destination,
        trip_to: flightData.trip_to,
        price: flightData.price,
        type_ticket: TicketType.ECONOMY,
        baggage_weight: BaggageWeight.FREE_7KG,
      },
    });

    const ticketTypes = [
      { type: TicketType.ECONOMY, multiplier: 1 },
      { type: TicketType.BUSINESS, multiplier: 1.5 },
      { type: TicketType.FIRST_CLASS, multiplier: 2 },
    ];

    for (const ticket of ticketTypes) {
      const baggageWeight = BaggageWeight.FREE_7KG;
      const baggagePrice = this.getBaggagePrice(baggageWeight);
      const calculatedPrice =
        flightData.price * ticket.multiplier + baggagePrice;

      await this.prismaService.ticket.create({
        data: {
          type_ticket: ticket.type,
          price: calculatedPrice,
          baggage_weight: baggageWeight,
          baggage_price: baggagePrice,
          flightId: createdFlight.id,
        },
      });
    }

    return createdFlight;
  }
}
