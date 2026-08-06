import prisma from '../../config/database';

export async function getStudentProfile(userId: string) {
  return prisma.student.findUnique({
    where: { userId },
    include: {
      user: true,
      enrollments: {
        include: {
          subject: {
            include: { teacher: { include: { user: true } } },
          },
        },
      },
    },
  });
}

export async function getStudentAttendance(userId: string) {
  const student = await prisma.student.findUnique({ where: { userId } });
  if (!student) throw new Error('Student not found');

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: student.id },
    include: { subject: true },
  });

  const attendanceSummaries = await Promise.all(
    enrollments.map(async (enrollment) => {
      const records = await prisma.attendance.findMany({
        where: {
          studentId: student.id,
          subjectId: enrollment.subjectId,
        },
        include: {
          teacher: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { date: 'desc' },
      });

      const total = records.length;
      const present = records.filter((r) => r.status === 'PRESENT').length;
      const absent = records.filter((r) => r.status === 'ABSENT').length;
      const late = records.filter((r) => r.status === 'LATE').length;

      return {
        subjectId: enrollment.subject.id,
        subjectName: enrollment.subject.name,
        subjectCode: enrollment.subject.code,
        totalClasses: total,
        present,
        absent,
        late,
        percentage: total > 0 ? Math.round(((present + late) / total) * 100) : 0,
        records,
      };
    })
  );

  return attendanceSummaries;
}

export async function getStudentTimetable(userId: string) {
  const student = await prisma.student.findUnique({ where: { userId } });
  if (!student) throw new Error('Student not found');

  return prisma.timetableSlot.findMany({
    where: {
      program: student.program,
      semester: student.semester,
      ...(student.section ? { section: student.section } : {}),
    },
    include: {
      subject: true,
      teacher: { include: { user: true } },
    },
    orderBy: [{ day: 'asc' }, { startTime: 'asc' }],
  });
}
