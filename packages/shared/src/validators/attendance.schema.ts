import { z } from 'zod';

export const markAttendanceSchema = z.object({
  subjectId: z.string().min(1, 'Subject ID is required'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  records: z
    .array(
      z.object({
        studentId: z.string().min(1, 'Student ID is required'),
        status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EMPTY'], {
          errorMap: () => ({ message: 'Status must be PRESENT, ABSENT, LATE, or EMPTY' }),
        }),
      })
    )
    .min(1, 'At least one attendance record is required'),
});

export type MarkAttendanceInput = z.infer<typeof markAttendanceSchema>;

export const attendanceQuerySchema = z.object({
  subjectId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  studentId: z.string().optional(),
});

export type AttendanceQueryInput = z.infer<typeof attendanceQuerySchema>;
