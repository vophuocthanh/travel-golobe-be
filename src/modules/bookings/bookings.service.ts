import { Injectable, NotFoundException } from '@nestjs/common';
import { Booking, BookingStatus } from '@prisma/client';
import { mailService } from 'src/lib/mail.service';
import {
  BookingDto,
  BookingPaginationResponseType,
} from 'src/modules/bookings/dto/booking.dto';
import { CreateFlightBookingDto } from 'src/modules/bookings/dto/create-flight-booking.dto';
import { CreateHotelBookingDto } from 'src/modules/bookings/dto/create-hotel-booking.dto';
import { CreateRoadVehicleBookingDto } from 'src/modules/bookings/dto/create-road-vehicle-booking.dto';
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
            hotelCrawlId: {
              contains: search,
            },
          },
          {
            flightCrawlId: {
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
            hotelCrawlId: {
              contains: search,
            },
          },
          {
            flightCrawlId: {
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

  async getBookedFlights(userId: string): Promise<{ data: Booking[] }> {
    const getFlightBooking = await this.prismaService.booking.findMany({
      where: { userId, flightCrawlId: { not: null } },
      include: {
        flightCrawls: true,
      },
    });
    return { data: getFlightBooking };
  }

  async getRoadVehicleBooking(userId: string): Promise<{ data: Booking[] }> {
    const getRoadVehicleBooking = await this.prismaService.booking.findMany({
      where: { userId, roadVehicleId: { not: null } },
      include: {
        roadVehicles: true,
      },
    });
    return { data: getRoadVehicleBooking };
  }

  async getBookedHotels(userId: string): Promise<{ data: Booking[] }> {
    const getHotelBooking = await this.prismaService.booking.findMany({
      where: { userId, hotelCrawlId: { not: null } },
      include: {
        hotelCrawls: true,
      },
    });
    return { data: getHotelBooking };
  }

  async getBookedTours(userId: string): Promise<{ data: Booking[] }> {
    const getTourBooking = await this.prismaService.booking.findMany({
      where: { userId, tourId: { not: null } },
      include: {
        tour: true,
      },
    });
    return { data: getTourBooking };
  }

  async bookFlight(
    createFlightBookingDto: CreateFlightBookingDto,
    userId: string,
  ): Promise<Booking> {
    const { flightCrawlId, flightQuantity } = createFlightBookingDto;

    const flight = await this.prismaService.flightCrawl.findUnique({
      where: { id: flightCrawlId },
    });

    if (!flight) {
      throw new Error('Flight not found');
    }

    if (flight.number_of_seats_remaining < flightQuantity) {
      throw new Error('Not enough available seats for the requested quantity');
    }

    await this.prismaService.flightCrawl.update({
      where: { id: flightCrawlId },
      data: {
        number_of_seats_remaining:
          flight.number_of_seats_remaining - flightQuantity,
      },
    });

    const totalAmountFlight = flight.price * flightQuantity;

    return this.prismaService.booking.create({
      data: {
        flightCrawlId,
        userId,
        flightQuantity,
        totalAmount: totalAmountFlight,
      },
    });
  }

  async bookRoadVehicle(
    createRoadVehicleBookingDto: CreateRoadVehicleBookingDto,
    userId: string,
  ): Promise<Booking> {
    const { roadVehicleId, roadVehicleQuantity } = createRoadVehicleBookingDto;

    const roadVehicle = await this.prismaService.roadVehicle.findUnique({
      where: { id: roadVehicleId },
    });

    if (!roadVehicle) {
      throw new Error('Road vehicle not found');
    }

    if (roadVehicle.number_of_seats_remaining < roadVehicleQuantity) {
      throw new Error('Not enough available seats for the requested quantity');
    }

    await this.prismaService.roadVehicle.update({
      where: { id: roadVehicleId },
      data: {
        number_of_seats_remaining:
          roadVehicle.number_of_seats_remaining - roadVehicleQuantity,
      },
    });

    const totalAmountRoadVehicle = roadVehicle.price * roadVehicleQuantity;

    return this.prismaService.booking.create({
      data: {
        roadVehicleId,
        userId,
        roadVehicleQuantity,
        totalAmount: totalAmountRoadVehicle,
      },
    });
  }

  async bookHotel(
    createHotelBookingDto: CreateHotelBookingDto,
    userId: string,
  ) {
    const { hotelCrawlId, hotelQuantity } = createHotelBookingDto;

    const hotel = await this.prismaService.hotelCrawl.findUnique({
      where: { id: hotelCrawlId },
    });

    if (!hotel) {
      throw new Error('Hotel not found');
    }

    if (hotel.number_of_seats_remaining < hotelQuantity) {
      throw new Error('Not enough available rooms for the requested quantity');
    }

    await this.prismaService.hotelCrawl.update({
      where: { id: hotelCrawlId },
      data: {
        number_of_seats_remaining:
          hotel.number_of_seats_remaining - hotelQuantity,
      },
    });

    const totalAmountHotel = hotel.price * hotelQuantity;

    return this.prismaService.booking.create({
      data: {
        hotelCrawlId,
        userId,
        hotelQuantity,
        totalAmount: totalAmountHotel,
      },
    });
  }

  async bookTour(createTourBookingDto: CreateTourBookingDto, userId: string) {
    const { tourId, flightCrawlId, hotelCrawlId, tourQuantity } =
      createTourBookingDto;

    const tour = await this.prismaService.tour.findUnique({
      where: { id: tourId },
    });

    const flightCrawl = flightCrawlId
      ? await this.prismaService.flightCrawl.findUnique({
          where: { id: flightCrawlId },
        })
      : null;

    const hotelCrawl = hotelCrawlId
      ? await this.prismaService.hotelCrawl.findUnique({
          where: { id: hotelCrawlId },
        })
      : null;

    if (!tour) throw new Error('Tour not found');
    if (flightCrawlId && !flightCrawl) throw new Error('Flight not found');
    if (hotelCrawlId && !hotelCrawl) throw new Error('Hotel not found');

    if (tour.number_of_seats_remaining < tourQuantity) {
      throw new Error('Not enough available seats for the requested quantity');
    }

    await this.prismaService.tour.update({
      where: { id: tourId },
      data: {
        number_of_seats_remaining:
          tour.number_of_seats_remaining - tourQuantity,
      },
    });

    if (flightCrawl) {
      if (
        flightCrawl.number_of_seats_remaining <
        createTourBookingDto.flightQuantity
      ) {
        throw new Error('Not enough available seats for the flight');
      }

      await this.prismaService.flightCrawl.update({
        where: { id: flightCrawlId },
        data: {
          number_of_seats_remaining:
            flightCrawl.number_of_seats_remaining -
            createTourBookingDto.flightQuantity,
        },
      });
    }

    if (hotelCrawl) {
      if (
        hotelCrawl.number_of_seats_remaining <
        createTourBookingDto.hotelQuantity
      ) {
        throw new Error('Not enough available rooms for the hotel');
      }

      await this.prismaService.hotelCrawl.update({
        where: { id: hotelCrawlId },
        data: {
          number_of_seats_remaining:
            hotelCrawl.number_of_seats_remaining -
            createTourBookingDto.hotelQuantity,
        },
      });
    }

    // Tính tổng số tiền
    const tourPrice = tour.price * tourQuantity;
    const flightPrice = flightCrawl
      ? flightCrawl.price * (createTourBookingDto.flightQuantity || 0)
      : 0;
    const hotelPrice = hotelCrawl
      ? hotelCrawl.price * (createTourBookingDto.hotelQuantity || 0)
      : 0;

    const totalAmountTour = tourPrice + flightPrice + hotelPrice;

    return this.prismaService.booking.create({
      data: {
        tourId,
        userId,
        flightCrawlId: flightCrawlId || null,
        hotelCrawlId: hotelCrawlId || null,
        tourQuantity: tourQuantity,
        flightQuantity: createTourBookingDto.flightQuantity || null,
        hotelQuantity: createTourBookingDto.hotelQuantity || null,
        tourPrice,
        flightPrice,
        hotelPrice,
        totalAmount: totalAmountTour,
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

  async cancelRoadVehicleBooking(bookingId: string, userId: string) {
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

  async getBookedFlightDetails(
    userId: string,
    bookingId: string,
  ): Promise<any> {
    const booking = await this.prismaService.booking.findUnique({
      where: { id: bookingId },
      include: {
        flightCrawls: true,
      },
    });

    if (!booking || booking.userId !== userId) {
      throw new NotFoundException('No flight booking found for this user.');
    }

    const { ...flightDetails } = booking.flightCrawls;

    return {
      bookingId: booking.id,
      flightId: booking.flightCrawlId,
      ...flightDetails,
      price: booking.totalAmount,
      flightQuantity: booking.flightQuantity,
      invoice: [],
    };
  }

  async getBookedHotelDetails(userId: string, bookingId: string): Promise<any> {
    const booking = await this.prismaService.booking.findUnique({
      where: { id: bookingId },
      include: {
        hotelCrawls: true,
      },
    });

    if (!booking || booking.userId !== userId) {
      throw new NotFoundException('No hotel booking found for this user.');
    }

    const { ...hotelDetails } = booking.hotelCrawls;

    return {
      bookingId: booking.id,
      hotelId: booking.hotelCrawlId,
      ...hotelDetails,
      price: booking.totalAmount,
      hotelQuantity: booking.hotelQuantity,
      status: booking.status,
      invoice: [],
    };
  }

  async getBookedRoadVehicleDetails(
    userId: string,
    bookingId: string,
  ): Promise<any> {
    const booking = await this.prismaService.booking.findUnique({
      where: { id: bookingId },
      include: {
        roadVehicles: true,
      },
    });

    if (!booking || booking.userId !== userId) {
      throw new NotFoundException(
        'No road vehicle booking found for this user.',
      );
    }

    const { ...roadVehicleDetails } = booking.roadVehicles;

    return {
      bookingId: booking.id,
      roadVehicleId: booking.roadVehicleId,
      ...roadVehicleDetails,
      price: booking.totalAmount,
      roadVehicleQuantity: booking.roadVehicleQuantity,
      status: booking.status,
      invoice: [],
    };
  }

  // confirmBooking

  async confirmBooking(bookingId: string, userId: string): Promise<Booking> {
    const booking = await this.prismaService.booking.findUnique({
      where: { id: bookingId },
    });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.userId !== userId) {
      throw new Error('You are not authorized to confirm this booking');
    }

    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedBooking = await this.prismaService.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CONFIRMED,
      },
    });

    await this.prismaService.invoiceDetail.create({
      data: {
        bookingId: updatedBooking.id,
        userId: updatedBooking.userId,
        totalAmount: updatedBooking.totalAmount,
      },
    });

    const htmlContent = `<h1>Xác Nhận Đặt Phòng</h1>
      <p>Thông tin đặt phòng của bạn:</p>
      <pre>${JSON.stringify(updatedBooking, null, 2)}</pre>`;

    await mailService.sendMail({
      to: user.email,
      subject: 'Xác Nhận Đặt Phòng',
      html: htmlContent,
    });

    return updatedBooking;
  }
}
