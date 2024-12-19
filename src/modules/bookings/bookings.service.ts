import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Booking, BookingStatus } from '@prisma/client';
import * as moment from 'moment-timezone';
import * as cron from 'node-cron';
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

  onModuleInit() {
    this.initializeCronJobs();
  }
  private parseDateStringWithTimezone(dateString: string): Date | undefined {
    if (!dateString) return undefined;
    const [day, month, year] = dateString.split('-').map(Number);

    // Tạo đối tượng Date và chuyển đổi về múi giờ Việt Nam (UTC+7)
    const dateInVN = moment
      .tz(`${year}-${month}-${day}`, 'Asia/Ho_Chi_Minh')
      .toDate();

    return dateInVN;
  }
  initializeCronJobs() {
    cron.schedule('* * * * *', async () => {
      await this.cancelExpiredBookings();
    });
    console.log(
      'Cron job for canceling expired bookings initialized and runs every minute',
    );
  }

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
    filters: BookingDto,
  ): Promise<BookingPaginationResponseType> {
    const items_per_page = Number(filters.items_per_page) || 10;
    const page = Number(filters.page) || 1;
    const skip = page > 1 ? (page - 1) * items_per_page : 0;

    const getFlightBooking = await this.prismaService.booking.findMany({
      take: items_per_page,
      skip,
      where: { flightCrawlId: { not: null } },
      include: {
        flightCrawls: true,
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    const total = await this.prismaService.booking.count({
      where: { flightCrawlId: { not: null } },
    });

    return {
      data: getFlightBooking,
      total,
      currentPage: page,
      itemsPerPage: items_per_page,
    };
  }

  async getRoadVehicleBooking(
    filters: BookingDto,
  ): Promise<BookingPaginationResponseType> {
    const items_per_page = Number(filters.items_per_page) || 10;
    const page = Number(filters.page) || 1;
    const skip = page > 1 ? (page - 1) * items_per_page : 0;

    const getRoadVehicleBooking = await this.prismaService.booking.findMany({
      take: items_per_page,
      skip,
      where: { roadVehicleId: { not: null } },
      include: {
        roadVehicles: true,
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
    const total = await this.prismaService.booking.count({
      where: { roadVehicleId: { not: null } },
    });
    return {
      data: getRoadVehicleBooking,
      total,
      currentPage: page,
      itemsPerPage: items_per_page,
    };
  }

  async getBookedHotels(
    filters: BookingDto,
  ): Promise<BookingPaginationResponseType> {
    const items_per_page = Number(filters.items_per_page) || 10;
    const page = Number(filters.page) || 1;
    const skip = page > 1 ? (page - 1) * items_per_page : 0;

    const getHotelBooking = await this.prismaService.booking.findMany({
      take: items_per_page,
      skip,
      where: { hotelCrawlId: { not: null } },
      include: {
        hotelCrawls: true,
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    const total = await this.prismaService.booking.count({
      where: { hotelCrawlId: { not: null } },
    });

    return {
      data: getHotelBooking,
      total,
      currentPage: page,
      itemsPerPage: items_per_page,
    };
  }

  async getBookedTours(
    filters: BookingDto,
  ): Promise<BookingPaginationResponseType> {
    const items_per_page = Number(filters.items_per_page) || 10;
    const page = Number(filters.page) || 1;
    const skip = page > 1 ? (page - 1) * items_per_page : 0;

    const getTourBooking = await this.prismaService.booking.findMany({
      take: items_per_page,
      skip,
      where: { tourId: { not: null } },
      include: {
        tour: {
          include: {
            hotel: true,
            flight: true,
          },
        },
        hotelCrawls: true,
        flightCrawls: true,
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    const total = await this.prismaService.booking.count({
      where: { tourId: { not: null } },
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

    // Tìm kiếm chuyến bay
    const flight = await this.prismaService.flightCrawl.findUnique({
      where: { id: flightCrawlId },
      include: { Ticket: true },
    });

    if (!flight) {
      throw new NotFoundException('Flight not found');
    }

    const currentDate = new Date();
    const endDate = new Date(flight.end_day);

    // Kiểm tra nếu chuyến bay đã kết thúc
    if (currentDate > endDate) {
      throw new HttpException(
        'This flight has already ended, you cannot book tickets.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Kiểm tra vé hợp lệ
    const ticket = flight.Ticket.find((t) => t.id === ticketFlighttId);

    if (!ticket) {
      throw new NotFoundException('Ticket not found for this flight');
    }

    // Kiểm tra số ghế còn lại
    if (flight.number_of_seats_remaining < flightQuantity) {
      throw new HttpException(
        'Not enough available seats for the requested quantity',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Cập nhật số ghế còn lại
    await this.prismaService.flightCrawl.update({
      where: { id: flightCrawlId },
      data: {
        number_of_seats_remaining:
          flight.number_of_seats_remaining - flightQuantity,
      },
    });

    // Lấy thông tin điểm của người dùng
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { points: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Tính tổng giá vé
    let totalAmountFlight = ticket.price * flightQuantity;

    // Nếu người dùng có từ 100 điểm trở lên, giảm 20%
    if (user.points >= 100) {
      totalAmountFlight *= 0.8; // Giảm giá 20%
    }

    // Tạo bản ghi đặt vé
    return this.prismaService.booking.create({
      data: {
        flightCrawlId,
        userId,
        flightQuantity,
        ticketFlighttId,
        totalAmount: totalAmountFlight,
        flightPrice: ticket.price,
        status: 'PENDING',
        confirmationTime: new Date(Date.now() + 3 * 60 * 1000),
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

    const currentDate = new Date();
    const endDate = new Date(roadVehicle.end_day);
    if (currentDate > endDate) {
      throw new HttpException(
        'This road vehicle has already ended, you cannot book tickets.',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prismaService.roadVehicle.update({
      where: { id: roadVehicleId },
      data: {
        number_of_seats_remaining:
          roadVehicle.number_of_seats_remaining - roadVehicleQuantity,
      },
    });

    // Lấy điểm `points` của người dùng
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { points: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let totalAmountRoadVehicle = roadVehicle.price * roadVehicleQuantity;

    // Giảm giá nếu `points >= 100`
    if (user.points >= 100) {
      totalAmountRoadVehicle *= 0.8;
    }

    return this.prismaService.booking.create({
      data: {
        roadVehicleId,
        userId,
        roadVehicleQuantity,
        totalAmount: totalAmountRoadVehicle,
        status: 'PENDING',
        confirmationTime: new Date(Date.now() + 3 * 60 * 1000),
      },
    });
  }

  async bookHotel(
    createHotelBookingDto: CreateHotelBookingDto,
    userId: string,
  ) {
    const { hotelCrawlId, hotelQuantity, roomId, checkInDate, checkOutDate } =
      createHotelBookingDto;

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

    const parsedCheckInDate = this.parseDateStringWithTimezone(checkInDate);
    const parsedCheckOutDate = this.parseDateStringWithTimezone(checkOutDate);

    const stayDuration = this.calculateNights(
      parsedCheckInDate,
      parsedCheckOutDate,
    );

    if (stayDuration <= 0) {
      throw new Error('Invalid stay duration');
    }

    await this.prismaService.hotelCrawl.update({
      where: { id: hotelCrawlId },
      data: {
        number_of_seats_remaining:
          hotel.number_of_seats_remaining - hotelQuantity,
      },
    });

    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { points: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let totalAmountHotel = room.pricePerDay * hotelQuantity * stayDuration;

    if (user.points >= 100) {
      totalAmountHotel *= 0.8;
    }

    return this.prismaService.booking.create({
      data: {
        hotelCrawlId,
        userId,
        roomId,
        hotelQuantity,
        checkInDate: parsedCheckInDate,
        checkOutDate: parsedCheckOutDate,
        totalAmount: totalAmountHotel,
        status: 'PENDING',
        confirmationTime: new Date(Date.now() + 3 * 60 * 1000),
      },
    });
  }

  private calculateNights(checkInDate: Date, checkOutDate: Date): number {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(
      Math.abs(checkOutDate.getTime() - checkInDate.getTime()) / oneDay,
    );
  }

  async bookTour(createTourBookingDto: CreateTourBookingDto, userId: string) {
    const { tourId, tourQuantity } = createTourBookingDto;

    const tour = await this.prismaService.tour.findUnique({
      where: { id: tourId },
    });

    if (!tour) {
      throw new HttpException('Tour not found', HttpStatus.NOT_FOUND);
    }

    const currentDate = new Date();
    const endDate = new Date(tour.end_date);
    if (currentDate > endDate) {
      throw new HttpException(
        'This tour has already ended, you cannot book tickets.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (tour.number_of_seats_remaining < tourQuantity) {
      throw new HttpException(
        'Not enough available seats for the requested quantity',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prismaService.tour.update({
      where: { id: tourId },
      data: {
        number_of_seats_remaining:
          tour.number_of_seats_remaining - tourQuantity,
      },
    });

    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { points: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let totalAmountTour = tour.totalAmount * tourQuantity;

    if (user.points >= 100) {
      totalAmountTour *= 0.8;
    }

    return this.prismaService.booking.create({
      data: {
        tourId,
        userId,
        tourQuantity,
        totalAmount: totalAmountTour,
        status: 'PENDING',
        confirmationTime: new Date(Date.now() + 3 * 60 * 1000),
      },
    });
  }

  async cancelExpiredBookings() {
    const now = new Date();

    // Lấy danh sách booking đã hết hạn
    const expiredBookings = await this.prismaService.booking.findMany({
      where: {
        status: 'PENDING',
        confirmationTime: { lte: now },
      },
    });

    for (const booking of expiredBookings) {
      if (booking.flightCrawlId && booking.flightQuantity) {
        // Hoàn lại số ghế
        await this.prismaService.flightCrawl.update({
          where: { id: booking.flightCrawlId },
          data: {
            number_of_seats_remaining: {
              increment: booking.flightQuantity,
            },
          },
        });
      }

      if (booking.hotelCrawlId && booking.hotelQuantity) {
        // Hoàn lại số phòng
        await this.prismaService.hotelCrawl.update({
          where: { id: booking.hotelCrawlId },
          data: {
            number_of_seats_remaining: {
              increment: booking.hotelQuantity,
            },
          },
        });
      }

      if (booking.roadVehicleId && booking.roadVehicleQuantity) {
        // Hoàn lại số ghế
        await this.prismaService.roadVehicle.update({
          where: { id: booking.roadVehicleId },
          data: {
            number_of_seats_remaining: {
              increment: booking.roadVehicleQuantity,
            },
          },
        });
      }

      if (booking.tourId && booking.tourQuantity) {
        // Hoàn lại số ghế
        await this.prismaService.tour.update({
          where: { id: booking.tourId },
          data: {
            number_of_seats_remaining: {
              increment: booking.tourQuantity,
            },
          },
        });

        // Cập nhật trạng thái thành 'CANCELED'
        await this.prismaService.booking.update({
          where: { id: booking.id },
          data: { status: 'CANCELED' },
        });
      }
    }
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

  async getBookedFlightDetails(bookingId: string): Promise<any> {
    const booking = await this.prismaService.booking.findUnique({
      where: { id: bookingId },
      include: {
        flightCrawls: true,
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    const { ...flightDetails } = booking;

    return {
      bookingId: booking.id,
      flightId: booking.flightCrawlId,
      ...flightDetails,
      price: booking.totalAmount,
      flightQuantity: booking.flightQuantity,
      invoice: [],
    };
  }

  async getBookedHotelDetails(bookingId: string): Promise<any> {
    const booking = await this.prismaService.booking.findUnique({
      where: { id: bookingId },
      include: {
        hotelCrawls: true,
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    const { ...hotelDetails } = booking.hotelCrawls;

    return {
      bookingId: booking.id,
      hotelId: booking.hotelCrawlId,
      ...hotelDetails,
      price: booking.totalAmount,
      hotelQuantity: booking.hotelQuantity,
      status: booking.status,
      user: {
        id: booking.user.id,
        name: booking.user.name,
        avatar: booking.user.avatar,
      },
      invoice: [],
    };
  }

  async getBookedRoadVehicleDetails(bookingId: string): Promise<any> {
    const booking = await this.prismaService.booking.findUnique({
      where: { id: bookingId },
      include: {
        roadVehicles: true,
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    const { ...roadVehicleDetails } = booking.roadVehicles;

    return {
      bookingId: booking.id,
      roadVehicleId: booking.roadVehicleId,
      ...roadVehicleDetails,
      price: booking.totalAmount,
      roadVehicleQuantity: booking.roadVehicleQuantity,
      status: booking.status,
      user: {
        id: booking.user.id,
        name: booking.user.name,
        avatar: booking.user.avatar,
      },
      invoice: [],
    };
  }

  async getBookedTourDetails(bookingId: string): Promise<any> {
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
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

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

    const originalTourPrice = tour.price;
    const totalAmount = booking.totalAmount;

    return {
      bookingId: booking.id,
      tourId: booking.tourId,
      ...tourDetails,
      originalTourPrice,
      price: totalAmount,
      tourQuantity: booking.tourQuantity,
      flightQuantity: booking.flightQuantity,
      hotelQuantity: booking.hotelQuantity,
      status: booking.status,
      hotelDetails: hotel || null,
      road_vehicle: roadVehicleDetails || null,
      user: {
        id: booking.user.id,
        name: booking.user.name,
        avatar: booking.user.avatar,
      },
      invoice: [],
    };
  }

  // confirmBooking

  async confirmBooking(bookingId: string, userId: string) {
    const booking = await this.prismaService.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        flightCrawls: true,
        hotelCrawls: true,
        tour: true,
        roadVehicles: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.userId !== userId) {
      throw new Error('Unauthorized access to booking');
    }

    await this.prismaService.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.WAITING_PAYMENT,
      },
    });

    const formattedTotalAmount = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(booking.totalAmount);

    let productName = '';

    const totalProducts =
      (booking.flightQuantity || 0) +
      (booking.hotelQuantity || 0) +
      (booking.tourQuantity || 0) +
      (booking.roadVehicleQuantity || 0);

    if (booking.tour) productName = booking.tour.name;
    if (booking.flightCrawls) productName = booking.flightCrawls.brand;
    if (booking.hotelCrawls) productName = booking.hotelCrawls.hotel_names;
    if (booking.roadVehicles) productName = booking.roadVehicles.brand;

    await mailService.sendMail({
      to: booking.user.email,
      subject: 'Xác nhận đặt chỗ thành công!',
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <div style="max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
              <header style="text-align: center; padding: 10px 0; border-bottom: 1px solid #ddd;">
                <img src="https://travel-golobe-web.s3.ap-southeast-1.amazonaws.com/avatars/85367661-7c4b-4d0b-8873-580af5e43191.png" alt="Company Logo" style="width: 120px;">
              </header>
              <section style="padding: 20px;">
                <h2 style="color: #2C3E50;">Xin chào, ${booking.user.name}</h2>
                <p>Cảm ơn bạn đã đặt chỗ trên website của chúng tôi. Dưới đây là thông tin chi tiết về đơn đặt hàng của bạn:</p>
                <div style="padding: 15px; background-color: #f7f7f7; border-radius: 8px; margin-top: 20px;">
                  <h3 style="color: #2C3E50;">Thông tin đơn hàng</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #ddd;">
                      <td style="padding: 10px; color: #555;">Mã đặt:</td>
                      <td style="padding: 10px; font-weight: bold;">${booking.id}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #ddd;">
                      <td style="padding: 10px; color: #555;">Tên dịch vụ:</td>
                      <td style="padding: 10px; font-weight: bold;">${productName}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #ddd;">
                      <td style="padding: 10px; color: #555;">Số lượng dịch vụ đặt:</td>
                      <td style="padding: 10px; font-weight: bold;">${totalProducts}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #ddd;">
                      <td style="padding: 10px; color: #555;">Ngày đặt:</td>
                      <td style="padding: 10px;">${new Date(booking.createdAt).toLocaleString()}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #ddd;">
                      <td style="padding: 10px; color: #555;">Tổng số tiền:</td>
                      <td style="padding: 10px; font-weight: bold; color: #e74c3c;">${formattedTotalAmount}</td>
                    </tr>
                  </table>
                </div>
                <p style="margin-top: 20px;">Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email hoặc số điện thoại bên dưới.</p>
                <p>Chúc bạn có một trải nghiệm tuyệt vời!</p>
              </section>
              <footer style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd; text-align: center; font-size: 12px; color: #777;">
                <p>Đội ngũ Hỗ trợ Khách hàng</p>
                <p><a href="https://travel-golobe.vercel.app" style="color: #3498db;">travel-golobe.vercel.app</a></p>
                <p>Email: support@example.com | Hotline: 123-456-789</p>
              </footer>
            </div>
          </body>
        </html>
      `,
    });

    return { message: 'Booking confirmed and email sent successfully' };
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

  async getCountBooking(): Promise<{ data: { total: number } }> {
    const total = await this.prismaService.booking.count();
    return { data: { total } };
  }
}
