import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateTourBookingDto {
  @ApiProperty()
  @IsString()
  tourId: string;
}
