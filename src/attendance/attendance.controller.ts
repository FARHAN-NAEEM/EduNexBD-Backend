// src/attendance/attendance.controller.ts
import { Controller, Get, Post, Body, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AuthGuard } from '@nestjs/passport';
import { AttendanceStatus } from '@prisma/client';

@Controller('attendance')
@UseGuards(AuthGuard('jwt')) // এই রাউটগুলো অ্যাক্সেস করতে লগইন লাগবেই
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // URL: GET /attendance?classId=...&sectionId=...&date=2026-03-27
  @Get()
  getAttendance(
    @Query('classId') classId: string,
    @Query('sectionId') sectionId: string,
    @Query('date') date: string, // ফরম্যাট: YYYY-MM-DD
  ) {
    if (!classId || !sectionId || !date) {
      throw new BadRequestException('classId, sectionId এবং date রিকোয়েস্টের সাথে দিতে হবে!');
    }
    return this.attendanceService.getAttendance(classId, sectionId, date);
  }

  // URL: POST /attendance
  @Post()
  saveAttendance(
    @Body('classId') classId: string,
    @Body('sectionId') sectionId: string,
    @Body('date') date: string,
    @Body('records') records: { studentId: string; status: AttendanceStatus }[],
  ) {
    if (!classId || !sectionId || !date || !records) {
      throw new BadRequestException('ডাটা অসম্পূর্ণ! classId, sectionId, date এবং records পাঠাতে হবে।');
    }
    return this.attendanceService.saveAttendance(classId, sectionId, date, records);
  }
}