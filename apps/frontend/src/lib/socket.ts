import { io, type Socket } from "socket.io-client";
import { useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { ApiClientConfig } from "./api-client";

const SOCKET_PATH = "/socket.io";

let sharedSocket: Socket | null = null;

function getSocket(): Socket {
  if (!sharedSocket) {
    const token = useAuthStore.getState().token;
    const url = ApiClientConfig.BASE_URL.replace(/\/$/, "");
    sharedSocket = io(url, {
      path: SOCKET_PATH,
      auth: token ? { token } : {},
      autoConnect: true,
    });
  }
  return sharedSocket;
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
  onNewCommentRef.current = onNewComment;
  const stableCb = useCallback(() => {
    onNewCommentRef.current();
  }, []);

  useEffect(() => {
    if (!Number.isInteger(movieId) || movieId < 1) return;
    const socket = getSocket();
    const roomId = filmRoomId(movieId);
    socket.emit("join_room", roomId);
    socket.on("movie_comment", stableCb);
    return () => {
      socket.off("movie_comment", stableCb);
      socket.emit("leave_room", roomId);
    };
  }, [movieId, stableCb]);
}
