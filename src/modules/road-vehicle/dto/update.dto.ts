import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateRoadVehicleCrawlDto {
  @ApiProperty()
  @IsOptional()
  brand?: string;

  @ApiProperty()
  @IsOptional()
  price?: number;

  @ApiProperty()
  @IsOptional()
  number_of_seat?: string;

  @ApiProperty()
  @IsOptional()
  start_time?: string;

  @ApiProperty()
  @IsOptional()
  start_day?: string;

  @ApiProperty()
  @IsOptional()
  end_day?: string;

  @ApiProperty()
  @IsOptional()
  end_time?: string;

  @ApiProperty()
  @IsOptional()
  trip_time?: string;

  @ApiProperty()
  @IsOptional()
  take_place?: string;

  @ApiProperty()
  @IsOptional()
  destination?: string;

  @ApiProperty()
  @IsOptional()
  location?: string;

  @ApiProperty()
  @IsOptional()
  number_of_seats_remaining?: number;
}
