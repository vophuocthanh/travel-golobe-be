import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { HandleAuthGuard } from 'src/modules/auth/guard/auth.guard';
import { MomoDto, MomoIpnDto } from 'src/modules/momo/dto/momo.dto';
import { MomoService } from 'src/modules/momo/momo.service';
import { RequestWithUser } from 'src/types/users';

@ApiBearerAuth()
@ApiTags('momo')
@Controller('momo')
export class MomoController {
  constructor(private readonly momoService: MomoService) {}

  @Post('payment')
  @UseGuards(HandleAuthGuard)
  async createPayment(@Body() momoDto: MomoDto, @Req() req: RequestWithUser) {
    const paymentUrl = await this.momoService.createPayment(
      momoDto,
      req.user.id,
    );
    return { paymentUrl };
  }

  @Get('payment-status')
  @UseGuards(HandleAuthGuard)
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
  @HttpCode(HttpStatus.OK)
  async handleMomoIpn(@Body() ipnData: MomoIpnDto) {
    console.log('ipnData:', ipnData);
    return this.momoService.handleIpn(ipnData);
  }
}
