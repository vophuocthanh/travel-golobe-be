import { Injectable } from '@nestjs/common';
import { RoadVehicle } from '@prisma/client';
import * as csv from 'csv-parser';
import * as fs from 'fs';
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

    const roadVehicleCraw = await this.prismaService.roadVehicle.findMany({
      take: items_per_page,
      skip,
      where: {
        OR: [
          {
            brand: {
              contains: search,
            },
          },
        ],
      },
    });
    const total = await this.prismaService.roadVehicle.count({
      where: {
        OR: [
          {
            brand: {
              contains: search,
            },
          },
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
}
