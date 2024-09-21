import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { TourCommentController } from './tour-comment.controller';
import { TourCommentService } from './tour-comment.service';

@Module({
  controllers: [TourCommentController],
  providers: [TourCommentService, PrismaService, JwtService],
})
export class TourCommentModule {}
