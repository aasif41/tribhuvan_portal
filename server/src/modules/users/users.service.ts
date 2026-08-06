import prisma from '../../config/database';
import { ApprovalStatus, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { sendApprovalEmail, sendRejectionEmail } from '../../utils/sendEmail';
import { syncStudentEnrollments } from '../../utils/enrollmentSync';
import { logAuditEvent } from '../audit/audit.service';

export async function getPendingUsers() {
  return prisma.user.findMany({
    where: { status: ApprovalStatus.PENDING },
    include: { student: true, teacher: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function approveUser(userId: string) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { status: ApprovalStatus.APPROVED },
    include: { student: true, teacher: true },
  });

  await sendApprovalEmail(user.name, user.email);
  if (user.student) {
    await syncStudentEnrollments(user.student.id);
  }

  await logAuditEvent({
    action: 'USER_APPROVED',
    category: 'USER_MANAGEMENT',
    performedBy: 'Admin',
    role: 'ADMIN',
    details: `Approved registration for ${user.name} (${user.role})`,
  });

  return user;
}

export async function rejectUser(userId: string) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { status: ApprovalStatus.REJECTED },
    include: { student: true, teacher: true },
  });

  await sendRejectionEmail(user.name, user.email);

  await logAuditEvent({
    action: 'USER_REJECTED',
    category: 'USER_MANAGEMENT',
    performedBy: 'Admin',
    role: 'ADMIN',
    details: `Rejected registration for ${user.name} (${user.role})`,
  });

  return user;
}

export async function getDashboardStats() {
  const [
    totalStudents,
    totalTeachers,
    pendingApprovals,
    totalSubjects,
    totalAnnouncements,
    recentRegistrations,
  ] = await Promise.all([
    prisma.user.count({ where: { role: Role.STUDENT, status: ApprovalStatus.APPROVED } }),
    prisma.user.count({ where: { role: Role.TEACHER, status: ApprovalStatus.APPROVED } }),
    prisma.user.count({ where: { status: ApprovalStatus.PENDING } }),
    prisma.subject.count(),
    prisma.announcement.count(),
    prisma.user.findMany({
      where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
    }),
  ]);

  return {
    totalStudents,
    totalTeachers,
    pendingApprovals,
    totalSubjects,
    totalAnnouncements,
    recentRegistrations,
  };
}

export async function getStudents() {
  return prisma.user.findMany({
    where: { role: Role.STUDENT },
    include: { student: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getTeachers() {
  return prisma.user.findMany({
    where: { role: Role.TEACHER },
    include: { teacher: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function deleteUser(userId: string) {
  return prisma.$transaction(async (tx) => {
    const student = await tx.student.findUnique({ where: { userId } });
    if (student) {
      await tx.enrollment.deleteMany({ where: { studentId: student.id } });
      await tx.attendance.deleteMany({ where: { studentId: student.id } });
      await tx.student.delete({ where: { id: student.id } });
    }

    const teacher = await tx.teacher.findUnique({ where: { userId } });
    if (teacher) {
      await tx.timetableSlot.updateMany({ where: { teacherId: teacher.id }, data: { teacherId: null } });
      await tx.attendance.deleteMany({ where: { markedBy: teacher.id } });
      await tx.subject.updateMany({ where: { teacherId: teacher.id }, data: { teacherId: null } });
      await tx.teacher.delete({ where: { id: teacher.id } });
    }

    return tx.user.delete({ where: { id: userId } });
  });
}

export async function updateUserProfile(userId: string, role: Role, data: any) {
  const result = await prisma.$transaction(async (tx) => {
    // 1. Update base user fields
    const userUpdateData: any = {};
    if (data.name) userUpdateData.name = data.name;
    
    if (data.phone !== undefined) {
      userUpdateData.phone = data.phone === '' ? null : data.phone;
    }
    
    if (data.profilePhoto !== undefined) userUpdateData.profilePhoto = data.profilePhoto;

    let updatedUser = await tx.user.update({
      where: { id: userId },
      data: userUpdateData,
    });

    // 2. Update role-specific fields
    if (role === Role.STUDENT && data.student) {
      const studentData: any = {};
      if (data.student.program) studentData.program = data.student.program;
      if (data.student.year) studentData.year = Number(data.student.year);
      if (data.student.semester) studentData.semester = Number(data.student.semester);
      if (data.student.section !== undefined) studentData.section = data.student.section;
      if (data.student.hostel !== undefined) studentData.hostel = data.student.hostel;
      
      await tx.student.update({
        where: { userId },
        data: studentData,
      });
    }

    if (role === Role.TEACHER && data.teacher) {
      const teacherData: any = {};
      if (data.teacher.department) teacherData.department = data.teacher.department;
      if (data.teacher.designation !== undefined) teacherData.designation = data.teacher.designation;

      await tx.teacher.update({
        where: { userId },
        data: teacherData,
      });
    }

    // Return the fresh user with relations
    const freshUser = await tx.user.findUnique({
      where: { id: userId },
      include: { student: true, teacher: true }
    });

    return freshUser;
  });
  
  if (role === Role.STUDENT && result?.student) {
    await syncStudentEnrollments(result.student.id);
  }

  await logAuditEvent({
    action: 'PROFILE_UPDATED',
    category: 'USER_MANAGEMENT',
    performedBy: result?.name || 'User',
    role: role,
    details: `Profile information updated for ${result?.name} (${result?.email})`,
  });
  
  return result;
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Verify current password
  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) {
    throw new Error('Current password is incorrect');
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password in DB
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  await logAuditEvent({
    action: 'PASSWORD_CHANGED',
    category: 'SECURITY',
    performedBy: user.name,
    role: user.role,
    details: `Password changed successfully for account ${user.email}`,
  });

  return { success: true, message: 'Password changed successfully' };
}

