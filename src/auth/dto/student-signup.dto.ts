// src/auth/dto/student-signup.dto.ts
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class StudentSignupDto {
  // ইউজার একাউন্টের জন্য
  @IsEmail({}, { message: 'সঠিক ইমেইল এড্রেস দিন' })
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @MinLength(6, { message: 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে' })
  password: string;

  // স্টুডেন্ট প্রোফাইলের জন্য
  @IsString()
  @IsNotEmpty()
  studentId: string; // কলেজের দেওয়া আইডি (যেমন: S-2026-001)

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsNumber()
  @IsNotEmpty()
  rollNo: number;

  // আমাদের নতুন স্কিমা অনুযায়ী নিচের দুটি আইডি দরকার
  @IsString()
  @IsNotEmpty()
  classId: string; // নির্দিষ্ট ক্লাসের আইডি

  @IsString()
  @IsNotEmpty()
  sectionId: string; // নির্দিষ্ট সেকশনের আইডি

  @IsString()
  @IsOptional()
  gender?: string;
}