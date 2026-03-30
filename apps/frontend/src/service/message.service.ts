import { apiClient } from "@/lib/api-client";

/** Single chat message from API or socket */
export interface ChatMessage {
  id?: number;
  senderId?: number | null;
  /** Public display name (`users.name`); email is never sent by the API. */
  senderName?: string | null;
  roomId: string;
  content: string;
  createdAt: string;
}

/** GET /api/v1/messages response */
export interface MessageHistoryResponse {
  messages: ChatMessage[];
  total: number;
  limit: number;
  offset: number;
}

export interface GetMessagesOptions {
  room: string;
  limit?: number;
  offset?: number;
}

export const messageService = {
  /** GET /api/v1/messages?room=...&limit=50&offset=0 — message history for a room */
  getByRoom: (options: GetMessagesOptions) => {
    const params = new URLSearchParams();
    params.set("room", options.room);
    if (options.limit != null) params.set("limit", String(options.limit));
    if (options.offset != null) params.set("offset", String(options.offset));
    return apiClient.get<MessageHistoryResponse>(`/api/v1/messages?${params.toString()}`);
  },
};
