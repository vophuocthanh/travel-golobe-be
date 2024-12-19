import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
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
import { Tour } from '@prisma/client';
import { Roles } from 'src/decorator/roles.decorator';
import { RolesGuard } from 'src/guard/roles.guard';
import { HandleAuthGuard } from 'src/modules/auth/guard/auth.guard';
import { CreateDtoTour } from 'src/modules/tour/dto/create.dto';
import {
  TourDto,
  TourPaginationResponseType,
} from 'src/modules/tour/dto/tour.dto';
import { UpdateTripScheduleDto } from 'src/modules/tour/dto/update-trip-schedule.dto';
import { UpdateDtoTour } from 'src/modules/tour/dto/update.dto';
import { TourService } from 'src/modules/tour/tour.service';
import { RequestWithUser } from 'src/types/users';

@ApiBearerAuth()
@ApiTags('tour')
@Controller('tour')
export class TourController {
  constructor(private tourService: TourService) {}

  // @UseGuards(HandleAuthGuard)
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'items_per_page', required: false })
  @ApiQuery({ name: 'search', required: false })
  @Get()
  @ApiQuery({
    name: 'sort_by_price',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort flights by price',
  })
  @ApiQuery({
    name: 'min_price',
    required: false,
    type: Number,
    description: 'Minimum price filter',
  })
  @ApiQuery({
    name: 'max_price',
    required: false,
    type: Number,
    description: 'Maximum price filter',
  })
  @ApiQuery({
    name: 'start_date',
    required: false,
    type: String,
    description: 'Start day in format dd-mm-yyyy',
  })
  @ApiQuery({
    name: 'end_date',
    required: false,
    type: String,
    description: 'End day in format dd-mm-yyyy',
  })
  @ApiQuery({
    name: 'rating',
    required: false,
    type: Number,
    description: 'Filter tours by rating',
  })
  @ApiQuery({
    name: 'starting_gate',
    required: false,
    type: String,
    description: 'Filter tours by starting gate',
  })
  @ApiQuery({
    name: 'road_vehicle',
    required: false,
    type: String,
    description: 'Filter tours by road vehicle',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    type: String,
    description: 'Filter tours by type',
  })
  @ApiOperation({ summary: 'Lấy tất cả các tour' })
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getTours(
    @Query() params: TourDto,
  ): Promise<TourPaginationResponseType> {
    return this.tourService.getTours(params);
  }

  @Get('find-by-budget')
  @ApiOperation({
    summary: 'Tìm kiếm tour phù hợp với ngân sách người dùng',
    description:
      'Dựa trên ngân sách tổng nhập vào, tìm kiếm các gợi ý tour với khách sạn, tour và phương tiện di chuyển phù hợp.',
  })
  @ApiQuery({
    name: 'totalBudget',
    description: 'Ngân sách tổng mà người dùng muốn chi cho tour',
    required: true,
    type: Number,
  })
  async findByBudget(@Query('totalBudget') totalBudget: number) {
    if (!totalBudget || totalBudget <= 0) {
      throw new NotFoundException('Ngân sách không hợp lệ');
    }

    return await this.tourService.findToursWithinBudget(totalBudget);
  }

  @Get('unique-starting-gate')
  async getUniqueStartingGate(): Promise<{ data: string[] }> {
    return this.tourService.getUniqueStartingGate();
  }

  @Get('unique-road-vehicle')
  async getUniqueRoadVehicle(): Promise<{ data: string[] }> {
    return this.tourService.getUniqueRoadVehicle();
  }

  @Get('count-tour')
  async countTour() {
    return this.tourService.getCountTour();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin tour theo id' })
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getTourById(@Param('id') id: string): Promise<Tour> {
    return this.tourService.getTourById(id);
  }

  @UseGuards(HandleAuthGuard, RolesGuard)
  @Roles('ADMIN', 'EMPLOYEE')
  @Post()
  @ApiOperation({ summary: 'Tạo tour' })
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createTour(
    @Body() createTour: CreateDtoTour,
    @Req() req: RequestWithUser,
  ): Promise<Tour> {
    const userId = req.user.id;
    return this.tourService.createTours(createTour, userId);
  }

  @UseGuards(HandleAuthGuard, RolesGuard)
  @Roles('ADMIN', 'EMPLOYEE')
  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin tour' })
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateTour(@Param('id') id: string, @Body() updateTour: UpdateDtoTour) {
    return this.tourService.updateTour(id, updateTour);
  }

  @UseGuards(HandleAuthGuard, RolesGuard)
  @Roles('ADMIN', 'EMPLOYEE')
  @Put(':tourId/trip-schedule/:tripScheduleId')
  @ApiOperation({ summary: 'Sửa lịch trình của chueyesn tour' })
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateTripSchedule(
    @Param('tourId') tourId: string,
    @Param('tripScheduleId') tripScheduleId: string,
    @Body() tripSchedule: UpdateTripScheduleDto,
  ) {
    return this.tourService.updateTripSchedule(
      tourId,
      tripScheduleId,
      tripSchedule,
    );
  }

  @UseGuards(HandleAuthGuard, RolesGuard)
  @Roles('ADMIN', 'EMPLOYEE')
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa tour' })
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async deleteTour(@Param('id') id: string): Promise<{ message: string }> {
    return this.tourService.deleteTour(id);
  }
}
