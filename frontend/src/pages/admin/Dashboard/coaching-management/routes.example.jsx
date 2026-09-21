import { Route } from "react-router-dom";
import CoachingManagementDashboard from "./CoachingManagementDashboard.jsx";

import {
  CoachingStudentAutoEnrollPage,
  CoachingStudentCreatePage,
  CoachingStudentListPage,
} from "./coaching-student/CoachingStudentPages.jsx";

import {
  CoachingFeeCreatePage,
  CoachingFeeListPage,
  CoachingFeeDuesPage,
  FeesCollectionSummaryPage,
  CoachingIncomeStatementPage,
  CoachingPaymentHistoryPage,
  CoachingFeeSetupPage,
} from "./coaching-fee/CoachingFeePages.jsx";

import {
  CmsExpenseCreatePage,
  CmsExpenseListPage,
  CmsExpenseReportPage,
} from "./cms-expense/CmsExpensePages.jsx";

import {
  CmsExpenseCategoryCreatePage,
  CmsExpenseCategoryListPage,
} from "./cms-expense-category/CmsExpenseCategoryPages.jsx";

import {
  CmsIncomeCategoryCreatePage,
  CmsIncomeCategoryListPage,
} from "./cms-income-category/CmsIncomeCategoryPages.jsx";

import {
  CmsIncomeCreatePage,
  CmsIncomeListPage,
} from "./cms-income/CmsIncomePages.jsx";

export function coachingManagementRoutes(basePath) {
  return (
    <>
      <Route path={basePath} element={<CoachingManagementDashboard />} />

      <Route path={`${basePath}/coaching-student/auto-enroll`} element={<CoachingStudentAutoEnrollPage />} />
      <Route path={`${basePath}/coaching-student/create`} element={<CoachingStudentCreatePage />} />
      <Route path={`${basePath}/coaching-student/list`} element={<CoachingStudentListPage />} />

      <Route path={`${basePath}/coaching-fee/create`} element={<CoachingFeeCreatePage />} />
      <Route path={`${basePath}/coaching-fee/list`} element={<CoachingFeeListPage />} />
      <Route path={`${basePath}/coaching-fee/dues`} element={<CoachingFeeDuesPage />} />
      <Route path={`${basePath}/coaching-fee/fees-collection-summary`} element={<FeesCollectionSummaryPage />} />
      <Route path={`${basePath}/coaching-fee/income-statement`} element={<CoachingIncomeStatementPage />} />
      <Route path={`${basePath}/coaching-fee/payment-history`} element={<CoachingPaymentHistoryPage />} />
      <Route path={`${basePath}/coaching-fee/fee-setup`} element={<CoachingFeeSetupPage />} />

      <Route path={`${basePath}/cms-expense/create`} element={<CmsExpenseCreatePage />} />
      <Route path={`${basePath}/cms-expense/list`} element={<CmsExpenseListPage />} />
      <Route path={`${basePath}/cms-expense/report`} element={<CmsExpenseReportPage />} />

      <Route path={`${basePath}/cms-expense-category/create`} element={<CmsExpenseCategoryCreatePage />} />
      <Route path={`${basePath}/cms-expense-category/list`} element={<CmsExpenseCategoryListPage />} />

      <Route path={`${basePath}/cms-income-category/create`} element={<CmsIncomeCategoryCreatePage />} />
      <Route path={`${basePath}/cms-income-category/list`} element={<CmsIncomeCategoryListPage />} />

      <Route path={`${basePath}/cms-income/create`} element={<CmsIncomeCreatePage />} />
      <Route path={`${basePath}/cms-income/list`} element={<CmsIncomeListPage />} />
    </>
  );
}

/*
In AppRoutes.jsx:

{coachingManagementRoutes("coaching-management")}
{coachingManagementRoutes("17-coaching-management")}

Use it under both /admin/dashboard and /dashboard just like your
user-management route helpers.
*/
