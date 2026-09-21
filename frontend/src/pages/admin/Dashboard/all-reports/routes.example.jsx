import { Route } from "react-router-dom";
import AllReportsDashboard from "./AllReportsDashboard.jsx";
import {
  StudentReportPage,
  CreateInactiveStudentPage,
  InactiveStudentListPage,
  ClassSummaryReportPage,
} from "./AllReportsPages.jsx";

export function allReportsRoutes(basePath) {
  return (
    <>
      <Route path={basePath} element={<AllReportsDashboard />} />

      <Route
        path={`${basePath}/student-report`}
        element={<StudentReportPage />}
      />

      <Route
        path={`${basePath}/create-inactive-student`}
        element={<CreateInactiveStudentPage />}
      />

      <Route
        path={`${basePath}/inactive-student-list`}
        element={<InactiveStudentListPage />}
      />

      <Route
        path={`${basePath}/class-summary-report`}
        element={<ClassSummaryReportPage />}
      />
    </>
  );
}

/*
Example usage inside /admin/dashboard and /dashboard:

{allReportsRoutes("all-reports")}
{allReportsRoutes("15-all-reports")}
*/
