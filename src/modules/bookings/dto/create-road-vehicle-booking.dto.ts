import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateRoadVehicleBookingDto {
  @ApiProperty()
  @IsString()
  roadVehicleId: string;

  @ApiProperty()
  @IsOptional()
  roadVehicleQuantity?: number;
}
