// src/admin/admin.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // সব টিচারের লিস্ট দেখা
  async getAllTeachers() {
    return this.prisma.teacher.findMany({
      include: { user: { select: { email: true, role: true, isActive: true } } },
    });
  }

  // টিচারের প্রোফাইল আপডেট করা
  async updateTeacher(id: string, data: any) {
    const teacher = await this.prisma.teacher.findUnique({ where: { id } });
    if (!teacher) throw new NotFoundException('এই টিচারকে খুঁজে পাওয়া যায়নি!');

    return this.prisma.teacher.update({
      where: { id },
      data: data,
    });
  }

  // টিচার ডিলিট করা (এর ফলে ইউজারও ডিলিট হয়ে যাবে কারণ আমাদের স্কিমাতে Cascade দেওয়া আছে)
  async deleteTeacher(id: string) {
    const teacher = await this.prisma.teacher.findUnique({ where: { id } });
    if (!teacher) throw new NotFoundException('এই টিচারকে খুঁজে পাওয়া যায়নি!');

    // আমরা সরাসরি User ডিলিট করছি, এতে Teacher প্রোফাইলও ডিলিট হয়ে যাবে
    return this.prisma.user.delete({
      where: { id: teacher.userId },
    });
  }
}