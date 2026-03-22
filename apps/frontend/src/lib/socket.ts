import { io, type Socket } from "socket.io-client";
import { useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { ApiClientConfig } from "./api-client";

const SOCKET_PATH = "/socket.io";

/** Initial reconnect delay (ms). Socket.io increases delay exponentially up to `reconnectionDelayMax`. */
const RECONNECT_DELAY_MS = 1000;
const RECONNECT_DELAY_MAX_MS = 30_000;
/** Jitter factor (0–1) applied to each delay step (built-in exponential backoff). */
const RECONNECT_JITTER = 0.5;

let sharedSocket: Socket | null = null;

/** Ref-counted rooms to re-`join_room` after disconnect/reconnect. */
const roomRefCounts = new Map<string, number>();

function rejoinAllTrackedRooms(socket: Socket): void {
  for (const [roomId, count] of roomRefCounts) {
    if (count > 0) {
      socket.emit("join_room", roomId);
    }
  }
}

function attachSocketLifecycle(socket: Socket): void {
  socket.on("connect", () => {
    rejoinAllTrackedRooms(socket);
  });

  const mgr = socket.io;
  mgr.on("reconnect_attempt", (attempt: number) => {
    if (import.meta.env.DEV) {
      console.info(`[socket] reconnect attempt ${attempt}`);
    }
  });
  mgr.on("reconnect", (attempt: number) => {
    if (import.meta.env.DEV) {
      console.info(`[socket] reconnected after ${attempt} attempt(s)`);
    }
  });
  mgr.on("reconnect_error", (err: Error) => {
    if (import.meta.env.DEV) {
      console.warn("[socket] reconnect error", err?.message ?? err);
    }
  });
  mgr.on("reconnect_failed", () => {
    console.error("[socket] reconnection failed (max attempts reached)");
  });

  socket.on("disconnect", (reason: string) => {
    if (import.meta.env.DEV) {
      console.info(`[socket] disconnected: ${reason}`);
    }
  });
}

export function getSocket(): Socket {
  if (!sharedSocket) {
    const token = useAuthStore.getState().token;
    const url = ApiClientConfig.BASE_URL.replace(/\/$/, "");
    sharedSocket = io(url, {
      path: SOCKET_PATH,
      auth: token ? { token } : {},
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Number.POSITIVE_INFINITY,
      reconnectionDelay: RECONNECT_DELAY_MS,
      reconnectionDelayMax: RECONNECT_DELAY_MAX_MS,
      randomizationFactor: RECONNECT_JITTER,
    });
    attachSocketLifecycle(sharedSocket);
    if (sharedSocket.connected) {
      rejoinAllTrackedRooms(sharedSocket);
    }
  }
  return sharedSocket;
}

/**
 * Register interest in a Socket.io room (ref-counted).
 * First subscriber emits `join_room`; after reconnect, all tracked rooms are rejoined automatically.
 */
export function joinSocketRoom(roomId: string): void {
  const id = roomId.trim();
  if (!id) return;
  const next = (roomRefCounts.get(id) ?? 0) + 1;
  roomRefCounts.set(id, next);
  if (next === 1) {
    getSocket().emit("join_room", id);
  }
}

/**
 * Release interest in a room. Last subscriber emits `leave_room`.
 * Does not recreate the socket if it was cleared (e.g. auth refresh).
 */
export function leaveSocketRoom(roomId: string): void {
  const id = roomId.trim();
  if (!id) return;
  const prev = roomRefCounts.get(id) ?? 0;
  if (prev <= 0) return;
  const next = prev - 1;
  if (next <= 0) {
    roomRefCounts.delete(id);
    if (sharedSocket) {
      sharedSocket.emit("leave_room", id);
    }
  } else {
    roomRefCounts.set(id, next);
  }
}

/** Keep socket auth in sync with store (e.g. after login/logout). Forces reconnect with new token. */
export function updateSocketAuth(): void {
  if (sharedSocket) {
    sharedSocket.disconnect();
    sharedSocket = null;
  }
}

export function filmRoomId(movieId: number): string {
  return `film:${movieId}`;
}

/** Subscribe to new movie comments for a film room; call onNewComment when one is pushed. Cleanup on unmount. */
export function useMovieCommentSocket(
  movieId: number,
  onNewComment: () => void
): void {
  const onNewCommentRef = useRef(onNewComment);
  useEffect(() => {
    onNewCommentRef.current = onNewComment;
  }, [onNewComment]);
  const stableCb = useCallback(() => {
    onNewCommentRef.current();
  }, []);

  useEffect(() => {
    if (!Number.isInteger(movieId) || movieId < 1) return;
    const socket = getSocket();
    const roomId = filmRoomId(movieId);
    joinSocketRoom(roomId);
    socket.on("movie_comment", stableCb);
    return () => {
      socket.off("movie_comment", stableCb);
      leaveSocketRoom(roomId);
    };
  }, [movieId, stableCb]);
}
