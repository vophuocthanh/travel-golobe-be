import { Injectable, NotFoundException } from '@nestjs/common';
import { Tour, TripSchedule } from '@prisma/client';
import * as dayjs from 'dayjs';
import { CreateDtoTour } from 'src/modules/tour/dto/create.dto';
import {
  TourDto,
  TourPaginationResponseType,
} from 'src/modules/tour/dto/tour.dto';
import { UpdateTripScheduleDto } from 'src/modules/tour/dto/update-trip-schedule.dto';
import { UpdateDtoTour } from 'src/modules/tour/dto/update.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TourService {
  constructor(private prismaService: PrismaService) {}

  private generateTourCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'MT-';
    for (let i = 0; i < 8; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters.charAt(randomIndex);
    }
    return code;
  }

  private parseDateString(dateString: string): Date | undefined {
    if (!dateString) return undefined;
    const [day, month, year] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  async getTours(filters: TourDto): Promise<TourPaginationResponseType> {
    if (!filters) {
      throw new Error('Filters must be provided');
    }

    const items_per_page = Number(filters.items_per_page) || 10;
    const page = Number(filters.page) || 1;
    const search = filters.search || '';
    const skip = page > 1 ? (page - 1) * items_per_page : 0;

    const sort_by_price = filters.sort_by_price === 'desc' ? 'desc' : 'asc';

    const min_price = filters.min_price
      ? parseFloat(filters.min_price.toString())
      : 0;
    const max_price = filters.max_price
      ? parseFloat(filters.max_price.toString())
      : Number.MAX_SAFE_INTEGER;

    const startDate = this.parseDateString(filters.start_date);
    const endDate = this.parseDateString(filters.end_date);

    const filterRating = filters.rating ? Number(filters.rating) : undefined;

    const sortStartingGate = filters.starting_gate
      ? filters.starting_gate.split(',')
      : undefined;

    const sortRoadVehicle = filters.road_vehicle
      ? filters.road_vehicle.split(',')
      : undefined;

    const tours = await this.prismaService.tour.findMany({
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
                name: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            ],
          },
          ...(startDate || endDate
            ? [
                {
                  start_date: {
                    gte: startDate || new Date('1970-01-01'),
                    lte: endDate || new Date(),
                  },
                },
              ]
            : []),
          filterRating !== undefined
            ? {
                rating: {
                  equals: filterRating,
                },
              }
            : {},
          sortStartingGate
            ? {
                starting_gate: {
                  in: sortStartingGate,
                },
              }
            : {},
          sortRoadVehicle
            ? {
                road_vehicle: {
                  in: sortRoadVehicle,
                },
              }
            : {},
        ],
      },
      orderBy: {
        price: sort_by_price,
      },
    });

    const total = await this.prismaService.tour.count({
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
                name: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            ],
          },
          ...(startDate || endDate
            ? [
                {
                  start_date: {
                    gte: startDate || new Date('1970-01-01'),
                    lte: endDate || new Date(),
                  },
                },
              ]
            : []),
          filterRating !== undefined
            ? {
                rating: {
                  equals: filterRating,
                },
              }
            : {},
          sortStartingGate
            ? {
                starting_gate: {
                  in: sortStartingGate,
                },
              }
            : {},
          sortRoadVehicle
            ? {
                road_vehicle: {
                  in: sortRoadVehicle,
                },
              }
            : {},
        ],
      },
    });

    if (!tours) {
      throw new NotFoundException('No tours found');
    }

    return {
      data: tours,
      total,
      currentPage: page,
      itemsPerPage: items_per_page,
    };
  }

  async getTourById(tourId: string) {
    const tour = await this.prismaService.tour.findUnique({
      where: {
        id: tourId,
      },
      include: {
        hotel: true,
        flight: true,
        roadVehicle: true,
        TripSchedule: true, // Thêm phần lấy lịch trình vào đây
      },
    });

    if (!tour) {
      throw new NotFoundException('Tour not found');
    }

    const {
      flight,
      roadVehicle,
      TripSchedule: tripSchedules,
      ...tourWithoutFavorites
    } = tour;

    let roadVehicleDetails = null;

    if (flight) {
      roadVehicleDetails = {
        type: 'Máy bay',
        details: flight,
      };
    } else if (roadVehicle) {
      roadVehicleDetails = {
        type: 'Xe khách',
        details: roadVehicle,
      };
    }

    return {
      ...tourWithoutFavorites,
      hotel: tour.hotel || null,
      road_vehicle: roadVehicleDetails || null,
      trip_schedules: tripSchedules || [],
    };
  }

  async createTours(data: CreateDtoTour, userId: string): Promise<Tour> {
    const startDate = this.parseDateString(data.start_date);
    const endDate = this.parseDateString(data.end_date);

    if (!startDate || !endDate) {
      throw new Error('Invalid start or end date');
    }

    const numberOfDays = dayjs(endDate).diff(dayjs(startDate), 'day') + 1;
    const numberOfNights = numberOfDays > 1 ? numberOfDays - 1 : 0;

    const timeTripFormatted = `${numberOfDays}N${numberOfNights}D`;

    let hotelPrice = 0;
    if (data.hotelId) {
      const hotel = await this.prismaService.hotelCrawl.findUnique({
        where: { id: data.hotelId },
        select: { price: true, number_of_seats_remaining: true },
      });
      if (!hotel) {
        throw new NotFoundException('Hotel not found');
      }
      if (hotel.number_of_seats_remaining === 0) {
        throw new Error('No available seats remaining in the selected hotel');
      }
      hotelPrice = hotel.price;
    }

    let transportPrice = 0;
    let roadVehicleType: string | null = null;

    if (data.flightId && data.roadVehicleId) {
      throw new Error(
        'You can only select either flightId or roadVehicleId, not both.',
      );
    }

    if (data.flightId) {
      const flight = await this.prismaService.flightCrawl.findUnique({
        where: { id: data.flightId },
        select: { price: true, number_of_seats_remaining: true },
      });
      if (!flight) {
        throw new NotFoundException('Flight not found');
      }
      if (flight.number_of_seats_remaining === 0) {
        throw new Error('No available seats remaining in the selected flight');
      }
      transportPrice = flight.price;
      roadVehicleType = 'Máy bay';
    }

    if (data.roadVehicleId) {
      const roadVehicle = await this.prismaService.roadVehicle.findUnique({
        where: { id: data.roadVehicleId },
        select: { price: true, number_of_seats_remaining: true },
      });
      if (!roadVehicle) {
        throw new NotFoundException('Road vehicle not found');
      }
      if (roadVehicle.number_of_seats_remaining === 0) {
        throw new Error(
          'No available seats remaining in the selected road vehicle',
        );
      }
      transportPrice = roadVehicle.price;
      roadVehicleType = 'Xe khách';
    }

    const totalAmount = hotelPrice + transportPrice + data.price;

    let tourCode: string;
    do {
      tourCode = this.generateTourCode();
    } while (
      await this.prismaService.tour.findFirst({
        where: { tour_code: tourCode },
      })
    );

    const tripSchedules = [];
    const startDay = dayjs(startDate);
    for (let i = 0; i < numberOfDays; i++) {
      const currentDate = startDay.add(i, 'day').toDate();
      let defaultSchedule = `Ngày ${i + 1}: `;

      if (i === 0) {
        defaultSchedule += 'Ngày đầu tiên, khởi hành và nhận phòng.';
      } else if (i === numberOfDays - 1) {
        defaultSchedule += 'Ngày cuối, chuẩn bị kết thúc chuyến đi và trở về.';
      } else {
        defaultSchedule += `Ngày ${i + 1}, tham quan và khám phá các địa điểm du lịch.`;
      }

      tripSchedules.push({
        day: i + 1,
        schedule: defaultSchedule,
        date: currentDate,
      });
    }

    return this.prismaService.tour.create({
      data: {
        ...data,
        userId,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        time_trip: timeTripFormatted,
        baby_price: 0,
        child_price: totalAmount / 2,
        adult_price: totalAmount,
        totalAmount,
        road_vehicle: roadVehicleType,
        tour_code: tourCode,
        TripSchedule: {
          create: tripSchedules,
        },
      },
    });
  }

  async updateTour(id: string, data: UpdateDtoTour): Promise<Tour> {
    return this.prismaService.tour.update({
      where: {
        id,
      },
      data: {
        ...data,
        price: data.price,
        start_date: this.parseDateString(data.start_date),
        end_date: this.parseDateString(data.end_date),
      },
    });
  }

  async deleteTour(id: string): Promise<{ message: string }> {
    await this.prismaService.tour.delete({
      where: {
        id,
      },
    });
    return { message: 'Tour deleted successfully' };
  }

  // isFavorite

  async updateTripSchedule(
    tourId: string,
    tripScheduleId: string,
    data: UpdateTripScheduleDto,
  ): Promise<TripSchedule> {
    const { schedule } = data;

    // Kiểm tra xem lịch trình có tồn tại không
    const existingSchedule = await this.prismaService.tripSchedule.findUnique({
      where: { id: tripScheduleId },
    });

    if (!existingSchedule) {
      throw new NotFoundException('Trip schedule not found');
    }

    // Cập nhật chỉ trường schedule
    return this.prismaService.tripSchedule.update({
      where: { id: tripScheduleId },
      data: {
        schedule,
      },
    });
  }

  async getUniqueStartingGate(): Promise<{ data: string[] }> {
    const uniqueStartingGate = await this.prismaService.tour.findMany({
      distinct: ['starting_gate'],
      select: { starting_gate: true },
    });
    const startingGates = uniqueStartingGate
      .map((tour) => tour.starting_gate)
      .filter(Boolean);
    return { data: startingGates };
  }

  async getUniqueRoadVehicle(): Promise<{ data: string[] }> {
    const uniqueRoadVehicle = await this.prismaService.tour.findMany({
      distinct: ['road_vehicle'],
      select: { road_vehicle: true },
    });

    const roadVehicles = uniqueRoadVehicle
      .map((tour) => tour.road_vehicle)
      .filter(Boolean);
    return { data: roadVehicles };
  }
}
