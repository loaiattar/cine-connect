import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useCallback, useState } from "react";
import { messageService, type ChatMessage } from "@/service/message.service";
import { getSocket } from "@/lib/socket";

function unwrapHistory(raw: unknown): { messages: ChatMessage[]; total: number } | null {
  if (raw == null) return null;
  if (typeof raw === "object" && "data" in raw) {
    const d = (raw as { data: unknown }).data;
    if (d != null && typeof d === "object" && "messages" in d) {
      const data = d as { messages: ChatMessage[]; total: number };
      return { messages: data.messages ?? [], total: data.total ?? 0 };
    }
  }
  if (typeof raw === "object" && "messages" in raw) {
    const r = raw as { messages: ChatMessage[]; total?: number };
    return { messages: Array.isArray(r.messages) ? r.messages : [], total: r.total ?? 0 };
  }
  return null;
}

export interface UseChatRoomOptions {
  roomId: string | null;
  limit?: number;
}

export interface UseChatRoomReturn {
  messages: ChatMessage[];
  total: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  sendMessage: (text: string) => void;
  isSending: boolean;
}

/**
 * Loads message history for a room (GET /api/messages), joins the socket room,
 * and keeps messages in sync via socket events (message_history, message).
 */
export function useChatRoom(options: UseChatRoomOptions): UseChatRoomReturn {
  const { roomId, limit = 50 } = options;
  const queryClient = useQueryClient();
  const [messagesByRoom, setMessagesByRoom] = useState<Record<string, ChatMessage[]>>({});

  const {
    data: rawData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["messages", roomId],
    queryFn: () => messageService.getByRoom({ room: roomId!, limit }),
    enabled: roomId != null && roomId.length > 0,
  });

  const history = unwrapHistory(rawData);
  const apiMessages = history?.messages ?? [];
  const total = history?.total ?? 0;

  const sendMutation = useMutation({
    mutationFn: (text: string) => {
      if (!roomId?.trim()) throw new Error("No room selected");
      getSocket().emit("message", { roomId, text });
      return Promise.resolve();
    },
    onSuccess: () => {
      if (roomId) queryClient.invalidateQueries({ queryKey: ["messages", roomId] });
    },
  });

  const sendMessage = useCallback(
    (text: string) => {
      const t = text.trim();
      if (!t) return;
      sendMutation.mutate(t);
    },
    [sendMutation]
  );

  useEffect(() => {
    if (roomId == null || roomId === "") return;
    const socket = getSocket();
    socket.emit("join_room", roomId);

    const onHistory = (payload: { roomId: string; messages: ChatMessage[] }) => {
      if (!Array.isArray(payload.messages)) return;
      const normalized = payload.messages.map((m) => ({
        id: m.id,
        senderId: m.senderId,
        senderEmail: m.senderEmail,
        roomId: m.roomId,
        content: m.content,
        createdAt:
          typeof m.createdAt === "string"
            ? m.createdAt
            : (m.createdAt as Date)?.toISOString?.() ?? new Date().toISOString(),
      }));
      const ordered = [...normalized].reverse();
      setMessagesByRoom((prev) => ({ ...prev, [payload.roomId]: ordered }));
    };

    const onMessage = (payload: {
      roomId: string;
      text: string;
      userId?: number;
      email?: string;
      timestamp?: string;
    }) => {
      const rid = payload.roomId;
      if (!rid) return;
      const newMsg: ChatMessage = {
        id: undefined,
        senderId: payload.userId ?? null,
        senderEmail: payload.email ?? null,
        roomId: rid,
        content: payload.text ?? "",
        createdAt: payload.timestamp ?? new Date().toISOString(),
      };
      setMessagesByRoom((prev) => ({
        ...prev,
        [rid]: [...(prev[rid] ?? []), newMsg],
      }));
    };

    socket.on("message_history", onHistory);
    socket.on("message", onMessage);

    return () => {
      socket.off("message_history", onHistory);
      socket.off("message", onMessage);
      socket.emit("leave_room", roomId);
    };
  }, [roomId]);

  const apiOrdered = [...apiMessages].reverse().map((m) => ({
    ...m,
    createdAt:
      typeof m.createdAt === "string"
        ? m.createdAt
        : (m.createdAt as Date)?.toISOString?.() ?? new Date().toISOString(),
  }));
  const liveMessages = roomId ? messagesByRoom[roomId] ?? [] : [];
  const messages = liveMessages.length > 0 ? liveMessages : apiOrdered;

  return {
    messages,
    total: liveMessages.length > 0 ? liveMessages.length : total,
    isLoading,
    isError,
    error: error instanceof Error ? error : isError && error ? new Error(String(error)) : null,
    refetch,
    sendMessage,
    isSending: sendMutation.isPending,
  };
}
