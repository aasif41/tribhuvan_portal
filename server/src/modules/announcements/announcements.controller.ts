import { Request, Response, NextFunction } from 'express';
import {
  listAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} from './announcements.service';
import { successResponse, createdResponse, errorResponse, noContentResponse } from '../../utils/apiResponse';

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await listAnnouncements(req.query as Record<string, unknown>);
    successResponse(res, result, 'Announcements retrieved');
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      errorResponse(res, 401, 'Not authenticated');
      return;
    }

    const { title, body, category } = req.body;
    if (!title || !body || !category) {
      errorResponse(res, 400, 'Title, body, and category are required');
      return;
    }

    const announcement = await createAnnouncement(
      { title, body, category },
      req.user.id,
      req.user.name,
      req.user.role
    );
    createdResponse(res, announcement, 'Announcement created');
  } catch (error) {
    next(error);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    if (!id) {
      errorResponse(res, 400, 'Announcement ID is required');
      return;
    }
    await deleteAnnouncement(id, req.user?.name, req.user?.role);
    noContentResponse(res);
  } catch (error) {
    next(error);
  }
}
