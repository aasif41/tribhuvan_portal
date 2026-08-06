import { Router } from 'express';
import { list, create, remove } from './announcements.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { isAdminOrTeacher } from '../../middleware/role.middleware';

const router = Router();

router.get('/', authMiddleware, list);
router.post('/', authMiddleware, isAdminOrTeacher, create);
router.delete('/:id', authMiddleware, isAdminOrTeacher, remove);

export default router;
