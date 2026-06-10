// src/main.ts
import * as dotenv from 'dotenv';
dotenv.config(); // <-- ¡ESTO TIENE QUE SER LA LÍNEA 1 DEL ARCHIVO!

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 EduGest API ejecutándose en: http://localhost:${port}`);
}
bootstrap();