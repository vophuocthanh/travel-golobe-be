import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { HotelCommentController } from './hotel-comment.controller';
import { HotelCommentService } from './hotel-comment.service';

@Module({
  controllers: [HotelCommentController],
  providers: [HotelCommentService, PrismaService, JwtService],
})
export class HotelCommentModule {}
