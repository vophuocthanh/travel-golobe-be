import { RoadVehicle } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum RoadVehicleBrands {
  LienHung = 'Lien Hung',
  HoaMai = 'Hoa Mai',
  PhucAnExpress = 'Phuc An Express',
  KhanhPhong = 'Khanh Phong',
  TraLanVien = 'Tra Lan Vien',
  HuyHoangVungTau = 'Huy Hoang-Vung Tau',
  PhuongNam = 'Phuong Nam',
  DaLatOi = 'Da Lat oi',
  HoangHai = 'Hoàng Hải',
  CucTung = 'Cuc Tung',
  VieLimousine = 'Vie Limousine',
  DinhNhan = 'Dinh Nhan',
  TrongThang = 'Trong Thang',
  HongSonPhuYen = 'Hong Son (Phu Yen)',
  PhiLong = 'Phi Long',
  XeNha = 'Xe Nha',
  QuangHanh = 'Quang Hanh',
  HuynhGia = 'Huynh Gia',
  AVIGO = 'AVIGO',
  HoangTrung = 'Hoang Trung',
  HanhCafe = 'Hanh Cafe',
  ThanhVinhVungTau = 'Thanh Vinh - Vung Tau',
}

export class RoadVehicleCrawlDto {
  search?: string;
  items_per_page?: number;
  page?: number;
  sort_by_price?: 'asc' | 'desc';
  min_price?: number;
  max_price?: number;
  @IsOptional()
  @IsString()
  start_day?: string;

  @IsOptional()
  @IsString()
  end_day?: string;
  search_from?: string;
  search_to?: string;

  @IsOptional()
  @IsEnum(RoadVehicleBrands)
  brand?: RoadVehicleBrands;
}

export interface RoadVehicleCrawlPaginationResponseType {
  data: RoadVehicle[];
  total: number;
  currentPage: number;
  itemsPerPage: number;
}
