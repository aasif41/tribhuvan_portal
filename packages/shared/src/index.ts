// Types
export { Role, ApprovalStatus } from './types/user.types';
export type { User, Student, Teacher, UserWithProfile } from './types/user.types';

export { AttendanceStatus } from './types/attendance.types';
export type {
  AttendanceRecord,
  AttendanceSummary,
  MarkAttendancePayload,
  AttendanceReport,
} from './types/attendance.types';

export { DAYS_OF_WEEK } from './types/timetable.types';
export type {
  Subject,
  TimetableSlot,
  DaySchedule,
  WeekSchedule,
  DayOfWeek,
} from './types/timetable.types';

export { ANNOUNCEMENT_CATEGORIES } from './types/announcement.types';
export type {
  Announcement,
  AnnouncementCategory,
  CreateAnnouncementPayload,
  AnnouncementListResponse,
} from './types/announcement.types';

// Constants
export { BRAND_COLORS, STATUS_COLORS } from './constants/colors';
export type { BrandColor } from './constants/colors';

export { COLLEGE } from './constants/college';

export { PROGRAMS, UNIVERSITIES, PROGRAM_NAMES, PROGRAM_CODES } from './constants/programs';
export type { ProgramInfo } from './constants/programs';

// Validators
export {
  registerSchema,
  loginSchema,
  verifyTokenSchema,
  studentSignupSchema,
  studentLoginSchema,
  teacherSignupSchema,
  teacherLoginSchema,
  adminLoginSchema,
} from './validators/auth.schema';
export type {
  RegisterInput,
  LoginInput,
  VerifyTokenInput,
  StudentSignupInput,
  StudentLoginInput,
  TeacherSignupInput,
  TeacherLoginInput,
  AdminLoginInput,
} from './validators/auth.schema';

export { markAttendanceSchema, attendanceQuerySchema } from './validators/attendance.schema';
export type {
  MarkAttendanceInput,
  AttendanceQueryInput,
} from './validators/attendance.schema';
