import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  app.enableCors({ origin: `http://${process.env.HOST}:${process.env.FRONT_PORT}` , credentials: true });

  app.use(cookieParser());

  await app.listen(process.env.PORT);
}
bootstrap();
