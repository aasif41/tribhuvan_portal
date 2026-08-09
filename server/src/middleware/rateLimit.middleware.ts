import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const attemptsMap = new Map<string, RateLimitStore>();

// Basic in-memory rate limiter for authentication endpoints: 10 attempts per 15 minutes per IP
export function authRateLimiter(req: Request, res: Response, next: NextFunction): void {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 10;

  let record = attemptsMap.get(ip);

  if (!record || now > record.resetTime) {
    record = { count: 1, resetTime: now + windowMs };
    attemptsMap.set(ip, record);
    return next();
  }

  record.count += 1;

  if (record.count > maxAttempts) {
    res.status(429).json({
      success: false,
      message: 'Too many login attempts. Please try again after 15 minutes.',
      code: 'TOO_MANY_REQUESTS',
    });
    return;
  }

  next();
}
