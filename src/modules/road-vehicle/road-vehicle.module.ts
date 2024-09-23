import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { RoadVehicleController } from './road-vehicle.controller';
import { RoadVehicleService } from './road-vehicle.service';

@Module({
  controllers: [RoadVehicleController],
  providers: [RoadVehicleService, PrismaService, JwtService],
})
export class RoadVehicleModule {}
