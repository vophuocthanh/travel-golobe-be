import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateTripScheduleDto {
  @IsOptional()
  id?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  schedule: string;
}
