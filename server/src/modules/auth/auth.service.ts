import prisma from '../../config/database';
import { Role, ApprovalStatus, User, Student, Teacher } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendApprovalNotification } from '../../utils/sendEmail';
import { logAuditEvent } from '../audit/audit.service';
import {
  StudentSignupInput,
  StudentLoginInput,
  TeacherSignupInput,
  TeacherLoginInput,
  AdminLoginInput,
} from '@tribhuvan/shared';

const JWT_SECRET = process.env.JWT_SECRET || 'tribhuvan-jwt-secret-key-2026';
const JWT_EXPIRES_IN = '7d';

export type UserWithRelations = User & { student: Student | null; teacher: Teacher | null };

export function generateToken(user: User): string {
  return jwt.sign(
    { userId: user.id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function sanitizeUser(user: UserWithRelations) {
  const { password, firebaseUid, ...sanitized } = user;
  return sanitized;
}

export async function studentSignup(input: StudentSignupInput) {
  // Check unique constraints
  const effectiveRollNo = input.rollNo || input.enrollmentNumber;

  const existingEnrollment = await prisma.student.findUnique({
    where: { enrollmentNumber: input.enrollmentNumber },
  });
  if (existingEnrollment) {
    throw new Error('Enrollment number is already registered');
  }

  const existingRollNo = await prisma.student.findUnique({
    where: { rollNo: effectiveRollNo },
  });
  if (existingRollNo) {
    throw new Error('Roll number or Enrollment number is already registered');
  }

  const existingEmail = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existingEmail) {
    throw new Error('Email address is already registered');
  }

  const hashedPassword = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      password: hashedPassword,
      role: Role.STUDENT,
      status: ApprovalStatus.APPROVED,
      student: {
        create: {
          rollNo: effectiveRollNo,
          enrollmentNumber: input.enrollmentNumber,
          program: input.program,
          year: Number(input.year),
          semester: Number(input.semester),
          section: input.section || null,
          dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
          hostel: input.hostel || null,
        },
      },
    },
    include: { student: true, teacher: true },
  });

  await logAuditEvent({
    action: 'STUDENT_REGISTERED',
    category: 'AUTH',
    performedBy: user.name,
    role: 'STUDENT',
    details: `Student account registered for ${user.name} (${user.student?.program || 'N/A'})`,
  });

  const token = generateToken(user);
  return { user: sanitizeUser(user), token };
}

export async function studentLogin(input: StudentLoginInput) {
  const studentRecord = await prisma.student.findUnique({
    where: { enrollmentNumber: input.enrollmentNumber },
    include: { user: { include: { student: true, teacher: true } } },
  });

  if (!studentRecord || !studentRecord.user || studentRecord.user.role !== Role.STUDENT) {
    throw new Error('Invalid enrollment number or password');
  }

  const isPasswordValid = await bcrypt.compare(input.password, studentRecord.user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid enrollment number or password');
  }

  await logAuditEvent({
    action: 'STUDENT_LOGIN',
    category: 'AUTH',
    performedBy: studentRecord.user.name,
    role: 'STUDENT',
    details: `Student logged in successfully (${studentRecord.enrollmentNumber})`,
  });

  const token = generateToken(studentRecord.user);
  return { user: sanitizeUser(studentRecord.user), token };
}

export async function teacherSignup(input: TeacherSignupInput) {
  const existingEmail = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existingEmail) {
    throw new Error('College Gmail is already registered');
  }

  const existingEmpId = await prisma.teacher.findUnique({
    where: { employeeId: input.employeeId },
  });
  if (existingEmpId) {
    throw new Error('Employee ID is already registered');
  }

  const hashedPassword = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      password: hashedPassword,
      phone: input.phone || null,
      role: Role.TEACHER,
      status: ApprovalStatus.PENDING,
      teacher: {
        create: {
          employeeId: input.employeeId,
          department: input.department,
          designation: input.designation || null,
        },
      },
    },
    include: { student: true, teacher: true },
  });

  await sendApprovalNotification(user.name, user.email).catch(() => {});

  await logAuditEvent({
    action: 'TEACHER_REGISTERED',
    category: 'AUTH',
    performedBy: user.name,
    role: 'TEACHER',
    details: `Faculty member registered: ${user.name} (${input.department}) - Pending Approval`,
  });

  return {
    message: 'Account created successfully. Your account is pending admin approval.',
    status: ApprovalStatus.PENDING,
  };
}

export async function teacherLogin(input: TeacherLoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: { student: true, teacher: true },
  });

  if (!user || user.role !== Role.TEACHER) {
    throw new Error('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  if (user.status === ApprovalStatus.PENDING) {
    const error: any = new Error('Your account is pending admin approval.');
    error.statusCode = 403;
    error.code = 'PENDING_APPROVAL';
    throw error;
  }

  if (user.status === ApprovalStatus.REJECTED) {
    const error: any = new Error('Your account has been rejected. Contact admin for support.');
    error.statusCode = 403;
    error.code = 'ACCOUNT_REJECTED';
    throw error;
  }

  await logAuditEvent({
    action: 'TEACHER_LOGIN',
    category: 'AUTH',
    performedBy: user.name,
    role: 'TEACHER',
    details: `Faculty member logged in successfully (${user.email})`,
  });

  const token = generateToken(user);
  return { user: sanitizeUser(user), token };
}

export async function adminLogin(input: AdminLoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: { student: true, teacher: true },
  });

  if (!user || user.role !== Role.ADMIN) {
    throw new Error('Invalid email/username or password');
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid email/username or password');
  }

  await logAuditEvent({
    action: 'ADMIN_LOGIN',
    category: 'AUTH',
    performedBy: user.name,
    role: 'ADMIN',
    details: `Administrator logged into Portal (${user.email})`,
  });

  const token = generateToken(user);
  return { user: sanitizeUser(user), token };
}

export async function getUserById(userId: string): Promise<UserWithRelations | null> {
  return prisma.user.findUnique({
    where: { id: userId },
    include: { student: true, teacher: true },
  });
}

