import { User, Student, Teacher } from '@prisma/client';

type UserWithRelations = User & {
  student: Student | null;
  teacher: Teacher | null;
};

declare global {
  namespace Express {
    interface Request {
      user?: UserWithRelations;
    }
  }
}

export {};
