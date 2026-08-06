import { Request, Response, NextFunction } from 'express';
import { getAllSubjects, createSubject, updateSubject, deleteSubject } from './subjects.service';
import { successResponse, createdResponse } from '../../utils/apiResponse';

export async function index(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const subjects = await getAllSubjects();
    successResponse(res, subjects, 'Subjects retrieved');
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = req.body;
    const subject = await createSubject({
      code: data.code,
      name: data.name,
      program: data.program,
      semester: Number(data.semester),
      credits: Number(data.credits),
      teacherId: data.teacherId || null,
    });
    createdResponse(res, subject, 'Subject created successfully');
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ success: false, message: 'Subject with this code already exists' });
      return;
    }
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const data = req.body;
    const updateData: any = {};
    if (data.code) updateData.code = data.code;
    if (data.name) updateData.name = data.name;
    if (data.program) updateData.program = data.program;
    if (data.semester !== undefined) updateData.semester = Number(data.semester);
    if (data.credits !== undefined) updateData.credits = Number(data.credits);
    if (data.teacherId !== undefined) updateData.teacherId = data.teacherId || null;

    const subject = await updateSubject(id, updateData);
    successResponse(res, subject, 'Subject updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function destroy(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await deleteSubject(id);
    successResponse(res, null, 'Subject deleted successfully');
  } catch (error) {
    next(error);
  }
}
