import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateFlightDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  images: string;

  @ApiProperty()
  @IsString()
  price: string;

  @ApiProperty()
  @IsString()
  startDate: string;

  @ApiProperty()
  @IsString()
  endDate: string;

  @ApiProperty()
  @IsString()
  perios: string;

  @IsOptional()
  @IsString()
  startLocation?: string;

  @IsOptional()
  @IsString()
  endLocation?: string;

  @IsOptional()
  @IsNumber()
  remainingCount?: number;

  @IsOptional()
  @IsNumber()
  count?: number;

  @IsOptional()
  @IsString()
  cuisine?: string;

  @IsOptional()
  @IsString()
  sightSeeing?: string;
}
