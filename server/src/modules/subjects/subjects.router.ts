import { Router } from 'express';
import { index, create, update, destroy } from './subjects.controller';
import { authMiddleware, requireRole } from '../../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, requireRole(['ADMIN']), index);
router.post('/', authMiddleware, requireRole(['ADMIN']), create);
router.put('/:id', authMiddleware, requireRole(['ADMIN']), update);
router.delete('/:id', authMiddleware, requireRole(['ADMIN']), destroy);

export default router;
