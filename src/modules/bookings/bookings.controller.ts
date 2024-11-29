import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { FlightCrawl, HotelCrawl, RoadVehicle } from '@prisma/client';
import { HandleAuthGuard } from 'src/modules/auth/guard/auth.guard';
import { BookingsService } from 'src/modules/bookings/bookings.service';
import {
  BookingDto,
  BookingPaginationResponseType,
  ConfirmBookingDto,
  CreateFlightBookingDto,
  CreateHotelBookingDto,
  CreateTourBookingDto,
} from 'src/modules/bookings/dto';
import { CreateRoadVehicleBookingDto } from 'src/modules/bookings/dto/create-road-vehicle-booking.dto';

import { RequestWithUser } from 'src/types/users';

@ApiBearerAuth()
@ApiTags('bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private bookingService: BookingsService) {}

  @UseGuards(HandleAuthGuard)
  @ApiOperation({ summary: 'Lấy tất cả các bookings' })
  @Get()
  async getAllBookings(
    @Query() params: BookingDto,
  ): Promise<BookingPaginationResponseType> {
    return this.bookingService.getAllBookings(params);
  }

  @UseGuards(HandleAuthGuard)
  @Get('book/flight')
  @ApiOperation({ summary: 'Lấy tất cả các bookings của flight' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'items_per_page', required: false })
  @ApiQuery({ name: 'search', required: false })
  async getBookedFlights(
    @Query() params: BookingDto,
  ): Promise<BookingPaginationResponseType> {
    return this.bookingService.getBookedFlights(params);
  }

  @UseGuards(HandleAuthGuard)
  @Get('book/road-vehicle')
  @ApiOperation({ summary: 'Lấy tất cả các bookings của road vehicle' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'items_per_page', required: false })
  @ApiQuery({ name: 'search', required: false })
  async getBookedRoadVehicles(
    @Query() params: BookingDto,
  ): Promise<BookingPaginationResponseType> {
    return this.bookingService.getRoadVehicleBooking(params);
  }

  @UseGuards(HandleAuthGuard)
  @Get('count-booking')
  @ApiOperation({ summary: 'Lấy ra số lượng booking' })
  async countBooking(): Promise<{ data: { total: number } }> {
    return this.bookingService.getCountBooking();
  }

  @UseGuards(HandleAuthGuard)
  @Get('flight/:bookingId')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết của booking flight' })
  async getBookedFlightDetails(@Param('bookingId') bookingId: string): Promise<{
    bookingId: string;
    flightId: string;
    totalPrice: number;
    flightDetails: FlightCrawl;
  }> {
    return this.bookingService.getBookedFlightDetails(bookingId);
  }

  @UseGuards(HandleAuthGuard)
  @Get('hotel/:bookingId')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết của booking hotel' })
  async getBookedHotelDetails(@Param('bookingId') bookingId: string): Promise<{
    bookingId: string;
    hotelId: string;
    totalPrice: number;
    hotelDetails: HotelCrawl;
  }> {
    return this.bookingService.getBookedHotelDetails(bookingId);
  }

  @UseGuards(HandleAuthGuard)
  @Get('road-vehicle/:bookingId')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết của booking road vehicle' })
  async getBookedRoadVehicleDetails(
    @Param('bookingId') bookingId: string,
  ): Promise<{
    bookingId: string;
    roadVehicleId: string;
    totalPrice: number;
    roadVehicleDetails: RoadVehicle;
  }> {
    return this.bookingService.getBookedRoadVehicleDetails(bookingId);
  }

  @UseGuards(HandleAuthGuard)
  @Get('tour/:bookingId')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết của booking tour' })
  async getBookedTourDetails(@Param('bookingId') bookingId: string): Promise<{
    bookingId: string;
    tourId: string;
    totalPrice: number;
    tourDetails: any;
  }> {
    return this.bookingService.getBookedTourDetails(bookingId);
  }

  @UseGuards(HandleAuthGuard)
  @Post('confirm')
  async confirmBooking(
    @Body() body: ConfirmBookingDto,
    @Req() req: RequestWithUser,
  ) {
    return this.bookingService.confirmBooking(body.bookingId, req.user.id);
  }

  @UseGuards(HandleAuthGuard)
  @Post('book/flight')
  @ApiOperation({ summary: 'Đặt vé máy bay' })
  async bookFlight(
    @Body() createFlightBookingDto: CreateFlightBookingDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.bookingService.bookFlight(createFlightBookingDto, userId);
  }

  @UseGuards(HandleAuthGuard)
  @Delete('book/flight/:id')
  @ApiOperation({ summary: 'Hủy vé máy bay' })
  async cancelFlightBooking(
    @Req() req: RequestWithUser,
    @Query('bookingId') bookingId: string,
  ) {
    const userId = req.user.id;
    return this.bookingService.cancelHotelBooking(bookingId, userId);
  }

  @UseGuards(HandleAuthGuard)
  @Post('book/road-vehicle')
  @ApiOperation({ summary: 'Đặt xe' })
  async bookRoadVehicle(
    @Body() createRoadVehicleBookingDto: CreateRoadVehicleBookingDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.bookingService.bookRoadVehicle(
      createRoadVehicleBookingDto,
      userId,
    );
  }

  @UseGuards(HandleAuthGuard)
  @Get('book/hotel')
  @ApiOperation({ summary: 'Lấy tất cả các bookings của hotel' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'items_per_page', required: false })
  @ApiQuery({ name: 'search', required: false })
  async getBookedHotels(
    @Query() params: BookingDto,
  ): Promise<BookingPaginationResponseType> {
    return this.bookingService.getBookedHotels(params);
  }

  @UseGuards(HandleAuthGuard)
  @Post('book/hotel')
  @ApiOperation({ summary: 'Đặt khách sạn' })
  async bookHotel(
    @Body() createHotelBookingDto: CreateHotelBookingDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.bookingService.bookHotel(createHotelBookingDto, userId);
  }

  @UseGuards(HandleAuthGuard)
  @Delete('book/hotel/:id')
  @ApiOperation({ summary: 'Hủy đặt phòng khách sạn' })
  async cancelHotelBooking(
    @Req() req: RequestWithUser,
    @Query('bookingId') bookingId: string,
  ) {
    const userId = req.user.id;
    return this.bookingService.cancelHotelBooking(bookingId, userId);
  }

  @UseGuards(HandleAuthGuard)
  @Get('book/tour')
  @ApiOperation({ summary: 'Lấy tất cả các bookings của tour' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'items_per_page', required: false })
  @ApiQuery({ name: 'search', required: false })
  async getBookedTours(
    @Query() params: BookingDto,
  ): Promise<BookingPaginationResponseType> {
    return this.bookingService.getBookedTours(params);
  }

  @UseGuards(HandleAuthGuard)
  @Post('book/tour')
  @ApiOperation({ summary: 'Đặt tour' })
  async bookTour(
    @Body() createTourBookingDto: CreateTourBookingDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.bookingService.bookTour(createTourBookingDto, userId);
  }

  @UseGuards(HandleAuthGuard)
  @Delete('book/tour/:id')
  @ApiOperation({ summary: 'Hủy tour' })
  async cancelTourBooking(
    @Req() req: RequestWithUser,
    @Query('bookingId') bookingId: string,
  ) {
    const userId = req.user.id;
    return this.bookingService.cancelTourBooking(bookingId, userId);
  }

  @UseGuards(HandleAuthGuard)
  @Delete('book/road-vehicle/:id')
  @ApiOperation({ summary: 'Hủy đặt xe' })
  async cancelRoadVehicleBooking(
    @Req() req: RequestWithUser,
    @Query('bookingId') bookingId: string,
  ) {
    const userId = req.user.id;
    return this.bookingService.cancelRoadVehicleBooking(bookingId, userId);
  }
}
