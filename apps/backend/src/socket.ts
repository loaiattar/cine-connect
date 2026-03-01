/**
 * Socket.io server for real-time discussion.
 *
 * Connection & authentication
 * - Connect to the same origin as the HTTP API (e.g. http://localhost:3000).
 * - Optional auth: send JWT in the handshake so the server can attach userId/email to the socket.
 *   Client: io({ auth: { token: "Bearer <jwt>" } }) or auth: { token: "<jwt>" }.
 * - If no token or invalid token, the socket still connects but socket.data.userId is undefined
 *   (anonymous user; you can still join rooms and send messages).
 *
 * Room model
 * - Rooms are identified by string roomId. Examples: "global", "film:550", "film:123".
 * - join_room(roomId) subscribes the socket to that room; leave_room(roomId) unsubscribes.
 * - Messages are scoped to a room; only clients in that room receive them.
 *
 * Events (client -> server)
 * - join_room: (roomId: string) — join a discussion room.
 * - leave_room: (roomId: string) — leave a room.
 * - message: (payload: { roomId: string; text: string }) — send a chat message to the room.
 *
 * Events (server -> client)
 * - message: { userId?: number; email?: string; text: string; roomId: string; timestamp: string }
 * - user_joined: { roomId: string; userId?: number; socketId: string }
 * - user_left: { roomId: string; userId?: number; socketId: string }
 */

import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { getCorsAllowlist, getJwtSecret } from './config';

const ROOM_PREFIX_FILM = 'film:';

function getCorsOptions(): { origin: string[] | boolean } {
  const allowlist = getCorsAllowlist();
  if (allowlist.length > 0) return { origin: allowlist };
  if (process.env.NODE_ENV === 'production') return { origin: false };
  return { origin: true }; // dev: allow any origin
}

export function createSocketServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: getCorsOptions(),
    path: '/socket.io',
  });

  io.use((socket, next) => {
    const token =
      (socket.handshake.auth as { token?: string })?.token ||
      (socket.handshake.headers?.authorization as string)?.replace(/^Bearer\s+/i, '');
    if (!token) {
      socket.data.userId = undefined;
      socket.data.email = undefined;
      return next();
    }
    try {
      const decoded = jwt.verify(token, getJwtSecret()) as { userId: number; email?: string };
      socket.data.userId = decoded.userId;
      socket.data.email = decoded.email ?? undefined;
    } catch {
      socket.data.userId = undefined;
      socket.data.email = undefined;
    }
    next();
  });

  io.on('connection', (socket: Socket) => {
    socket.on('join_room', (roomId: string) => {
      if (typeof roomId !== 'string' || !roomId.trim()) return;
      const id = roomId.trim();
      socket.join(id);
      io.to(id).emit('user_joined', {
        roomId: id,
        userId: socket.data.userId,
        email: socket.data.email,
        socketId: socket.id,
      });
    });

    socket.on('leave_room', (roomId: string) => {
      if (typeof roomId !== 'string' || !roomId.trim()) return;
      const id = roomId.trim();
      socket.leave(id);
      io.to(id).emit('user_left', {
        roomId: id,
        userId: socket.data.userId,
        socketId: socket.id,
      });
    });

    socket.on('message', (payload: { roomId?: string; text?: string }) => {
      const roomId = typeof payload?.roomId === 'string' ? payload.roomId.trim() : '';
      const text = typeof payload?.text === 'string' ? payload.text.trim() : '';
      if (!roomId || !text) return;
      const message = {
        roomId,
        text,
        userId: socket.data.userId,
        email: socket.data.email,
        timestamp: new Date().toISOString(),
      };
      io.to(roomId).emit('message', message);
    });
  });

  return io;
}

/** Normalize room id for a film: use "film:{movieId}". */
export function filmRoomId(movieId: number): string {
  return `${ROOM_PREFIX_FILM}${movieId}`;
}

export const GLOBAL_ROOM_ID = 'global';
