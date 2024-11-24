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

    const filterType = filters.type ? filters.type : undefined;

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
          filterType ? { type: filterType } : {},
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
          filterType ? { type: filterType } : {},
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

  private generateTripSchedules(startDate: Date, numberOfDays: number): any[] {
    const schedules = [];
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

      schedules.push({
        day: i + 1,
        schedule: defaultSchedule,
        date: currentDate,
      });
    }

    return schedules;
  }

  private async validateHotel(hotelId: string) {
    const hotel = await this.prismaService.hotelCrawl.findUnique({
      where: { id: hotelId },
      select: { price: true, number_of_seats_remaining: true },
    });

    if (!hotel) {
      throw new NotFoundException('Hotel not found');
    }
    if (hotel.number_of_seats_remaining === 0) {
      throw new Error('No available seats remaining in the selected hotel');
    }

    return hotel;
  }

  private async validateFlight(flightId: string) {
    const flight = await this.prismaService.flightCrawl.findUnique({
      where: { id: flightId },
      select: { price: true, number_of_seats_remaining: true },
    });

    if (!flight) {
      throw new NotFoundException('Flight not found');
    }
    if (flight.number_of_seats_remaining === 0) {
      throw new Error('No available seats remaining in the selected flight');
    }

    return { ...flight, type: 'Máy bay' };
  }
  private async validateRoadVehicle(roadVehicleId: string) {
    const roadVehicle = await this.prismaService.roadVehicle.findUnique({
      where: { id: roadVehicleId },
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

    return { ...roadVehicle, type: 'Xe khách' };
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

    if (data.type === 'closed') {
      if (!data.hotelId) {
        throw new Error('Hotel ID is required for closed tours.');
      }
      if (!data.flightId && !data.roadVehicleId) {
        throw new Error(
          'Either flightId or roadVehicleId is required for closed tours.',
        );
      }
    }

    if (
      data.type === 'open' &&
      (data.hotelId || data.flightId || data.roadVehicleId)
    ) {
      throw new Error(
        'HotelId, flightId, and roadVehicleId must not be provided for open tours.',
      );
    }

    const hotel = data.hotelId
      ? await this.validateHotel(data.hotelId)
      : { price: 0, number_of_seats_remaining: 0 };

    const transport = data.flightId
      ? await this.validateFlight(data.flightId)
      : data.roadVehicleId
        ? await this.validateRoadVehicle(data.roadVehicleId)
        : { price: 0, type: null };

    const tourPrice = data.type === 'closed' ? data.price * 0.93 : data.price; // giảm 7% mỗi loại
    const hotelPrice =
      data.type === 'closed' ? hotel.price * 0.93 : hotel.price; // giảm 7% mỗi loại
    const transportPrice =
      data.type === 'closed' ? transport.price * 0.93 : transport.price; // giảm 7% mỗi loại

    const totalAmount = tourPrice + hotelPrice + transportPrice;

    const tripSchedules = this.generateTripSchedules(startDate, numberOfDays);

    const tourCode = await this.generateTourCode();

    return this.prismaService.tour.create({
      data: {
        ...data,
        userId,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        time_trip: timeTripFormatted,
        baby_price: totalAmount * 0.2,
        child_price: totalAmount * 0.5,
        adult_price: totalAmount,
        totalAmount,
        road_vehicle: transport.type,
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

    const existingSchedule = await this.prismaService.tripSchedule.findUnique({
      where: { id: tripScheduleId },
    });

    if (!existingSchedule) {
      throw new NotFoundException('Trip schedule not found');
    }

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

  async getCountTour(): Promise<{ data: { total: number } }> {
    const total = await this.prismaService.tour.count();
    return { data: { total } };
  }

  async findToursWithinBudget(totalBudget: number): Promise<any> {
    const hotels = await this.prismaService.hotelCrawl.findMany({
      select: { id: true, price: true, hotel_names: true },
    });
    const tours = await this.prismaService.tour.findMany({
      select: { id: true, totalAmount: true, tour_code: true, name: true },
    });
    const flights = await this.prismaService.flightCrawl.findMany({
      select: { id: true, price: true, brand: true },
    });
    const roadVehicles = await this.prismaService.roadVehicle.findMany({
      select: { id: true, price: true, brand: true },
    });

    const recommendations = [];

    for (const hotel of hotels) {
      for (const tour of tours) {
        const remainingBudget = totalBudget - (hotel.price + tour.totalAmount);

        if (remainingBudget <= 0) continue;

        const matchingFlights = flights.filter(
          (flight) => flight.price <= remainingBudget,
        );
        const matchingRoadVehicles = roadVehicles.filter(
          (roadVehicle) => roadVehicle.price <= remainingBudget,
        );

        matchingFlights.forEach((flight) => {
          if (recommendations.length < 20) {
            recommendations.push({
              totalPrice: hotel.price + tour.totalAmount + flight.price,
              hotel,
              tour,
              transport: { type: 'Máy bay', details: flight },
            });
          }
        });

        matchingRoadVehicles.forEach((roadVehicle) => {
          if (recommendations.length < 20) {
            recommendations.push({
              totalPrice: hotel.price + tour.totalAmount + roadVehicle.price,
              hotel,
              tour,
              transport: { type: 'Xe khách', details: roadVehicle },
            });
          }
        });

        if (recommendations.length >= 20) break;
      }
      if (recommendations.length >= 20) break;
    }

    if (recommendations.length === 0) {
      throw new NotFoundException(
        'Không tìm thấy gợi ý tour nào phù hợp với ngân sách đã nhập',
      );
    }

    return recommendations;
  }
}
