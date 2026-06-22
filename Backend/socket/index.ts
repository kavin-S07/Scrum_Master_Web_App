import { Server } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt';
import { env } from '../config/env';
import logger from '../utils/logger';

const onlineUsers = new Map<string, string>(); // userId -> socketId
let io: Server | null = null;

export const initSocket = (server: http.Server): Server => {
  io = new Server(server, {
    cors: {
      origin: env.allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Auth middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    try {
      const decoded = jwt.verify(token, jwtConfig.secret) as { id: string };
      socket.data.userId = decoded.id;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId as string;
    onlineUsers.set(userId, socket.id);
    logger.info(`User ${userId} connected via socket`);

    socket.join(`user:${userId}`);

    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      logger.info(`User ${userId} disconnected`);
    });
  });

  return io;
};

/**
 * Emits an event to a specific user's room, if they're currently connected.
 * Safe to call before the socket server is initialized (e.g. from a
 * one-off script or during tests) — it just no-ops instead of throwing.
 */
export const emitToUser = (userId: string, event: string, data: unknown): void => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
};

export const isUserOnline = (userId: string): boolean => onlineUsers.has(userId);

export const getIO = (): Server | null => io;