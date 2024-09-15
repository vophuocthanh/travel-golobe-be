import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateHotelDto {
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

  @ApiProperty()
  @IsString()
  @IsOptional()
  image_2?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  image_3?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  image_4?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  image_5?: string;

  @ApiProperty()
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

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  rating?: number;
}
