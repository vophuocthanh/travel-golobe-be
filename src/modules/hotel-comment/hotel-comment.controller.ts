import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { HotelCrawlReview, ReviewReplyHotel } from '@prisma/client';
import { HandleAuthGuard } from 'src/modules/auth/guard/auth.guard';
import { CreateHotelReviewDto } from 'src/modules/hotel-comment/dto/create-hotel-review.dto';
import {
  HotelReviewWithUserDto,
  ReplyHotelDto,
  ReplyToReplyHotelDto,
} from 'src/modules/hotel-comment/dto/reply.dto';
import { UpdateHotelReviewDto } from 'src/modules/hotel-comment/dto/update-hotel-revew.dto';
import { HotelCommentService } from 'src/modules/hotel-comment/hotel-comment.service';
import { RequestWithUser } from 'src/types/users';

@ApiBearerAuth()
@ApiTags('hotel-comment')
@Controller('hotel-comment')
export class HotelCommentController {
  constructor(private hotelCommentService: HotelCommentService) {}

  @Get(':id/reviews')
  @ApiOperation({ summary: 'Lấy tất cả đánh giá của từng khách sạn' })
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getReviews(
    @Param('id') id: string,
  ): Promise<{ data: HotelReviewWithUserDto[] }> {
    return this.hotelCommentService.getHotelReviews(id);
  }

  @UseGuards(HandleAuthGuard)
  @Post(':id/reviews')
  @ApiOperation({ summary: 'Thêm đánh giá cho khách sạn' })
  @ApiResponse({ status: 201, description: 'Review added successfully' })
  async addReview(
    @Param('id') id: string,
    @Body() body: CreateHotelReviewDto,
    @Req() req: RequestWithUser,
  ): Promise<HotelCrawlReview> {
    const userId = req.user.id;
    return this.hotelCommentService.addReviewToHotel(id, body, userId);
  }

  @UseGuards(HandleAuthGuard)
  @Put(':id/reviews/:reviewId')
  @ApiOperation({ summary: 'Cập nhật đánh giá của khách sạn' })
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateReview(
    @Param('reviewId') reviewId: string,
    @Body() body: UpdateHotelReviewDto,
  ): Promise<HotelCrawlReview> {
    return this.hotelCommentService.updateHotelReview(reviewId, body);
  }

  @UseGuards(HandleAuthGuard)
  @Delete(':hotelId/review/:reviewId')
  @ApiOperation({ summary: 'Xóa đánh giá' })
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteReview(
    @Param('hotelId') hotelId: string,
    @Param('reviewId') reviewId: string,
    @Req() req: RequestWithUser,
  ): Promise<{ message: string }> {
    const userId = req.user.id;
    return this.hotelCommentService.deleteHotelReview(
      hotelId,
      reviewId,
      userId,
    );
  }

  @UseGuards(HandleAuthGuard)
  @Post(':hotelId/review/:reviewId/replies')
  @ApiOperation({ summary: 'Trả lời đánh giá' })
  @ApiResponse({ status: 201, description: 'Reply added successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async addReplyToReview(
    @Param('reviewId') reviewId: string,
    @Body() body: ReplyHotelDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.hotelCommentService.addReplyToReview(
      reviewId,
      body.content,
      userId,
    );
  }

  @Get(':hotelId/review/:reviewId/replies')
  @ApiOperation({ summary: 'Lấy tất cả trả lời của đánh giá' })
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getRepliesForReview(
    @Param('reviewId') reviewId: string,
  ): Promise<{ data: ReviewReplyHotel[] }> {
    return this.hotelCommentService.getRepliesForReview(reviewId);
  }

  @UseGuards(HandleAuthGuard)
  @Post(':reviewId/replies/:replyId')
  @ApiOperation({ summary: 'Trả lời cho trả lời của bình luận' })
  @ApiResponse({ status: 201, description: 'Reply added successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async addReplyToReply(
    @Param('replyId') replyId: string,
    @Body() body: ReplyToReplyHotelDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.hotelCommentService.addReplyToReply(
      replyId,
      body.content,
      userId,
    );
  }
}
