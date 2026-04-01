// src/attendance/attendance.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AttendanceStatus } from '@prisma/client';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  // ১. নির্দিষ্ট ক্লাসের স্টুডেন্টদের ডাটা এবং আজকের হাজিরা নিয়ে আসা
  async getAttendance(classId: string, sectionId: string, date: string) {
    // স্ট্রিং ডেট-কে আইএসও ডেট অবজেক্টে রূপান্তর করা হচ্ছে
    const attendanceDate = new Date(date).toISOString();

    // ওই ক্লাস এবং সেকশনের সব স্টুডেন্টদের নিয়ে আসা (রোল নাম্বার অনুযায়ী সাজানো)
    const students = await this.prisma.student.findMany({
      where: { classId, sectionId },
      select: { id: true, studentId: true, firstName: true, lastName: true, rollNo: true },
      orderBy: { rollNo: 'asc' }
    });

    // আজকের হাজিরার লিস্ট ডাটাবেস থেকে নিয়ে আসা
    const attendances = await this.prisma.attendance.findMany({
      where: { classId, sectionId, date: attendanceDate }
    });

    // স্টুডেন্টদের ডাটার সাথে তাদের হাজিরার স্ট্যাটাস মিলিয়ে পাঠানো
    return students.map(student => {
      const record = attendances.find(a => a.studentId === student.id);
      return {
        ...student,
        status: record ? record.status : null // null মানে এখনো হাজিরা নেওয়া হয়নি
      };
    });
  }

  // ২. হাজিরা সেভ বা আপডেট করা (Bulk Upsert)
  async saveAttendance(classId: string, sectionId: string, date: string, records: { studentId: string, status: AttendanceStatus }[]) {
    const attendanceDate = new Date(date).toISOString();

    // ট্রানজেকশন ব্যবহার করছি যাতে সব স্টুডেন্টের হাজিরা একসাথে সেভ হয়, একটা ফেইল করলে সব বাতিল হয়
    const upsertPromises = records.map(record => {
      return this.prisma.attendance.upsert({
        where: {
          date_studentId: { // স্কিমাদের @@unique([date, studentId]) এর কারণে এটা ব্যবহার করা যায়
            date: attendanceDate,
            studentId: record.studentId
          }
        },
        update: {
          status: record.status // আগে হাজিরা দেওয়া থাকলে জাস্ট আপডেট হবে
        },
        create: {
          date: attendanceDate,
          status: record.status,
          studentId: record.studentId,
          classId: classId,
          sectionId: sectionId
        } // আগে হাজিরা দেওয়া না থাকলে নতুন করে সেভ হবে
      });
    });

    await this.prisma.$transaction(upsertPromises);
    return { message: 'হাজিরা সফলভাবে সেভ করা হয়েছে!', date: date };
  }
}