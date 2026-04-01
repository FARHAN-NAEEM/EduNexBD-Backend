// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TeacherModule } from './teacher/teacher.module';
import { AdminModule } from './admin/admin.module';
import { YearsModule } from './academic/years/years.module';
import { ClassesModule } from './academic/classes/classes.module';
import { SectionsModule } from './academic/sections/sections.module';
import { SubjectsModule } from './academic/subjects/subjects.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { StudentsModule } from './students/students.module'; // শুধুমাত্র বহুবচনটা থাকবে
import { AttendanceModule } from './attendance/attendance.module';
import { ResultModule } from './result/result.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    TeacherModule,
    AdminModule,
    YearsModule,
    ClassesModule,
    SectionsModule,
    SubjectsModule,
    AssignmentsModule,
    StudentsModule,
    AttendanceModule,
    ResultModule, // একবচন StudentModule টি এখান থেকে ডিলিট করে দিয়েছি
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}