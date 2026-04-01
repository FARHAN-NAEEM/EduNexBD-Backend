// src/academic/years/years.service.ts
import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class YearsService {
  constructor(private prisma: PrismaService) {}

  // নতুন শিক্ষাবর্ষ তৈরি করা
  async createYear(year: string, startDate: string, endDate: string) {
    try {
      return await this.prisma.academicYear.create({
        data: {
          year,
          startDate: new Date(startDate), // String কে Date ফরম্যাটে কনভার্ট করছি
          endDate: new Date(endDate),
        },
      });
    } catch (error) {
      if (error.code === 'P2002') throw new ConflictException('এই শিক্ষাবর্ষটি আগেই তৈরি করা হয়েছে!');
      throw error;
    }
  }

  // সব শিক্ষাবর্ষের লিস্ট দেখা
  async getAllYears() {
    return this.prisma.academicYear.findMany({
      orderBy: { startDate: 'desc' }, // নতুন বছরটা আগে দেখাবে
    });
  }
}