import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { userService } from "@/service/user.service";

export function useUserSearch(
  q: string,
  options: { limit?: number; offset?: number; enabled?: boolean } = {}
) {
  const { limit = 20, offset = 0, enabled = true } = options;
  const trimmed = q.trim();

  return useQuery({
    queryKey: ["users", "search", trimmed, limit, offset],
    queryFn: () => userService.searchUsers(trimmed, { limit, offset }),
    enabled: enabled && trimmed.length > 0,
    placeholderData: keepPreviousData,
  });
}
