export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
}

export interface AttendanceRecord {
  id: string;
  date: string;
  status: AttendanceStatus;
  studentId: string;
  subjectId: string;
  markedBy: string;
  createdAt: string;
  teacher?: {
    user: {
      name: string;
    };
  };
}

export interface AttendanceSummary {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  totalClasses: number;
  present: number;
  absent: number;
  late: number;
  percentage: number;
  records?: AttendanceRecord[];
}

export interface MarkAttendancePayload {
  subjectId: string;
  date: string;
  records: Array<{
    studentId: string;
    status: AttendanceStatus;
  }>;
}

export interface AttendanceReport {
  subject: {
    id: string;
    code: string;
    name: string;
  };
  records: AttendanceRecord[];
  summary: {
    totalClasses: number;
    totalStudents: number;
    averageAttendance: number;
  };
}
