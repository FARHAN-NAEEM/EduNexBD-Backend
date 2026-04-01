// src/academic/classes/classes.controller.ts
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../../auth/admin.guard';

@Controller('academic/classes') // রাউট: /academic/classes
@UseGuards(AuthGuard('jwt'), AdminGuard) // শুধুমাত্র এডমিন এক্সেস
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  createClass(@Body() body: { name: string; academicYearId: string }) {
    return this.classesService.createClass(body.name, body.academicYearId);
  }

  @Get()
  getAllClasses() {
    return this.classesService.getAllClasses();
  }
}