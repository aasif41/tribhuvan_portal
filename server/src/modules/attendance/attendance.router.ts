import { Router } from 'express';
import { mark, getBySubject } from './attendance.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { isTeacher, isAdminOrTeacher } from '../../middleware/role.middleware';

const router = Router();

router.post('/mark', authMiddleware, isTeacher, mark);
router.get('/:subjectId', authMiddleware, isAdminOrTeacher, getBySubject);

export default router;
