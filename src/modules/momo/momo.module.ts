import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { MomoController } from './momo.controller';
import { MomoService } from './momo.service';

@Module({
  controllers: [MomoController],
  providers: [MomoService, PrismaService, JwtService],
})
export class MomoModule {}
