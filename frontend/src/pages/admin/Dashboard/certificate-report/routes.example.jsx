import { Routes, Route } from "react-router-dom";
import CertificateReportDashboard from "./CertificateReportDashboard.jsx";
import {
  GiveCertificatePage,
  CertificateReportPage,
  CertificateSettingsPage,
} from "./CertificateReportPages.jsx";

export function certificateReportRoutes(basePath) {
  return (
    <>
      <Route path={basePath} element={<CertificateReportDashboard />} />
      <Route path={`${basePath}/give-certificate`} element={<GiveCertificatePage />} />
      <Route path={`${basePath}/certificate-report`} element={<CertificateReportPage />} />
      <Route path={`${basePath}/certificate-settings`} element={<CertificateSettingsPage />} />
    </>
  );
}

/*
Use inside your dashboard route:

{certificateReportRoutes("certificate-report")}
{certificateReportRoutes("14-certificate-report")}
*/
