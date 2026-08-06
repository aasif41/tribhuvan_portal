import { Request, Response, NextFunction } from 'express';
import {
  studentSignup,
  studentLogin,
  teacherSignup,
  teacherLogin,
  adminLogin,
  sanitizeUser,
} from './auth.service';
import {
  studentSignupSchema,
  studentLoginSchema,
  teacherSignupSchema,
  teacherLoginSchema,
  adminLoginSchema,
} from '@tribhuvan/shared';
import { successResponse, createdResponse, errorResponse } from '../../utils/apiResponse';

export async function handleStudentSignup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validated = studentSignupSchema.parse(req.body);
    const result = await studentSignup(validated);
    createdResponse(res, result, 'Student registered successfully');
  } catch (error: any) {
    if (error.name === 'ZodError') {
      const issue = error.errors[0]?.message || 'Validation error';
      errorResponse(res, 400, issue);
      return;
    }
    if (error.message && (error.message.includes('already registered') || error.message.includes('Unique constraint'))) {
      errorResponse(res, 409, error.message);
      return;
    }
    next(error);
  }
}

export async function handleStudentLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validated = studentLoginSchema.parse(req.body);
    const result = await studentLogin(validated);
    successResponse(res, result, 'Student login successful');
  } catch (error: any) {
    if (error.name === 'ZodError') {
      const issue = error.errors[0]?.message || 'Validation error';
      errorResponse(res, 400, issue);
      return;
    }
    if (error.message === 'Invalid enrollment number or password') {
      errorResponse(res, 401, error.message);
      return;
    }
    next(error);
  }
}

export async function handleTeacherSignup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validated = teacherSignupSchema.parse(req.body);
    const result = await teacherSignup(validated);
    createdResponse(res, result, result.message);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      const issue = error.errors[0]?.message || 'Validation error';
      errorResponse(res, 400, issue);
      return;
    }
    if (error.message && (error.message.includes('already registered') || error.message.includes('Unique constraint'))) {
      errorResponse(res, 409, error.message);
      return;
    }
    next(error);
  }
}

export async function handleTeacherLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validated = teacherLoginSchema.parse(req.body);
    const result = await teacherLogin(validated);
    successResponse(res, result, 'Teacher login successful');
  } catch (error: any) {
    if (error.name === 'ZodError') {
      const issue = error.errors[0]?.message || 'Validation error';
      errorResponse(res, 400, issue);
      return;
    }
    if (error.code === 'PENDING_APPROVAL' || error.code === 'ACCOUNT_REJECTED') {
      res.status(403).json({
        success: false,
        message: error.message,
        code: error.code,
      });
      return;
    }
    if (error.message === 'Invalid email or password') {
      errorResponse(res, 401, error.message);
      return;
    }
    next(error);
  }
}

export async function handleAdminLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validated = adminLoginSchema.parse(req.body);
    const result = await adminLogin(validated);
    successResponse(res, result, 'Admin login successful');
  } catch (error: any) {
    if (error.name === 'ZodError') {
      const issue = error.errors[0]?.message || 'Validation error';
      errorResponse(res, 400, issue);
      return;
    }
    if (error.message === 'Invalid email/username or password') {
      errorResponse(res, 401, error.message);
      return;
    }
    next(error);
  }
}

export async function handleMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      errorResponse(res, 401, 'Not authenticated');
      return;
    }
    successResponse(res, sanitizeUser(req.user), 'Current user profile');
  } catch (error) {
    next(error);
  }
}
