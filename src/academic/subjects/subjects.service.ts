// src/academic/subjects/subjects.service.ts
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSubjectDto, UpdateSubjectDto } from './dto/subject.dto';

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  async createSubject(dto: CreateSubjectDto) {
    const classExists = await this.prisma.class.findUnique({
      where: { id: dto.classId },
    });
    if (!classExists) throw new NotFoundException('প্রদত্ত Class আইডিটি সঠিক নয়!');

    try {
      return await this.prisma.subject.create({
        data: {
          name: dto.name, code: dto.code, classId: dto.classId,
          hasPractical: dto.hasPractical ?? false,
          writtenMarks: dto.writtenMarks ?? 100,
          mcqMarks: dto.mcqMarks ?? 0,
          practicalMarks: dto.practicalMarks ?? 0,
          fullMarks: dto.fullMarks ?? 100,
          passMarks: dto.passMarks ?? 33,
        },
        include: { class: true },
      });
    } catch (error: any) {
      if (error.code === 'P2002') throw new ConflictException('এই সাবজেক্ট কোডটি আগেই ব্যবহৃত হয়েছে!');
      throw error;
    }
  }

  async getAllSubjects() {
    return this.prisma.subject.findMany({
      include: { class: { include: { academicYear: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  // ✅ UPDATE SUBJECT
  async updateSubject(id: string, dto: UpdateSubjectDto) {
    try {
      return await this.prisma.subject.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      throw new NotFoundException('সাবজেক্ট আপডেট করতে সমস্যা হয়েছে!');
    }
  }

  // ✅ DELETE SUBJECT
  async deleteSubject(id: string) {
    try {
      return await this.prisma.subject.delete({
        where: { id },
      });
    } catch (error) {
      throw new ConflictException('এই সাবজেক্টটি ডিলেট করা সম্ভব নয়, কারণ এর অধীনে মার্কস সেভ করা থাকতে পারে!');
    }
  }
}