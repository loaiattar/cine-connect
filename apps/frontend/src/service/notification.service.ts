import { apiClient } from "@/lib/api-client";

/** Single notification from GET /api/v1/notifications */
export interface NotificationRow {
  id: number;
  userId: number | null;
  message: string;
  readAt: string | null;
  createdAt: string | null;
  /** Optional: "profile" | "movie" — link to relevant page when set with targetId */
  linkType?: string | null;
  /** Optional: userId for profile, or externalMovieId for movie */
  targetId?: number | null;
}

/** GET /api/v1/notifications response */
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
  /** GET /api/v1/notifications — list current user's notifications */
  getNotifications: (options?: GetNotificationsOptions) => {
    const params = new URLSearchParams();
    if (options?.limit != null) params.set("limit", String(options.limit));
    if (options?.offset != null) params.set("offset", String(options.offset));
    const q = params.toString();
    return apiClient.get<NotificationsListResponse>(
      `/api/v1/notifications${q ? `?${q}` : ""}`
    );
  },

  /** PATCH /api/v1/notifications/:id/read — mark one as read */
  markAsRead: (id: number) =>
    apiClient.patch<NotificationRow>(`/api/v1/notifications/${id}/read`),

  /** PATCH /api/v1/notifications/read — mark all as read */
  markAllAsRead: () =>
    apiClient.patch<{ marked: boolean }>("/api/v1/notifications/read"),
};
