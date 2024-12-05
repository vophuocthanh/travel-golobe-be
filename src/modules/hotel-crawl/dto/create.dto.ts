import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateHotelCrawlDto {
  @ApiProperty()
  @IsNotEmpty()
  hotel_names: string;

  @ApiProperty()
  @IsNotEmpty()
  location: string;

  @ApiProperty()
  @IsNotEmpty()
  price: number;

  @ApiProperty()
  @IsNotEmpty()
  image: string;

  @ApiProperty()
  @IsNotEmpty()
  received_time: string;

  @ApiProperty()
  @IsNotEmpty()
  giveback_time: string;

  @ApiProperty()
  description?: string;
}
