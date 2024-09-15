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
import { Hotel, HotelReview } from '@prisma/client';
import { HandleAuthGuard } from 'src/modules/auth/guard/auth.guard';
import { CreateHotelReviewDto } from 'src/modules/hotel/dto/create-hotel-review.dto';
import { CreateHotelDto } from 'src/modules/hotel/dto/create.dto';
import {
  HotelDto,
  HotelPaginationResponseType,
} from 'src/modules/hotel/dto/hotel.dto';
import { UpdateHotelReviewDto } from 'src/modules/hotel/dto/update-hotel-revew.dto';
import { UpdateHotelDto } from 'src/modules/hotel/dto/update.dto';
import { HotelService } from 'src/modules/hotel/hotel.service';
import { RequestWithUser } from 'src/types/users';

@ApiBearerAuth()
@ApiTags('hotel')
@Controller('hotel')
export class HotelController {
  constructor(private hotelService: HotelService) {}

  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'items_per_page', required: false })
  @ApiQuery({ name: 'search', required: false })
  @Get()
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  getHotels(@Query() params: HotelDto): Promise<HotelPaginationResponseType> {
    return this.hotelService.getHotels(params);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  getHotelById(@Param('id') id: string): Promise<Hotel> {
    return this.hotelService.getHotelById(id);
  }

  @UseGuards(HandleAuthGuard)
  @Post()
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createHotel(
    @Body() createHotelDto: CreateHotelDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.hotelService.createHotel(createHotelDto, userId);
  }

  @UseGuards(HandleAuthGuard)
  @Put(':id')
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  update(
    @Param('id') id: string,
    @Body() body: UpdateHotelDto,
  ): Promise<Hotel> {
    return this.hotelService.updateHotel(id, body);
  }

  @UseGuards(HandleAuthGuard)
  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.hotelService.deleteHotel(id);
  }

  // Review

  @UseGuards(HandleAuthGuard)
  @Get(':id/reviews')
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getReviews(@Param('id') id: string): Promise<HotelReview[]> {
    return this.hotelService.getHotelReviews(id);
  }

  @UseGuards(HandleAuthGuard)
  @Post(':id/reviews')
  @ApiResponse({ status: 201, description: 'Review added successfully' })
  async addReview(
    @Param('id') id: string,
    @Body() body: CreateHotelReviewDto,
    @Req() req: RequestWithUser,
  ): Promise<HotelReview> {
    const userId = req.user.id;
    return this.hotelService.addReviewToHotel(id, body, userId);
  }

  @UseGuards(HandleAuthGuard)
  @Put(':id/reviews/:reviewId')
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updateReview(
    @Param('reviewId') reviewId: string,
    @Body() body: UpdateHotelReviewDto,
  ): Promise<HotelReview> {
    return this.hotelService.updateHotelReview(reviewId, body);
  }

  @UseGuards(HandleAuthGuard)
  @Delete(':hotelId/review/:reviewId')
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteReview(
    @Param('hotelId') hotelId: string,
    @Param('reviewId') reviewId: string,
    @Req() req: RequestWithUser,
  ): Promise<{ message: string }> {
    const userId = req.user.id;
    return this.hotelService.deleteHotelReview(hotelId, reviewId, userId);
  }
}
