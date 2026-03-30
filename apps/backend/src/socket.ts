/**
 * Socket.io server for real-time discussion.
 *
 * Connection & authentication
 * - Connect to the same origin as the HTTP API (e.g. http://localhost:3000).
 * - Optional auth: send JWT in the handshake so the server can attach userId and a display name to the socket.
 *   Client: io({ auth: { token: "Bearer <jwt>" } }) or auth: { token: "<jwt>" }.
 * - If no token or invalid token, the socket still connects but socket.data.userId is undefined
 *   (anonymous user; you can still join rooms and send messages). Display name is loaded from DB when authenticated.
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
 * - message: { userId?: number; senderName?: string; text: string; roomId: string; timestamp: string } — also persisted to DB
 * - message_history: { roomId: string; messages: Array<{ id, senderId, roomId, content, createdAt, senderName? }> } — sent on join_room
 * - user_joined: { roomId: string; userId?: number; socketId: string }
 * - user_left: { roomId: string; userId?: number; socketId: string }
 */

import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { parse as parseCookieHeader } from 'cookie';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from './db';
import { users } from './db/schema';
import { getCorsAllowlist, getJwtSecret } from './config';
import { COOKIE_ACCESS } from './utils/authCookies';
import { MessageService, chatSenderDisplayName } from './services/message.service';
import { sanitizeUserText } from './utils/sanitize';

const ROOM_PREFIX_FILM = 'film:';

let socketIoInstance: Server | null = null;

/** Used by REST handlers (e.g. movie comments) to broadcast to film rooms. */
export function getSocketIo(): Server | null {
  return socketIoInstance;
}

function getCorsOptions(): {
  origin: string[] | boolean;
  credentials: boolean;
} {
  const allowlist = getCorsAllowlist();
  if (allowlist.length > 0) {
    return { origin: allowlist, credentials: true };
  }
  if (process.env.NODE_ENV === 'production') {
    return { origin: false, credentials: false };
  }
  return { origin: true, credentials: true };
}

export function createSocketServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: getCorsOptions(),
    path: '/socket.io',
  });

  io.use(async (socket, next) => {
    const cookieHeader = socket.handshake.headers.cookie;
    const cookies = cookieHeader ? parseCookieHeader(cookieHeader) : {};
    const fromCookie = cookies[COOKIE_ACCESS];
    const token =
      (typeof fromCookie === 'string' && fromCookie) ||
      (socket.handshake.auth as { token?: string })?.token ||
      (socket.handshake.headers?.authorization as string)?.replace(/^Bearer\s+/i, '');
    if (!token) {
      socket.data.userId = undefined;
      socket.data.senderName = undefined;
      return next();
    }
    try {
      const decoded = jwt.verify(token, getJwtSecret()) as { userId: number };
      socket.data.userId = decoded.userId;
      try {
        const [u] = await db
          .select({ name: users.name })
          .from(users)
          .where(eq(users.id, decoded.userId))
          .limit(1);
        socket.data.senderName = chatSenderDisplayName(u?.name ?? null, decoded.userId);
      } catch {
        socket.data.senderName = chatSenderDisplayName(null, decoded.userId);
      }
    } catch {
      socket.data.userId = undefined;
      socket.data.senderName = undefined;
    }
    next();
  });

  io.on('connection', (socket: Socket) => {
    socket.on('join_room', async (roomId: string) => {
      if (typeof roomId !== 'string' || !roomId.trim()) return;
      const id = roomId.trim();
      socket.join(id);
      io.to(id).emit('user_joined', {
        roomId: id,
        userId: socket.data.userId,
        socketId: socket.id,
      });
      try {
        const { messages: history } = await MessageService.getByRoom(id, 50, 0);
        socket.emit('message_history', { roomId: id, messages: history });
      } catch {
        // ignore DB errors (e.g. DB not running)
      }
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

    socket.on('message', async (payload: { roomId?: string; text?: string }) => {
      const roomId = typeof payload?.roomId === 'string' ? payload.roomId.trim() : '';
      const raw = typeof payload?.text === 'string' ? payload.text.trim() : '';
      if (!roomId || !raw) return;
      const text = sanitizeUserText(raw);
      if (!text) return;
      let createdAt: string = new Date().toISOString();
      try {
        const row = await MessageService.create(socket.data.userId ?? null, roomId, text);
        if (row?.createdAt) createdAt = row.createdAt.toISOString();
      } catch {
        // persist failed; still broadcast so clients see the message
      }
      const message: {
        roomId: string;
        text: string;
        timestamp: string;
        userId?: number;
        senderName?: string;
      } = { roomId, text, timestamp: createdAt };
      if (socket.data.userId != null) {
        message.userId = socket.data.userId;
        if (socket.data.senderName != null) {
          message.senderName = socket.data.senderName;
        }
      }
      io.to(roomId).emit('message', message);
    });
  });

  socketIoInstance = io;
  return io;
}

/**
 * Disconnect all Socket.io clients and close the Engine; clears the singleton.
 * Call before httpServer.close() during graceful shutdown.
 */
export function closeSocketServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    const io = socketIoInstance;
    if (!io) {
      resolve();
      return;
    }
    try {
      io.disconnectSockets(true);
    } catch {
      // ignore
    }
    io.close((err) => {
      socketIoInstance = null;
      if (err) reject(err);
      else resolve();
    });
  });
}

/** Normalize room id for a film: use "film:{movieId}". */
export function filmRoomId(movieId: number): string {
  return `${ROOM_PREFIX_FILM}${movieId}`;
}

export const GLOBAL_ROOM_ID = 'global';
