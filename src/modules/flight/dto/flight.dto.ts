import { Flight } from '@prisma/client';

export class FlightDto {
  search?: string;
  rating?: number;
  airlineId?: string; // Thay vì airline name
  price?: [number, number]; // [minPrice, maxPrice]
  items_per_page?: number;
  page?: number;
}

export interface FlightPaginationResponseType {
  data: Flight[];
  total: number;
  currentPage: number;
  itemsPerPage: number;
}
