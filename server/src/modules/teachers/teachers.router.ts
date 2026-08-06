import { Router } from 'express';
import { profile, classes } from './teachers.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { isTeacher } from '../../middleware/role.middleware';

const router = Router();

router.get('/profile', authMiddleware, isTeacher, profile);
router.get('/classes', authMiddleware, isTeacher, classes);

export default router;
