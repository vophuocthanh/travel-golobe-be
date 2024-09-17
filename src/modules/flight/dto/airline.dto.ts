import { ApiProperty } from '@nestjs/swagger';
import { Airline } from '@prisma/client';
import { IsString } from 'class-validator';

export class AirlineDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  logo: string;

  @ApiProperty()
  @IsString()
  description: string;
}

export class AirlineTypeDto {
  search?: string;
  items_per_page?: number;
  page?: number;
}

export interface AirlinePaginationResponseType {
  data: Airline[];
  total: number;
  currentPage: number;
  itemsPerPage: number;
}
