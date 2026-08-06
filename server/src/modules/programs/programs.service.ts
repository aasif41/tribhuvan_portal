import prisma from '../../config/database';
import { PROGRAMS as DEFAULT_PROGRAMS } from '@tribhuvan/shared';
import { logAuditEvent } from '../audit/audit.service';

export async function getAllPrograms() {
  let programs = await prisma.program.findMany({
    orderBy: { name: 'asc' },
  });

  // If table is empty, seed default programs automatically
  if (programs.length === 0) {
    await prisma.program.createMany({
      data: DEFAULT_PROGRAMS.map((p) => ({
        code: p.code,
        name: p.name,
        university: p.university,
        duration: p.duration,
        semesters: p.semesters,
      })),
      skipDuplicates: true,
    });
    programs = await prisma.program.findMany({
      orderBy: { name: 'asc' },
    });
  }

  return programs;
}

export async function createProgram(data: {
  code: string;
  name: string;
  university?: string;
  duration?: number;
  semesters?: number;
}) {
  const program = await prisma.program.create({
    data: {
      code: data.code.trim().toUpperCase(),
      name: data.name.trim(),
      university: data.university?.trim() || 'Nalanda University',
      duration: Number(data.duration) || 3,
      semesters: Number(data.semesters) || 6,
    },
  });

  await logAuditEvent({
    action: 'PROGRAM_CREATED',
    category: 'ACADEMICS',
    performedBy: 'Admin',
    role: 'ADMIN',
    details: `Created new academic program: ${program.name} (${program.code})`,
  });

  return program;
}

export async function updateProgram(
  id: string,
  data: {
    code?: string;
    name?: string;
    university?: string;
    duration?: number;
    semesters?: number;
  }
) {
  const program = await prisma.program.update({
    where: { id },
    data: {
      ...(data.code && { code: data.code.trim().toUpperCase() }),
      ...(data.name && { name: data.name.trim() }),
      ...(data.university && { university: data.university.trim() }),
      ...(data.duration !== undefined && { duration: Number(data.duration) }),
      ...(data.semesters !== undefined && { semesters: Number(data.semesters) }),
    },
  });

  await logAuditEvent({
    action: 'PROGRAM_UPDATED',
    category: 'ACADEMICS',
    performedBy: 'Admin',
    role: 'ADMIN',
    details: `Updated academic program details for ${program.name} (${program.code})`,
  });

  return program;
}

export async function deleteProgram(id: string) {
  const program = await prisma.program.delete({
    where: { id },
  });

  await logAuditEvent({
    action: 'PROGRAM_DELETED',
    category: 'ACADEMICS',
    performedBy: 'Admin',
    role: 'ADMIN',
    details: `Deleted academic program: ${program.name} (${program.code})`,
  });

  return program;
}
