import { Flight } from '@prisma/client';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export interface FlightDto {
  items_per_page?: number;
  page?: number;
  search?: string;
}

export interface FlightPaginationResponseType {
  data: Flight[];
  total: number;
  currentPage: number;
  itemsPerPage: number;
}

export class CreateFlightDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  images: string;

  @IsNotEmpty()
  price: string;

  @IsNotEmpty()
  startDate: string;

  @IsNotEmpty()
  endDate: string;

  @IsNotEmpty()
  perios: string;

  @IsOptional()
  @IsString()
  created_at?: string;

  @IsOptional()
  @IsString()
  updated_at?: string;

  @IsOptional()
  @IsString()
  id?: string;
}

export class UpdateFlightDto extends CreateFlightDto {}
