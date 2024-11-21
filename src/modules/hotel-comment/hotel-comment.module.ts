import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HotelCommentGateway } from 'src/modules/hotel-comment/gateway/hotel-comment.gateway';
import { PrismaService } from 'src/prisma.service';
import { HotelCommentController } from './hotel-comment.controller';
import { HotelCommentService } from './hotel-comment.service';

@Module({
  controllers: [HotelCommentController],
  providers: [
    HotelCommentService,
    PrismaService,
    JwtService,
    HotelCommentGateway,
  ],
})
export class HotelCommentModule {}
