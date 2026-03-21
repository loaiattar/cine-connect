import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  userService,
  type UserSearchResponse,
} from "@/service/user.service";

function unwrapUserSearch(raw: unknown): UserSearchResponse | null {
  if (raw == null) return null;
  if (typeof raw === "object" && "data" in raw) {
    const d = (raw as { data: unknown }).data;
    if (d != null && typeof d === "object" && "users" in d && "total" in d) {
      return d as UserSearchResponse;
    }
    return null;
  }
  if (typeof raw === "object" && "users" in raw && "total" in raw) {
    return raw as UserSearchResponse;
  }
  return null;
}

export function useUserSearch(
  q: string,
  options: { limit?: number; offset?: number; enabled?: boolean } = {}
) {
  const { limit = 20, offset = 0, enabled = true } = options;
  const trimmed = q.trim();

  return useQuery({
    queryKey: ["users", "search", trimmed, limit, offset],
    queryFn: async () => {
      const res = await userService.searchUsers(trimmed, { limit, offset });
      return (
        unwrapUserSearch(res) ?? {
          users: [],
          total: 0,
          limit,
          offset,
        }
      );
    },
    enabled: enabled && trimmed.length > 0,
    placeholderData: keepPreviousData,
  });
}
