import { Injectable } from '@nestjs/common';
import { Booking } from '@prisma/client';
import {
  BookingDto,
  BookingPaginationResponseType,
} from 'src/modules/bookings/dto/booking.dto';
import { CreateFlightBookingDto } from 'src/modules/bookings/dto/create-flight-booking.dto';
import { CreateHotelBookingDto } from 'src/modules/bookings/dto/create-hotel-booking.dto';
import { CreateTourBookingDto } from 'src/modules/bookings/dto/create-tour-booking.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class BookingsService {
  constructor(private prismaService: PrismaService) {}

  async getAllBookings(
    filters: BookingDto,
  ): Promise<BookingPaginationResponseType> {
    const items_per_page = Number(filters.items_per_page) || 10000;
    const page = Number(filters.page) || 1;
    const search = filters.search || '';
    const skip = page > 1 ? (page - 1) * items_per_page : 0;

    const flights = await this.prismaService.booking.findMany({
      take: items_per_page,
      skip,
      where: {
        OR: [
          {
            hotelId: {
              contains: search,
            },
          },
          {
            flightId: {
              contains: search,
            },
          },
          {
            tourId: {
              contains: search,
            },
          },
        ],
      },
    });
    const total = await this.prismaService.booking.count({
      where: {
        OR: [
          {
            hotelId: {
              contains: search,
            },
          },
          {
            flightId: {
              contains: search,
            },
          },
          {
            tourId: {
              contains: search,
            },
          },
        ],
      },
    });
    return {
      data: flights,
      total,
      currentPage: page,
      itemsPerPage: items_per_page,
    };
  }

  async getBookedFlights(userId: string): Promise<Booking[]> {
    return this.prismaService.booking.findMany({
      where: { userId, flightId: { not: null } },
      include: {
        flight: true,
      },
    });
  }

  async getBookedHotels(userId: string): Promise<Booking[]> {
    return this.prismaService.booking.findMany({
      where: { userId, hotelId: { not: null } },
      include: {
        hotel: true,
      },
    });
  }

  async getBookedTours(userId: string): Promise<Booking[]> {
    return this.prismaService.booking.findMany({
      where: { userId, tourId: { not: null } },
      include: {
        tour: true,
      },
    });
  }

  async bookFlight(
    createFlightBookingDto: CreateFlightBookingDto,
    userId: string,
  ): Promise<Booking> {
    const { flightId } = createFlightBookingDto;

    const flight = await this.prismaService.flight.findUnique({
      where: { id: flightId },
    });

    if (!flight) {
      throw new Error('Flight not found');
    }

    return this.prismaService.booking.create({
      data: {
        flightId,
        userId,
      },
    });
  }

  async bookHotel(
    createHotelBookingDto: CreateHotelBookingDto,
    userId: string,
  ) {
    const { hotelId } = createHotelBookingDto;

    const hotel = await this.prismaService.hotel.findUnique({
      where: { id: hotelId },
    });

    if (!hotel) {
      throw new Error('Hotel not found');
    }

    return this.prismaService.booking.create({
      data: {
        hotelId,
        userId,
      },
    });
  }

  async bookTour(createTourBookingDto: CreateTourBookingDto, userId: string) {
    const { tourId } = createTourBookingDto;

    const tour = await this.prismaService.tour.findUnique({
      where: { id: tourId },
    });

    if (!tour) {
      throw new Error('Tour not found');
    }

    return this.prismaService.booking.create({
      data: {
        tourId,
        userId,
      },
    });
  }

  async cancelFlightBooking(bookingId: string, userId: string) {
    const booking = await this.prismaService.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.userId !== userId) {
      throw new Error('You are not authorized to cancel this booking');
    }

    await this.prismaService.booking.delete({
      where: { id: bookingId },
    });

    return { message: 'Booking canceled successfully' };
  }

  async cancelHotelBooking(bookingId: string, userId: string) {
    const booking = await this.prismaService.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.userId !== userId) {
      throw new Error('You are not authorized to cancel this booking');
    }

    await this.prismaService.booking.delete({
      where: { id: bookingId },
    });

    return { message: 'Booking canceled successfully' };
  }

  async cancelTourBooking(bookingId: string, userId: string) {
    const booking = await this.prismaService.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.userId !== userId) {
      throw new Error('You are not authorized to cancel this booking');
    }

    await this.prismaService.booking.delete({
      where: { id: bookingId },
    });

    return { message: 'Booking canceled successfully' };
  }
}
