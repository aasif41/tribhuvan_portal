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

const router = Router();

// Student routes
router.post('/student/signup', handleStudentSignup);
router.post('/student/login', handleStudentLogin);

// Teacher routes
router.post('/teacher/signup', handleTeacherSignup);
router.post('/teacher/login', handleTeacherLogin);

// Admin route
router.post('/admin/login', handleAdminLogin);

// Authenticated current user profile
router.get('/me', authMiddleware, handleMe);

export default router;
