import { Response } from 'express';

interface ApiResponseOptions<T> {
  res: Response;
  statusCode?: number;
  success?: boolean;
  message?: string;
  data?: T;
}

export function apiResponse<T>({
  res,
  statusCode = 200,
  success = true,
  message = 'Success',
  data,
}: ApiResponseOptions<T>): void {
  res.status(statusCode).json({
    success,
    message,
    data,
  });
}

export function successResponse<T>(res: Response, data: T, message = 'Success'): void {
  apiResponse({ res, statusCode: 200, success: true, message, data });
}

export function createdResponse<T>(res: Response, data: T, message = 'Created successfully'): void {
  apiResponse({ res, statusCode: 201, success: true, message, data });
}

export function noContentResponse(res: Response): void {
  res.status(204).send();
}

export function errorResponse(
  res: Response,
  statusCode: number,
  message: string,
  code?: string
): void {
  res.status(statusCode).json({
    success: false,
    message,
    code,
  });
}
