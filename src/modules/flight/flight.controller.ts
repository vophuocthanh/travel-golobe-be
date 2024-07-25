import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Flight } from '@prisma/client';
import { HandleAuthGuard } from 'src/modules/auth/guard/auth.guard';
import {
  CreateFlightDto,
  FlightDto,
  FlightPaginationResponseType,
} from 'src/modules/flight/dto/flight.dto';
import { FlightService } from 'src/modules/flight/flight.service';
import { RequestWithUser } from 'src/modules/hotel/dto/hotel.dto';

@Controller('flight')
export class FlightController {
  constructor(private flightService: FlightService) {}

  @Get()
  getFlights(
    @Query() params: FlightDto,
  ): Promise<FlightPaginationResponseType> {
    return this.flightService.getFlights(params);
  }

  @Get(':id')
  getFlightById(@Query('id') id: string): Promise<Flight> {
    return this.flightService.getFlightById(id);
  }

  @UseGuards(HandleAuthGuard)
  @Post()
  async createFlight(
    @Body() createFlightDto: CreateFlightDto,
    @Req() req: RequestWithUser,
  ): Promise<Flight> {
    const userId = req.user.id;
    return this.flightService.createFlight(createFlightDto, userId);
  }

  @UseGuards(HandleAuthGuard)
  @Put(':id')
  async updateFlight(@Param('id') id: string, @Body() updateFlightDto: Flight) {
    return this.flightService.updateFlight(id, updateFlightDto);
  }

  @UseGuards(HandleAuthGuard)
  @Delete(':id')
  async deleteFlight(@Param('id') id: string) {
    return this.flightService.deleteFlight(id);
  }
}
