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
  star_number?: string;

  @ApiProperty()
  @IsOptional()
  price?: string;

  @ApiProperty()
  @IsOptional()
  score_hotels?: string;

  @ApiProperty()
  @IsOptional()
  number_rating?: string;

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
