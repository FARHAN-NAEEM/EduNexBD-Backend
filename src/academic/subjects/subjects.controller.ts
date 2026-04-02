// src/academic/subjects/subjects.controller.ts
import { Controller, Post, Body, Get } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto } from './dto/subject.dto';

@Controller('academic/subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Post()
  createSubject(@Body() dto: CreateSubjectDto) {
    return this.subjectsService.createSubject(dto);
  }

  @Get()
  getAllSubjects() {
    return this.subjectsService.getAllSubjects();
  }
}