// src/result/result.service.ts
import { Injectable, BadRequestException } from '@nestjs/common'; // 👈 এখানে @nestjs/common করা হয়েছে
import { PrismaService } from '../prisma/prisma.service'; // আপনার প্রিজমা সার্ভিসের সঠিক পাথ দেবেন
import { CreateExamDto, EnterMarkDto } from './dto/result.dto';

@Injectable()
export class ResultService {
  constructor(private prisma: PrismaService) {}

  // ১. নতুন পরীক্ষা তৈরি করা
  async createExam(dto: CreateExamDto) {
    return this.prisma.exam.create({ data: dto });
  }

  // ২. মার্কস এন্ট্রি এবং অটোমেটিক জিপিএ ক্যালকুলেশন লজিক
  async enterMark(dto: EnterMarkDto) {
    // সাবজেক্টের পাস মার্কস কত সেটা ডাটাবেস থেকে নিয়ে আসা
    const subject = await this.prisma.subject.findUnique({ where: { id: dto.subjectId } });
    if (!subject) throw new BadRequestException('সাবজেক্ট পাওয়া যায়নি!');

    // টোটাল মার্কস ক্যালকুলেট করা
    const total = (dto.written || 0) + (dto.mcq || 0) + (dto.practical || 0);
    
    // পাস নাকি ফেল চেক করা
    const isFail = total < subject.passMarks;

    // ডাটাবেস থেকে গ্রেডিং রুলস (A+, A, B...) নিয়ে আসা
    const gradingSystems = await this.prisma.gradingSystem.findMany({
      orderBy: { minMarks: 'desc' }
    });

    let assignedGrade = 'F';
    let assignedGpa = 0.0;

    // যদি পাস করে, তাহলে কত মার্কস পেয়েছে তার ওপর ভিত্তি করে গ্রেড ও জিপিএ দেওয়া
    if (!isFail) {
      // পার্সেন্টেজ বের করা (যেমন: ১০০ এর মধ্যে ৮০ পেলে ৮০%)
      const percentage = (total / subject.fullMarks) * 100;
      
      const matchedGrade = gradingSystems.find(g => percentage >= g.minMarks && percentage <= g.maxMarks);
      if (matchedGrade) {
        assignedGrade = matchedGrade.grade;
        assignedGpa = matchedGrade.gpa;
      }
    }

    // ডাটাবেসে মার্কস সেভ বা আপডেট করা (Upsert)
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

  // ৩. পরীক্ষার সব সাবজেক্টের মার্কস নিয়ে ফাইনাল রেজাল্ট প্রসেস করা (অ্যাডভান্সড ফিচার)
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

    // কোনো এক সাবজেক্টে ফেল করলে ওভারঅল রেজাল্ট FAIL
    const status = hasFailed ? 'FAIL' : 'PASS';
    const averageGpa = hasFailed ? 0.0 : (totalGpa / marks.length); // জিপিএ এভারেজ করা

    return this.prisma.result.upsert({
      where: { studentId_examId: { studentId, examId } },
      update: { totalMarks, gpa: averageGpa, status },
      create: { studentId, examId, totalMarks, gpa: averageGpa, status }
    });
  }
}