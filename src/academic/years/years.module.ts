// src/academic/years/years.module.ts
import { Module } from '@nestjs/common';
import { YearsService } from './years.service';
import { YearsController } from './years.controller';

@Module({
  controllers: [YearsController],
  providers: [YearsService],
})
export class YearsModule {}