import { Injectable } from '@nestjs/common';
import { PaymentMethod, PaymentStatus } from '@prisma/client';
import axios from 'axios';
import * as crypto from 'crypto';
import { MomoDto, MomoIpnDto } from 'src/modules/momo/dto/momo.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class MomoService {
  private readonly YOUR_SECRET_KEY = process.env.MOMO_YOUR_SECRET_KEY;
  private readonly PARTNER_CODE = process.env.MOMO_PARTNER_CODE;
  private readonly ACCESS_KEY = process.env.MOMO_ACCESS_KEY;
  private readonly REDIRECT_URL = process.env.MOMO_REDIRECT_URL;
  private readonly IPN_URL =
    'https://1231-14-245-30-249.ngrok-free.app/api/momo/ipn';

  constructor(private readonly prisma: PrismaService) {}

  async createPayment(data: MomoDto, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: data.bookingId },
      select: { totalAmount: true },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    const { totalAmount: amount } = booking;
    const orderId = `${this.PARTNER_CODE}_${data.bookingId}_${Date.now()}`;
    const requestId = orderId;
    const extraData = '';

    const signature = this.generateSignatureForPayment(
      amount,
      orderId,
      requestId,
      extraData,
    );

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
      const { data: response } = await axios.post(
        'https://test-payment.momo.vn/v2/gateway/api/create',
        requestBody,
      );
      const paymentUrl = response.payUrl;

      await this.prisma.payment.create({
        data: {
          bookingId: data.bookingId,
          userId,
          amount,
          paymentMethod: PaymentMethod.CREDIT_CARD,
          status: PaymentStatus.PENDING,
          orderId,
        },
      });

      return {
        partnerCode: this.PARTNER_CODE,
        orderId,
        amount,
        requestId,
        paymentUrl,
      };
    } catch (error) {
      console.error(
        'Error creating payment:',
        error.response?.data || error.message,
      );
      throw new Error('Payment creation failed');
    }
  }

  async checkPaymentStatus(orderId: string, requestId: string) {
    const signature = this.generateSignatureForStatus(orderId, requestId);

    const requestBody = {
      partnerCode: this.PARTNER_CODE,
      accessKey: this.ACCESS_KEY,
      orderId,
      requestId,
      signature,
    };

    try {
      const { data: response } = await axios.post(
        'https://test-payment.momo.vn/v2/gateway/api/query',
        requestBody,
      );
      const paymentStatus = response?.status;

      if (paymentStatus === 'COMPLETED') {
        await this.prisma.payment.update({
          where: { orderId },
          data: { status: PaymentStatus.COMPLETED },
        });
      }

      return response;
    } catch (error) {
      console.error(
        'Error checking payment status:',
        error.response?.data || error.message,
      );
      throw new Error('Error checking payment status');
    }
  }

  async updatePaymentStatus(orderId: string, status: PaymentStatus) {
    const payment = await this.prisma.payment.findUnique({
      where: { orderId },
    });

    if (!payment) {
      throw new Error('Payment record not found');
    }

    return this.prisma.payment.update({
      where: { orderId },
      data: { status },
    });
  }

  private generateSignatureForPayment(
    amount: number,
    orderId: string,
    requestId: string,
    extraData: string,
  ): string {
    const rawSignature = `accessKey=${this.ACCESS_KEY}&amount=${amount}&extraData=${extraData}&ipnUrl=${this.IPN_URL}&orderId=${orderId}&orderInfo=pay with MoMo&partnerCode=${this.PARTNER_CODE}&redirectUrl=${this.REDIRECT_URL}&requestId=${requestId}&requestType=payWithMethod`;
    return this.createSignature(rawSignature);
  }

  private generateSignatureForStatus(
    orderId: string,
    requestId: string,
  ): string {
    const rawSignature = `accessKey=${this.ACCESS_KEY}&orderId=${orderId}&partnerCode=${this.PARTNER_CODE}&requestId=${requestId}`;
    return this.createSignature(rawSignature);
  }

  async handleIpn(ipnData: MomoIpnDto): Promise<void> {
    console.log('Received MoMo IPN data:', ipnData);

    // const signature = this.generateSignatureForIpn(ipnData);
    // if (signature !== ipnData.signature) {
    //   console.error('Signature mismatch! Invalid IPN.');
    //   throw new HttpException('Invalid signature', HttpStatus.BAD_REQUEST);
    // }

    if (ipnData.resultCode === 0) {
      console.log('Payment successful:', ipnData);
      await this.updatePaymentStatus(ipnData.orderId, PaymentStatus.COMPLETED);
      console.log(
        'Payment status updated to COMPLETED for orderId:',
        ipnData.orderId,
      );
    } else {
      console.error(
        `Payment failed with resultCode ${ipnData.resultCode}:`,
        ipnData.message,
      );
    }

    console.log('IPN processed successfully.');
  }

  private createSignature(rawSignature: string): string {
    return crypto
      .createHmac('sha256', this.YOUR_SECRET_KEY)
      .update(rawSignature)
      .digest('hex');
  }
}
