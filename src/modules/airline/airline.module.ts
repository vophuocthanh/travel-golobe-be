import { Module } from '@nestjs/common';
import { AirlineController } from './airline.controller';
import { AirlineService } from './airline.service';

@Module({
  controllers: [AirlineController],
  providers: [AirlineService]
})
export class AirlineModule {}
