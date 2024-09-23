import { Injectable } from '@nestjs/common';
import { FlightCrawl } from '@prisma/client';
import * as csv from 'csv-parser';
import * as fs from 'fs';
import {
  FlightCrawlDto,
  FlightCrawlPaginationResponseType,
} from 'src/modules/flight-crawl/dto/flight.dto';
import { UpdateFlightCrawlDto } from 'src/modules/flight-crawl/dto/update.dto';

import { PrismaService } from 'src/prisma.service';

@Injectable()
export class FlightCrawlService {
  constructor(private prismaService: PrismaService) {}

  private formatDate(dateStr: string): string {
    const [day, month, year] = dateStr.split('-');
    return `${year}-${month}-${day}`;
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

  async getFlightsCrawl(
    filters: FlightCrawlDto,
  ): Promise<FlightCrawlPaginationResponseType> {
    const items_per_page = Number(filters.items_per_page) || 10;
    const page = Number(filters.page) || 1;
    const search = filters.search || '';
    const sort_by_price = filters.sort_by_price || 'asc'; // sort up and down
    const min_price = parseFloat(filters.min_price?.toString() || '0');
    const max_price = parseFloat(
      filters.max_price?.toString() || `${Number.MAX_SAFE_INTEGER}`,
    );
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

  async getFlightCrawlById(id: string): Promise<FlightCrawl> {
    return this.prismaService.flightCrawl.findFirst({
      where: {
        id,
      },
    });
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
    await this.prismaService.flightCrawl.delete({
      where: {
        id,
      },
    });
    return {
      message: 'Successfully deleted the flight',
    };
  }
}
