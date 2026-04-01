// src/auth/auth.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { StudentSignupDto } from './dto/student-signup.dto';
import { TeacherSignupDto } from './dto/teacher-signup.dto';

@Controller('auth') // মূল রাউট: /auth
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup') signup(@Body() dto: AuthDto) { return this.authService.signup(dto); }
  @Post('signin') signin(@Body() dto: AuthDto) { return this.authService.signin(dto); }
  @Post('signup/student') signupStudent(@Body() dto: StudentSignupDto) { return this.authService.signupStudent(dto); }
  @Post('signup/teacher') signupTeacher(@Body() dto: TeacherSignupDto) { return this.authService.signupTeacher(dto); }

  @Post('signup/admin') // রাউট: /auth/signup/admin
  signupAdmin(@Body() dto: AuthDto) {
    return this.authService.signupAdmin(dto);
  }
}