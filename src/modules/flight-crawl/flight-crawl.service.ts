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

  private calculateTripTime(startTime: string, endTime: string): string {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    const start = new Date();
    start.setHours(startHours, startMinutes);

    const end = new Date();
    end.setHours(endHours, endMinutes);

    let duration = (end.getTime() - start.getTime()) / (1000 * 60); // in minutes

    if (duration < 0) {
      duration += 24 * 60; // adjust if end time is past midnight
    }

    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours}h ${minutes}m`;
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
  ): Promise<FlightCrawlPaginationResponseType> {
    const items_per_page = Number(filters.items_per_page) || 10;
    const page = Number(filters.page) || 1;
    const search = filters.search || '';
    const sort_by_price = filters.sort_by_price || 'asc';
    const min_price = parseFloat(filters.min_price?.toString() || '0');
    const max_price = parseFloat(
      filters.max_price?.toString() || `${Number.MAX_SAFE_INTEGER}`,
    );
    const searchFrom = filters.search_from || '';
    const searchTo = filters.search_to || '';
    const startDate = this.parseDateString(filters.start_day);
    const endDate = this.parseDateString(filters.end_day);
    const filterBrand = filters.brand || '';
    const skip = page > 1 ? (page - 1) * items_per_page : 0;

    const flightCrawl = await this.prismaService.flightCrawl.findMany({
      take: items_per_page,
      skip,
      where: {
        AND: [
          {
            price: {
              gte: min_price,
              lte: max_price,
            },
          },
          {
            OR: [
              {
                brand: {
                  contains: search,
                },
              },
            ],
          },
          ...(startDate || endDate
            ? [
                {
                  start_day: {
                    gte: startDate || new Date('1970-01-01'),
                    lte: endDate || new Date(),
                  },
                },
              ]
            : []),
          ...(filterBrand
            ? [
                {
                  brand: {
                    equals: filterBrand,
                  },
                },
              ]
            : []),
          ...(searchFrom
            ? [
                {
                  take_place: {
                    contains: searchFrom,
                  },
                },
              ]
            : []),
          ...(searchTo
            ? [
                {
                  destination: {
                    contains: searchTo,
                  },
                },
              ]
            : []),
        ],
      },
      orderBy: {
        price: sort_by_price,
      },
    });

    const total = await this.prismaService.flightCrawl.count({
      where: {
        AND: [
          {
            price: {
              gte: min_price,
              lte: max_price,
            },
          },
          {
            OR: [
              {
                brand: {
                  contains: search,
                },
              },
            ],
          },
          ...(startDate || endDate
            ? [
                {
                  start_day: {
                    gte: startDate || new Date('1970-01-01'),
                    lte: endDate || new Date(),
                  },
                },
              ]
            : []),
          ...(filterBrand
            ? [
                {
                  brand: {
                    equals: filterBrand,
                  },
                },
              ]
            : []),
          ...(searchFrom
            ? [
                {
                  take_place: {
                    contains: searchFrom,
                  },
                },
              ]
            : []),
          ...(searchTo
            ? [
                {
                  destination: {
                    contains: searchTo,
                  },
                },
              ]
            : []),
        ],
      },
    });

    return {
      data: flightCrawl,
      total,
      currentPage: page,
      itemsPerPage: items_per_page,
    };
  }

  async getFlightCrawlById(id: string) {
    const flight = await this.prismaService.flightCrawl.findFirst({
      where: {
        id,
      },
      include: {
        Ticket: true,
      },
    });

    const { ...flightWithoutFavorites } = flight;

    return {
      ...flightWithoutFavorites,
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

  async createFlight(flightData: CreateFlightCrawlDto): Promise<FlightCrawl> {
    const tripTime = this.calculateTripTime(
      flightData.start_time,
      flightData.end_time,
    );
    const createdFlight = await this.prismaService.flightCrawl.create({
      data: {
        brand: flightData.brand,
        start_time: flightData.start_time,
        start_day: this.parseDateString(flightData.start_day),
        end_day: this.parseDateString(flightData.end_day),
        end_time: flightData.end_time,
        trip_time: tripTime,
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
