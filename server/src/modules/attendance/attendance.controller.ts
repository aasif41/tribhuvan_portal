import { Request, Response, NextFunction } from 'express';
import { markAttendance, getAttendanceBySubject } from './attendance.service';
import { successResponse, errorResponse } from '../../utils/apiResponse';

export async function mark(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user || !req.user.teacher) {
      errorResponse(res, 403, 'Only teachers can mark attendance');
      return;
    }
    const results = await markAttendance(req.body, req.user.teacher.id);
    successResponse(res, results, 'Attendance marked successfully');
  } catch (error) {
    if (error instanceof Error && error.message.includes('not assigned')) {
      errorResponse(res, 403, error.message);
      return;
    }
    next(error);
  }
}

export async function getBySubject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { subjectId } = req.params;
    if (!subjectId) {
      errorResponse(res, 400, 'Subject ID is required');
      return;
    }
    const report = await getAttendanceBySubject(subjectId);
    successResponse(res, report, 'Attendance report retrieved');
  } catch (error) {
    next(error);
  }
}
