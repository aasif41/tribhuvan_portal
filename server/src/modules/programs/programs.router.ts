import { Router } from 'express';
import * as programsController from './programs.controller';
import { authMiddleware, requireRole } from '../../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Public / Authenticated route to list programs
router.get('/', programsController.getPrograms);

// Admin-only management routes
router.post('/', authMiddleware, requireRole([Role.ADMIN]), programsController.createProgram);
router.put('/:id', authMiddleware, requireRole([Role.ADMIN]), programsController.updateProgram);
router.delete('/:id', authMiddleware, requireRole([Role.ADMIN]), programsController.deleteProgram);

export default router;
