import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { BookingStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import axios from 'axios';
import * as crypto from 'crypto';
import {
  MomoDto,
  MomoDtoType,
  MomoIpnDto,
  MomoPaginationResponseType,
} from 'src/modules/momo/dto/momo.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class MomoService {
  private readonly YOUR_SECRET_KEY = process.env.MOMO_YOUR_SECRET_KEY;
  private readonly PARTNER_CODE = process.env.MOMO_PARTNER_CODE;
  private readonly ACCESS_KEY = process.env.MOMO_ACCESS_KEY;
  private readonly REDIRECT_URL = 'http://localhost:5173';
  private readonly IPN_URL =
    'https://6ecc-2001-ee0-4b76-e030-11e0-aa59-6507-f791.ngrok-free.app/api/momo/ipn';

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
      throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
    }

    const updatedPayment = await this.prisma.payment.update({
      where: { orderId },
      data: { status },
    });

    // Nếu thanh toán thành công, cập nhật trạng thái đặt chỗ thành CONFIRMED
    if (status === PaymentStatus.COMPLETED) {
      const bookingId = payment.bookingId;

      // Cập nhật trạng thái của booking
      await this.prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.CONFIRMED,
          confirmationTime: new Date(), // Thay đổi thời gian xác nhận nếu cần
        },
      });
    }

    return updatedPayment;
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

  async getPaymentAll(
    filters: MomoDtoType,
  ): Promise<MomoPaginationResponseType> {
    const items_per_page = Number(filters.items_per_page) || 10000;
    const page = Number(filters.page) || 1;
    const search = filters.search || '';
    const skip = page > 1 ? (page - 1) * items_per_page : 0;

    const payments = await this.prisma.payment.findMany({
      take: items_per_page,
      skip,
      where: {
        OR: [
          {
            booking: {
              user: {
                email: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
          },
          {
            bookingId: null,
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.payment.count({
      where: {
        OR: [
          {
            booking: {
              user: {
                email: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
          },
          {
            bookingId: null,
          },
        ],
      },
    });

    return {
      data: payments,
      total,
      currentPage: page,
      itemsPerPage: items_per_page,
    };
  }

  async getPaymentById(paymentId: string) {
    return this.prisma.payment.findUnique({
      where: { id: paymentId },
    });
  }

  async getPaymentAllUser(userId: string) {
    const paymentUser = await this.prisma.payment.findMany({
      where: {
        userId: userId,
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.payment.count({
      where: {
        userId: userId,
      },
    });

    return { data: paymentUser, total };
  }
}
