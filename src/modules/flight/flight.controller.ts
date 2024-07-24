import { Controller, Get, Query } from '@nestjs/common';
import {
  FlightDto,
  FlightPaginationResponseType,
} from 'src/modules/flight/dto/flight.dto';
import { FlightService } from 'src/modules/flight/flight.service';

@Controller('flight')
export class FlightController {
  constructor(private flightService: FlightService) {}

  @Get()
  getFlights(
    @Query() params: FlightDto,
  ): Promise<FlightPaginationResponseType> {
    return this.flightService.getFlights(params);
  }
}
