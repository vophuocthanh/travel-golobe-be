import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { FlightCommentModule } from './modules/flight-comment/flight-comment.module';
import { FlightCrawlModule } from './modules/flight-crawl/flight-crawl.module';
import { HotelCommentModule } from './modules/hotel-comment/hotel-comment.module';
import { HotelCrawlModule } from './modules/hotel-crawl/hotel-crawl.module';
import { LocationModule } from './modules/location/location.module';
import { RoadVehicleModule } from './modules/road-vehicle/road-vehicle.module';
import { RoleModule } from './modules/role/role.module';
import { TourCommentModule } from './modules/tour-comment/tour-comment.module';
import { TourModule } from './modules/tour/tour.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    AuthModule,
    UserModule,
    TourModule,
    RoleModule,
    LocationModule,
    BookingsModule,
    FlightCommentModule,
    HotelCommentModule,
    TourCommentModule,
    FlightCrawlModule,
    HotelCrawlModule,
    RoadVehicleModule,
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
