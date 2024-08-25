import { CustomLocation } from '@prisma/client';

export interface LocationDto {
  items_per_page?: number;
  page?: number;
  search?: string;
}

export interface LocationPaginationResponseType {
  data: CustomLocation[];
  total: number;
  currentPage: number;
  itemsPerPage: number;
}
