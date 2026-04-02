// src/academic/subjects/dto/subject.dto.ts
import { IsString, IsNotEmpty, IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class CreateSubjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  classId: string;

  // --- Dynamic Marks Fields ---
  @IsOptional()
  @IsBoolean()
  hasPractical?: boolean;

  @IsOptional()
  @IsNumber()
  writtenMarks?: number;

  @IsOptional()
  @IsNumber()
  mcqMarks?: number;

  @IsOptional()
  @IsNumber()
  practicalMarks?: number;

  @IsOptional()
  @IsNumber()
  fullMarks?: number;

  @IsOptional()
  @IsNumber()
  passMarks?: number;
}