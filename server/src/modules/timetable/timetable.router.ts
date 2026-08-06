import { Router } from 'express';
import { index, metadata, bulkUpsert, getSettings, updateSettings } from './timetable.controller';
import { authMiddleware, requireRole } from '../../middleware/auth.middleware';

const router = Router();

router.get('/settings', authMiddleware, getSettings);
router.put('/settings', authMiddleware, requireRole(['ADMIN']), updateSettings);

router.get('/metadata', authMiddleware, requireRole(['ADMIN']), metadata);
router.get('/', authMiddleware, index);
router.post('/bulk', authMiddleware, requireRole(['ADMIN']), bulkUpsert);

export default router;
