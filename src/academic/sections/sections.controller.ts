// src/academic/sections/sections.controller.ts
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { SectionsService } from './sections.service';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../../auth/admin.guard';

@Controller('academic/sections') // রাউট: /academic/sections
@UseGuards(AuthGuard('jwt'), AdminGuard) // শুধুমাত্র এডমিনদের জন্য
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Post()
  createSection(@Body() body: { name: string; classId: string }) {
    return this.sectionsService.createSection(body.name, body.classId);
  }

  @Get()
  getAllSections() {
    return this.sectionsService.getAllSections();
  }
}