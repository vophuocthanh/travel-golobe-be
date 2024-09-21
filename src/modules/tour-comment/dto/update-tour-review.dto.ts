import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateTourReviewDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  content?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  rating?: number;
}
