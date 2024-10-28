import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CreateFlightCrawlDto {
  @ApiProperty()
  @IsOptional()
  brand?: string;

  @ApiProperty()
  @IsOptional()
  price?: number;

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
  take_place?: string;

  @ApiProperty()
  @IsOptional()
  destination?: string;

  @ApiProperty()
  @IsOptional()
  trip_to?: string;

  @ApiProperty()
  @IsOptional()
  image?: string;
}
