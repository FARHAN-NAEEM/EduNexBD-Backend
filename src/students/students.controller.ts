// src/students/students.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { StudentsService } from './students.service';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../auth/admin.guard';

@Controller('students')
@UseGuards(AuthGuard('jwt')) // পুরো কন্ট্রোলার লগইন ছাড়া এক্সেস করা যাবে না
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  // সবার লিস্ট দেখা (Admin Only)
  @Get()
  @UseGuards(AdminGuard)
  findAll() {
    return this.studentsService.getAllStudents();
  }

  // নিজের প্রোফাইল দেখা (Log-in Student Only)
  @Get('profile')
  getProfile(@Req() req: any) {
    const userId = req.user.id || req.user.sub;
    return this.studentsService.getProfile(userId);
  }

  // নির্দিষ্ট কোনো স্টুডেন্টের প্রোফাইল দেখা (Admin/Teacher)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentsService.getProfile(id);
  }

  // স্টুডেন্ট আপডেট করা (Admin Only)
  @Patch(':id')
  @UseGuards(AdminGuard)
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.studentsService.updateStudent(id, updateData);
  }

  // স্টুডেন্ট ডিলিট করা (Admin Only)
  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.studentsService.removeStudent(id);
  }
}