import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateFlightBookingDto {
  @ApiProperty()
  @IsString()
  flightCrawlId: string;

  @ApiProperty()
  @IsNumber()
  flightQuantity?: number;
}
