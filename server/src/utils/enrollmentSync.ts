import prisma from '../config/database';

/**
 * Sync enrollments for a specific student based on their program and semester.
 */
export async function syncStudentEnrollments(studentId: string) {
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) return;

  const subjects = await prisma.subject.findMany({
    where: {
      program: student.program,
      semester: student.semester,
    }
  });

  // Keep track of active subject IDs to delete old enrollments if semester changed
  const subjectIds = subjects.map(s => s.id);

  // Remove enrollments for subjects they shouldn't be in anymore
  await prisma.enrollment.deleteMany({
    where: {
      studentId: student.id,
      NOT: {
        subjectId: { in: subjectIds }
      }
    }
  });

  // Upsert current valid enrollments
  for (const subject of subjects) {
    await prisma.enrollment.upsert({
      where: {
        studentId_subjectId: {
          studentId: student.id,
          subjectId: subject.id,
        }
      },
      update: {},
      create: {
        studentId: student.id,
        subjectId: subject.id,
      }
    });
  }
}

/**
 * Sync enrollments for a specific subject based on program and semester.
 */
export async function syncSubjectEnrollments(subjectId: string) {
  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!subject) return;

  const students = await prisma.student.findMany({
    where: {
      program: subject.program,
      semester: subject.semester,
    }
  });

  const studentIds = students.map(s => s.id);

  // Remove enrollments for students who shouldn't be in it anymore
  await prisma.enrollment.deleteMany({
    where: {
      subjectId: subject.id,
      NOT: {
        studentId: { in: studentIds }
      }
    }
  });

  // Upsert current valid enrollments
  for (const student of students) {
    await prisma.enrollment.upsert({
      where: {
        studentId_subjectId: {
          studentId: student.id,
          subjectId: subject.id,
        }
      },
      update: {},
      create: {
        studentId: student.id,
        subjectId: subject.id,
      }
    });
  }
}

/**
 * Global sync of all enrollments
 */
export async function syncAllEnrollments() {
  const students = await prisma.student.findMany();
  for (const s of students) {
    await syncStudentEnrollments(s.id);
  }
}
