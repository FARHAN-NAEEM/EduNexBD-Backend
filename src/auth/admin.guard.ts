// src/auth/admin.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // ইউজার না থাকলে বা ইউজারের রোল ADMIN না হলে ব্লক করবে
    if (!user || user.role !== 'ADMIN') {
      throw new ForbiddenException('শুধুমাত্র অ্যাডমিন এই কাজটি করতে পারবেন!');
    }
    
    return true;
  }
}