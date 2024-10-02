import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateDtoTour {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  image: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  created_at?: string;

  @IsOptional()
  @IsString()
  updated_at?: string;

  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsString()
  starting_gate?: string;

  @IsOptional()
  @IsString()
  sight_seeing?: string;

  @IsOptional()
  @IsString()
  cuisine?: string;

  @IsOptional()
  @IsString()
  suitable?: string;

  @IsOptional()
  @IsString()
  ideal_time?: string;

  @IsOptional()
  @IsString()
  vchouer?: string;

  @IsOptional()
  @IsString()
  time_trip?: string;

  @IsOptional()
  @IsNumber()
  baby_price?: number;

  @IsOptional()
  @IsNumber()
  children_price?: number;

  @IsOptional()
  @IsNumber()
  adult_price?: number;

  @IsOptional()
  @IsString()
  image_2?: string;

  @IsOptional()
  @IsString()
  image_3?: string;

  @IsOptional()
  @IsString()
  image_4?: string;

  @IsOptional()
  @IsString()
  image_5?: string;

  @IsOptional()
  @IsNumber()
  rating?: number;

  @IsOptional()
  @IsNumber()
  number_of_seats_remaining?: number;

  @IsOptional()
  @IsString()
  road_vehicle?: string;
}
