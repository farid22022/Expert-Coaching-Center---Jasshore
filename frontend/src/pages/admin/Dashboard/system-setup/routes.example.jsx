import { Route } from "react-router-dom";
import SystemSetupDashboard from "./SystemSetupDashboard.jsx";

import {
  LeaveCategoryCreatePage,
  LeaveCategoryListPage,
} from "./leave-category/LeaveCategoryPages.jsx";

import {
  HolidayCategoryCreatePage,
  HolidayCategoryListPage,
} from "./holiday-category/HolidayCategoryPages.jsx";

import {
  YearlyHolidayCreatePage,
  YearlyHolidayListPage,
} from "./yearly-holiday/YearlyHolidayPages.jsx";

import {
  BloodGroupCreatePage,
  BloodGroupListPage,
} from "./blood-group/BloodGroupPages.jsx";

import {
  DesignationCreatePage,
  DesignationListPage,
} from "./designation/DesignationPages.jsx";

import {
  ReligionCreatePage,
  ReligionListPage,
} from "./religion/ReligionPages.jsx";

import {
  GenderCreatePage,
  GenderListPage,
} from "./gender/GenderPages.jsx";

import {
  EducationCreatePage,
  EducationListPage,
} from "./education/EducationPages.jsx";

import {
  ProfessionCreatePage,
  ProfessionListPage,
} from "./profession/ProfessionPages.jsx";

import {
  DivisionsCreatePage,
  DivisionsListPage,
} from "./divisions/DivisionsPages.jsx";

import {
  DistrictsCreatePage,
  DistrictsListPage,
} from "./districts/DistrictsPages.jsx";

import {
  UpazilasCreatePage,
  UpazilasListPage,
} from "./upazilas/UpazilasPages.jsx";

export function systemSetupRoutes(basePath) {
  return (
    <>
      <Route path={basePath} element={<SystemSetupDashboard />} />

      <Route path={`${basePath}/leave-category/create`} element={<LeaveCategoryCreatePage />} />
      <Route path={`${basePath}/leave-category/list`} element={<LeaveCategoryListPage />} />

      <Route path={`${basePath}/holiday-category/create`} element={<HolidayCategoryCreatePage />} />
      <Route path={`${basePath}/holiday-category/list`} element={<HolidayCategoryListPage />} />

      <Route path={`${basePath}/yearly-holiday/create`} element={<YearlyHolidayCreatePage />} />
      <Route path={`${basePath}/yearly-holiday/list`} element={<YearlyHolidayListPage />} />

      <Route path={`${basePath}/blood-group/create`} element={<BloodGroupCreatePage />} />
      <Route path={`${basePath}/blood-group/list`} element={<BloodGroupListPage />} />

      <Route path={`${basePath}/designation/create`} element={<DesignationCreatePage />} />
      <Route path={`${basePath}/designation/list`} element={<DesignationListPage />} />

      <Route path={`${basePath}/religion/create`} element={<ReligionCreatePage />} />
      <Route path={`${basePath}/religion/list`} element={<ReligionListPage />} />

      <Route path={`${basePath}/gender/create`} element={<GenderCreatePage />} />
      <Route path={`${basePath}/gender/list`} element={<GenderListPage />} />

      <Route path={`${basePath}/education/create`} element={<EducationCreatePage />} />
      <Route path={`${basePath}/education/list`} element={<EducationListPage />} />

      <Route path={`${basePath}/profession/create`} element={<ProfessionCreatePage />} />
      <Route path={`${basePath}/profession/list`} element={<ProfessionListPage />} />

      <Route path={`${basePath}/divisions/create`} element={<DivisionsCreatePage />} />
      <Route path={`${basePath}/divisions/list`} element={<DivisionsListPage />} />

      <Route path={`${basePath}/districts/create`} element={<DistrictsCreatePage />} />
      <Route path={`${basePath}/districts/list`} element={<DistrictsListPage />} />

      <Route path={`${basePath}/upazilas/create`} element={<UpazilasCreatePage />} />
      <Route path={`${basePath}/upazilas/list`} element={<UpazilasListPage />} />
    </>
  );
}

/*
Inside your /admin/dashboard and /dashboard routes:

{systemSetupRoutes("system-setup")}
{systemSetupRoutes("20-system-setup")}
*/
