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
import { ReviewReplyTour, TourReview } from '@prisma/client';
import { HandleAuthGuard } from 'src/modules/auth/guard/auth.guard';
import { CreateTourReviewDto } from 'src/modules/tour-comment/dto/create-tour-review.dto';
import {
  ReplyToReplyTourDto,
  ReplyTourDto,
} from 'src/modules/tour-comment/dto/reply.dto';
import { UpdateTourReviewDto } from 'src/modules/tour-comment/dto/update-tour-review.dto';
import { TourCommentService } from 'src/modules/tour-comment/tour-comment.service';
import { RequestWithUser } from 'src/types/users';

@ApiBearerAuth()
@ApiTags('tour-comment')
@Controller('tour-comment')
export class TourCommentController {
  constructor(private tourCommentService: TourCommentService) {}
  @UseGuards(HandleAuthGuard)
  @Get(':id/reviews')
  @ApiOperation({ summary: 'Lấy tất cả đánh giá của từng tour' })
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getReviews(
    @Param('id') tourId: string,
  ): Promise<{ data: TourReview[] }> {
    return this.tourCommentService.getTourReviews(tourId);
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
    return this.tourCommentService.addReviewToTour(
      id,
      createTourReview,
      userId,
    );
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
    return this.tourCommentService.updateTourReview(
      reviewId,
      updateTourReviewDto,
    );
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
    return this.tourCommentService.deleteTourReview(id, reviewId, userId);
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
    return this.tourCommentService.addReplyToReview(
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
  ): Promise<{ data: ReviewReplyTour[] }> {
    return this.tourCommentService.getRepliesForReview(reviewId);
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
    return this.tourCommentService.addReplyToReply(
      reviewReplyId,
      replyToReplyTourDto.content,
      userId,
    );
  }
}
