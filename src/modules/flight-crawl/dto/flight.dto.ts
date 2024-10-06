import { FlightCrawl } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum AirlineBrand {
  VIETNAM_AIRLINES = 'Vietnam Airlines',
  VIETJET_AIR = 'VietJet Air',
  BAMBOO_AIRWAYS = 'Bamboo Airways',
}

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
  @IsEnum(AirlineBrand)
  brand?: AirlineBrand;
}

export interface FlightCrawlPaginationResponseType {
  data: FlightCrawl[];
  total: number;
  currentPage: number;
  itemsPerPage: number;
}
