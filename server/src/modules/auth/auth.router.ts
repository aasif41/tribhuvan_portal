import { Router } from 'express';
import {
  handleStudentSignup,
  handleStudentLogin,
  handleTeacherSignup,
  handleTeacherLogin,
  handleAdminLogin,
  handleMe,
} from './auth.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { authRateLimiter } from '../../middleware/rateLimit.middleware';

const router = Router();

// Student routes
router.post('/student/signup', authRateLimiter, handleStudentSignup);
router.post('/student/login', authRateLimiter, handleStudentLogin);

// Teacher routes
router.post('/teacher/signup', authRateLimiter, handleTeacherSignup);
router.post('/teacher/login', authRateLimiter, handleTeacherLogin);

// Admin route
router.post('/admin/login', authRateLimiter, handleAdminLogin);

// Authenticated current user profile
router.get('/me', authMiddleware, handleMe);

export default router;
