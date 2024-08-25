import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDtoTour {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  image: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsNotEmpty()
  location: string;

  @IsOptional()
  @IsString()
  created_at?: string;

  @IsOptional()
  @IsString()
  updated_at?: string;

  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsNumber()
  remainingCount?: number;

  @IsOptional()
  @IsString()
  count?: string;

  @IsOptional()
  @IsString()
  cuisine?: string;

  @IsOptional()
  @IsString()
  suitable_subject?: string;

  @IsOptional()
  @IsString()
  vchouer?: string;

  @IsOptional()
  @IsString()
  time_out?: string;

  @IsOptional()
  @IsString()
  ideal_time?: string;

  @IsOptional()
  @IsString()
  image2?: string;

  @IsOptional()
  @IsString()
  image3?: string;

  @IsOptional()
  @IsString()
  image4?: string;

  @IsOptional()
  @IsString()
  transport?: string;

  @IsOptional()
  @IsString()
  hotel?: string;

  @IsOptional()
  @IsString()
  starting_gate?: string;

  @IsOptional()
  @IsString()
  sight_seeing?: string;
}
