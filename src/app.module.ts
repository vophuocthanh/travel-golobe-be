import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { HotelModule } from 'src/modules/hotel/hotel.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { FlightModule } from './modules/flight/flight.module';
import { LocationModule } from './modules/location/location.module';
import { RoleModule } from './modules/role/role.module';
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
