import { Injectable } from '@nestjs/common';
import { CustomLocation } from '@prisma/client';
import { CreateLocationDto } from 'src/modules/location/dto/create.location.dto';
import {
  LocationDto,
  LocationPaginationResponseType,
} from 'src/modules/location/dto/location.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class LocationService {
  constructor(private prismaService: PrismaService) {}

  async getLocations(
    params: LocationDto,
  ): Promise<LocationPaginationResponseType> {
    const items_per_page = Number(params.items_per_page) || 10;
    const page = Number(params.page) || 1;
    const search = params.search || '';
    const skip = page > 1 ? (page - 1) * items_per_page : 0;

    const locations = await this.prismaService.customLocation.findMany({
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
    const total = await this.prismaService.customLocation.count({
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
      data: locations,
      total,
      currentPage: page,
      itemsPerPage: items_per_page,
    };
  }

  async getLocationById(id: string) {
    return this.prismaService.customLocation.findFirst({
      where: {
        id,
      },
    });
  }

  async createLocation(
    createLocationDto: CreateLocationDto,
    userId: string,
  ): Promise<CustomLocation> {
    return this.prismaService.customLocation.create({
      data: {
        ...createLocationDto,
        userId,
      },
    });
  }

  async updateLocation(
    id: string,
    updateLocationDto: CreateLocationDto,
  ): Promise<CustomLocation> {
    return this.prismaService.customLocation.update({
      where: {
        id,
      },
      data: {
        ...updateLocationDto,
      },
    });
  }

  async deleteLocation(id: string): Promise<{ message: string }> {
    await this.prismaService.customLocation.delete({
      where: {
        id,
      },
    });
    return { message: 'Location deleted successfully' };
  }
}
