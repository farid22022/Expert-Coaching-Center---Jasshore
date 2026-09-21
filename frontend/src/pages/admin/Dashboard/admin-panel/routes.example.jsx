import { Route } from "react-router-dom";
import AdminPanelDashboard from "./AdminPanelDashboard.jsx";
import {
  PayBillPage,
  AcademicYearPage,
  AdminListPage,
  ResetPasswordPage,
  RolePage,
  UserLoginHistoryPage,
  AdminDisablePage,
  AdminRestorePage,
} from "./AdminPanelPages.jsx";

export function adminPanelRoutes(basePath) {
  return (
    <>
      <Route path={basePath} element={<AdminPanelDashboard />} />
      <Route path={`${basePath}/pay-bill`} element={<PayBillPage />} />
      <Route path={`${basePath}/academic-year`} element={<AcademicYearPage />} />
      <Route path={`${basePath}/admin-list`} element={<AdminListPage />} />
      <Route path={`${basePath}/reset-password`} element={<ResetPasswordPage />} />
      <Route path={`${basePath}/role`} element={<RolePage />} />
      <Route path={`${basePath}/user-login-history`} element={<UserLoginHistoryPage />} />
      <Route path={`${basePath}/admin-disable`} element={<AdminDisablePage />} />
      <Route path={`${basePath}/admin-restore`} element={<AdminRestorePage />} />
    </>
  );
}

/*
Inside /admin/dashboard and /dashboard:

{adminPanelRoutes("admin-panel")}
{adminPanelRoutes("18-admin-panel")}
*/
