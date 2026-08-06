import prisma from '../../config/database';

interface TimetableQuery {
  program?: string;
  semester?: number;
  section?: string;
  teacherId?: string;
}

export async function getTimetable(query: TimetableQuery) {
  const where: Record<string, unknown> = {};

  if (query.program) where.program = query.program;
  if (query.semester) where.semester = Number(query.semester);
  if (query.section) where.section = query.section;
  if (query.teacherId) where.teacherId = query.teacherId;

  return prisma.timetableSlot.findMany({
    where,
    include: {
      subject: {
        include: {
          teacher: { include: { user: true } }
        }
      },
      teacher: { include: { user: true } },
    },
    orderBy: [{ day: 'asc' }, { startTime: 'asc' }],
  });
}

export async function getTimetableMetadata() {
  const subjects = await prisma.subject.findMany({
    include: { teacher: { include: { user: true } } }
  });
  const teachers = await prisma.teacher.findMany({
    include: { user: true }
  });
  return { subjects, teachers };
}

export async function bulkUpsertTimetable(program: string, semester: number, slots: any[]) {
  return prisma.$transaction(async (tx) => {
    // Delete existing slots for this program and semester
    await tx.timetableSlot.deleteMany({
      where: { program, semester }
    });

    // Insert new slots
    if (slots && slots.length > 0) {
      await tx.timetableSlot.createMany({
        data: slots.map(slot => ({
          day: slot.day,
          startTime: slot.startTime,
          endTime: slot.endTime,
          room: slot.room || '',
          subjectId: slot.subjectId,
          teacherId: slot.teacherId,
          program,
          semester,
          section: slot.section || null,
        }))
      });
    }

    return tx.timetableSlot.findMany({
      where: { program, semester },
      include: {
        subject: {
          include: {
            teacher: { include: { user: true } }
          }
        },
        teacher: { include: { user: true } },
      },
      orderBy: [{ day: 'asc' }, { startTime: 'asc' }],
    });
  });
}

const DEFAULT_TIME_SLOTS = [
  { id: 't1', start: '9:15', end: '10:05', label: '9:15 - 10:05' },
  { id: 't2', start: '10:10', end: '11:00', label: '10:10 - 11:00' },
  { id: 't3', start: '11:05', end: '11:55', label: '11:05 - 11:55' },
  { id: 't4', start: '12:00', end: '12:50', label: '12:00 - 12:50' },
  { id: 'lunch', start: '12:55', end: '1:35', label: 'LUNCH', isLunch: true },
  { id: 't5', start: '1:40', end: '2:30', label: '1:40 - 2:30' },
  { id: 't6', start: '2:35', end: '3:25', label: '2:35 - 3:25' },
  { id: 't7', start: '3:30', end: '4:20', label: '3:30 - 4:20' },
  { id: 't8', start: '4:25', end: '5:15', label: '4:25 - 5:15' },
];

export async function getTimetableSettings() {
  const setting = await prisma.setting.findUnique({
    where: { key: 'TIME_SLOTS' }
  });
  
  if (setting) {
    try {
      return JSON.parse(setting.value);
    } catch (e) {
      return DEFAULT_TIME_SLOTS;
    }
  }
  return DEFAULT_TIME_SLOTS;
}

export async function updateTimetableSettings(timeSlots: any[]) {
  const value = JSON.stringify(timeSlots);
  const setting = await prisma.setting.upsert({
    where: { key: 'TIME_SLOTS' },
    update: { value },
    create: { key: 'TIME_SLOTS', value }
  });
  return JSON.parse(setting.value);
}
