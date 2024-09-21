import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { FlightController } from './flight.controller';
import { FlightService } from './flight.service';

@Module({
  controllers: [FlightController],
  providers: [FlightService, PrismaService, JwtService],
})
export class FlightModule {}
