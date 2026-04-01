// src/assignments/assignments.service.ts
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssignmentsService {
  constructor(private prisma: PrismaService) {}

  // শিক্ষককে সাবজেক্ট এসাইন করা
  async assignTeacher(teacherId: string, subjectId: string) {
    // ১. চেক করছি টিচার আছে কি না
    const teacher = await this.prisma.teacher.findUnique({ where: { id: teacherId } });
    if (!teacher) throw new NotFoundException('প্রদত্ত Teacher আইডিটি সঠিক নয়!');

    // ২. চেক করছি সাবজেক্ট আছে কি না
    const subject = await this.prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) throw new NotFoundException('প্রদত্ত Subject আইডিটি সঠিক নয়!');

    try {
      return await this.prisma.assignment.create({
        data: {
          teacherId,
          subjectId,
        },
        include: {
          teacher: true,
          subject: { include: { class: true } },
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('এই শিক্ষককে ইতিমধ্যে এই সাবজেক্টে এসাইন করা হয়েছে!');
      }
      throw error;
    }
  }

  // সব এসাইনমেন্টের লিস্ট দেখা
  async getAllAssignments() {
    return this.prisma.assignment.findMany({
      include: {
        teacher: true,
        subject: {
          include: { class: { include: { academicYear: true } } }
        },
      },
    });
  }
}