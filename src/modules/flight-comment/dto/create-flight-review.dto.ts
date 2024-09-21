import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateFlightReviewDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;
}
