// src/teacher/teacher.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TeacherService {
  constructor(private prisma: PrismaService) {}

  // ১. সব শিক্ষকের লিস্ট দেখা (অ্যাডমিনের জন্য)
  async getAllTeachers() {
    return this.prisma.teacher.findMany({
      include: {
        user: { select: { email: true, role: true, isActive: true } },
        assignments: { // Assignment মডেলের মাধ্যমে সাবজেক্টের তথ্য আনা হচ্ছে
          include: {
            subject: true 
          }
        }
      },
    });
  }

  // ২. নিজের প্রোফাইল দেখা (লগইন করা শিক্ষকের জন্য)
  async getProfile(userId: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId: userId },
      include: {
        user: { select: { email: true, role: true, isActive: true } },
        assignments: {
          include: {
            subject: true
          }
        }
      },
    });

    if (!teacher) throw new NotFoundException('শিক্ষক প্রোফাইল পাওয়া যায়নি!');
    return teacher;
  }

  // ৩. শিক্ষকের প্রোফাইল আপডেট করা (অ্যাডমিনের জন্য)
  async updateTeacher(id: string, updateData: any) {
    const teacher = await this.prisma.teacher.findUnique({ where: { id } });
    if (!teacher) throw new NotFoundException('এই শিক্ষককে খুঁজে পাওয়া যায়নি!');

    return this.prisma.teacher.update({
      where: { id },
      data: updateData,
    });
  }

  // ৪. শিক্ষক ডিলিট করা (ইউজারসহ)
  async removeTeacher(id: string) {
    const teacher = await this.prisma.teacher.findUnique({ where: { id } });
    if (!teacher) throw new NotFoundException('এই শিক্ষককে খুঁজে পাওয়া যায়নি!');

    return this.prisma.user.delete({
      where: { id: teacher.userId },
    });
  }

  // ৫. শিক্ষককে সাবজেক্ট অ্যাসাইন করা (Assignment মডেল ব্যবহার করে)
  async assignSubject(teacherId: string, subjectId: string) {
    // আগে চেক করবো টিচার এবং সাবজেক্ট আছে কিনা
    const teacher = await this.prisma.teacher.findUnique({ where: { id: teacherId } });
    const subject = await this.prisma.subject.findUnique({ where: { id: subjectId } });

    if (!teacher) throw new NotFoundException('শিক্ষক পাওয়া যায়নি!');
    if (!subject) throw new NotFoundException('সাবজেক্ট পাওয়া যায়নি!');

    // চেক করবো এই টিচারকে এই সাবজেক্ট আগে থেকেই দেওয়া আছে কিনা (Duplicate Check)
    const existingAssignment = await this.prisma.assignment.findUnique({
      where: {
        teacherId_subjectId: { // আপনার স্কিমার @@unique 인덱স ব্যবহার করা হলো
          teacherId,
          subjectId
        }
      }
    });

    if (existingAssignment) {
      throw new ConflictException('এই শিক্ষককে আগে থেকেই এই সাবজেক্টটি দেওয়া হয়েছে!');
    }

    // Assignment টেবিলে নতুন এন্ট্রি তৈরি করা
    return this.prisma.assignment.create({
      data: {
        teacherId,
        subjectId
      },
      include: { // রেসপন্সে টিচার এবং সাবজেক্টের নাম দেখিয়ে দেওয়া
        teacher: { select: { firstName: true, lastName: true } },
        subject: { select: { name: true, code: true } }
      }
    });
  }
}