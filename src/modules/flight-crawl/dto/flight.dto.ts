import { FlightCrawl } from '@prisma/client';
import { IsOptional, IsString } from 'class-validator';

export class FlightCrawlDto {
  search?: string;
  items_per_page?: number;
  page?: number;
  sort_by_price?: 'asc' | 'desc';
  min_price?: number;
  max_price?: number;
  @IsOptional()
  @IsString()
  start_day?: string;

  @IsOptional()
  @IsString()
  end_day?: string;
  month?: number;
  year?: number;

  @IsOptional()
  brand?: string;

  search_from?: string;
  search_to?: string;

  type?: string;
}

export interface FlightCrawlPaginationResponseType {
  data: FlightCrawl[];
  total: number;
  currentPage: number;
  itemsPerPage: number;
}
