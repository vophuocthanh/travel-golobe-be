import { Injectable } from '@nestjs/common';
import { PaymentMethod, PaymentStatus } from '@prisma/client';
import axios from 'axios';
import * as crypto from 'crypto';
import { MomoDto } from 'src/modules/momo/dto/momo.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class MomoService {
  constructor(private readonly prisma: PrismaService) {}

  private YOUR_SECRET_KEY = process.env.MOMO_YOUR_SECRET_KEY;
  private PARTNER_CODE = process.env.MOMO_PARTNER_CODE;
  private ACCESS_KEY = process.env.MOMO_ACCESS_KEY;
  private REDIRECT_URL = process.env.MOMO_REDIRECT_URL;
  private IPN_URL = process.env.MOMO_IPN_URL;

  async createPayment(data: MomoDto, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: data.bookingId },
      select: { totalAmount: true },
    });

    const amount = booking.totalAmount;
    const orderId = `${this.PARTNER_CODE}${new Date().getTime()}`;
    const requestId = orderId;
    const extraData = '';

    const rawSignature = this.createRawSignature(
      amount,
      orderId,
      requestId,
      extraData,
    );
    const signature = this.generateSignature(rawSignature);

    const requestBody = {
      partnerCode: this.PARTNER_CODE,
      partnerName: 'Test',
      storeId: 'MomoTestStore',
      requestId,
      amount: amount.toString(),
      orderId,
      orderInfo: 'pay with MoMo',
      redirectUrl: this.REDIRECT_URL,
      ipnUrl: this.IPN_URL,
      lang: 'vi',
      requestType: 'payWithMethod',
      autoCapture: true,
      extraData,
      orderGroupId: '',
      signature,
    };

    try {
      const response = await axios.post(
        'https://test-payment.momo.vn/v2/gateway/api/create',
        requestBody,
      );
      const paymentUrl = response.data.payUrl;

      await this.prisma.payment.create({
        data: {
          bookingId: data.bookingId,
          userId,
          amount,
          paymentMethod: PaymentMethod.CREDIT_CARD,
          status: PaymentStatus.PENDING,
        },
      });

      return paymentUrl;
    } catch (error) {
      console.error(
        'Error creating payment:',
        error.response?.data || error.message,
      );
      throw new Error('Payment creation failed');
    }
  }

  private createRawSignature(
    amount: number,
    orderId: string,
    requestId: string,
    extraData: string,
  ): string {
    return `accessKey=${this.ACCESS_KEY}&amount=${amount}&extraData=${extraData}&ipnUrl=${this.IPN_URL}&orderId=${orderId}&orderInfo=pay with MoMo&partnerCode=${this.PARTNER_CODE}&redirectUrl=${this.REDIRECT_URL}&requestId=${requestId}&requestType=payWithMethod`;
  }

  private generateSignature(rawSignature: string): string {
    return crypto
      .createHmac('sha256', this.YOUR_SECRET_KEY)
      .update(rawSignature)
      .digest('hex');
  }
}
