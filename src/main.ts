import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');

  // config swagger api
  const config = new DocumentBuilder()
    .setTitle('Travel-Golobe')
    .setDescription('The Travel-Golobe API description')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('bookings')
    .addTag('user')
    .addTag('flight')
    .addTag('flight-comment')
    .addTag('hotel')
    .addTag('hotel-comment')
    .addTag('location')
    .addTag('role')
    .addTag('tour')
    .addTag('tour-comment')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'Swagger | Travel-Golobe',
  });

  // Configure port on Frontend access side
  const corsOptions: CorsOptions = {
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:3002',
      'https://travel-golobe.vercel.app',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  };
  app.enableCors(corsOptions);
  app.useStaticAssets(join(__dirname, '../uploads'));
  await app.listen(3001);
}

bootstrap();
