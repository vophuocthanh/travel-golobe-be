import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { FlightCrawlController } from './flight-crawl.controller';
import { FlightCrawlService } from './flight-crawl.service';

@Module({
  controllers: [FlightCrawlController],
  providers: [FlightCrawlService, PrismaService, JwtService],
})
export class FlightCrawlModule {}
