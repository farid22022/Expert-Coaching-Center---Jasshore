import { useQuery } from "@tanstack/react-query";

import api, { unwrapResults } from "../services/api.js";
import { STALE } from "../services/queryClient.js";

export const STUDENT_ASSESSMENTS_KEY = ["studentAssessments"];

// One shared cache entry for every student component that needs the assessment list
// (dashboard "Upcoming tests", Assessments page). Status stays server-authoritative:
// we only poll the server (visible tab only) and refetch on focus.
export function useStudentAssessments() {
  return useQuery({
    queryKey: STUDENT_ASSESSMENTS_KEY,
    queryFn: ({ signal }) => api.get("/assessments/student/assessments/", { params: { page_size: 100 }, signal }).then((response) => unwrapResults(response.data)),
    staleTime: STALE.live,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
}
