import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ReplyTourDto {
  @ApiProperty({ description: 'Content of the reply' })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class ReplyToReplyTourDto {
  @ApiProperty({ description: 'Content of the reply' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
