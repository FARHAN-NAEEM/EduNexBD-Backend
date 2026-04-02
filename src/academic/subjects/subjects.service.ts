// src/academic/subjects/subjects.service.ts
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSubjectDto } from './dto/subject.dto';

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  // নতুন সাবজেক্ট তৈরি করা (ডাইনামিক মার্কস লজিক সহ)
  async createSubject(dto: CreateSubjectDto) {
    // আগে চেক করছি ওই আইডি দিয়ে কোনো ক্লাস আছে কি না
    const classExists = await this.prisma.class.findUnique({
      where: { id: dto.classId },
    });

    if (!classExists) throw new NotFoundException('প্রদত্ত Class আইডিটি সঠিক নয়!');

    try {
      return await this.prisma.subject.create({
        data: {
          name: dto.name,
          code: dto.code,
          classId: dto.classId,
          
          // Dynamic Marks Structure
          hasPractical: dto.hasPractical ?? false,
          writtenMarks: dto.writtenMarks ?? 100,
          mcqMarks: dto.mcqMarks ?? 0,
          practicalMarks: dto.practicalMarks ?? 0,
          fullMarks: dto.fullMarks ?? 100,
          passMarks: dto.passMarks ?? 33,
        },
        include: {
          class: true, // আউটপুটে ক্লাসের তথ্যও দেখাবে
        },
      });
    } catch (error: any) {
      // যদি একই কোড (code) দিয়ে আগে থেকেই সাবজেক্ট থাকে
      if (error.code === 'P2002') throw new ConflictException('এই সাবজেক্ট কোডটি আগেই ব্যবহৃত হয়েছে!');
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
      orderBy: { createdAt: 'desc' }
    });
  }
}