import { Request, Response, NextFunction } from 'express';
import { getPendingUsers, approveUser, rejectUser, getDashboardStats, getStudents, getTeachers, deleteUser, updateUserProfile, changePassword } from './users.service';
import { successResponse, errorResponse } from '../../utils/apiResponse';

export async function pending(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const users = await getPendingUsers();
    successResponse(res, users, 'Pending users retrieved');
  } catch (error) {
    next(error);
  }
}

export async function approve(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req.params;
    if (!userId) {
      errorResponse(res, 400, 'User ID is required');
      return;
    }
    const user = await approveUser(userId);
    successResponse(res, user, 'User approved successfully');
  } catch (error) {
    next(error);
  }
}

export async function reject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req.params;
    if (!userId) {
      errorResponse(res, 400, 'User ID is required');
      return;
    }
    const user = await rejectUser(userId);
    successResponse(res, user, 'User rejected');
  } catch (error) {
    next(error);
  }
}

export async function stats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dashboardStats = await getDashboardStats();
    successResponse(res, dashboardStats, 'Dashboard stats retrieved');
  } catch (error) {
    next(error);
  }
}

export async function getStudentsController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const students = await getStudents();
    successResponse(res, students, 'Students retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function getTeachersController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const teachers = await getTeachers();
    successResponse(res, teachers, 'Teachers retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function destroyUserController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req.params;
    await deleteUser(userId);
    successResponse(res, null, 'User deleted successfully');
  } catch (error) {
    next(error);
  }
}

export async function updateProfileController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    
    if (!userId || !role) {
      errorResponse(res, 401, 'Unauthorized');
      return;
    }

    // Call the service to update profile with the request body
    const updatedUser = await updateUserProfile(userId, role, req.body);
    successResponse(res, updatedUser, 'Profile updated successfully');
  } catch (error) {
    console.error('Update profile error:', error);
    next(error);
  }
}

export async function changePasswordController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!userId) {
      errorResponse(res, 401, 'Unauthorized');
      return;
    }

    if (!currentPassword || !newPassword) {
      errorResponse(res, 400, 'Current password and new password are required');
      return;
    }

    if (newPassword.length < 6) {
      errorResponse(res, 400, 'New password must be at least 6 characters');
      return;
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      errorResponse(res, 400, 'New passwords do not match');
      return;
    }

    const result = await changePassword(userId, currentPassword, newPassword);
    successResponse(res, null, result.message);
  } catch (error: any) {
    if (error.message === 'Current password is incorrect') {
      errorResponse(res, 400, error.message);
      return;
    }
    next(error);
  }
}

