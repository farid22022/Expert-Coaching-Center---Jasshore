import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Clock, Radio } from "lucide-react";

import { useStudentAssessments } from "../../hooks/useStudentAssessments.js";
import { formatAppDateTime, useServerCountdown } from "../../hooks/useServerCountdown.js";

const OPEN = new Set(["STARTING_SOON", "UPCOMING", "AVAILABLE_NOW", "IN_PROGRESS"]);

function remainingText({ days, hours, minutes, seconds }) {
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function Row({ test, onZero }) {
  const waiting = test.student_status === "UPCOMING" || test.student_status === "STARTING_SOON";
  const countdown = useServerCountdown(waiting ? test.starts_at : null, test.server_time, onZero);
  const live = test.timing_mode === "live";
  let label;
  if (waiting) label = `Starts in ${remainingText(countdown)}`;
  else if (test.student_status === "IN_PROGRESS") label = "In progress";
  else label = live ? "Live now" : "Available";
  return (
    <li>
      <Link to={`/student/tests/${test.id}`} className="block rounded-lg bg-emerald-50 p-3 outline-none hover:bg-emerald-100 focus-visible:ring-2 focus-visible:ring-emerald-500">
        <p className="text-sm font-semibold text-emerald-900">{test.title}</p>
        <p className="mt-0.5 text-xs text-emerald-700">{[test.subject_name, test.timing_mode === "scheduled" ? "Scheduled" : live ? "Live" : "MCQ"].filter(Boolean).join(" · ")}</p>
        <p className={`mt-1 flex items-center gap-1.5 text-xs font-bold ${waiting ? "text-amber-700" : "text-emerald-800"}`}>
          {waiting ? <Clock size={13} aria-hidden="true" /> : <Radio size={13} aria-hidden="true" />}
          <span>{label}</span>
          {waiting && test.starts_at && <span className="font-medium text-slate-500">· {formatAppDateTime(test.starts_at)}</span>}
        </p>
      </Link>
    </li>
  );
}

/** Backend-driven: status comes from `student_status`; this component only renders and re-asks the server. */
export default function UpcomingTests({ limit = 4 }) {
  const { data, isLoading, refetch } = useStudentAssessments();
  const tests = useMemo(() => (data || [])
    .filter((item) => item.assessment_type !== "assignment" && OPEN.has(item.student_status))
    .sort((a, b) => {
      const rank = (t) => (t.student_status === "IN_PROGRESS" ? 0 : t.student_status === "AVAILABLE_NOW" ? 1 : 2);
      return rank(a) - rank(b) || String(a.starts_at || "").localeCompare(String(b.starts_at || ""));
    }), [data]);

  if (isLoading) return <p className="text-sm text-slate-500">Loading tests...</p>;
  if (!tests.length) return <p className="text-sm text-slate-500">No upcoming or live tests right now.</p>;
  return (
    <>
      <ul className="space-y-3">{tests.slice(0, limit).map((test) => <Row key={test.id} test={test} onZero={refetch} />)}</ul>
      {tests.length > limit && <Link to="/student/dashboard/assessments" className="mt-3 inline-block text-xs font-semibold text-emerald-700">See all {tests.length} tests →</Link>}
    </>
  );
}
