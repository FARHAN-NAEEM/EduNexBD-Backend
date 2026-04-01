// src/academic/years/years.controller.ts
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { YearsService } from './years.service';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../../auth/admin.guard';

@Controller('academic/years') // রাউট: /academic/years
@UseGuards(AuthGuard('jwt'), AdminGuard) // শুধুমাত্র এডমিনরা এই কাজ করতে পারবে!
export class YearsController {
  constructor(private readonly yearsService: YearsService) {}

  @Post()
  createYear(@Body() body: { year: string; startDate: string; endDate: string }) {
    return this.yearsService.createYear(body.year, body.startDate, body.endDate);
  }

  @Get()
  getAllYears() {
    return this.yearsService.getAllYears();
  }
}