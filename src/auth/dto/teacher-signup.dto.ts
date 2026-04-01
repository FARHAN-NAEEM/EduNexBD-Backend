// src/auth/dto/teacher-signup.dto.ts
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class TeacherSignupDto {
  // ইউজার একাউন্টের জন্য
  @IsEmail({}, { message: 'সঠিক ইমেইল এড্রেস দিন' })
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @MinLength(6, { message: 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে' })
  password: string;

  // শিক্ষকের প্রোফাইলের জন্য
  @IsString()
  @IsNotEmpty()
  employeeId: string; // শিক্ষক আইডি

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  designation: string; // যেমন: Lecturer, Professor

  @IsString()
  @IsOptional()
  department?: string; // যেমন: CSE, EEE
}