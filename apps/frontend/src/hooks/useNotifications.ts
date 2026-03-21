import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import {
  notificationService,
  type NotificationRow,
} from "@/service/notification.service";
import { useAuth } from "@/hooks/useAuth";

export interface UseNotificationsOptions {
  limit?: number;
  offset?: number;
  /** Polling interval in ms; set to 0 or omit to disable */
  refetchInterval?: number;
}

export interface UseNotificationsReturn {
  notifications: NotificationRow[];
  total: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  isMarking: boolean;
  markError: Error | null;
  unreadCount: number;
}

/**
 * Loads the current user's notifications and exposes mark-as-read actions.
 * Only runs when the user is authenticated. Optional refetchInterval for polling.
 */
export function useNotifications(
  options: UseNotificationsOptions = {}
): UseNotificationsReturn {
  const { limit = 50, offset = 0, refetchInterval } = options;
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const enabled = user != null;

  const {
    data: rawData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["notifications", user?.userId, limit, offset],
    queryFn: () => notificationService.getNotifications({ limit, offset }),
    enabled,
    refetchInterval: refetchInterval ?? 0,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.userId] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.userId] });
    },
  });

  const markAsRead = useCallback(
    (id: number) => markAsReadMutation.mutate(id),
    [markAsReadMutation]
  );
  const markAllAsRead = useCallback(
    () => markAllAsReadMutation.mutate(),
    [markAllAsReadMutation]
  );

  const data = rawData ?? null;
  const notifications = data?.notifications ?? [];
  const total = data?.total ?? 0;
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const isMarking = markAsReadMutation.isPending || markAllAsReadMutation.isPending;
  const markErr = markAsReadMutation.error ?? markAllAsReadMutation.error;
  const markError =
    markErr instanceof Error
      ? markErr
      : markErr != null && typeof markErr === "object" && "message" in markErr
        ? new Error(String((markErr as { message: string }).message))
        : markErr != null
          ? new Error(String(markErr))
          : null;

  return {
    notifications,
    total,
    isLoading,
    isError,
    error: error instanceof Error ? error : isError && error ? new Error(String(error)) : null,
    refetch,
    markAsRead,
    markAllAsRead,
    isMarking,
    markError,
    unreadCount,
  };
}
