import { Router } from 'express';
import { profile, attendance, timetable } from './students.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { isStudent } from '../../middleware/role.middleware';

const router = Router();

router.get('/profile', authMiddleware, isStudent, profile);
router.get('/attendance', authMiddleware, isStudent, attendance);
router.get('/timetable', authMiddleware, isStudent, timetable);

export default router;
