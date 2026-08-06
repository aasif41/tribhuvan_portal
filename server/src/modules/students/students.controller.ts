import { Request, Response, NextFunction } from 'express';
import { getStudentProfile, getStudentAttendance, getStudentTimetable } from './students.service';
import { successResponse, errorResponse } from '../../utils/apiResponse';

export async function profile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      errorResponse(res, 401, 'Not authenticated');
      return;
    }
    const studentProfile = await getStudentProfile(req.user.id);
    if (!studentProfile) {
      errorResponse(res, 404, 'Student profile not found');
      return;
    }
    successResponse(res, studentProfile, 'Student profile retrieved');
  } catch (error) {
    next(error);
  }
}

export async function attendance(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      errorResponse(res, 401, 'Not authenticated');
      return;
    }
    const attendanceData = await getStudentAttendance(req.user.id);
    successResponse(res, attendanceData, 'Attendance retrieved');
  } catch (error) {
    next(error);
  }
}

export async function timetable(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      errorResponse(res, 401, 'Not authenticated');
      return;
    }
    const timetableData = await getStudentTimetable(req.user.id);
    successResponse(res, timetableData, 'Timetable retrieved');
  } catch (error) {
    next(error);
  }
}
