// src/teacher/teacher.controller.ts
import { Controller, Get, Patch, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('teachers') // রাউট এখন: /teachers
@UseGuards(AuthGuard('jwt'))
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  // সবার লিস্ট দেখা: GET /teachers
  @Get()
  findAll() {
    return this.teacherService.getAllTeachers();
  }

  // নিজের প্রোফাইল দেখা: GET /teachers/profile
  @Get('profile')
  getProfile(@Req() req: any) {
    const userId = req.user.id || req.user.sub;
    return this.teacherService.getProfile(userId);
  }

  // টিচার আপডেট করা: PATCH /teachers/:id
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.teacherService.updateTeacher(id, updateData);
  }

  // টিচার ডিলিট করা: DELETE /teachers/:id
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teacherService.removeTeacher(id);
  }

  // সাবজেক্ট অ্যাসাইন করা: PATCH /teachers/:id/assign-subject
  @Patch(':id/assign-subject')
  assignSubject(@Param('id') id: string, @Body('subjectId') subjectId: string) {
    return this.teacherService.assignSubject(id, subjectId);
  }
}