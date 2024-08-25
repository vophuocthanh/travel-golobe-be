import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';

@Module({
  controllers: [LocationController],
  providers: [LocationService, PrismaService, JwtService],
})
export class LocationModule {}
