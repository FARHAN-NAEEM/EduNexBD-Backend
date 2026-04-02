// src/result/dto/result.dto.ts
import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateExamDto {
  @IsString()
  name: string; // e.g., "Mid Term 2026"

  @IsString()
  academicYearId: string;

  @IsOptional()
  @IsString()
  classId?: string;

  @IsOptional()
  @IsString()
  sectionId?: string; // ✅ নতুন যোগ করা হয়েছে
}

export class EnterMarkDto {
  @IsString()
  studentId: string;
  @IsString()
  subjectId: string;
  @IsString()
  examId: string;
  
  @IsOptional()
  @IsNumber()
  written?: number;
  
  @IsOptional()
  @IsNumber()
  mcq?: number;
  
  @IsOptional()
  @IsNumber()
  practical?: number;
}