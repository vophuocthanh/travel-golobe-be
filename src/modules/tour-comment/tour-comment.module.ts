import { Module } from '@nestjs/common';
import { TourCommentController } from './tour-comment.controller';
import { TourCommentService } from './tour-comment.service';

@Module({
  controllers: [TourCommentController],
  providers: [TourCommentService]
})
export class TourCommentModule {}
