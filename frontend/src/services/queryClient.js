import { QueryClient } from "@tanstack/react-query";

// Defaults suit remote-database latency: serve cached data instantly, never refetch on tab focus,
// retry transient failures once, and never retry client errors (4xx).
export const STALE = {
  reference: 10 * 60_000, // rarely changes (subjects, grade scales, published form schemas)
  list: 30_000, // admin/teacher lists
  auth: 5 * 60_000, // /auth/me
  live: 10_000, // notifications, live/scheduled tests
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE.list,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        const status = error?.response?.status;
        if (status && status >= 400 && status < 500) return false;
        return failureCount < 1;
      },
    },
    mutations: { retry: false },
  },
});

// Stable key factories so every component hits the same cache entry for the same resource.
export const queryKeys = {
  adminStats: ["adminStats"],
  courses: (params = {}) => ["courses", params],
  employees: (params = {}) => ["employees", params],
  teacherAssignments: (params = {}) => ["teacherAssignments", params],
  applications: (params = {}) => ["applications", params],
};
