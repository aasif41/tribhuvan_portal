import { Request, Response, NextFunction } from 'express';
import { getTimetable, getTimetableMetadata, bulkUpsertTimetable, getTimetableSettings, updateTimetableSettings } from './timetable.service';
import { successResponse } from '../../utils/apiResponse';

export async function index(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { program, semester, section, teacherId } = req.query;
    const timetableData = await getTimetable({
      program: program as string | undefined,
      semester: semester ? Number(semester) : undefined,
      section: section as string | undefined,
      teacherId: teacherId as string | undefined,
    });
    successResponse(res, timetableData, 'Timetable retrieved');
  } catch (error) {
    next(error);
  }
}

export async function metadata(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await getTimetableMetadata();
    successResponse(res, data, 'Timetable metadata retrieved');
  } catch (error) {
    next(error);
  }
}

export async function bulkUpsert(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { program, semester, slots } = req.body;
    
    if (!program || !semester) {
      res.status(400).json({ success: false, message: 'Program and semester are required' });
      return;
    }

    const updatedTimetable = await bulkUpsertTimetable(program, Number(semester), slots || []);
    successResponse(res, updatedTimetable, 'Timetable successfully updated');
  } catch (error) {
    next(error);
  }
}

export async function getSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const settings = await getTimetableSettings();
    successResponse(res, settings, 'Timetable settings retrieved');
  } catch (error) {
    next(error);
  }
}

export async function updateSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { timeSlots } = req.body;
    if (!timeSlots || !Array.isArray(timeSlots)) {
      res.status(400).json({ success: false, message: 'Invalid timeSlots array' });
      return;
    }
    const updatedSettings = await updateTimetableSettings(timeSlots);
    successResponse(res, updatedSettings, 'Timetable settings updated');
  } catch (error) {
    next(error);
  }
}
