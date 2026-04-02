// src/result/result.controller.ts
import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { ResultService } from './result.service';
import { CreateExamDto, EnterMarkDto } from './dto/result.dto';

@Controller('results')
export class ResultController {
  constructor(private readonly resultService: ResultService) {}

  @Post('exam')
  createExam(@Body() createExamDto: CreateExamDto) {
    return this.resultService.createExam(createExamDto);
  }

  @Get('exams') // ✅ নতুন API যোগ করা হয়েছে
  getAllExams() {
    return this.resultService.getAllExams();
  }

  @Post('mark')
  enterMark(@Body() enterMarkDto: EnterMarkDto) {
    return this.resultService.enterMark(enterMarkDto);
  }

  @Post('process/:studentId/:examId')
  processFinalResult(@Param('studentId') studentId: string, @Param('examId') examId: string) {
    return this.resultService.processFinalResult(studentId, examId);
  }
}