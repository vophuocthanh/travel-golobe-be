import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateHotelBookingDto {
  @ApiProperty()
  @IsString()
  hotelCrawlId: string;

  @ApiProperty()
  @IsOptional()
  hotelQuantity?: number;

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  roomId: string;

  @ApiProperty()
  @IsOptional()
  checkInDate?: string;

  @ApiProperty()
  @IsOptional()
  checkOutDate?: string;
}
