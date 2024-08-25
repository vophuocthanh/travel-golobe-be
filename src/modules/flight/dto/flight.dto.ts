import { Flight } from '@prisma/client';

export interface FlightDto {
  items_per_page?: number;
  page?: number;
  search?: string;
}

export interface FlightPaginationResponseType {
  data: Flight[];
  total: number;
  currentPage: number;
  itemsPerPage: number;
}
