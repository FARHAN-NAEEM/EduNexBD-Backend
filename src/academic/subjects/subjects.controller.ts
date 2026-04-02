// src/academic/subjects/subjects.controller.ts
import { Controller, Post, Body, Get, Patch, Param, Delete } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto, UpdateSubjectDto } from './dto/subject.dto';

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

  @Patch(':id')
  updateSubject(@Param('id') id: string, @Body() dto: UpdateSubjectDto) {
    return this.subjectsService.updateSubject(id, dto);
  }

  @Delete(':id')
  deleteSubject(@Param('id') id: string) {
    return this.subjectsService.deleteSubject(id);
  }
}