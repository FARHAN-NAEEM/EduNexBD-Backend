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
  sectionId?: string; // ✅ নতুন যোগ করা হয়েছে
}

// ✅ EXAM UPDATE করার জন্য নতুন DTO
export class UpdateExamDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  academicYearId?: string;

  @IsOptional()
  @IsString()
  classId?: string;

  @IsOptional()
  @IsString()
  sectionId?: string;
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