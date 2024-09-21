import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FlightGateway } from 'src/modules/flight-comment/gateway/flight.gateway';
import { PrismaService } from 'src/prisma.service';
import { FlightCommentController } from './flight-comment.controller';
import { FlightCommentService } from './flight-comment.service';

@Module({
  controllers: [FlightCommentController],
  providers: [FlightCommentService, PrismaService, JwtService, FlightGateway],
})
export class FlightCommentModule {}
