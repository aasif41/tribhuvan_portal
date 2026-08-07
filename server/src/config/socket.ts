import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { isOriginAllowed } from './cors';

let io: Server;

export function initializeSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: isOriginAllowed,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    socket.on('join-class', (data: { subjectId: string; teacherId: string }) => {
      socket.join(`class:${data.subjectId}`);
      console.log(`📚 Socket ${socket.id} joined class:${data.subjectId}`);
    });

    socket.on('leave-class', (data: { subjectId: string }) => {
      socket.leave(`class:${data.subjectId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initializeSocket first.');
  }
  return io;
}

export function emitAttendanceUpdate(subjectId: string, data: Record<string, unknown>): void {
  if (io) {
    io.to(`class:${subjectId}`).emit('attendance-update', data);
  }
}
