import { apiClient } from "@/lib/api-client";

/** Single notification from GET /api/notifications */
export interface NotificationRow {
  id: number;
  userId: number | null;
  message: string;
  readAt: string | null;
  createdAt: string | null;
}

/** GET /api/notifications response */
export interface NotificationsListResponse {
  notifications: NotificationRow[];
  total: number;
  limit: number;
  offset: number;
}

export interface GetNotificationsOptions {
  limit?: number;
  offset?: number;
}

export const notificationService = {
  /** GET /api/notifications — list current user's notifications */
  getNotifications: (options?: GetNotificationsOptions) => {
    const params = new URLSearchParams();
    if (options?.limit != null) params.set("limit", String(options.limit));
    if (options?.offset != null) params.set("offset", String(options.offset));
    const q = params.toString();
    return apiClient.get<NotificationsListResponse>(
      `/api/notifications${q ? `?${q}` : ""}`
    );
  },

  /** PATCH /api/notifications/:id/read — mark one as read */
  markAsRead: (id: number) =>
    apiClient.patch<NotificationRow>(`/api/notifications/${id}/read`),

  /** PATCH /api/notifications/read — mark all as read */
  markAllAsRead: () =>
    apiClient.patch<{ marked: boolean }>("/api/notifications/read"),
};
