import { Injectable } from '@nestjs/common';
import { Hotel } from '@prisma/client';
import { CreateHotelDto } from 'src/modules/hotel/dto/create.dto';
import {
  HotelDto,
  HotelPaginationResponseType,
} from 'src/modules/hotel/dto/hotel.dto';
import { UpdateHotelDto } from 'src/modules/hotel/dto/update.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class HotelService {
  constructor(private prismaServie: PrismaService) {}

  async getHotels(filters: HotelDto): Promise<HotelPaginationResponseType> {
    const items_per_page = Number(filters.items_per_page) || 10;
    const page = Number(filters.page) || 1;
    const search = filters.search || '';
    const skip = page > 1 ? (page - 1) * items_per_page : 0;

    const hotles = await this.prismaServie.hotel.findMany({
      take: items_per_page,
      skip,
      where: {
        OR: [
          {
            name: {
              contains: search,
            },
          },
          {
            address: {
              contains: search,
            },
          },
        ],
      },
      orderBy: {
        createAt: 'desc',
      },
    });
    const total = await this.prismaServie.hotel.count({
      where: {
        OR: [
          {
            name: {
              contains: search,
            },
          },
          {
            address: {
              contains: search,
            },
          },
        ],
      },
    });
    return {
      data: hotles,
      total,
      currentPage: page,
      itemsPerPage: items_per_page,
    };
  }

  async getHotelById(id: string) {
    return this.prismaServie.hotel.findFirst({
      where: {
        id: id,
      },
    });
  }

  async createHotel(data: CreateHotelDto, userId: string): Promise<Hotel> {
    return this.prismaServie.hotel.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async updateHotel(id: string, data: UpdateHotelDto): Promise<Hotel> {
    return this.prismaServie.hotel.update({
      where: {
        id,
      },
      data,
    });
  }

  async deleteHotel(id: string): Promise<{ message: string }> {
    await this.prismaServie.hotel.delete({
      where: {
        id,
      },
    });
    return { message: 'Hotel deleted successfully' };
  }
}
