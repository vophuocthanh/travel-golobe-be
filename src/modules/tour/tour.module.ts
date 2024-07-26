import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { TourController } from './tour.controller';
import { TourService } from './tour.service';

@Module({
  controllers: [TourController],
  providers: [TourService, PrismaService, JwtService],
})
export class TourModule {}
