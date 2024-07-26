import { Hotel } from '@prisma/client';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export interface HotelDto {
  items_per_page?: number;
  page?: number;
  search?: string;
}

export interface HotelPaginationResponseType {
  data: Hotel[];
  total: number;
  currentPage: number;
  itemsPerPage: number;
}

export class CreateHotelDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  address: string;

  @IsNotEmpty()
  images: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  price: string;

  @IsOptional()
  @IsString()
  created_at?: string;

  @IsOptional()
  @IsString()
  updated_at?: string;

  @IsOptional()
  @IsString()
  image_two?: string;

  @IsOptional()
  @IsString()
  image_three?: string;

  @IsOptional()
  @IsString()
  image_four?: string;

  @IsOptional()
  @IsString()
  evaluate?: string;

  @IsOptional()
  @IsString()
  id?: string;
}

export class UpdateHotelDto extends CreateHotelDto {}
