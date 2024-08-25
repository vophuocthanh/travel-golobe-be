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
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Flight } from '@prisma/client';
import { HandleAuthGuard } from 'src/modules/auth/guard/auth.guard';
import { CreateFlightDto } from 'src/modules/flight/dto/create.dto';
import {
  FlightDto,
  FlightPaginationResponseType,
} from 'src/modules/flight/dto/flight.dto';
import { UpdateFlightDto } from 'src/modules/flight/dto/update.dto';
import { FlightService } from 'src/modules/flight/flight.service';
import { RequestWithUser } from 'src/types/users';

@ApiBearerAuth()
@ApiTags('flight')
@Controller('flight')
export class FlightController {
  constructor(private flightService: FlightService) {}

  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'items_per_page', required: false })
  @ApiQuery({ name: 'search', required: false })
  @Get()
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  getFlights(
    @Query() params: FlightDto,
  ): Promise<FlightPaginationResponseType> {
    return this.flightService.getFlights(params);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  getFlightById(@Query('id') id: string): Promise<Flight> {
    return this.flightService.getFlightById(id);
  }

  @UseGuards(HandleAuthGuard)
  @Post()
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createFlight(
    @Body() createFlightDto: CreateFlightDto,
    @Req() req: RequestWithUser,
  ): Promise<Flight> {
    const userId = req.user.id;
    return this.flightService.createFlight(createFlightDto, userId);
  }

  @UseGuards(HandleAuthGuard)
  @Put(':id')
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateFlight(
    @Param('id') id: string,
    @Body() updateFlightDto: UpdateFlightDto,
  ) {
    return this.flightService.updateFlight(id, updateFlightDto);
  }

  @UseGuards(HandleAuthGuard)
  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async deleteFlight(@Param('id') id: string) {
    return this.flightService.deleteFlight(id);
  }
}
