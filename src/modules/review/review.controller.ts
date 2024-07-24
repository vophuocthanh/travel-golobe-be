import { Controller, Get } from '@nestjs/common';
import { ReviewService } from 'src/modules/review/review.service';

@Controller('review')
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @Get()
  getReviews() {}
}
