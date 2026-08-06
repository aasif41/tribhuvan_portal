import prisma from '../../config/database';
import { AttendanceStatus } from '@prisma/client';
import { markAttendanceSchema } from '@tribhuvan/shared';
import { emitAttendanceUpdate } from '../../config/socket';

interface MarkAttendancePayload {
  subjectId: string;
  date: string;
  records: Array<{
    studentId: string;
    status: string;
  }>;
}

export async function markAttendance(payload: MarkAttendancePayload, teacherId: string) {
  const validated = markAttendanceSchema.parse(payload);
  const date = new Date(validated.date);

  // Verify teacher is assigned to this subject
  const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });
  if (!teacher) throw new Error('Teacher not found');

  const subject = await prisma.subject.findUnique({
    where: { id: validated.subjectId },
  });
  if (!subject || subject.teacherId !== teacherId) {
    throw new Error('You are not assigned to this subject');
  }

  // Upsert attendance records
  const results = await Promise.all(
    validated.records.map(async (record) => {
      if (record.status === 'EMPTY') {
        try {
          await prisma.attendance.delete({
            where: {
              date_studentId_subjectId: {
                date,
                studentId: record.studentId,
                subjectId: validated.subjectId,
              },
            },
          });
        } catch (e) {
          // ignore if record doesn't exist to delete
        }
        return {
          studentId: record.studentId,
          status: 'EMPTY',
        };
      }
      
      return prisma.attendance.upsert({
        where: {
          date_studentId_subjectId: {
            date,
            studentId: record.studentId,
            subjectId: validated.subjectId,
          },
        },
        update: {
          status: record.status as AttendanceStatus,
          markedBy: teacherId,
        },
        create: {
          date,
          status: record.status as AttendanceStatus,
          studentId: record.studentId,
          subjectId: validated.subjectId,
          markedBy: teacherId,
        },
        include: {
          student: { include: { user: true } },
        },
      });
    })
  );

  // Emit real-time update
  emitAttendanceUpdate(validated.subjectId, {
    subjectId: validated.subjectId,
    date: validated.date,
    records: results,
    markedBy: teacherId,
  });

  return results;
}

export async function getAttendanceBySubject(subjectId: string) {
  const records = await prisma.attendance.findMany({
    where: { subjectId },
    include: {
      student: { include: { user: true } },
      subject: true,
    },
    orderBy: [{ date: 'desc' }, { student: { user: { name: 'asc' } } }],
  });

  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });

  const totalStudents = await prisma.enrollment.count({ where: { subjectId } });
  const uniqueDates = [...new Set(records.map((r) => r.date.toISOString().split('T')[0]))];
  const totalClasses = uniqueDates.length;
  const totalPresent = records.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length;
  const averageAttendance =
    totalClasses > 0 && totalStudents > 0
      ? Math.round((totalPresent / (totalClasses * totalStudents)) * 100)
      : 0;

  return {
    subject: subject
      ? { id: subject.id, code: subject.code, name: subject.name }
      : null,
    records,
    summary: {
      totalClasses,
      totalStudents,
      averageAttendance,
    },
  };
}
