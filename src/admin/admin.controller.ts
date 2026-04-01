// src/admin/admin.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../auth/admin.guard';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('teachers')
  getAllTeachers() {
    return this.adminService.getAllTeachers();
  }

  // আপডেট রাউট: PATCH /admin/teachers/:id
  @Patch('teachers/:id')
  updateTeacher(@Param('id') id: string, @Body() body: any) {
    return this.adminService.updateTeacher(id, body);
  }

  // ডিলিট রাউট: DELETE /admin/teachers/:id
  @Delete('teachers/:id')
  deleteTeacher(@Param('id') id: string) {
    return this.adminService.deleteTeacher(id);
  }
}