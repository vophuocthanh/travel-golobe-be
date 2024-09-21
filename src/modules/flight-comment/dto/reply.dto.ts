import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ReplyFlightDto {
  @ApiProperty({ description: 'Content of the reply' })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class ReplyToReplyFlightDto {
  @ApiProperty({ description: 'Content of the reply' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
