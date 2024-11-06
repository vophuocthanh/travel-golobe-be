import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
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
import { HandleAuthGuard } from 'src/modules/auth/guard/auth.guard';
import {
  MomoDto,
  MomoDtoType,
  MomoIpnDto,
  MomoPaginationResponseType,
} from 'src/modules/momo/dto/momo.dto';
import { MomoService } from 'src/modules/momo/momo.service';
import { RequestWithUser } from 'src/types/users';

@ApiBearerAuth()
@ApiTags('momo')
@Controller('momo')
export class MomoController {
  constructor(private readonly momoService: MomoService) {}

  @UseGuards(HandleAuthGuard)
  @Get('payment')
  @ApiOperation({ summary: 'Lấy tất cả các giao dịch' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'items_per_page', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiOperation({ summary: 'Lấy tất cả các giao dịch' })
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getPaymentUrl(
    @Query() params: MomoDtoType,
  ): Promise<MomoPaginationResponseType> {
    return this.momoService.getPaymentAll(params);
  }

  @UseGuards(HandleAuthGuard)
  @ApiOperation({
    summary: 'Lấy danh sách giao dịch của người dùng đang đăng nhập',
  })
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @Get('user')
  async getPaymentsByUser(@Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.momoService.getPaymentAllUser(userId);
  }

  @UseGuards(HandleAuthGuard)
  @ApiOperation({ summary: 'Lấy chi tiết giao dịch' })
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @Get('payment/:id')
  async getPaymentDetail(@Param('id') id: string) {
    return this.momoService.getPaymentById(id);
  }

  @UseGuards(HandleAuthGuard)
  @ApiOperation({ summary: 'Đếm số lượng giao dịch thành công' })
  @ApiResponse({ status: 200, description: 'Successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @Get('count-payment-success')
  async countSuccessPayment() {
    return this.momoService.getCountPaymentDone();
  }

  @Post('payment')
  @UseGuards(HandleAuthGuard)
  @ApiOperation({ summary: 'Tạo giao dịch' })
  async createPayment(@Body() momoDto: MomoDto, @Req() req: RequestWithUser) {
    const paymentUrl = await this.momoService.createPayment(
      momoDto,
      req.user.id,
    );
    return { paymentUrl };
  }

  @Get('payment-status')
  @UseGuards(HandleAuthGuard)
  @ApiOperation({ summary: 'Kiểm tra trạng thái thanh toán' })
  async checkPaymentStatus(
    @Query('orderId') orderId: string,
    @Query('requestId') requestId: string,
  ) {
    const result = await this.momoService.checkPaymentStatus(
      orderId,
      requestId,
    );
    return result;
  }

  @Post('ipn')
  @ApiOperation({ summary: 'Xử lý IPN từ Momo' })
  @HttpCode(HttpStatus.OK)
  async handleMomoIpn(@Body() ipnData: MomoIpnDto) {
    console.log('ipnData:', ipnData);
    return this.momoService.handleIpn(ipnData);
  }
}
