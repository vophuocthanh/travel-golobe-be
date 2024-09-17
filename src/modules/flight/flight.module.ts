import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FlightGateway } from 'src/modules/flight/gateway/flight.gateway';
import { PrismaService } from 'src/prisma.service';
import { FlightController } from './flight.controller';
import { FlightService } from './flight.service';

@Module({
  controllers: [FlightController],
  providers: [FlightService, PrismaService, JwtService, FlightGateway],
})
export class FlightModule {}
