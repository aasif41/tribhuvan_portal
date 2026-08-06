import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';

export function checkRole(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
      });
      return;
    }

    next();
  };
}

export const isAdmin = checkRole(Role.ADMIN);
export const isTeacher = checkRole(Role.TEACHER);
export const isStudent = checkRole(Role.STUDENT);
export const isAdminOrTeacher = checkRole(Role.ADMIN, Role.TEACHER);
