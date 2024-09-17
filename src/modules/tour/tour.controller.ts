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
import { ReviewReplyTour, Tour, TourReview } from '@prisma/client';
import { HandleAuthGuard } from 'src/modules/auth/guard/auth.guard';
import { CreateTourReviewDto } from 'src/modules/tour/dto/create-tour-review.dto';
import { CreateDtoTour } from 'src/modules/tour/dto/create.dto';
import {
  ReplyToReplyTourDto,
  ReplyTourDto,
} from 'src/modules/tour/dto/reply.dto';
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

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin tour theo id' })
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getTourById(@Query('id') id: string): Promise<Tour> {
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

  // Review

  @UseGuards(HandleAuthGuard)
  @Get(':id/reviews')
  @ApiOperation({ summary: 'Lấy tất cả đánh giá của từng tour' })
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getReviews(@Param('id') tourId: string): Promise<TourReview[]> {
    return this.tourService.getTourReviews(tourId);
  }

  @UseGuards(HandleAuthGuard)
  @Post(':id/reviews')
  @ApiOperation({ summary: 'Thêm đánh giá cho tour' })
  @ApiResponse({ status: 201, description: 'Review added successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
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
  @ApiOperation({ summary: 'Cập nhật đánh giá của tour' })
  @ApiResponse({ status: 200, description: 'Successfully updated review' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateReview(
    @Param('reviewId') reviewId: string,
    @Body() updateTourReviewDto: UpdateTourReviewDto,
  ): Promise<TourReview> {
    return this.tourService.updateTourReview(reviewId, updateTourReviewDto);
  }

  @UseGuards(HandleAuthGuard)
  @Delete(':id/reviews/:reviewId')
  @ApiOperation({ summary: 'Xóa đánh giá' })
  @ApiResponse({ status: 200, description: 'Successfully deleted review' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async deleteReview(
    @Param('id') id: string,
    @Param('reviewId') reviewId: string,
    @Req() req: RequestWithUser,
  ): Promise<{ message: string }> {
    const userId = req.user.id;
    return this.tourService.deleteTourReview(id, reviewId, userId);
  }

  // Review reply

  @UseGuards(HandleAuthGuard)
  @Post(':id/reviews/:reviewId/replies')
  @ApiOperation({ summary: 'Trả lời đánh giá' })
  @ApiResponse({ status: 201, description: 'Reply added successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async addReplyToReview(
    @Param('reviewId') reviewId: string,
    @Body() replyTourDto: ReplyTourDto,
    @Req() req: RequestWithUser,
  ): Promise<ReviewReplyTour> {
    const userId = req.user.id;
    return this.tourService.addReplyToReview(
      reviewId,
      replyTourDto.content,
      userId,
    );
  }

  @Get(':id/reviews/:reviewId/replies')
  @ApiOperation({ summary: 'Lấy tất cả trả lời cho đánh giá' })
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getRepliesForReview(
    @Param('reviewId') reviewId: string,
  ): Promise<ReviewReplyTour[]> {
    return this.tourService.getRepliesForReview(reviewId);
  }

  @UseGuards(HandleAuthGuard)
  @Post(':reviewId/replies/:reviewReplyId')
  @ApiOperation({ summary: 'Trả lời trả lời của tour' })
  @ApiResponse({ status: 201, description: 'Reply added successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async addReplyToReply(
    @Param('reviewReplyId') reviewReplyId: string,
    @Body() replyToReplyTourDto: ReplyToReplyTourDto,
    @Req() req: RequestWithUser,
  ): Promise<ReviewReplyTour> {
    const userId = req.user.id;
    return this.tourService.addReplyToReply(
      reviewReplyId,
      replyToReplyTourDto.content,
      userId,
    );
  }
}
