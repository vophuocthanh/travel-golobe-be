import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { FlightCommentController } from './flight-comment.controller';
import { FlightCommentService } from './flight-comment.service';

@Module({
  controllers: [FlightCommentController],
  providers: [FlightCommentService, PrismaService],
})
export class FlightCommentModule {}
