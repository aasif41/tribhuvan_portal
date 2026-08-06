import { Request, Response, NextFunction } from 'express';
import * as programsService from './programs.service';

export async function getPrograms(_req: Request, res: Response, next: NextFunction) {
  try {
    const programs = await programsService.getAllPrograms();
    res.json({
      success: true,
      data: programs,
    });
  } catch (error) {
    next(error);
  }
}

export async function createProgram(req: Request, res: Response, next: NextFunction) {
  try {
    const { code, name, university, duration, semesters } = req.body;

    if (!code || !name) {
      return res.status(400).json({
        success: false,
        message: 'Program code and name are required',
      });
    }

    const program = await programsService.createProgram({
      code,
      name,
      university,
      duration,
      semesters,
    });

    res.status(201).json({
      success: true,
      message: 'Program created successfully',
      data: program,
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'A program with this code already exists',
      });
    }
    next(error);
  }
}

export async function updateProgram(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { code, name, university, duration, semesters } = req.body;

    const program = await programsService.updateProgram(id, {
      code,
      name,
      university,
      duration,
      semesters,
    });

    res.json({
      success: true,
      message: 'Program updated successfully',
      data: program,
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'A program with this code already exists',
      });
    }
    next(error);
  }
}

export async function deleteProgram(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await programsService.deleteProgram(id);
    res.json({
      success: true,
      message: 'Program deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
