// src/result/result.service.ts
import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExamDto, EnterMarkDto, UpdateExamDto } from './dto/result.dto';

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

  // ২. সব পরীক্ষার লিস্ট দেখা
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

  // UPDATE EXAM
  async updateExam(id: string, dto: UpdateExamDto) {
    try {
      return await this.prisma.exam.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      throw new NotFoundException('পরীক্ষা আপডেট করতে সমস্যা হয়েছে!');
    }
  }

  // DELETE EXAM
  async deleteExam(id: string) {
    try {
      return await this.prisma.exam.delete({
        where: { id },
      });
    } catch (error) {
      throw new ConflictException('এই পরীক্ষাটি ডিলেট করা সম্ভব নয়, কারণ এর অধীনে মার্কস সেভ করা থাকতে পারে!');
    }
  }

  // ৩. মার্কস এন্ট্রি এবং অটোমেটিক জিপিএ ক্যালকুলেশন লজিক (আপডেটেড গ্রেডিং স্কেল)
  async enterMark(dto: EnterMarkDto) {
    const subject = await this.prisma.subject.findUnique({ where: { id: dto.subjectId } });
    if (!subject) throw new BadRequestException('সাবজেক্ট পাওয়া যায়নি!');

    const total = (dto.written || 0) + (dto.mcq || 0) + (dto.practical || 0);
    
    // ✅ Percentage Calculation
    const percentage = (total / (subject.fullMarks || 100)) * 100;

    let assignedGrade = 'F';
    let assignedGpa = 0.0;

    // ✅ Standard Letter Grade System
    if (percentage >= 80) { assignedGrade = 'A+'; assignedGpa = 5.0; }
    else if (percentage >= 70) { assignedGrade = 'A'; assignedGpa = 4.0; }
    else if (percentage >= 60) { assignedGrade = 'A-'; assignedGpa = 3.5; }
    else if (percentage >= 50) { assignedGrade = 'B'; assignedGpa = 3.0; }
    else if (percentage >= 40) { assignedGrade = 'C'; assignedGpa = 2.0; }
    else if (percentage >= 33) { assignedGrade = 'D'; assignedGpa = 1.0; }
    else { assignedGrade = 'F'; assignedGpa = 0.0; }

    const isFail = assignedGrade === 'F';

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

  // ৪. পরীক্ষার সব সাবজেক্টের মার্কস নিয়ে ফাইনাল রেজাল্ট প্রসেস করা
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
      if (mark.grade === 'F' || mark.isFail) hasFailed = true;
    });

    const status = hasFailed ? 'FAIL' : 'PASS';
    const averageGpa = hasFailed ? 0.0 : (totalGpa / marks.length); 

    return this.prisma.result.upsert({
      where: { studentId_examId: { studentId, examId } },
      update: { totalMarks, gpa: averageGpa, status },
      create: { studentId, examId, totalMarks, gpa: averageGpa, status }
    });
  }

  // ৫. ট্যাবুলেশন শিট জেনারেট করার লজিক (রিয়েল-টাইম ডাইনামিক ক্যালকুলেশন সহ)
  async getTabulationSheet(examId: string, classId: string, sectionId: string) {
    const subjects = await this.prisma.subject.findMany({
      where: { classId },
      orderBy: { createdAt: 'asc' }
    });

    if (!subjects.length) throw new NotFoundException('এই ক্লাসের কোনো সাবজেক্ট পাওয়া যায়নি!');

    const students = await this.prisma.student.findMany({
      where: { sectionId },
      orderBy: { rollNo: 'asc' }
    });

    if (!students.length) throw new NotFoundException('এই শাখায় কোনো স্টুডেন্ট নেই!');

    const studentIds = students.map(s => s.id);
    const allMarks = await this.prisma.mark.findMany({
      where: {
        examId,
        studentId: { in: studentIds }
      }
    });

    // ডাটা ফরম্যাটিং এবং রিয়েল-টাইম ক্যালকুলেশন
    const formattedStudents = students.map(student => {
      const studentMarks: any = {};
      let grandTotal = 0;
      let totalGpa = 0;
      let hasFailed = false;
      let subjectsWithMarksCount = 0;
      
      subjects.forEach(sub => {
        const mark = allMarks.find(m => m.studentId === student.id && m.subjectId === sub.id);
        if (mark) {
          // ✅ Calculate subject percentage
          const percentage = (mark.total / (sub.fullMarks || 100)) * 100;
          
          let subPoint = 0;
          let subGrade = 'F';

          // ✅ Assign Grade & Point based on exact marks range
          if (percentage >= 80) { subPoint = 5.0; subGrade = 'A+'; }
          else if (percentage >= 70) { subPoint = 4.0; subGrade = 'A'; }
          else if (percentage >= 60) { subPoint = 3.5; subGrade = 'A-'; }
          else if (percentage >= 50) { subPoint = 3.0; subGrade = 'B'; }
          else if (percentage >= 40) { subPoint = 2.0; subGrade = 'C'; }
          else if (percentage >= 33) { subPoint = 1.0; subGrade = 'D'; }
          else { subPoint = 0.0; subGrade = 'F'; }

          if (subGrade === 'F') {
            hasFailed = true;
          }

          studentMarks[sub.id] = {
            w: mark.written,
            m: mark.mcq,
            p: mark.practical,
            t: mark.total
          };
          grandTotal += mark.total;
          totalGpa += subPoint;
          subjectsWithMarksCount++;
        } else {
          studentMarks[sub.id] = null;
        }
      });

      // ✅ Final GPA & Grade Calculation (As per standard rules)
      let finalGpa = 0.00;
      let finalGrade = '-';

      if (subjectsWithMarksCount > 0) {
        if (hasFailed) {
          // If failed in ANY subject, Final GPA is 0.00 and Grade is F
          finalGpa = 0.00;
          finalGrade = 'F';
        } else {
          // Calculate Average GPA
          finalGpa = totalGpa / subjectsWithMarksCount;

          // Assign Final Grade based on average GPA
          if (finalGpa >= 5.0) finalGrade = 'A+';
          else if (finalGpa >= 4.0) finalGrade = 'A';
          else if (finalGpa >= 3.5) finalGrade = 'A-';
          else if (finalGpa >= 3.0) finalGrade = 'B';
          else if (finalGpa >= 2.0) finalGrade = 'C';
          else if (finalGpa >= 1.0) finalGrade = 'D';
          else finalGrade = 'F';
        }
      }

      return {
        roll: student.rollNo,
        name: `${student.firstName} ${student.lastName}`,
        marks: studentMarks,
        total: subjectsWithMarksCount > 0 ? grandTotal : '-',
        gpa: subjectsWithMarksCount > 0 ? finalGpa.toFixed(2) : '-',
        grade: subjectsWithMarksCount > 0 ? finalGrade : '-'
      };
    });

    return {
      subjects: subjects.map(s => ({
        id: s.id,
        name: s.name,
        hasPractical: s.hasPractical
      })),
      students: formattedStudents
    };
  }
}