import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { HotelCrawlController } from './hotel-crawl.controller';
import { HotelCrawlService } from './hotel-crawl.service';

@Module({
  controllers: [HotelCrawlController],
  providers: [HotelCrawlService, PrismaService, JwtService],
})
export class HotelCrawlModule {}
