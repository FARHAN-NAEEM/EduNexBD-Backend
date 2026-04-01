// src/teacher/teacher.module.ts
import { Module } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { TeacherController } from './teacher.controller';
import { PrismaModule } from '../prisma/prisma.module'; // এটি ডাটাবেস কলের জন্য বাধ্যতামূলক

@Module({
  imports: [PrismaModule],
  controllers: [TeacherController],
  providers: [TeacherService],
  exports: [TeacherService],
})
export class TeacherModule {}