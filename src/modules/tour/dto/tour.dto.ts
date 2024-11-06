import { Tour } from '@prisma/client';
import { IsOptional, IsString } from 'class-validator';

export class TourDto {
  items_per_page?: number;
  page?: number;
  search?: string;
  rating?: number;
  sort_by_price?: 'asc' | 'desc';
  min_price?: number;
  max_price?: number;

  @IsOptional()
  @IsString()
  start_date?: string;

  @IsOptional()
  @IsString()
  end_date?: string;

  starting_gate?: string;

  road_vehicle?: string;
}

export interface TourPaginationResponseType {
  data: Tour[];
  total: number;
  currentPage: number;
  itemsPerPage: number;
}
