import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateRoadVehicleDto {
  @ApiProperty()
  @IsNotEmpty()
  brand: string;

  @ApiProperty()
  @IsNotEmpty()
  price: number;

  @ApiProperty()
  @IsNotEmpty()
  start_day: string;

  @ApiProperty()
  @IsNotEmpty()
  end_day: string;

  @ApiProperty()
  @IsNotEmpty()
  number_of_seat: string;
}
