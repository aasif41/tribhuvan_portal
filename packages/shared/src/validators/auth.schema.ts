import { z } from 'zod';

export const studentSignupSchema = z
  .object({
    name: z.string().min(2, 'Full name must be at least 2 characters').max(100),
    rollNo: z.string().optional(),
    program: z.string().min(1, 'Program is required'),
    year: z.coerce.number().min(1, 'Year must be between 1 and 4').max(4),
    semester: z.coerce.number().min(1, 'Semester must be between 1 and 8').max(8),
    section: z.string().optional(),
    dateOfBirth: z.string().optional(),
    hostel: z.string().optional(),
    email: z.string().email('Invalid email address'),
    enrollmentNumber: z.string().min(1, 'Enrollment number is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type StudentSignupInput = z.infer<typeof studentSignupSchema>;

export const studentLoginSchema = z.object({
  enrollmentNumber: z.string().min(1, 'Enrollment number is required'),
  password: z.string().min(1, 'Password is required'),
});

export type StudentLoginInput = z.infer<typeof studentLoginSchema>;

export const teacherSignupSchema = z
  .object({
    name: z.string().min(2, 'Full name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address'),
    employeeId: z.string().min(1, 'Employee ID is required'),
    department: z.string().min(1, 'Department is required'),
    designation: z.string().optional(),
    phone: z.string().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type TeacherSignupInput = z.infer<typeof teacherSignupSchema>;

export const teacherLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type TeacherLoginInput = z.infer<typeof teacherLoginSchema>;

export const adminLoginSchema = z.object({
  email: z.string().min(1, 'Email / Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

// Deprecated Firebase schemas kept for backwards compatibility if needed
export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(['STUDENT', 'TEACHER', 'ADMIN']),
  phone: z.string().optional(),
  rollNo: z.string().optional(),
  program: z.string().optional(),
  year: z.coerce.number().optional(),
  semester: z.coerce.number().optional(),
  section: z.string().optional(),
  dateOfBirth: z.string().optional(),
  hostel: z.string().optional(),
  employeeId: z.string().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  idToken: z.string().optional(),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const verifyTokenSchema = z.object({
  token: z.string().optional(),
});
export type VerifyTokenInput = z.infer<typeof verifyTokenSchema>;
