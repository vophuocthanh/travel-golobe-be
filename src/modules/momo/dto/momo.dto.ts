import { ApiProperty } from '@nestjs/swagger';
import { Payment } from '@prisma/client';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class MomoDto {
  @ApiProperty()
  @IsNotEmpty()
  bookingId: string;

  @IsOptional()
  userId?: string;
}

export class CheckStatusTransactionDto {
  @ApiProperty({
    description: 'The unique order ID for the transaction',
    example: 'MOMO1712108682648',
  })
  @IsString()
  @IsNotEmpty()
  orderId: string;
}

export class MomoIpnDto {
  @ApiProperty({
    description: 'Momo partner code',
    example: 'MOMO',
  })
  @IsString()
  @IsNotEmpty()
  partnerCode: string;

  @ApiProperty({
    description: 'The unique order ID from your system',
    example: 'MOMO_21ddeed7-7dcd-4017-b667-777447b9583f_1728147700922',
  })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({
    description: 'The unique request ID',
    example: 'MOMO_21ddeed7-7dcd-4017-b667-777447b9583f_1728147700922',
  })
  @IsString()
  @IsNotEmpty()
  requestId: string;

  @ApiProperty({
    description: 'Amount paid',
    example: 141094,
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    description: 'Order info',
    example: 'pay with MoMo',
  })
  @IsString()
  orderInfo: string;

  @ApiProperty({
    description: 'Order type (e.g., momo_wallet)',
    example: 'momo_wallet',
  })
  @IsString()
  orderType: string;

  @ApiProperty({
    description: 'Transaction ID from Momo',
    example: 4182186459,
  })
  @IsNumber()
  @IsNotEmpty()
  transId: number;

  @ApiProperty({
    description: 'Result code of the transaction',
    example: 0,
  })
  @IsNumber()
  @IsNotEmpty()
  resultCode: number;

  @ApiProperty({
    description: 'Response message',
    example: 'Successful.',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    description: 'Pay type (e.g., napas)',
    example: 'napas',
  })
  @IsString()
  @IsNotEmpty()
  payType: string;

  @ApiProperty({
    description: 'Response time in milliseconds',
    example: 1728147754778,
  })
  @IsNumber()
  @IsNotEmpty()
  responseTime: number;

  @ApiProperty({
    description: 'Additional data sent along with the transaction',
    example: '',
    required: false,
  })
  @IsString()
  extraData: string;

  @ApiProperty({
    description: 'Signature used to validate the transaction',
    example: 'a79c57a0374136ee18ae81653a56f1d521a751664cabe3b6f495b5f89b4388b5',
  })
  @IsString()
  @IsNotEmpty()
  signature: string;
}

export class MomoDtoType {
  items_per_page: number;
  page: number;
  search: string;
}

export interface MomoPaginationResponseType {
  data: Payment[];
  total: number;
  currentPage: number;
  itemsPerPage: number;
}
