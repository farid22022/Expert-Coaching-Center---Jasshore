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
          {courses.map((course) => (
            <article key={course.id} className="overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-sm">
              {course.cover_image ? (
                <div className="relative h-44 overflow-hidden bg-emerald-950">
                  <img src={course.cover_image} alt="" className="h-full w-full object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }} />
                  <div className="absolute inset-0 grid place-items-center bg-emerald-950/35 p-4 text-center font-black text-white">{course.program}</div>
                </div>
              ) : (
                <div className="grid h-44 place-items-center gap-3 bg-gradient-to-br from-emerald-800 to-emerald-950 p-4 text-center">
                  <img src="/jasshoreExpert.png" alt="" className="h-14 w-14 rounded-full bg-white/90 p-1 shadow-md" />
                  <p className="font-black leading-tight text-white">{course.program}</p>
                </div>
              )}
              <div className="p-4">
                <h2 className="font-black text-slate-950">{course.program}</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">{[course.session, course.section].filter(Boolean).join(" - ") || "Active enrollment"}</p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-emerald-100"><div className="h-full rounded-full bg-emerald-600" style={{ width: `${course.progress?.percentage || 0}%` }} /></div>
                <p className="mt-2 text-xs font-bold text-emerald-800">{course.progress?.percentage || 0}% complete - {course.progress?.completed_units || 0}/{course.progress?.total_units || 0} activities</p>
                <Link className="btn btn-success btn-sm mt-4 text-white" to={`/student/courses/${course.id}`}>Continue Course</Link>
              </div>
            </article>
          ))}
          {!courses.length && <div className="rounded-xl border border-dashed border-emerald-200 bg-white p-8 text-center font-semibold text-slate-500">Your approved courses will appear here.</div>}
        </div>
      )}
    </PortalPage>
  );
}
