import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { BookingsService } from './bookings.service';

@Injectable()
export class BookingCleanupService {
  constructor(private readonly bookingsService: BookingsService) {}

  @Cron('0 0 * * *')
  async handleCron() {
    try {
      const flightResult =
        await this.bookingsService.deleteExpiredFlightBookings();
      console.log(flightResult.message);

      const hotelResult =
        await this.bookingsService.deleteExpiredHotelBookings();
      console.log(hotelResult.message);

      const tourResult = await this.bookingsService.deleteExpiredTourBookings();
      console.log(tourResult.message);

      const roadVehicleResult =
        await this.bookingsService.deleteExpiredRoadVehicleBookings();
      console.log(roadVehicleResult.message);
    } catch (error) {
      console.error('Error deleting expired bookings:', error);
    }
  }
}
