import { Injectable } from '@nestjs/common';
import { RoadVehicle } from '@prisma/client';
import * as csv from 'csv-parser';
import * as fs from 'fs';
import { CreateRoadVehicleDto } from 'src/modules/road-vehicle/dto/create.dto';
import {
  RoadVehicleCrawlDto,
  RoadVehicleCrawlPaginationResponseType,
} from 'src/modules/road-vehicle/dto/road-vehicle.dto';
import { UpdateRoadVehicleCrawlDto } from 'src/modules/road-vehicle/dto/update.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class RoadVehicleService {
  constructor(private prismaService: PrismaService) {}
  private formatDate(dateStr: string): string {
    const [day, month, year] = dateStr.split('-');
    return `${year}-${month}-${day}`;
  }

  private parseDateString(dateString: string): Date | undefined {
    if (!dateString) return undefined;
    const [day, month, year] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  async importRoadVehicleFromCSV(filePath: string): Promise<void> {
    const roadVehicles = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          const roadVehicle = {
            brand: row.brand || '',
            price: parseFloat(row.price || '0'),
            number_of_seat: row.number_of_seat || '0',
            start_time: row.start_time || '',
            start_day: new Date(this.formatDate(row.start_day)),
            end_day: new Date(this.formatDate(row.end_day)),
            end_time: row.end_time || '',
            trip_time: row.trip_time || '',
            take_place: row.take_place || '',
            destination: row.destination || '',
            location: row.location || '',
          };

          roadVehicles.push(roadVehicle);
        })
        .on('end', async () => {
          try {
            for (const roadVehicle of roadVehicles) {
              await this.prismaService.roadVehicle.create({
                data: roadVehicle,
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

  async getRoadVehicleCrawl(
    filters: RoadVehicleCrawlDto,
  ): Promise<RoadVehicleCrawlPaginationResponseType> {
    const items_per_page = Number(filters.items_per_page) || 10;
    const page = Number(filters.page) || 1;
    const search = filters.search || '';
    const skip = page > 1 ? (page - 1) * items_per_page : 0;

    const sort_by_price = filters.sort_by_price || 'asc';

    const min_price = parseFloat(filters.min_price?.toString() || '0');
    const max_price = parseFloat(
      filters.max_price?.toString() || `${Number.MAX_SAFE_INTEGER}`,
    );

    const searchFrom = filters.search_from || ''; // Điểm đi
    const searchTo = filters.search_to || ''; // Điểm đến

    const filterBrand = filters.brand || '';

    const startDate = this.parseDateString(filters.start_day);
    const endDate = this.parseDateString(filters.end_day);

    const roadVehicleCraw = await this.prismaService.roadVehicle.findMany({
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
          ...(filterBrand
            ? [
                {
                  brand: {
                    equals: filterBrand,
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

    const total = await this.prismaService.roadVehicle.count({
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
          ...(filterBrand
            ? [
                {
                  brand: {
                    equals: filterBrand,
                  },
                },
              ]
            : []),
        ],
      },
    });

    return {
      data: roadVehicleCraw,
      total,
      currentPage: page,
      itemsPerPage: items_per_page,
    };
  }

  async getRoadVehicleCrawlById(id: string): Promise<RoadVehicle> {
    return this.prismaService.roadVehicle.findFirst({
      where: {
        id,
      },
    });
  }

  async putRoadVehicleCrawl(
    id: string,
    roadVehicle: UpdateRoadVehicleCrawlDto,
  ): Promise<RoadVehicle> {
    return this.prismaService.roadVehicle.update({
      where: {
        id,
      },
      data: roadVehicle,
    });
  }

  async deleteRoadVehicleCrawl(id: string): Promise<{ message: string }> {
    await this.prismaService.roadVehicle.delete({
      where: {
        id,
      },
    });
    return {
      message: 'Delete successfully',
    };
  }

  async createRoadVehicleCrawl(
    data: CreateRoadVehicleDto,
  ): Promise<RoadVehicle> {
    const startDay = this.parseDateString(data.start_day);
    const endDay = this.parseDateString(data.end_day);

    if (!startDay || !endDay) {
      throw new Error('Invalid start day or end day');
    }

    const startTime = new Date(startDay);
    const endTime = new Date(endDay);

    const startHourMinute = data.start_time.split(':');
    const endHourMinute = data.end_time.split(':');

    startTime.setHours(
      Number(startHourMinute[0]),
      Number(startHourMinute[1]),
      0,
      0,
    );
    endTime.setHours(Number(endHourMinute[0]), Number(endHourMinute[1]), 0, 0);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      throw new Error('Invalid start time or end time');
    }

    const tripDurationInMillis = endTime.getTime() - startTime.getTime();

    if (tripDurationInMillis < 0) {
      throw new Error('End time must be later than start time');
    }

    const tripDurationInMinutes = Math.floor(
      tripDurationInMillis / (1000 * 60),
    );

    const hours = Math.floor(tripDurationInMinutes / 60);
    const minutes = tripDurationInMinutes % 60;

    const trip_time = `${hours} hours ${minutes} minutes`;

    const roadVehicle = await this.prismaService.roadVehicle.create({
      data: {
        ...data,
        start_day: startDay,
        end_day: endDay,
        trip_time: trip_time,
      },
    });

    return roadVehicle;
  }
}
