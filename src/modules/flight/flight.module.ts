import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { FlightController } from './flight.controller';
import { FlightService } from './flight.service';

@Module({
  controllers: [FlightController],
  providers: [FlightService, PrismaService],
})
export class FlightModule {}
