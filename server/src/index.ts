import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { env } from './config/env';
import { initializeSocket } from './config/socket';
import { loggerMiddleware } from './middleware/logger.middleware';
import { errorMiddleware } from './middleware/error.middleware';

// Route imports
import authRouter from './modules/auth/auth.router';
import usersRouter from './modules/users/users.router';
import studentsRouter from './modules/students/students.router';
import teachersRouter from './modules/teachers/teachers.router';
import attendanceRouter from './modules/attendance/attendance.router';
import timetableRouter from './modules/timetable/timetable.router';
import announcementsRouter from './modules/announcements/announcements.router';
import subjectsRouter from './modules/subjects/subjects.router';
import programsRouter from './modules/programs/programs.router';
import auditRouter from './modules/audit/audit.router';

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
initializeSocket(httpServer);

import { isOriginAllowed } from './config/cors';

// Global Middleware
app.use(
  cors({
    origin: isOriginAllowed,
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);

// Health check
app.get(['/api/health', '/health'], (_req, res) => {
  res.json({
    success: true,
    message: 'Tribhuvan Portal API is running',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// API Routes (mounted under both /api and root / for client compatibility)
const registerRoutes = (prefix: string) => {
  app.use(`${prefix}/auth`, authRouter);
  app.use(`${prefix}/users`, usersRouter);
  app.use(`${prefix}/students`, studentsRouter);
  app.use(`${prefix}/teachers`, teachersRouter);
  app.use(`${prefix}/attendance`, attendanceRouter);
  app.use(`${prefix}/timetable`, timetableRouter);
  app.use(`${prefix}/announcements`, announcementsRouter);
  app.use(`${prefix}/subjects`, subjectsRouter);
  app.use(`${prefix}/programs`, programsRouter);
  app.use(`${prefix}/audit`, auditRouter);
};

registerRoutes('/api');
registerRoutes('');

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler
app.use(errorMiddleware);

// Start server
httpServer.listen(env.PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║     Tribhuvan College Portal API         ║
  ║     Running on port ${env.PORT}                ║
  ║     Environment: ${env.NODE_ENV.padEnd(20)}║
  ╚══════════════════════════════════════════╝
  `);
});

export default app;
