import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateHotelDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  images: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  price: string;

  @IsString()
  @IsOptional()
  image_2?: string;

  @IsString()
  @IsOptional()
  image_3?: string;

  @IsString()
  @IsOptional()
  image_4?: string;

  @IsString()
  @IsOptional()
  image_5?: string;

  @IsString()
  @IsOptional()
  evaluate?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  locationId: string;

  @IsString()
  @IsOptional()
  userId?: string;
}
