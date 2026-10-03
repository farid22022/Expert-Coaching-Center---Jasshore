import api from "./api.js";

export const unreadCountKey = ["notifications", "unreadCount"];

// Shared unread-count fetch. Concurrent callers (header bell, student dashboard, focus +
// visibilitychange firing together) share one request; `fresh` bypasses the short cache after a
// notification mutation so the badge never lags behind an action the user just took.
export function fetchUnreadCount(queryClient, { fresh = false } = {}) {
  return queryClient.fetchQuery({
    queryKey: unreadCountKey,
    queryFn: ({ signal }) => api.get("/sms/notifications/unread_count/", { signal }).then((response) => response.data?.data || response.data),
    staleTime: fresh ? 0 : 5_000,
  });
}
