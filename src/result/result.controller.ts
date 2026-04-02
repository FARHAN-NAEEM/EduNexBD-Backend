// src/result/result.controller.ts
import { Controller, Post, Body, Param, Get, Patch, Delete } from '@nestjs/common';
import { ResultService } from './result.service';
import { CreateExamDto, EnterMarkDto, UpdateExamDto } from './dto/result.dto';

@Controller('results')
export class ResultController {
  constructor(private readonly resultService: ResultService) {}

  @Post('exam')
  createExam(@Body() createExamDto: CreateExamDto) {
    return this.resultService.createExam(createExamDto);
  }

  @Get('exams') // ✅ নতুন API যোগ করা হয়েছে
  getAllExams() {
    return this.resultService.getAllExams();
  }

  // ✅ UPDATE EXAM API (নতুন যোগ করা হয়েছে)
  @Patch('exam/:id')
  updateExam(@Param('id') id: string, @Body() dto: UpdateExamDto) {
    return this.resultService.updateExam(id, dto);
  }

  // ✅ DELETE EXAM API (নতুন যোগ করা হয়েছে)
  @Delete('exam/:id')
  deleteExam(@Param('id') id: string) {
    return this.resultService.deleteExam(id);
  }

  @Post('mark')
  enterMark(@Body() enterMarkDto: EnterMarkDto) {
    return this.resultService.enterMark(enterMarkDto);
  }

  @Post('process/:studentId/:examId')
  processFinalResult(@Param('studentId') studentId: string, @Param('examId') examId: string) {
    return this.resultService.processFinalResult(studentId, examId);
  }

  // ✅ NEW: GET Tabulation Data API (ট্যাবুলেশন শিট ডাটা ফেচ করার জন্য)
  @Get('tabulation/:examId/:classId/:sectionId')
  getTabulationSheet(
    @Param('examId') examId: string,
    @Param('classId') classId: string,
    @Param('sectionId') sectionId: string
  ) {
    return this.resultService.getTabulationSheet(examId, classId, sectionId);
  }
}