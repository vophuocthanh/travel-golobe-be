import { FlightCrawl } from '@prisma/client';

export class FlightCrawlDto {
  search?: string;
  items_per_page?: number;
  page?: number;
  sort_by_price?: 'asc' | 'desc';
  min_price?: number;
  max_price?: number;
}

export interface FlightCrawlPaginationResponseType {
  data: FlightCrawl[];
  total: number;
  currentPage: number;
  itemsPerPage: number;
}
