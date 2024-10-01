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
import { Tour } from '@prisma/client';
import { HandleAuthGuard } from 'src/modules/auth/guard/auth.guard';
import { CreateDtoTour } from 'src/modules/tour/dto/create.dto';
import {
  TourDto,
  TourPaginationResponseType,
} from 'src/modules/tour/dto/tour.dto';
import { UpdateDtoTour } from 'src/modules/tour/dto/update.dto';
import { TourService } from 'src/modules/tour/tour.service';
import { RequestWithUser } from 'src/types/users';

@ApiBearerAuth()
@ApiTags('tour')
@Controller('tour')
export class TourController {
  constructor(private tourService: TourService) {}

  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'items_per_page', required: false })
  @ApiQuery({ name: 'search', required: false })
  @Get()
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
  @UseGuards(HandleAuthGuard)
  @ApiOperation({ summary: 'Lấy danh sách các tour yêu thích của người dùng' })
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @Get('favorite')
  async getFavoriteTours(@Req() req: RequestWithUser) {
    const userId = req.user.id;
    const favorites = await this.tourService.getFavoriteTours(userId);
    return favorites;
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

  @Get('search')
  @ApiOperation({ summary: 'Tìm kiếm tour theo địa điểm' })
  async searchTours(
    @Query('start') startLocation: string,
    @Query('end') endLocation: string,
  ) {
    return this.tourService.findToursByLocation(startLocation, endLocation);
  }

  @UseGuards(HandleAuthGuard)
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

  @UseGuards(HandleAuthGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin tour' })
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateTour(@Param('id') id: string, @Body() updateTour: UpdateDtoTour) {
    return this.tourService.updateTour(id, updateTour);
  }

  @UseGuards(HandleAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa tour' })
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async deleteTour(@Param('id') id: string): Promise<{ message: string }> {
    return this.tourService.deleteTour(id);
  }

  // isFavorite

  @UseGuards(HandleAuthGuard)
  @ApiOperation({ summary: 'Đánh dấu tour là yêu thích' })
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @Post(':id/favorite')
  async markAsFavorite(
    @Param('id') tourId: string,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    await this.tourService.markAsFavorite(userId, tourId);
    return { message: 'Marked as favorite' };
  }

  @UseGuards(HandleAuthGuard)
  @ApiOperation({ summary: 'Bỏ đánh dấu yêu thích tour' })
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @Post(':id/unfavorite')
  async unmarkAsFavorite(
    @Param('id') tourId: string,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    await this.tourService.unmarkAsFavorite(userId, tourId);
    return { message: 'Unmarked as favorite' };
  }
}
