import { Controller } from '@nestjs/common';
import { FlightCommentService } from 'src/modules/flight-comment/flight-comment.service';

@Controller('flight-comment')
export class FlightCommentController {
  constructor(private flightComemntService: FlightCommentService) {}
}
