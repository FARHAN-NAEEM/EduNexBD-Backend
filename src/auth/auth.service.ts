// src/auth/auth.service.ts
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import { StudentSignupDto } from './dto/student-signup.dto';
import { TeacherSignupDto } from './dto/teacher-signup.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  // সাধারণ ইউজার রেজিস্ট্রেশন
  async signup(dto: AuthDto) {
    const hash = await bcrypt.hash(dto.password, 10);
    try {
      const user = await this.prisma.user.create({
        data: { email: dto.email, passwordHash: hash },
      });
      return this.signToken(user.id, user.email, user.role);
    } catch (error) {
      if (error.code === 'P2002') throw new ForbiddenException('এই ইমেইল দিয়ে ইতমধ্যেই একটি একাউন্ট রয়েছে!');
      throw error;
    }
  }

  // স্টুডেন্ট রেজিস্ট্রেশন ফাংশন
  async signupStudent(dto: StudentSignupDto) {
    const hash = await bcrypt.hash(dto.password, 10);
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          passwordHash: hash,
          role: 'STUDENT',
          student: {
            create: {
              studentId: dto.studentId,
              firstName: dto.firstName,
              lastName: dto.lastName,
              rollNo: dto.rollNo,
              classId: dto.classId,
              sectionId: dto.sectionId,
              gender: dto.gender,
            },
          },
        },
      });
      return this.signToken(user.id, user.email, user.role);
    } catch (error) {
      if (error.code === 'P2002') throw new ForbiddenException('এই ইমেইল বা স্টুডেন্ট আইডি আগে থেকেই ব্যবহৃত হচ্ছে!');
      throw error;
    }
  }

  // শিক্ষক রেজিস্ট্রেশন ফাংশন 
  async signupTeacher(dto: TeacherSignupDto) {
    const hash = await bcrypt.hash(dto.password, 10);
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          passwordHash: hash,
          role: 'TEACHER',
          teacher: {
            create: {
              employeeId: dto.employeeId,
              firstName: dto.firstName,
              lastName: dto.lastName,
              designation: dto.designation,
              department: dto.department,
            },
          },
        },
      });
      return this.signToken(user.id, user.email, user.role);
    } catch (error) {
      if (error.code === 'P2002') throw new ForbiddenException('এই ইমেইল বা এমপ্লয়ি আইডি আগে থেকেই ব্যবহৃত হচ্ছে!');
      throw error;
    }
  }

  // এডমিন রেজিস্ট্রেশন ফাংশন
  async signupAdmin(dto: AuthDto) {
    const hash = await bcrypt.hash(dto.password, 10);
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          passwordHash: hash,
          role: 'ADMIN',
        },
      });
      return this.signToken(user.id, user.email, user.role);
    } catch (error) {
      if (error.code === 'P2002') throw new ForbiddenException('এই ইমেইল দিয়ে ইতমধ্যেই একটি একাউন্ট রয়েছে!');
      throw error;
    }
  }

  // লগইন ফাংশন
  async signin(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new ForbiddenException('ভুল ইমেইল বা পাসওয়ার্ড!');
    
    const pwMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!pwMatches) throw new ForbiddenException('ভুল ইমেইল বা পাসওয়ার্ড!');
    
    return this.signToken(user.id, user.email, user.role);
  }

  // টোকেন জেনারেট করার ফাংশন (আপডেটেড)
  private async signToken(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    const secret = process.env.JWT_SECRET || 'super-secret-key';
    
    // ✅ এখানে expiresIn বাড়িয়ে '7d' (৭ দিন) করে দেওয়া হয়েছে
    const token = await this.jwt.signAsync(payload, { 
      expiresIn: '7d', 
      secret: secret 
    });
    
    return { access_token: token };
  }
}