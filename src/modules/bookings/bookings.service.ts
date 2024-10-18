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
    const items_per_page = Number(filters.items_per_page) || 10;
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

  async getBookedFlights(
    userId: string,
    filters: BookingDto,
  ): Promise<BookingPaginationResponseType> {
    const items_per_page = Number(filters.items_per_page) || 10;
    const page = Number(filters.page) || 1;
    const skip = page > 1 ? (page - 1) * items_per_page : 0;

    const getFlightBooking = await this.prismaService.booking.findMany({
      take: items_per_page,
      skip,
      where: { userId, flightCrawlId: { not: null } },
      include: {
        flightCrawls: true,
      },
    });

    const total = await this.prismaService.booking.count({
      where: { userId, flightCrawlId: { not: null } },
    });

    return {
      data: getFlightBooking,
      total,
      currentPage: page,
      itemsPerPage: items_per_page,
    };
  }

  async getRoadVehicleBooking(
    userId: string,
    filters: BookingDto,
  ): Promise<BookingPaginationResponseType> {
    const items_per_page = Number(filters.items_per_page) || 10;
    const page = Number(filters.page) || 1;
    const skip = page > 1 ? (page - 1) * items_per_page : 0;

    const getRoadVehicleBooking = await this.prismaService.booking.findMany({
      take: items_per_page,
      skip,
      where: { userId, roadVehicleId: { not: null } },
      include: {
        roadVehicles: true,
      },
    });
    const total = await this.prismaService.booking.count({
      where: { userId, roadVehicleId: { not: null } },
    });
    return {
      data: getRoadVehicleBooking,
      total,
      currentPage: page,
      itemsPerPage: items_per_page,
    };
  }

  async getBookedHotels(
    userId: string,
    filters: BookingDto,
  ): Promise<BookingPaginationResponseType> {
    const items_per_page = Number(filters.items_per_page) || 10;
    const page = Number(filters.page) || 1;
    const skip = page > 1 ? (page - 1) * items_per_page : 0;

    const getHotelBooking = await this.prismaService.booking.findMany({
      take: items_per_page,
      skip,
      where: { userId, hotelCrawlId: { not: null } },
      include: {
        hotelCrawls: true,
      },
    });

    const total = await this.prismaService.booking.count({
      where: { userId, hotelCrawlId: { not: null } },
    });

    return {
      data: getHotelBooking,
      total,
      currentPage: page,
      itemsPerPage: items_per_page,
    };
  }

  async getBookedTours(
    userId: string,
    filters: BookingDto,
  ): Promise<BookingPaginationResponseType> {
    const items_per_page = Number(filters.items_per_page) || 10;
    const page = Number(filters.page) || 1;
    const skip = page > 1 ? (page - 1) * items_per_page : 0;

    const getTourBooking = await this.prismaService.booking.findMany({
      take: items_per_page,
      skip,
      where: { userId, tourId: { not: null } },
      include: {
        tour: {
          include: {
            hotel: true, // Lấy thông tin chi tiết hotel
            flight: true, // Lấy thông tin chi tiết flight
          },
        },
        hotelCrawls: true,
        flightCrawls: true,
      },
    });

    const total = await this.prismaService.booking.count({
      where: { userId, tourId: { not: null } },
    });

    return {
      data: getTourBooking,
      total,
      currentPage: page,
      itemsPerPage: items_per_page,
    };
  }

  async bookFlight(
    createFlightBookingDto: CreateFlightBookingDto,
    userId: string,
  ): Promise<Booking> {
    const { flightCrawlId, flightQuantity, ticketFlighttId } =
      createFlightBookingDto;

    const flight = await this.prismaService.flightCrawl.findUnique({
      where: { id: flightCrawlId },
      include: { Ticket: true },
    });

    if (!flight) {
      throw new Error('Flight not found');
    }

    const ticket = flight.Ticket.find(
      (ticket) => ticket.id === ticketFlighttId,
    );

    if (!ticket) {
      throw new Error('Ticket not found for this flight');
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

    const totalAmountFlight = ticket.price * flightQuantity;

    return this.prismaService.booking.create({
      data: {
        flightCrawlId,
        userId,
        flightQuantity,
        ticketFlighttId,
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
    const { hotelCrawlId, hotelQuantity, roomId } = createHotelBookingDto;

    const hotel = await this.prismaService.hotelCrawl.findUnique({
      where: { id: hotelCrawlId },
      include: { rooms: true },
    });

    if (!hotel) {
      throw new Error('Hotel not found');
    }

    const room = hotel.rooms.find((room) => room.id === roomId);

    if (!room) {
      throw new Error('Room not found');
    }

    if (!room.available) {
      throw new Error('Selected room type is not available');
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

    const totalAmountHotel = room.pricePerDay * hotelQuantity;

    return this.prismaService.booking.create({
      data: {
        hotelCrawlId,
        userId,
        roomId,
        hotelQuantity,
        totalAmount: totalAmountHotel,
      },
    });
  }

  async bookTour(createTourBookingDto: CreateTourBookingDto, userId: string) {
    const { tourId, tourQuantity } = createTourBookingDto;

    const tour = await this.prismaService.tour.findUnique({
      where: { id: tourId },
    });

    if (!tour) {
      throw new Error('Tour not found');
    }

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

    const totalAmountTour = tour.adult_price * tourQuantity;

    return this.prismaService.booking.create({
      data: {
        tourId,
        userId,
        tourQuantity,
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

  async getBookedTourDetails(userId: string, bookingId: string): Promise<any> {
    const booking = await this.prismaService.booking.findUnique({
      where: { id: bookingId },
      include: {
        tour: {
          include: {
            hotel: true,
            flight: true,
            roadVehicle: true,
          },
        },
      },
    });

    if (!booking || booking.userId !== userId) {
      throw new NotFoundException('No tour booking found for this user.');
    }

    const { tour } = booking;
    const { hotel, flight, roadVehicle, ...tourDetails } = tour;

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
      bookingId: booking.id,
      tourId: booking.tourId,
      ...tourDetails,
      price: booking.totalAmount,
      tourQuantity: booking.tourQuantity,
      flightQuantity: booking.flightQuantity,
      hotelQuantity: booking.hotelQuantity,
      status: booking.status,
      hotelDetails: hotel || null,
      road_vehicle: roadVehicleDetails || null,
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

  // hàm xoá khi mà đặt booking quá 24h thì nó sẽ tự động xoá trong database

  private async deleteExpiredBookings(entity: string) {
    const expiredBookings = await this.prismaService.booking.findMany({
      where: {
        [entity]: { not: null },
        createdAt: {
          lt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 ngày trước
        },
      },
    });

    for (const booking of expiredBookings) {
      await this.prismaService.booking.delete({
        where: { id: booking.id },
      });
    }

    return expiredBookings.length;
  }

  async deleteExpiredFlightBookings() {
    const deletedCount = await this.deleteExpiredBookings('flightCrawlId');
    return {
      message: `${deletedCount} expired flight bookings deleted successfully`,
    };
  }

  async deleteExpiredHotelBookings() {
    const deletedCount = await this.deleteExpiredBookings('hotelCrawlId');
    return {
      message: `${deletedCount} expired hotel bookings deleted successfully`,
    };
  }

  async deleteExpiredTourBookings() {
    const deletedCount = await this.deleteExpiredBookings('tourId');
    return {
      message: `${deletedCount} expired tour bookings deleted successfully`,
    };
  }

  async deleteExpiredRoadVehicleBookings() {
    const deletedCount = await this.deleteExpiredBookings('roadVehicleId');
    return {
      message: `${deletedCount} expired road vehicle bookings deleted successfully`,
    };
  }
}
