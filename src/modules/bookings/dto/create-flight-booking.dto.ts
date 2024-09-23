import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateFlightBookingDto {
  @ApiProperty()
  @IsString()
  flightCrawlId: string;
}
