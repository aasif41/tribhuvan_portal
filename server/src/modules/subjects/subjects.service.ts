import prisma from '../../config/database';
import { Prisma } from '@prisma/client';
import { syncSubjectEnrollments } from '../../utils/enrollmentSync';

export async function getAllSubjects() {
  return prisma.subject.findMany({
    include: {
      teacher: {
        include: { user: true }
      }
    },
    orderBy: [{ program: 'asc' }, { semester: 'asc' }, { name: 'asc' }]
  });
}

export async function createSubject(data: {
  code: string;
  name: string;
  program: string;
  semester: number;
  credits: number;
  teacherId?: string;
}) {
  const subject = await prisma.subject.create({
    data
  });
  await syncSubjectEnrollments(subject.id);
  return subject;
}

export async function updateSubject(id: string, data: Partial<Prisma.SubjectUpdateInput>) {
  const subject = await prisma.subject.update({
    where: { id },
    data
  });
  await syncSubjectEnrollments(subject.id);
  return subject;
}

export async function deleteSubject(id: string) {
  return prisma.$transaction(async (tx) => {
    // Delete related records first to avoid foreign key constraint violations
    await tx.timetableSlot.deleteMany({ where: { subjectId: id } });
    await tx.enrollment.deleteMany({ where: { subjectId: id } });
    await tx.attendance.deleteMany({ where: { subjectId: id } });
    
    // Finally delete the subject
    return tx.subject.delete({
      where: { id }
    });
  });
}
