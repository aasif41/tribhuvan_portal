import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';

const JWT_SECRET = process.env.JWT_SECRET || 'tribhuvan-jwt-secret-key-2026';

interface JwtPayload {
  userId: string;
  role: string;
  email: string;
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'No authorization token provided',
      });
      return;
    }

    const token = authHeader.split('Bearer ')[1];

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired session token',
      });
      return;
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        student: true,
        teacher: true,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found. Please log in again.',
      });
      return;
    }

    // Check approval status
    if (user.status === 'PENDING') {
      res.status(403).json({
        success: false,
        message: 'Your account is pending admin approval.',
        code: 'PENDING_APPROVAL',
      });
      return;
    }

    if (user.status === 'REJECTED') {
      res.status(403).json({
        success: false,
        message: 'Your account has been rejected. Contact admin for support.',
        code: 'ACCOUNT_REJECTED',
      });
      return;
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Authentication failed',
    });
  }
}

export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { student: true, teacher: true },
      });
      if (user && user.status === 'APPROVED') {
        req.user = user;
      }
    }

    next();
  } catch {
    next();
  }
}

export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions to access this resource',
      });
      return;
    }

    next();
  };
}
