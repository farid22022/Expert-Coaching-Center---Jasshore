import { Route } from "react-router-dom";
import StudentWorkDashboard from "./StudentWorkDashboard.jsx";

import {
  ClassWorkCreatePage,
  ClassWorkListPage,
} from "./class-work/ClassWorkPages.jsx";

import {
  AssignmentCreatePage,
  AssignmentListPage,
} from "./assignment/AssignmentPages.jsx";

import {
  HomeWorkCreatePage,
  HomeWorkListPage,
  HomeWorkAtAGlancePage,
} from "./home-work/HomeWorkPages.jsx";

export function studentWorkRoutes(basePath = "student-work") {
  return (
    <>
      <Route path={basePath} element={<StudentWorkDashboard />} />

      <Route
        path={`${basePath}/class-work/create`}
        element={<ClassWorkCreatePage />}
      />
      <Route
        path={`${basePath}/class-work/list`}
        element={<ClassWorkListPage />}
      />

      <Route
        path={`${basePath}/assignment/create`}
        element={<AssignmentCreatePage />}
      />
      <Route
        path={`${basePath}/assignment/list`}
        element={<AssignmentListPage />}
      />

      <Route
        path={`${basePath}/home-work/create`}
        element={<HomeWorkCreatePage />}
      />
      <Route
        path={`${basePath}/home-work/list`}
        element={<HomeWorkListPage />}
      />
      <Route
        path={`${basePath}/home-work/at-a-glance`}
        element={<HomeWorkAtAGlancePage />}
      />
    </>
  );
}

/*
Use inside both /admin/dashboard and /dashboard:

{studentWorkRoutes("student-work")}
*/
