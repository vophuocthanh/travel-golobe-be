import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateDtoTour {
  @ApiProperty()
  @IsOptional()
  name: string;

  @ApiProperty()
  @IsOptional()
  description: string;

  @ApiProperty()
  @IsOptional()
  image: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  created_at?: string;

  @IsOptional()
  @IsString()
  updated_at?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  start_date?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  end_date?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  starting_gate?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  sight_seeing?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  cuisine?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  suitable?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  ideal_time?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  vchouer?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  time_trip?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  baby_price?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  children_price?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  adult_price?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  image_2?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  image_3?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  image_4?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  image_5?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  rating?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  number_of_seats_remaining?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  road_vehicle?: string;
}
