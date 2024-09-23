import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Booking } from '@prisma/client';
import { HandleAuthGuard } from 'src/modules/auth/guard/auth.guard';
import { BookingsService } from 'src/modules/bookings/bookings.service';
import {
  BookingDto,
  BookingPaginationResponseType,
  CreateFlightBookingDto,
  CreateHotelBookingDto,
  CreateTourBookingDto,
} from 'src/modules/bookings/dto';

import { RequestWithUser } from 'src/types/users';

@ApiBearerAuth()
@ApiTags('bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private bookingService: BookingsService) {}

  @UseGuards(HandleAuthGuard)
  @Get()
  async getAllBookings(
    @Query() params: BookingDto,
  ): Promise<BookingPaginationResponseType> {
    return this.bookingService.getAllBookings(params);
  }

  @UseGuards(HandleAuthGuard)
  @Get('book/flight')
  async getBookedFlights(
    @Req() req: RequestWithUser,
  ): Promise<{ data: Booking[] }> {
    const userId = req.user.id;
    return this.bookingService.getBookedFlights(userId);
  }

  @UseGuards(HandleAuthGuard)
  @Post('book/flight')
  async bookFlight(
    @Body() createFlightBookingDto: CreateFlightBookingDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.bookingService.bookFlight(createFlightBookingDto, userId);
  }

  @UseGuards(HandleAuthGuard)
  @Delete('book/flight/:id')
  async cancelFlightBooking(
    @Req() req: RequestWithUser,
    @Query('bookingId') bookingId: string,
  ) {
    const userId = req.user.id;
    return this.bookingService.cancelFlightBooking(bookingId, userId);
  }

  @UseGuards(HandleAuthGuard)
  @Get('book/hotel')
  async getBookedHotels(
    @Req() req: RequestWithUser,
  ): Promise<{ data: Booking[] }> {
    const userId = req.user.id;
    return this.bookingService.getBookedHotels(userId);
  }

  @UseGuards(HandleAuthGuard)
  @Post('book/hotel')
  async bookHotel(
    @Body() createHotelBookingDto: CreateHotelBookingDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.bookingService.bookHotel(createHotelBookingDto, userId);
  }

  @UseGuards(HandleAuthGuard)
  @Delete('book/hotel/:id')
  async cancelHotelBooking(
    @Req() req: RequestWithUser,
    @Query('bookingId') bookingId: string,
  ) {
    const userId = req.user.id;
    return this.bookingService.cancelHotelBooking(bookingId, userId);
  }

  @UseGuards(HandleAuthGuard)
  @Get('book/tour')
  async getBookedTours(
    @Req() req: RequestWithUser,
  ): Promise<{ data: Booking[] }> {
    const userId = req.user.id;
    return this.bookingService.getBookedTours(userId);
  }

  @UseGuards(HandleAuthGuard)
  @Post('book/tour')
  async bookTour(
    @Body() createTourBookingDto: CreateTourBookingDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.bookingService.bookTour(createTourBookingDto, userId);
  }

  @UseGuards(HandleAuthGuard)
  @Delete('book/tour/:id')
  async cancelTourBooking(
    @Req() req: RequestWithUser,
    @Query('bookingId') bookingId: string,
  ) {
    const userId = req.user.id;
    return this.bookingService.cancelTourBooking(bookingId, userId);
  }
}
