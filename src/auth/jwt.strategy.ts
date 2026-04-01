// src/auth/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // auth.service.ts এর সাথে হুবহু মিল থাকতে হবে
      secretOrKey: process.env.JWT_SECRET || 'super-secret-key', 
    });
  }

  async validate(payload: any) {
    // এই রিটার্ন করা অবজেক্টটিই আপনার কন্ট্রোলারে req.user হিসেবে পাওয়া যায়
    return { 
      id: payload.sub, 
      email: payload.email, 
      role: payload.role // 👈 এটি না থাকলে AdminGuard কাজ করবে না
    };
  }
}