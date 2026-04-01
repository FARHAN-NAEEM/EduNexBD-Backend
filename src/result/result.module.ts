// src/result/result.module.ts
import { Module } from '@nestjs/common';
import { ResultController } from './result.controller';
import { ResultService } from './result.service';
import { PrismaService } from '../prisma/prisma.service'; // 👈 PrismaService ইমপোর্ট করা হলো

@Module({
  controllers: [ResultController],
  providers: [ResultService, PrismaService] // 👈 providers-এ PrismaService যুক্ত করা হলো
})
export class ResultModule {}