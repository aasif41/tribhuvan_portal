import prisma from '../../config/database';

export async function getTeacherProfile(userId: string) {
  return prisma.teacher.findUnique({
    where: { userId },
    include: {
      user: true,
      subjects: true,
    },
  });
}

export async function getTeacherClasses(userId: string) {
  const teacher = await prisma.teacher.findUnique({ where: { userId } });
  if (!teacher) throw new Error('Teacher not found');

  const subjects = await prisma.subject.findMany({
    where: { teacherId: teacher.id },
    include: {
      enrollments: {
        include: {
          student: { include: { user: true } },
        },
      },
    },
  });

  const timetable = await prisma.timetableSlot.findMany({
    where: { teacherId: teacher.id },
    include: { subject: true },
    orderBy: [{ day: 'asc' }, { startTime: 'asc' }],
  });

  return { subjects, timetable };
}
