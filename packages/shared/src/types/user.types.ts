export enum Role {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN',
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface User {
  id: string;
  firebaseUid?: string | null;
  email: string;
  name: string;
  role: Role;
  status: ApprovalStatus;
  profilePhoto: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  userId: string;
  user: User;
  rollNo: string;
  enrollmentNumber: string;
  program: string;
  year: number;
  semester: number;
  section: string | null;
  dateOfBirth: string | null;
  hostel: string | null;
}

export interface Teacher {
  id: string;
  userId: string;
  user: User;
  employeeId: string;
  department: string;
  designation: string | null;
}

export interface UserWithProfile extends User {
  student: Student | null;
  teacher: Teacher | null;
}
