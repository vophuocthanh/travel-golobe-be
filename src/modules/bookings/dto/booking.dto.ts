import { Booking } from '@prisma/client';

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
