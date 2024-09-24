import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateHotelCrawlDto {
  @ApiProperty()
  @IsOptional()
  hotel_names?: string;

  @ApiProperty()
  @IsOptional()
  location?: string;

  @ApiProperty()
  @IsOptional()
  star_number?: number;

  @ApiProperty()
  @IsOptional()
  price?: number;

  @ApiProperty()
  @IsOptional()
  score_hotels?: number;

  @ApiProperty()
  @IsOptional()
  number_rating?: number;

  @ApiProperty()
  @IsOptional()
  received_time?: string;

  @ApiProperty()
  @IsOptional()
  giveback_time?: string;

  @ApiProperty()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsOptional()
  hotel_link?: string;

  @ApiProperty()
  @IsOptional()
  place?: string;

  @ApiProperty()
  @IsOptional()
  image?: string;

  @ApiProperty()
  @IsOptional()
  image_2?: string;

  @ApiProperty()
  @IsOptional()
  image_3?: string;

  @ApiProperty()
  @IsOptional()
  image_4?: string;

  @ApiProperty()
  @IsOptional()
  image_5?: string;
}
