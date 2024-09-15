import { Module } from '@nestjs/common';
import { HotelCommentController } from './hotel-comment.controller';
import { HotelCommentService } from './hotel-comment.service';

@Module({
  controllers: [HotelCommentController],
  providers: [HotelCommentService]
})
export class HotelCommentModule {}
