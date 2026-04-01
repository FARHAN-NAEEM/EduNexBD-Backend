// src/academic/subjects/subjects.service.ts
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  // নতুন সাবজেক্ট তৈরি করা
  async createSubject(name: string, code: string, classId: string) {
    // আগে চেক করছি ওই আইডি দিয়ে কোনো ক্লাস আছে কি না
    const classExists = await this.prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classExists) throw new NotFoundException('প্রদত্ত Class আইডিটি সঠিক নয়!');

    try {
      return await this.prisma.subject.create({
        data: {
          name,
          code, // যেমন: MATH-101
          classId,
        },
        include: {
          class: true, // আউটপুটে ক্লাসের তথ্যও দেখাবে
        },
      });
    } catch (error) {
      // যদি একই কোড (code) দিয়ে আগে থেকেই সাবজেক্ট থাকে
      if (error.code === 'P2002') throw new ConflictException('এই সাবজেক্ট কোডটি আগেই ব্যবহৃত হয়েছে!');
      throw error;
    }
  }

  // সব সাবজেক্টের লিস্ট দেখা
  async getAllSubjects() {
    return this.prisma.subject.findMany({
      include: {
        class: {
          include: { academicYear: true } // সাবজেক্ট -> ক্লাস -> বছর সব রিলেশন দেখাবে
        }
      },
    });
  }
}