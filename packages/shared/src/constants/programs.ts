export interface ProgramInfo {
  name: string;
  code: string;
  university: string;
  duration: number;
  semesters: number;
}

export const UNIVERSITIES = {
  NALANDA: 'Nalanda University',
  GGSIP: 'GGSIP University / IP University',
} as const;

export const PROGRAMS: ProgramInfo[] = [
  {
    name: 'B.Sc (Hons.) Data Science',
    code: 'BSC-DS',
    university: UNIVERSITIES.NALANDA,
    duration: 3,
    semesters: 6,
  },
  {
    name: 'B.Sc (Hons.) Computer Science',
    code: 'BSC-CS',
    university: UNIVERSITIES.NALANDA,
    duration: 3,
    semesters: 6,
  },
  {
    name: 'B.Sc (Hons.) Environmental Science',
    code: 'BSC-ENV',
    university: UNIVERSITIES.NALANDA,
    duration: 3,
    semesters: 6,
  },
  {
    name: 'BBA (Hons.)',
    code: 'BBA',
    university: UNIVERSITIES.NALANDA,
    duration: 3,
    semesters: 6,
  },
  {
    name: 'B.A. Sustainable Development',
    code: 'BA-SD',
    university: UNIVERSITIES.NALANDA,
    duration: 3,
    semesters: 6,
  },
  {
    name: 'B.Tech Computer Science & Engineering',
    code: 'BTECH-CSE',
    university: UNIVERSITIES.GGSIP,
    duration: 4,
    semesters: 8,
  },
  {
    name: 'B.Tech Artificial Intelligence & Data Science',
    code: 'BTECH-AIDS',
    university: UNIVERSITIES.GGSIP,
    duration: 4,
    semesters: 8,
  },
  {
    name: 'B.Tech Artificial Intelligence & Machine Learning',
    code: 'BTECH-AIML',
    university: UNIVERSITIES.GGSIP,
    duration: 4,
    semesters: 8,
  },
];

export const PROGRAM_NAMES = PROGRAMS.map((p) => p.name);
export const PROGRAM_CODES = PROGRAMS.map((p) => p.code);
