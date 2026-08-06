import { Router } from 'express';
import { pending, approve, reject, stats, getStudentsController, getTeachersController, destroyUserController, updateProfileController, changePasswordController } from './users.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { isAdmin } from '../../middleware/role.middleware';

const router = Router();

// Profile Routes (accessible to any authenticated user)
router.put('/profile', authMiddleware, updateProfileController);
router.put('/change-password', authMiddleware, changePasswordController);

router.get('/pending', authMiddleware, isAdmin, pending);
router.patch('/approve/:userId', authMiddleware, isAdmin, approve);
router.patch('/reject/:userId', authMiddleware, isAdmin, reject);
router.get('/stats', authMiddleware, isAdmin, stats);

// Student & Teacher Management Routes
router.get('/students', authMiddleware, isAdmin, getStudentsController);
router.get('/teachers', authMiddleware, isAdmin, getTeachersController);
router.delete('/students/:userId', authMiddleware, isAdmin, destroyUserController);
router.delete('/teachers/:userId', authMiddleware, isAdmin, destroyUserController);

export default router;
