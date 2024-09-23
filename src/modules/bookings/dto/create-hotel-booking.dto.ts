import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateHotelBookingDto {
  @ApiProperty()
  @IsString()
  hotelCrawlId: string;
}
