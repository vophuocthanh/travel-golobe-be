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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FlightCrawlReview, ReviewReplyFlight } from '@prisma/client';
import { HandleAuthGuard } from 'src/modules/auth/guard/auth.guard';
import { CreateFlightReviewDto } from 'src/modules/flight-comment/dto/create-flight-review.dto';
import {
  FlightReviewWithUserDto,
  ReplyFlightDto,
  ReplyToReplyFlightDto,
} from 'src/modules/flight-comment/dto/reply.dto';
import { UpdateFlightReviewDto } from 'src/modules/flight-comment/dto/update-flight-review.dto';
import { FlightCommentService } from 'src/modules/flight-comment/flight-comment.service';
import { AirlineDto } from 'src/modules/flight/dto/airline.dto';
import { RequestWithUser } from 'src/types/users';

@ApiBearerAuth()
@ApiTags('flight-comment')
@Controller('flight-comment')
export class FlightCommentController {
  constructor(private flightComemntService: FlightCommentService) {}

  @Get(':id/reviews')
  @ApiOperation({ summary: 'Lấy tất cả đánh giá của từng chuyến bay' })
  @ApiResponse({ status: 200, description: 'Successfully fetched reviews' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getReviews(
    @Param('id') flightId: string,
  ): Promise<{ data: FlightReviewWithUserDto[] }> {
    return this.flightComemntService.getFlightReviews(flightId);
  }

  @UseGuards(HandleAuthGuard)
  @Post(':id/reviews')
  @ApiOperation({ summary: 'Thêm đánh giá cho chuyến bay' })
  @ApiResponse({ status: 201, description: 'Review added successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async addReview(
    @Param('id') flightId: string,
    @Body() createFlightReviewDto: CreateFlightReviewDto,
    @Req() req: RequestWithUser,
  ): Promise<FlightReviewWithUserDto> {
    const userId = req.user.id;
    return this.flightComemntService.addReviewToFlight(
      flightId,
      createFlightReviewDto,
      userId,
    );
  }

  @UseGuards(HandleAuthGuard)
  @Put(':id/reviews/:reviewId')
  @ApiOperation({ summary: 'Cập nhật đánh giá' })
  @ApiResponse({ status: 200, description: 'Successfully updated review' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateReview(
    @Param('reviewId') reviewId: string,
    @Body() updateFlightReviewDto: UpdateFlightReviewDto,
  ): Promise<FlightCrawlReview> {
    return this.flightComemntService.updateFlightReview(
      reviewId,
      updateFlightReviewDto,
    );
  }

  @UseGuards(HandleAuthGuard)
  @Delete(':flightId/review/:reviewId')
  @ApiOperation({ summary: 'Xóa đánh giá' })
  @ApiResponse({ status: 200, description: 'Successfully deleted review' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async deleteFlightReview(
    @Param('flightId') flightId: string,
    @Param('reviewId') reviewId: string,
    @Req() req: RequestWithUser,
  ): Promise<{ message: string }> {
    const userId = req.user.id;
    return this.flightComemntService.deleteFlightReview(
      flightId,
      reviewId,
      userId,
    );
  }

  // Add reply to a review

  @UseGuards(HandleAuthGuard)
  @Post(':id/reviews/:reviewId/reply')
  @ApiOperation({ summary: 'Thêm trả lời cho đánh giá' })
  @ApiResponse({ status: 201, description: 'Reply added successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async addReply(
    @Param('reviewId') reviewId: string,
    @Body() replyFlightDto: ReplyFlightDto,
    @Req() req: RequestWithUser,
  ): Promise<ReviewReplyFlight> {
    const userId = req.user.id;
    return this.flightComemntService.addReplyToReview(
      reviewId,
      replyFlightDto.content,
      userId,
    );
  }

  // Get replies for a specific review

  @Get(':id/reviews/:reviewId/replies')
  @ApiOperation({ summary: 'Lấy tất cả trả lời cho đánh giá' })
  @ApiResponse({ status: 200, description: 'Successfully fetched replies' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getReplies(
    @Param('reviewId') reviewId: string,
  ): Promise<{ data: ReviewReplyFlight[] }> {
    return this.flightComemntService.getRepliesForReview(reviewId);
  }

  // Function to add reply to a reply

  @UseGuards(HandleAuthGuard)
  @Post(':reviewId/replies/:replyId')
  @ApiOperation({ summary: 'Thêm trả lời cho trả lời của đánh giá' })
  @ApiResponse({ status: 201, description: 'Reply added successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async addReplyToReply(
    @Param('replyId') replyId: string,
    @Body() replyFlightDto: ReplyToReplyFlightDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.flightComemntService.addReplyToReply(
      replyId,
      replyFlightDto.content,
      userId,
    );
  }

  @Post('airlines')
  async createAirline(@Body() data: AirlineDto) {
    return this.flightComemntService.createAirline(data);
  }

  @Get('filter')
  async filterFlights(
    @Query('airline') airline?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('minRating') minRating?: number,
  ) {
    return this.flightComemntService.filterFlights(
      airline,
      minPrice,
      maxPrice,
      minRating,
    );
  }
}
