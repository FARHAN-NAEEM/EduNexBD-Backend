// src/students/students.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  // ১. সব স্টুডেন্টের লিস্ট দেখা (অ্যাডমিনের জন্য)
  async getAllStudents() {
    return this.prisma.student.findMany({
      include: {
        user: { select: { email: true, role: true, isActive: true } },
        class: { select: { name: true } },
        section: { select: { name: true } },
      },
      orderBy: { rollNo: 'asc' } // রোল অনুযায়ী সাজানো
    });
  }

  // ২. নির্দিষ্ট স্টুডেন্টের কমপ্লিট প্রোফাইল দেখা (User ID বা Student ID দিয়ে)
  async getProfile(userIdOrStudentId: string) {
    const student = await this.prisma.student.findFirst({
      where: { 
        OR: [
          { userId: userIdOrStudentId },
          { id: userIdOrStudentId }
        ]
      },
      include: {
        user: { select: { email: true, role: true, isActive: true } },
        class: { include: { academicYear: true } },
        section: true,
        attendances: {
            orderBy: { date: 'desc' },
            take: 30 // লাস্ট ৩০ দিনের হাজিরা দেখাবে
        }
      },
    });

    if (!student) throw new NotFoundException('স্টুডেন্ট প্রোফাইল পাওয়া যায়নি!');

    // Profile Completion Score লজিক (কত পারসেন্ট প্রোফাইল পূরণ হয়েছে)
    const requiredFields = ['fullNameBn', 'dob', 'bloodGroup', 'mobile', 'fatherName', 'presentAddress', 'photoUrl'];
    const filledFields = requiredFields.filter(
        field => student[field as keyof typeof student] !== null && student[field as keyof typeof student] !== ''
    ).length;
    const profileCompletionScore = Math.round((filledFields / requiredFields.length) * 100);

    return {
        ...student,
        profileCompletionScore
    };
  }

  // ৩. স্টুডেন্ট প্রোফাইল আপডেট করা (Full Profile Data)
  async updateStudent(id: string, updateData: any) {
    const student = await this.prisma.student.findUnique({ where: { id } });
    if (!student) throw new NotFoundException('এই ছাত্রকে খুঁজে পাওয়া যায়নি!');

    // ডাটা স্যানিটাইজেশন
    const dataToUpdate = { ...updateData };

    if (dataToUpdate.rollNo) {
        dataToUpdate.rollNo = parseInt(dataToUpdate.rollNo, 10);
    }
    
    if (dataToUpdate.dob) {
        dataToUpdate.dob = new Date(dataToUpdate.dob).toISOString();
    }

    return this.prisma.student.update({
      where: { id },
      data: dataToUpdate,
      include: { class: true, section: true },
    });
  }

  // ৪. স্টুডেন্ট ডিলিট করা (ইউজারসহ)
  async removeStudent(id: string) {
    const student = await this.prisma.student.findUnique({ where: { id } });
    if (!student) throw new NotFoundException('এই ছাত্রকে খুঁজে পাওয়া যায়নি!');

    // ইউজার ডিলিট করলে ক্যাসকেড ডিলিট অনুযায়ী স্টুডেন্ট প্রোফাইলও ডাটাবেস থেকে মুছে যাবে
    return this.prisma.user.delete({
      where: { id: student.userId },
    });
  }
}