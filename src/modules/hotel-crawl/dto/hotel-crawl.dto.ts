import { HotelCrawl } from '@prisma/client';

export class HotelCrawlDto {
  search?: string;
  items_per_page?: number;
  page?: number;
  sort_by_price?: 'asc' | 'desc';
  min_price?: string;
  max_price?: string;
  sort_by_number_rating?: 'asc' | 'desc';
  star_number?: string;
}

export interface HotelCrawlPaginationResponseType {
  data: HotelCrawl[];
  total: number;
  currentPage: number;
  itemsPerPage: number;
}
