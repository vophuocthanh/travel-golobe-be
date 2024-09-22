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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Flight } from '@prisma/client';
import { existsSync, mkdirSync } from 'fs';
import { HandleAuthGuard } from 'src/modules/auth/guard/auth.guard';
import { CreateFlightDto } from 'src/modules/flight/dto/create.dto';
import {
  FlightDto,
  FlightPaginationResponseType,
} from 'src/modules/flight/dto/flight.dto';
import { UpdateFlightDto } from 'src/modules/flight/dto/update.dto';
import { FlightService } from 'src/modules/flight/flight.service';
import { RequestWithUser } from 'src/types/users';

const uploadDir = './uploads';

if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

@ApiBearerAuth()
@ApiTags('flight')
@Controller('flight')
export class FlightController {
  constructor(private flightService: FlightService) {}

  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'items_per_page', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiOperation({ summary: 'Lấy tất cả các thông tin chuyến bay' })
  @Get()
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getFlights(
    @Query() params: FlightDto,
  ): Promise<FlightPaginationResponseType> {
    return this.flightService.getFlights(params);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chuyến bay theo id' })
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getFlightById(@Param('id') id: string): Promise<Flight> {
    return this.flightService.getFlightById(id);
  }

  @UseGuards(HandleAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Tạo chuyến bay' })
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
  @ApiOperation({ summary: 'Cập nhật thông tin chuyến bay' })
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
  @ApiOperation({ summary: 'Xóa chuyến bay' })
  @ApiResponse({ status: 200, description: 'Successfully deleted the flight' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async deleteFlight(@Param('id') id: string): Promise<{ message: string }> {
    return this.flightService.deleteFlight(id);
  }

  // Review

  // Yeut thich
  @UseGuards(HandleAuthGuard)
  @Post(':id/favorite')
  @ApiOperation({ summary: 'Tym hoặc bỏ tym chuyến bay' })
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async toggleFavorite(
    @Param('id') flightId: string,
    @Req() req: RequestWithUser,
  ): Promise<string> {
    const userId = req.user.id;
    return this.flightService.toggleFavorite(flightId, userId);
  }

  @Get(':id/favorites/count')
  @ApiOperation({ summary: 'Lấy số lượng tym cho chuyến bay' })
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async countFavorites(@Param('id') flightId: string): Promise<number> {
    return this.flightService.countFavorites(flightId);
  }
}
