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
import { Flight, FlightReview, ReviewReplyFlight } from '@prisma/client';
import { HandleAuthGuard } from 'src/modules/auth/guard/auth.guard';
import {
  AirlineDto,
  AirlinePaginationResponseType,
  AirlineTypeDto,
} from 'src/modules/flight/dto/airline.dto';
import { CreateFlightReviewDto } from 'src/modules/flight/dto/create-flight-review.dto';
import { CreateFlightDto } from 'src/modules/flight/dto/create.dto';
import {
  FlightDto,
  FlightPaginationResponseType,
} from 'src/modules/flight/dto/flight.dto';
import {
  ReplyFlightDto,
  ReplyToReplyFlightDto,
} from 'src/modules/flight/dto/reply.dto';
import { UpdateFlightReviewDto } from 'src/modules/flight/dto/update-flight-review.dto';
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
  @ApiOperation({ summary: 'Lấy tất cả các thông tin chuyến bay' })
  @Get()
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getFlights(
    @Query() params: FlightDto,
  ): Promise<FlightPaginationResponseType> {
    return this.flightService.getFlights(params);
  }

  @Get('airlines')
  async getAllAirlines(
    @Query() params: AirlineTypeDto,
  ): Promise<AirlinePaginationResponseType> {
    return this.flightService.getAirlines(params);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chuyến bay theo id' })
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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

  @Get(':id/reviews')
  @ApiOperation({ summary: 'Lấy tất cả đánh giá của từng chuyến bay' })
  @ApiResponse({ status: 200, description: 'Successfully fetched reviews' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getReviews(
    @Param('id') flightId: string,
  ): Promise<{ data: FlightReview[] }> {
    return this.flightService.getFlightReviews(flightId);
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
  ): Promise<FlightReview> {
    const userId = req.user.id;
    return this.flightService.addReviewToFlight(
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
  ): Promise<FlightReview> {
    return this.flightService.updateFlightReview(
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
    return this.flightService.deleteFlightReview(flightId, reviewId, userId);
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
    return this.flightService.addReplyToReview(
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
    return this.flightService.getRepliesForReview(reviewId);
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
    return this.flightService.addReplyToReply(
      replyId,
      replyFlightDto.content,
      userId,
    );
  }

  @Post('airlines')
  async createAirline(@Body() data: AirlineDto) {
    return this.flightService.createAirline(data);
  }

  @Get('filter')
  async filterFlights(
    @Query('airline') airline?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('minRating') minRating?: number,
  ) {
    return this.flightService.filterFlights(
      airline,
      minPrice,
      maxPrice,
      minRating,
    );
  }
}
