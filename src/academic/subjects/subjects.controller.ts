// src/academic/subjects/subjects.controller.ts
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../../auth/admin.guard';

@Controller('academic/subjects') // রাউট: /academic/subjects
@UseGuards(AuthGuard('jwt'), AdminGuard) // শুধুমাত্র এডমিন এক্সেস
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Post()
  createSubject(@Body() body: { name: string; code: string; classId: string }) {
    return this.subjectsService.createSubject(body.name, body.code, body.classId);
  }

  @Get()
  getAllSubjects() {
    return this.subjectsService.getAllSubjects();
  }
}