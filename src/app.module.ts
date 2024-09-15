import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { HotelModule } from 'src/modules/hotel/hotel.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { FlightCommentModule } from './modules/flight-comment/flight-comment.module';
import { FlightModule } from './modules/flight/flight.module';
import { HotelCommentModule } from './modules/hotel-comment/hotel-comment.module';
import { LocationModule } from './modules/location/location.module';
import { RoleModule } from './modules/role/role.module';
import { TourCommentModule } from './modules/tour-comment/tour-comment.module';
import { TourModule } from './modules/tour/tour.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    HotelModule,
    TourModule,
    FlightModule,
    RoleModule,
    LocationModule,
    BookingsModule,
    FlightCommentModule,
    HotelCommentModule,
    TourCommentModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    // config de dung duoc HttpException
  ],
})
export class AppModule {}
