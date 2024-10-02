import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateHotelBookingDto {
  @ApiProperty()
  @IsString()
  hotelCrawlId: string;

  @ApiProperty()
  @IsOptional()
  hotelQuantity?: number;
}
