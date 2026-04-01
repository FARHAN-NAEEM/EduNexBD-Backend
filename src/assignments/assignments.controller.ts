// src/assignments/assignments.controller.ts
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../auth/admin.guard';

@Controller('assignments') // রাউট: /assignments
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  assignTeacher(@Body() body: { teacherId: string; subjectId: string }) {
    return this.assignmentsService.assignTeacher(body.teacherId, body.subjectId);
  }

  @Get()
  getAllAssignments() {
    return this.assignmentsService.getAllAssignments();
  }
}