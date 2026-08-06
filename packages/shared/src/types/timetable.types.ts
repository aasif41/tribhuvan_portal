export interface Subject {
  id: string;
  code: string;
  name: string;
  program: string;
  semester: number;
  credits: number;
  teacherId: string | null;
}

export interface TimetableSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  room: string;
  subjectId: string;
  subject: Subject;
  teacherId: string;
  program: string;
  semester: number;
  section: string | null;
}

export interface DaySchedule {
  day: string;
  slots: TimetableSlot[];
}

export type WeekSchedule = DaySchedule[];

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];
