// src/result/result.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExamDto, EnterMarkDto } from './dto/result.dto';

@Injectable()
export class ResultService {
  constructor(private prisma: PrismaService) {}

  // ১. নতুন পরীক্ষা তৈরি করা
  async createExam(dto: CreateExamDto) {
    return this.prisma.exam.create({ 
      data: dto,
      include: { academicYear: true, class: true, section: true }
    });
  }

  // ২. সব পরীক্ষার লিস্ট দেখা (✅ নতুন যোগ করা হয়েছে)
  async getAllExams() {
    return this.prisma.exam.findMany({
      include: {
        academicYear: true,
        class: true,
        section: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // ৩. মার্কস এন্ট্রি এবং অটোমেটিক জিপিএ ক্যালকুলেশন লজিক
  async enterMark(dto: EnterMarkDto) {
    const subject = await this.prisma.subject.findUnique({ where: { id: dto.subjectId } });
    if (!subject) throw new BadRequestException('সাবজেক্ট পাওয়া যায়নি!');

    const total = (dto.written || 0) + (dto.mcq || 0) + (dto.practical || 0);
    const isFail = total < subject.passMarks;

    const gradingSystems = await this.prisma.gradingSystem.findMany({
      orderBy: { minMarks: 'desc' }
    });

    let assignedGrade = 'F';
    let assignedGpa = 0.0;

    if (!isFail) {
      const percentage = (total / subject.fullMarks) * 100;
      const matchedGrade = gradingSystems.find(g => percentage >= g.minMarks && percentage <= g.maxMarks);
      if (matchedGrade) {
        assignedGrade = matchedGrade.grade;
        assignedGpa = matchedGrade.gpa;
      }
    }

    return this.prisma.mark.upsert({
      where: {
        studentId_subjectId_examId: {
          studentId: dto.studentId,
          subjectId: dto.subjectId,
          examId: dto.examId
        }
      },
      update: {
        written: dto.written,
        mcq: dto.mcq,
        practical: dto.practical,
        total: total,
        isFail: isFail,
        grade: assignedGrade,
        gpa: assignedGpa,
      },
      create: {
        studentId: dto.studentId,
        subjectId: dto.subjectId,
        examId: dto.examId,
        written: dto.written || 0,
        mcq: dto.mcq || 0,
        practical: dto.practical || 0,
        total: total,
        isFail: isFail,
        grade: assignedGrade,
        gpa: assignedGpa,
      }
    });
  }

  // ৪. পরীক্ষার সব সাবজেক্টের মার্কস নিয়ে ফাইনাল রেজাল্ট প্রসেস করা
  async processFinalResult(studentId: string, examId: string) {
    const marks = await this.prisma.mark.findMany({
      where: { studentId, examId }
    });

    if (marks.length === 0) throw new BadRequestException('এই স্টুডেন্টের কোনো মার্কস এন্ট্রি নেই!');

    let totalMarks = 0;
    let totalGpa = 0;
    let hasFailed = false;

    marks.forEach(mark => {
      totalMarks += mark.total;
      totalGpa += mark.gpa || 0;
      if (mark.isFail) hasFailed = true;
    });

    const status = hasFailed ? 'FAIL' : 'PASS';
    const averageGpa = hasFailed ? 0.0 : (totalGpa / marks.length); 

    return this.prisma.result.upsert({
      where: { studentId_examId: { studentId, examId } },
      update: { totalMarks, gpa: averageGpa, status },
      create: { studentId, examId, totalMarks, gpa: averageGpa, status }
    });
  }
}