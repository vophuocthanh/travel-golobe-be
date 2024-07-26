import { Flight } from '@prisma/client';
import { CreateFlightDto } from 'src/modules/flight/dto/create.dto';

export interface FlightDto {
  items_per_page?: number;
  page?: number;
  search?: string;
}

export interface FlightPaginationResponseType {
  data: Flight[];
  total: number;
  currentPage: number;
  itemsPerPage: number;
}

export class UpdateFlightDto extends CreateFlightDto {}
