import { FlightCrawl } from '@prisma/client';

export class FlightCrawlDto {
  search?: string;
  items_per_page?: number;
  page?: number;
}

export interface FlightCrawlPaginationResponseType {
  data: FlightCrawl[];
  total: number;
  currentPage: number;
  itemsPerPage: number;
}
