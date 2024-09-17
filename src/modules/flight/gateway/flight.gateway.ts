import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateFlightReviewDto } from 'src/modules/flight/dto/create-flight-review.dto';
import { UpdateFlightReviewDto } from 'src/modules/flight/dto/update-flight-review.dto';
import { FlightService } from 'src/modules/flight/flight.service';

@WebSocketGateway({ cors: true })
export class FlightGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly flightService: FlightService) {}

  @SubscribeMessage('addReview')
  async handleAddReview(
    @MessageBody() data: { flightId: string; review: CreateFlightReviewDto },
    @ConnectedSocket() client: Socket,
  ) {
    const review = await this.flightService.addReviewToFlight(
      data.flightId,
      data.review,
      client.id,
    );
    this.server.emit('reviewAdded', review);
  }

  @SubscribeMessage('updateReview')
  async handleUpdateReview(
    @MessageBody()
    data: {
      reviewId: string;
      updateData: UpdateFlightReviewDto;
    },
  ) {
    const updatedReview = await this.flightService.updateFlightReview(
      data.reviewId,
      data.updateData,
    );
    this.server.emit('reviewUpdated', updatedReview);
  }

  @SubscribeMessage('deleteReview')
  async handleDeleteReview(
    @MessageBody() data: { reviewId: string; flightId: string },
    @ConnectedSocket() client: Socket,
  ) {
    await this.flightService.deleteFlightReview(
      data.flightId,
      data.reviewId,
      client.id,
    );
    this.server.emit('reviewDeleted', data.reviewId);
  }
}
