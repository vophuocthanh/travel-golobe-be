import { RoadVehicle } from '@prisma/client';
import { IsOptional, IsString } from 'class-validator';

export class RoadVehicleCrawlDto {
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
  search_from?: string;
  search_to?: string;

  @IsOptional()
  brand?: string;
}

export interface RoadVehicleCrawlPaginationResponseType {
  data: RoadVehicle[];
  total: number;
  currentPage: number;
  itemsPerPage: number;
}
