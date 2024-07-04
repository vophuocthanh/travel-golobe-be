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
  userId?: string;

  @IsOptional()
  created_at?: string;

  @IsOptional()
  updated_at?: string;

  @IsOptional()
  image_two?: string;

  @IsOptional()
  image_three?: string;

  @IsOptional()
  image_four?: string;

  @IsOptional()
  evaluate?: string;

  @IsOptional()
  id?: string;
}

export class UpdateHotelDto extends CreateHotelDto {}
