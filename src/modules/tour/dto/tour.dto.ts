import { Tour } from '@prisma/client';

export interface TourDto {
  items_per_page?: number;
  page?: number;
  search?: string;
}

export interface TourPaginationResponseType {
  data: Tour[];
  total: number;
  currentPage: number;
  itemsPerPage: number;
}
