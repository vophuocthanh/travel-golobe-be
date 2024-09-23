import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ReplyHotelDto {
  @ApiProperty({ description: 'Content of the reply' })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class ReplyToReplyHotelDto {
  @ApiProperty({ description: 'Content of the reply' })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class HotelReviewWithUserDto {
  id: string;
  content: string;
  rating: number;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
}
