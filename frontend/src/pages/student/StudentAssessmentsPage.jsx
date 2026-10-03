import { useMemo } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Clock, Radio } from "lucide-react";

import { getApiErrorMessage } from "../../services/api.js";
import { useStudentAssessments } from "../../hooks/useStudentAssessments.js";
import { formatAppDateTime } from "../../hooks/useServerCountdown.js";
import { LoadingOrError, PortalPage } from "./studentPortalShared.jsx";

// Sections come from the backend's `student_status`, never from the device clock.
const SECTION_OF = {
  AVAILABLE_NOW: "available", IN_PROGRESS: "available",
  UPCOMING: "upcoming", STARTING_SOON: "upcoming",
  SUBMITTED: "completed",
};
const STATUS_LABEL = { AVAILABLE_NOW: "Available now", IN_PROGRESS: "In progress", UPCOMING: "Scheduled", STARTING_SOON: "Starting soon", SUBMITTED: "Completed" };

export default function StudentAssessmentsPage() {
  const { data, error: requestError, isLoading: loading } = useStudentAssessments();
  const error = requestError ? getApiErrorMessage(requestError, "Unable to load assessments.") : "";
  const tests = useMemo(() => (data || []).filter((item) => ["mcq", "exam"].includes(item.assessment_type)), [data]);

  const groups = useMemo(() => ({
    available: tests.filter((item) => SECTION_OF[item.student_status] === "available"),
    upcoming: tests.filter((item) => SECTION_OF[item.student_status] === "upcoming"),
    completed: tests.filter((item) => SECTION_OF[item.student_status] === "completed"),
  }), [tests]);

  return (
    <PortalPage title="Assessments">
      <LoadingOrError loading={loading} error={error} />
      {!loading && !error && (
        <div className="space-y-6">
          <Section title="Available Now" icon={Radio} iconClass="text-red-600" items={groups.available} emptyText="No tests are currently available." />
          <Section title="Upcoming" icon={Clock} iconClass="text-amber-600" items={groups.upcoming} emptyText="No upcoming tests are scheduled." />
          <Section title="Completed" icon={CheckCircle2} iconClass="text-emerald-700" items={groups.completed} emptyText="You haven't completed any tests yet." />
        </div>
      )}
    </PortalPage>
  );
}

function Section({ title, icon: Icon, iconClass, items, emptyText }) {
  return (
    <div className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 font-black text-slate-950"><Icon size={18} className={iconClass} /> {title}</h2><span className="badge badge-outline">{items.length}</span></div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {items.map((test) => (
          <article key={test.id} className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-4">
            <h3 className="font-black text-slate-950">{test.title}</h3>
            <p className="mt-1 text-sm font-semibold text-slate-500">{[test.subject_name, `${test.duration_minutes} minutes`].filter(Boolean).join(" · ")}</p>
            <p className="mt-1 text-xs font-bold text-slate-500">
              <span className="mr-2 rounded-full bg-white px-2 py-0.5 text-emerald-800">{STATUS_LABEL[test.student_status] || test.student_status}</span>
              {test.starts_at && SECTION_OF[test.student_status] === "upcoming" ? `Starts ${formatAppDateTime(test.starts_at)}` : test.ends_at ? `Until ${formatAppDateTime(test.ends_at)}` : ""}
            </p>
            {test.attempt && test.student_status === "SUBMITTED" && <p className="mt-2 text-sm font-black text-emerald-700">Score: {test.attempt.score} / {test.attempt.total_marks}</p>}
            <Link to={`/student/tests/${test.id}`} className="btn btn-success btn-sm mt-3 text-white">
              {test.student_status === "AVAILABLE_NOW" ? "Start Test" : test.student_status === "IN_PROGRESS" ? "Resume Test" : "View details"}
            </Link>
          </article>
        ))}
        {!items.length && <p className="rounded-lg border border-dashed border-slate-200 p-5 font-semibold text-slate-500">{emptyText}</p>}
      </div>
    </div>
  );
}
