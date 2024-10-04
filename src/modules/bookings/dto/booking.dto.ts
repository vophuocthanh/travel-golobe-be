import { ApiProperty } from '@nestjs/swagger';
import { Booking } from '@prisma/client';
import { IsNotEmpty } from 'class-validator';

export class BookingDto {
  items_per_page: number;
  page: number;
  search: string;
}

export interface BookingPaginationResponseType {
  data: Booking[];
  total: number;
  currentPage: number;
  itemsPerPage: number;
}

export class GetFlightDto {
  @IsNotEmpty()
  bookingId: string;

  @IsNotEmpty()
  flightId: string;
}

export class ConfirmBookingDto {
  @ApiProperty()
  @IsNotEmpty()
  bookingId: string;
}
