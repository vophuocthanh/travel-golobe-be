import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  // config swagger api
  const config = new DocumentBuilder()
    .setTitle('Travel-Golobe')
    .setDescription('The Travel-Golobe API description')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('flight')
    .addTag('hotel')
    .addTag('location')
    .addTag('role')
    .addTag('tour')
    .addTag('user')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'Swagger | Travel-Golobe',
  });

  // Configure port on Frontend access side
  const corsOptions: CorsOptions = {
    origin: ['http://localhost:5173', 'https://travel-golobe.vercel.app'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  };
  app.enableCors(corsOptions);
  await app.listen(3001);
}

bootstrap();
