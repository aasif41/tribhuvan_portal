import { Router } from 'express';
import { getAuditLogsController, exportAuditCSVController } from './audit.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { isAdmin } from '../../middleware/role.middleware';

const router = Router();

// Restricted to ADMIN only
router.get('/', authMiddleware, isAdmin, getAuditLogsController);
router.get('/export', authMiddleware, isAdmin, exportAuditCSVController);

export default router;
