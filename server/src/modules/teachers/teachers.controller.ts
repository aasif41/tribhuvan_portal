import { Request, Response, NextFunction } from 'express';
import { getTeacherProfile, getTeacherClasses } from './teachers.service';
import { successResponse, errorResponse } from '../../utils/apiResponse';

export async function profile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      errorResponse(res, 401, 'Not authenticated');
      return;
    }
    const teacherProfile = await getTeacherProfile(req.user.id);
    if (!teacherProfile) {
      errorResponse(res, 404, 'Teacher profile not found');
      return;
    }
    successResponse(res, teacherProfile, 'Teacher profile retrieved');
  } catch (error) {
    next(error);
  }
}

export async function classes(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      errorResponse(res, 401, 'Not authenticated');
      return;
    }
    const classData = await getTeacherClasses(req.user.id);
    successResponse(res, classData, 'Teacher classes retrieved');
  } catch (error) {
    next(error);
  }
}
