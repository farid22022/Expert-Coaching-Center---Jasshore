import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getApiErrorMessage } from "../../services/api.js";
import { studentDashboardApi } from "../../services/resourceApi.js";
import { LoadingOrError, PortalPage } from "./studentPortalShared.jsx";

export default function StudentCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentDashboardApi
      .list()
      .then((data) => setCourses(data.enrollments || []))
      .catch((requestError) => setError(getApiErrorMessage(requestError, "Unable to load courses.")))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PortalPage title="My Courses">
      <LoadingOrError loading={loading} error={error} />
      {!loading && !error && (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((course, index) => <LearningCourseCard key={course.id} course={course} index={index} />)}
          {!courses.length && <div className="rounded-xl border border-dashed border-emerald-200 bg-white p-8 text-center font-semibold text-slate-500">Your approved courses will appear here.</div>}
        </div>
      )}
    </PortalPage>
  );
}
import { LearningCourseCard } from "./StudentDashboardView.jsx";
