import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma.service';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [BookingsController],
  providers: [BookingsService, PrismaService, JwtService],
})
export class BookingsModule {}
