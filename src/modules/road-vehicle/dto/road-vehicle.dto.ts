import { RoadVehicle } from '@prisma/client';

export class RoadVehicleCrawlDto {
  search?: string;
  items_per_page?: number;
  page?: number;
}

export interface RoadVehicleCrawlPaginationResponseType {
  data: RoadVehicle[];
  total: number;
  currentPage: number;
  itemsPerPage: number;
}
