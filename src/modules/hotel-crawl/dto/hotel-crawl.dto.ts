import { HotelCrawl } from '@prisma/client';

export class HotelCrawlDto {
  search?: string;
  items_per_page?: number;
  page?: number;
}

export interface HotelCrawlPaginationResponseType {
  data: HotelCrawl[];
  total: number;
  currentPage: number;
  itemsPerPage: number;
}
