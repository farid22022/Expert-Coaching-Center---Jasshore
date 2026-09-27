import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronRight, GraduationCap } from "lucide-react";

import { getApiErrorMessage } from "../../services/api.js";
import { studentAcademicApi } from "../../services/resourceApi.js";
import { LoadingOrError, PortalPage } from "./studentPortalShared.jsx";

const STATUS_STYLE = {
  upcoming: "badge-ghost",
  in_progress: "badge-info text-white",
  completed: "badge-success text-white",
  archived: "badge-ghost",
};

function StatusPill({ status }) {
  return <span className={`badge badge-sm ${STATUS_STYLE[status] || "badge-ghost"}`}>{(status || "").replaceAll("_", " ") || "Upcoming"}</span>;
}

export default function StudentAcademicOverviewPage() {
  const { enrollmentId } = useParams();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    studentAcademicApi
      .overview(enrollmentId)
      .then(setOverview)
      .catch((requestError) => setError(getApiErrorMessage(requestError, "Unable to load your academic overview.")))
      .finally(() => setLoading(false));
  }, [enrollmentId]);

  return (
    <PortalPage title="Academic Overview" eyebrow={overview?.enrollment?.course_title || "Your enrolled admission"}>
      <LoadingOrError loading={loading} error={error} />
      {!loading && !error && overview && (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-emerald-100 bg-white p-4 shadow-sm">
              <p className="text-2xl font-black text-slate-950">{overview.summary.courses_completed} / {overview.summary.total_courses}</p>
              <p className="text-sm font-bold text-slate-500">Courses Completed</p>
            </div>
            <div className="rounded-lg border border-emerald-100 bg-white p-4 shadow-sm">
              <p className="text-2xl font-black text-slate-950">{overview.summary.average_percentage !== null ? `${overview.summary.average_percentage}%` : "N/A"}</p>
              <p className="text-sm font-bold text-slate-500">Average Percentage</p>
            </div>
            <div className="rounded-lg border border-emerald-100 bg-white p-4 shadow-sm">
              <p className="text-2xl font-black capitalize text-slate-950">{overview.enrollment.status}</p>
              <p className="text-sm font-bold text-slate-500">Enrollment Status</p>
            </div>
          </div>

          {overview.stages.map((stage) => (
            <section key={stage.id ?? "general"} className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <GraduationCap size={18} className="text-emerald-700" />
                <h2 className="font-black text-slate-950">{stage.display_label ? `${stage.display_label} - ${stage.name}` : stage.name}</h2>
                <StatusPill status={stage.status} />
              </div>
              <div className="mt-4 divide-y divide-emerald-50">
                {stage.subjects.map((subject) => (
                  <Link
                    key={subject.id}
                    to={`/student/courses/${enrollmentId}/subjects/${subject.id}/result`}
                    className="flex items-center justify-between gap-4 py-3 transition hover:bg-emerald-50/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-900">{subject.name}</span>
                      <StatusPill status={subject.status} />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-slate-700">{subject.percentage !== null ? `${subject.percentage}%` : "N/A"}</span>
                      <span className="text-sm font-black text-emerald-700">{subject.grade || "N/A"}</span>
                      <ChevronRight size={16} className="text-slate-400" />
                    </div>
                  </Link>
                ))}
                {!stage.subjects.length && <p className="py-3 text-sm font-semibold text-slate-500">No subjects in this stage yet.</p>}
              </div>
            </section>
          ))}
          {!overview.stages.length && (
            <p className="rounded-xl border border-dashed border-emerald-200 bg-white p-8 text-center font-semibold text-slate-500">
              Your academic structure hasn't been configured yet.
            </p>
          )}
        </div>
      )}
    </PortalPage>
  );
}
