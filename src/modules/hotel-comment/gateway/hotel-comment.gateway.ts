import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateHotelReviewDto } from 'src/modules/hotel-comment/dto/create-hotel-review.dto';
import { HotelCommentService } from 'src/modules/hotel-comment/hotel-comment.service';

@WebSocketGateway({ cors: true })
export class HotelCommentGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly hotelCommentService: HotelCommentService) {}

  // Khi có client kết nối
  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  // Khi client ngắt kết nối
  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Lấy danh sách review của hotel
  @SubscribeMessage('getHotelReviews')
  async getHotelReviews(
    @MessageBody() hotelCrawlId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const reviews =
      await this.hotelCommentService.getHotelReviews(hotelCrawlId);
    client.emit('hotelReviews', reviews); // Gửi dữ liệu lại cho client
  }

  // Thêm review mới
  @SubscribeMessage('addHotelReview')
  async addHotelReview(
    @MessageBody()
    data: {
      hotelCrawlId: string;
      review: CreateHotelReviewDto;
      userId: string;
    },
  ) {
    const review = await this.hotelCommentService.addReviewToHotel(
      data.hotelCrawlId,
      data.review,
      data.userId,
    );
    this.server.emit('newHotelReview', review); // Phát sự kiện tới tất cả client
  }

  // Thêm reply mới
  @SubscribeMessage('addReply')
  async addReply(
    @MessageBody() data: { reviewId: string; content: string; userId: string },
  ) {
    const reply = await this.hotelCommentService.addReplyToReview(
      data.reviewId,
      data.content,
      data.userId,
    );
    this.server.emit('newReply', reply);
  }
}
