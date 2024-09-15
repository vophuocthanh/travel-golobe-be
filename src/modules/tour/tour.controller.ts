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
import { Tour, TourReview } from '@prisma/client';
import { HandleAuthGuard } from 'src/modules/auth/guard/auth.guard';
import { CreateTourReviewDto } from 'src/modules/tour/dto/create-tour-review.dto';
import { CreateDtoTour } from 'src/modules/tour/dto/create.dto';
import {
  TourDto,
  TourPaginationResponseType,
} from 'src/modules/tour/dto/tour.dto';
import { UpdateTourReviewDto } from 'src/modules/tour/dto/update-tour-review.dto';
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
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  getTours(@Query() params: TourDto): Promise<TourPaginationResponseType> {
    return this.tourService.getTours(params);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  getTourById(@Query('id') id: string): Promise<Tour> {
    return this.tourService.getTourById(id);
  }

  @Get('search')
  async searchTours(
    @Query('start') startLocation: string,
    @Query('end') endLocation: string,
  ) {
    return this.tourService.findToursByLocation(startLocation, endLocation);
  }

  @UseGuards(HandleAuthGuard)
  @Post()
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  createTour(
    @Body() createTour: CreateDtoTour,
    @Req() req: RequestWithUser,
  ): Promise<Tour> {
    const userId = req.user.id;
    return this.tourService.createTours(createTour, userId);
  }

  @UseGuards(HandleAuthGuard)
  @Put(':id')
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateTour(@Param('id') id: string, @Body() updateTour: UpdateDtoTour) {
    return this.tourService.updateTour(id, updateTour);
  }

  @UseGuards(HandleAuthGuard)
  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async deleteTour(@Param('id') id: string): Promise<{ message: string }> {
    return this.tourService.deleteTour(id);
  }
  // Review

  @UseGuards(HandleAuthGuard)
  @Get(':id/reviews')
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getReviews(@Param('id') itourId: string): Promise<TourReview[]> {
    return this.tourService.getTourReviews(itourId);
  }

  @UseGuards(HandleAuthGuard)
  @Post(':id/reviews')
  @ApiResponse({ status: 201, description: 'Review added successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async addReview(
    @Param('id') id: string,
    @Body() createTourReview: CreateTourReviewDto,
    @Req() req: RequestWithUser,
  ): Promise<TourReview> {
    const userId = req.user.id;
    return this.tourService.addReviewToTour(id, createTourReview, userId);
  }

  @UseGuards(HandleAuthGuard)
  @Put(':id/reviews/:reviewId')
  @ApiResponse({ status: 200, description: 'Successfully updated review' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateReview(
    @Param('reviewId') reviewId: string,
    @Body() updateTourReviewDto: UpdateTourReviewDto,
  ): Promise<TourReview> {
    return this.tourService.updateTourReview(reviewId, updateTourReviewDto);
  }

  @UseGuards(HandleAuthGuard)
  @Delete(':id/reviews/:reviewId')
  @ApiResponse({ status: 200, description: 'Successfully deleted review' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteReview(
    @Param('id') id: string,
    @Param('reviewId') reviewId: string,
    @Req() req: RequestWithUser,
  ): Promise<{ message: string }> {
    const userId = req.user.id;
    return this.tourService.deleteTourReview(id, reviewId, userId);
  }
}
