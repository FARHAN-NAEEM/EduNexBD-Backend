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

export class UpdateSubjectDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() code?: string;
  @IsOptional() @IsString() classId?: string;
  @IsOptional() @IsBoolean() hasPractical?: boolean;
  @IsOptional() @IsNumber() writtenMarks?: number;
  @IsOptional() @IsNumber() mcqMarks?: number;
  @IsOptional() @IsNumber() practicalMarks?: number;
  @IsOptional() @IsNumber() fullMarks?: number;
  @IsOptional() @IsNumber() passMarks?: number;
}