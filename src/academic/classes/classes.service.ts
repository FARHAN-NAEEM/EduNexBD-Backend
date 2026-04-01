// src/academic/classes/classes.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ClassesService {
  constructor(private prisma: PrismaService) {}

  // নতুন ক্লাস তৈরি করা
  async createClass(name: string, academicYearId: string) {
    // আগে চেক করছি ওই আইডি দিয়ে কোনো বছর আছে কি না
    const yearExists = await this.prisma.academicYear.findUnique({
      where: { id: academicYearId },
    });

    if (!yearExists) throw new NotFoundException('প্রদত্ত Academic Year আইডিটি সঠিক নয়!');

    return this.prisma.class.create({
      data: {
        name,
        academicYearId,
      },
      include: {
        academicYear: true, // আউটপুটে বছরের তথ্যও দেখাবে
      },
    });
  }

  // সব ক্লাসের লিস্ট দেখা
  async getAllClasses() {
    return this.prisma.class.findMany({
      include: {
        academicYear: true,
        sections: true, // সাথে সেকশনগুলোও (যদি থাকে) দেখাবে
      },
    });
  }
}