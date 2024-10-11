import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min } from 'class-validator';

export class CreateTourBookingDto {
  @ApiProperty({ description: 'ID của tour' })
  @IsString()
  tourId: string;

  // @ApiProperty({ description: 'ID của chuyến bay (nếu có)', required: false })
  // @IsOptional()
  // @IsString()
  // flightCrawlId?: string;

  // @ApiProperty({ description: 'ID của khách sạn (nếu có)', required: false })
  // @IsOptional()
  // @IsString()
  // hotelCrawlId?: string;

  @ApiProperty({ description: 'Số lượng tour đặt', example: 1 })
  @IsInt()
  @Min(1)
  tourQuantity: number;

  // flightQuantity?: number; // có thể không có, mặc định là 1
  // hotelQuantity?: number;

  // @ApiProperty({
  //   description: 'Số lượng chuyến bay đặt',
  //   example: 1,
  //   required: false,
  // })
  // @IsOptional()
  // @IsInt()
  // @Min(1)
  // flightQuantity?: number;

  // @ApiProperty({
  //   description: 'Số lượng khách sạn đặt',
  //   example: 1,
  //   required: false,
  // })
  // @IsOptional()
  // @IsInt()
  // @Min(1)
  // hotelQuantity?: number;
}
