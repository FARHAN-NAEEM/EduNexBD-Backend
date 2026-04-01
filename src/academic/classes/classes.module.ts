// src/academic/classes/classes.module.ts
import { Module } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { ClassesController } from './classes.controller';

@Module({
  controllers: [ClassesController],
  providers: [ClassesService],
})
export class ClassesModule {}