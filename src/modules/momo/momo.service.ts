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
  private readonly YOUR_SECRET_KEY = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
  private readonly PARTNER_CODE = 'MOMO';
  private readonly ACCESS_KEY = 'F8BBA842ECF85';
  private readonly REDIRECT_URL = 'http://localhost:5173';
  private readonly IPN_URL =
    'https://9793-2001-ee0-4b7b-b4f0-343d-4cfb-5711-f5b7.ngrok-free.app/api/momo/ipn';

  constructor(private readonly prisma: PrismaService) {}

  private async addPointsToUser(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { points: true },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const currentPoints = user.points || 0;
    const newPoints = currentPoints + 5;

    // Nếu điểm đạt 100 hoặc hơn, reset điểm về 0 và trả về trạng thái giảm giá
    if (newPoints >= 100) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { points: 0 },
      });
      return true; // Đủ điều kiện giảm giá
    }

    // Cập nhật điểm nếu chưa đủ 100 điểm
    await this.prisma.user.update({
      where: { id: userId },
      data: { points: newPoints },
    });

    return false; // Không đủ điều kiện giảm giá
  }

  async createPayment(data: MomoDto, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: data.bookingId },
      select: { totalAmount: true },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    const { totalAmount } = booking;

    // Chỉ cộng 10 điểm mỗi lần mua và kiểm tra điều kiện giảm giá
    // const isEligibleForDiscount = await this.addPointsToUser(userId);

    // // Áp dụng giảm giá nếu đủ điểm
    // const finalAmount = isEligibleForDiscount
    //   ? totalAmount * 0.8 // Giảm 20%
    //   : totalAmount;

    const orderId = `${this.PARTNER_CODE}_${data.bookingId}_${Date.now()}`;
    const requestId = orderId;
    const extraData = '';

    const signature = this.generateSignatureForPayment(
      totalAmount,
      orderId,
      requestId,
      extraData,
    );

    const requestBody = {
      partnerCode: this.PARTNER_CODE,
      partnerName: 'Test',
      storeId: 'MomoTestStore',
      requestId,
      amount: totalAmount,
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
          amount: totalAmount,
          paymentMethod: PaymentMethod.CREDIT_CARD,
          status: PaymentStatus.PENDING,
          orderId,
        },
      });

      return {
        partnerCode: this.PARTNER_CODE,
        orderId,
        totalAmount,
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

    if (status === PaymentStatus.COMPLETED) {
      const bookingId = payment.bookingId;

      // Cập nhật trạng thái của booking
      await this.prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.CONFIRMED,
          confirmationTime: new Date(),
        },
      });

      // // Cộng điểm cho người dùng
      await this.addPointsToUser(payment.userId); // Mỗi giao dịch cộng 10 điểm
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
    if (ipnData.resultCode === 0) {
      console.log('Payment successful:', ipnData);

      // Lấy thông tin thanh toán
      const payment = await this.prisma.payment.findUnique({
        where: { orderId: ipnData.orderId },
      });

      if (!payment) {
        throw new Error('Payment record not found');
      }

      // Cập nhật trạng thái thanh toán thành COMPLETED
      await this.updatePaymentStatus(ipnData.orderId, PaymentStatus.COMPLETED);

      // Cộng điểm cho người dùng (chỉ cộng 10 điểm)
      // await this.addPointsToUser(payment.userId);

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
        status: PaymentStatus.COMPLETED,
      },
      include: {
        booking: {
          select: {
            id: true,
            flightCrawls: true,
            hotelCrawls: true,
            tour: true,
            roadVehicles: true,
            totalAmount: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.payment.count({
      where: {
        userId: userId,
        status: PaymentStatus.COMPLETED,
      },
    });

    const responseData = paymentUser
      .map((payment) => {
        const booking = payment.booking;

        if (!booking) {
          return null;
        }

        const responseEntry: any = {
          paymentId: payment.id,
          bookingId: booking.id,
          totalAmount: booking.totalAmount,
          createdAt: booking.createdAt,
          status: payment.status,
          paymentMethod: payment.paymentMethod,
        };

        if (booking.flightCrawls) {
          responseEntry.flightCrawls = booking.flightCrawls;
        }
        if (booking.hotelCrawls) {
          responseEntry.hotelCrawls = booking.hotelCrawls;
        }
        if (booking.tour) {
          responseEntry.tour = booking.tour;
        }
        if (booking.roadVehicles) {
          responseEntry.roadVehicles = booking.roadVehicles;
        }

        const hasValidData = Object.keys(responseEntry).length > 6;

        return hasValidData ? responseEntry : null;
      })
      .filter(Boolean);

    return { data: responseData, total };
  }

  async getCountPaymentDone(): Promise<{ data: { total: number } }> {
    const total = await this.prisma.payment.count({
      where: { status: PaymentStatus.COMPLETED },
    });
    return { data: { total } };
  }
}
