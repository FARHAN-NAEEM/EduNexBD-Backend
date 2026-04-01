// src/academic/sections/sections.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SectionsService {
  constructor(private prisma: PrismaService) {}

  // নতুন সেকশন তৈরি করা
  async createSection(name: string, classId: string) {
    // আগে চেক করছি ওই আইডি দিয়ে কোনো ক্লাস আছে কি না
    const classExists = await this.prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classExists) throw new NotFoundException('প্রদত্ত Class আইডিটি সঠিক নয়!');

    return this.prisma.section.create({
      data: {
        name,
        classId,
      },
      include: {
        class: true, // আউটপুটে ক্লাসের তথ্যও দেখাবে
      },
    });
  }

  // সব সেকশনের লিস্ট দেখা
  async getAllSections() {
    return this.prisma.section.findMany({
      include: {
        class: {
          include: { academicYear: true } // সেকশন -> ক্লাস -> বছর সব একসাথে দেখাবে!
        }
      },
    });
  }
}