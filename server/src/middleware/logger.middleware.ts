import morgan from 'morgan';
import { Request, Response } from 'express';

const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';

export const loggerMiddleware = morgan(morganFormat, {
  skip: (_req: Request, res: Response) => {
    if (process.env.NODE_ENV === 'test') return true;
    return false;
  },
});
