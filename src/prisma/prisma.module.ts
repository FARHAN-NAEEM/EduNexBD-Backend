import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // একে গ্লোবাল করে দিলাম যাতে অন্য যেকোনো মডিউল থেকে ডাটাবেস এক্সেস করা যায়
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // অন্য মডিউলকে এটি ব্যবহারের পারমিশন দেওয়া হলো
})
export class PrismaModule {}