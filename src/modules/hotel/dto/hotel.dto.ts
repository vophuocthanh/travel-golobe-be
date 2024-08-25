import { Hotel } from '@prisma/client';

export interface HotelDto {
  items_per_page?: number;
  page?: number;
  search?: string;
}

export interface HotelPaginationResponseType {
  data: Hotel[];
  total: number;
  currentPage: number;
  itemsPerPage: number;
}
