import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateDtoTour {
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

  @ApiProperty()
  @IsOptional()
  @IsString()
  image_2?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  image_3?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  image_4?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  image_5?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  transport?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  hotel?: string;

  @IsOptional()
  @IsString()
  starting_gate?: string;

  @IsOptional()
  @IsString()
  sight_seeing?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  rating?: number;
}
