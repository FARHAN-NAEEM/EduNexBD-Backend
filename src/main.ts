// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express'; // 👈 এটি ইমপোর্ট করা হয়েছে

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS এনাবল করা (যাতে ফ্রন্টএন্ড কানেক্ট হতে পারে)
  app.enableCors();

  // 👇 Base64 ইমেজ রিসিভ করার জন্য JSON লিমিট বাড়িয়ে 10MB করা হলো
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  // গ্লোবাল ভ্যালিডেশন পাইপ
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
  }));

  await app.listen(3000);
}
bootstrap();