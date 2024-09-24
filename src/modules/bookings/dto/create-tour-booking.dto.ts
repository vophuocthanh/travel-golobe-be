import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateTourBookingDto {
  @ApiProperty()
  @IsString()
  tourId: string;

  @ApiProperty()
  @IsOptional()
  flightCrawlId?: string;

  @ApiProperty()
  @IsOptional()
  hotelCrawlId?: string;
}
