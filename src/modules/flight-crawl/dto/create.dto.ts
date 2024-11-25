import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, ValidateIf } from 'class-validator';
import { FlightType } from 'src/enums/flight-type.enum';

export class CreateFlightCrawlDto {
  @ApiProperty()
  @IsOptional()
  brand?: string;

  @ApiProperty()
  @IsOptional()
  price?: number;

  @ApiProperty()
  @IsOptional()
  start_time?: string;

  @ApiProperty()
  @IsOptional()
  start_day?: string;

  @ApiProperty()
  @IsOptional()
  end_day?: string;

  @ApiProperty()
  @IsOptional()
  end_time?: string;

  @ApiProperty()
  @IsOptional()
  take_place?: string;

  @ApiProperty()
  @IsOptional()
  destination?: string;

  @ApiProperty()
  @IsOptional()
  trip_to?: string;

  @ApiProperty()
  @IsOptional()
  image?: string;

  @ApiProperty({ enum: FlightType })
  @IsEnum(FlightType)
  type: FlightType;

  @ApiPropertyOptional({
    description: 'Thời gian khởi hành chuyến về, chỉ có khi type là ROUND_TRIP',
  })
  @ValidateIf((dto) => dto.type === FlightType.ROUND_TRIP)
  @IsOptional()
  return_start_time?: string;

  @ApiPropertyOptional({
    description: 'Ngày khởi hành chuyến về, chỉ có khi type là ROUND_TRIP',
  })
  @ValidateIf((dto) => dto.type === FlightType.ROUND_TRIP)
  @IsOptional()
  return_start_day?: string;

  @ApiPropertyOptional({
    description: 'Ngày kết thúc chuyến về, chỉ có khi type là ROUND_TRIP',
  })
  @ValidateIf((dto) => dto.type === FlightType.ROUND_TRIP)
  @IsOptional()
  return_end_day?: string;

  @ApiPropertyOptional({
    description: 'Thời gian kết thúc chuyến về, chỉ có khi type là ROUND_TRIP',
  })
  @ValidateIf((dto) => dto.type === FlightType.ROUND_TRIP)
  @IsOptional()
  return_end_time?: string;

  @ApiPropertyOptional({
    description: 'Thời gian di chuyển chuyến về, chỉ có khi type là ROUND_TRIP',
  })
  @ValidateIf((dto) => dto.type === FlightType.ROUND_TRIP)
  @IsOptional()
  return_trip_time?: string;
}
