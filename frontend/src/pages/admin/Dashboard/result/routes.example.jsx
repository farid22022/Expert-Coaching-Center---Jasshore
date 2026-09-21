import { Route } from "react-router-dom";
import ResultDashboard from "./ResultDashboard.jsx";
import {
  ResultPositionSetupPage,
  ResultProcessPage,
  MarkSheetPage,
  TabulationSheetPage,
  GradeSheetReportPage,
  MeritListPage,
  FailReportPage,
  SubjectWiseResultPage,
  SubjectWiseFailReportPage,
  ExamWiseRollUpdatePage,
  PromotionPage,
  ResultPublishPage,
  ExamResultSummaryPage,
  StudentResultSummaryPage,
} from "./ResultPages.jsx";

export function resultRoutes(basePath) {
  return (
    <>
      <Route path={basePath} element={<ResultDashboard />} />

      <Route
        path={`${basePath}/result-position-setup`}
        element={<ResultPositionSetupPage />}
      />

      <Route
        path={`${basePath}/result-process`}
        element={<ResultProcessPage />}
      />

      <Route
        path={`${basePath}/mark-sheet`}
        element={<MarkSheetPage />}
      />

      <Route
        path={`${basePath}/tabulation-sheet`}
        element={<TabulationSheetPage />}
      />

      <Route
        path={`${basePath}/grade-sheet-report`}
        element={<GradeSheetReportPage />}
      />

      <Route
        path={`${basePath}/merit-list`}
        element={<MeritListPage />}
      />

      <Route
        path={`${basePath}/fail-report`}
        element={<FailReportPage />}
      />

      <Route
        path={`${basePath}/subject-wise-result`}
        element={<SubjectWiseResultPage />}
      />

      <Route
        path={`${basePath}/subject-wise-fail-report`}
        element={<SubjectWiseFailReportPage />}
      />

      <Route
        path={`${basePath}/exam-wise-roll-update`}
        element={<ExamWiseRollUpdatePage />}
      />

      <Route
        path={`${basePath}/promotion`}
        element={<PromotionPage />}
      />

      <Route
        path={`${basePath}/result-publish`}
        element={<ResultPublishPage />}
      />

      <Route
        path={`${basePath}/exam-result-summary`}
        element={<ExamResultSummaryPage />}
      />

      <Route
        path={`${basePath}/student-result-summary`}
        element={<StudentResultSummaryPage />}
      />
    </>
  );
}

/*
Example usage inside /admin/dashboard and /dashboard:

{resultRoutes("result")}
{resultRoutes("7-result")}
*/
