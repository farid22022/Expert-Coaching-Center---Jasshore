import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { AlertCircle, ArrowLeft, Ban, CheckCircle2, Clock, Hourglass, Radio, Timer } from "lucide-react";

import api, { getApiErrorMessage } from "../../services/api.js";
import RoleDashboardShell from "../../components/layout/RoleDashboardShell.jsx";
import SafeHtml from "../../components/common/SafeHtml.jsx";
import { APP_TIME_ZONE, formatAppDateTime, useServerCountdown } from "../../hooks/useServerCountdown.js";
import { StudentTestRunner } from "./StudentCoursePage.jsx";
import { studentNav } from "./studentPortalShared.jsx";

const TERMINAL = new Set(["SUBMITTED", "EXPIRED", "CANCELLED"]);
const pad = (value) => String(value).padStart(2, "0");

function Countdown({ target, serverTime, label, onZero }) {
  const { days, hours, minutes, seconds } = useServerCountdown(target, serverTime, onZero);
  const units = [["Days", days], ["Hours", hours], ["Minutes", minutes], ["Seconds", seconds]];
  return (
    <div>
      <p className="text-sm font-black uppercase text-slate-500">{label}</p>
      {/* Digits are decorative (aria-hidden); the static sentence below is what assistive tech reads,
          so a screen reader isn't interrupted every second. */}
      <div className="mt-3 grid max-w-md grid-cols-4 gap-2 sm:gap-3" aria-hidden="true">
        {units.map(([name, value]) => (
          <div key={name} className="rounded-lg bg-emerald-950 px-1 py-3 text-center text-white">
            <p className="text-2xl font-black tabular-nums sm:text-3xl">{pad(value)}</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-emerald-200 sm:text-xs">{name}</p>
          </div>
        ))}
      </div>
      <p className="sr-only">{label} {formatAppDateTime(target)}</p>
    </div>
  );
}

function StatusBadge({ status, live }) {
  const map = {
    UPCOMING: ["Scheduled", "bg-amber-100 text-amber-800", Clock],
    STARTING_SOON: ["Starting soon", "bg-orange-100 text-orange-800", Hourglass],
    AVAILABLE_NOW: [live ? "Live now" : "Available now", "bg-emerald-100 text-emerald-800", Radio],
    IN_PROGRESS: ["In progress", "bg-blue-100 text-blue-800", Timer],
    SUBMITTED: ["Submitted", "bg-emerald-100 text-emerald-800", CheckCircle2],
    EXPIRED: ["Ended", "bg-slate-200 text-slate-700", Ban],
    CANCELLED: ["Cancelled", "bg-red-100 text-red-700", Ban],
    NOT_AVAILABLE: ["Not available", "bg-slate-200 text-slate-700", Ban],
  };
  const [label, className, Icon] = map[status] || map.NOT_AVAILABLE;
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-black ${className}`}><Icon size={15} aria-hidden="true" />{label}</span>;
}

function Fact({ label, value }) {
  if (value === undefined || value === null || value === "") return null;
  return <div><dt className="text-xs font-black uppercase text-slate-400">{label}</dt><dd className="mt-0.5 font-bold text-slate-900">{value}</dd></div>;
}

function Unavailable({ title, text }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <AlertCircle className="mx-auto text-slate-400" size={40} />
      <h2 className="mt-3 text-xl font-black text-slate-950">{title}</h2>
      <p className="mt-2 font-semibold text-slate-600">{text}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <Link className="btn btn-success text-white" to="/student/dashboard/assessments">View assessments</Link>
        <Link className="btn btn-outline" to="/student/dashboard/courses">My courses</Link>
      </div>
    </div>
  );
}

export default function StudentTestPage() {
  const { assessmentId } = useParams();
  const [test, setTest] = useState(null);
  const [error, setError] = useState(null);
  const [running, setRunning] = useState(false);
  const active = useRef(true);

  // Everything is rebuilt from the URL + authenticated user + backend, so a refresh (or a link
  // opened from a notification in a new tab) lands on the same test with the same countdown.
  const load = useCallback(() => api.get(`/assessments/student/assessments/${assessmentId}/`)
    .then((response) => { if (active.current) { setTest(response.data?.data || response.data); setError(null); } })
    .catch((requestError) => { if (active.current) setError({ status: requestError.response?.status, message: getApiErrorMessage(requestError, "Unable to load this assessment.") }); }), [assessmentId]);

  useEffect(() => {
    active.current = true;
    setTest(null); setError(null); setRunning(false);
    load();
    return () => { active.current = false; };
  }, [load]);

  // Freshness without a manual reload: re-ask the backend when the tab regains focus and once a
  // minute while the test is not in a final state (e.g. the teacher reschedules or cancels it).
  const status = test?.student_status;
  useEffect(() => {
    if (!test || TERMINAL.has(status) || running) return undefined;
    const refresh = () => { if (document.visibilityState !== "hidden") load(); };
    const timer = window.setInterval(refresh, 60000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", refresh); };
  }, [test, status, running, load]);

  const finishRun = () => { setRunning(false); load(); window.dispatchEvent(new Event("notificationschange")); };

  let body;
  if (error && !test) {
    body = error.status === 404
      ? <Unavailable title="This assessment is no longer available" text="It may have been removed, unpublished, or isn't part of a course you're enrolled in." />
      : <Unavailable title="Couldn't load this assessment" text={error.message} />;
  } else if (!test) {
    body = <div className="animate-pulse rounded-xl border border-emerald-100 bg-white p-8 text-sm font-bold text-slate-500">Loading assessment...</div>;
  } else if (test.assessment_type === "assignment" && test.enrollment_id) {
    return <Navigate replace to={`/student/courses/${test.enrollment_id}?open=assignment:${test.id}`} />;
  } else if (running) {
    body = <div className="learning-panel p-5 sm:p-7"><StudentTestRunner item={test} autoStart close={finishRun} onDone={load} /></div>;
  } else {
    const live = test.timing_mode === "live";
    const waiting = status === "UPCOMING" || status === "STARTING_SOON";
    const open = status === "AVAILABLE_NOW" || status === "IN_PROGRESS";
    body = (
      <article className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={status} live={live} />
          <span className="text-sm font-black uppercase text-emerald-700">{live ? "Live MCQ" : test.timing_mode === "scheduled" ? "Scheduled test" : test.assessment_type === "exam" ? "Online test" : "MCQ"}</span>
        </div>
        <h2 className="mt-3 text-2xl font-black text-slate-950 sm:text-3xl">{test.title}</h2>
        <p className="mt-1 font-semibold text-slate-500">{[test.subject_name, test.course_title].filter(Boolean).join(" · ")}</p>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Fact label="Teacher" value={test.teacher_name} />
          <Fact label={`Starts (${APP_TIME_ZONE})`} value={formatAppDateTime(test.starts_at)} />
          <Fact label={`Ends (${APP_TIME_ZONE})`} value={formatAppDateTime(test.ends_at)} />
          <Fact label="Duration" value={`${test.duration_minutes} minutes`} />
          <Fact label="Questions" value={test.question_count || ""} />
          <Fact label="Attempts allowed" value={test.attempts_allowed === 0 ? "Unlimited" : test.attempts_allowed} />
        </dl>

        {waiting && (
          <section className="mt-7 rounded-xl border border-amber-200 bg-amber-50 p-5" aria-label="Start countdown">
            <Countdown target={test.starts_at} serverTime={test.server_time} label="Starts in" onZero={load} />
            <p className="mt-4 text-sm font-semibold text-slate-600">The Start button appears automatically when the test opens. You don't need to refresh.</p>
          </section>
        )}

        {open && (
          <section className="mt-7 rounded-xl border border-emerald-200 bg-emerald-50 p-5" aria-label="Test is available">
            <p className="flex items-center gap-2 text-lg font-black text-emerald-900"><Radio size={18} aria-hidden="true" /> {status === "IN_PROGRESS" ? "Your attempt is in progress." : live ? "The live test is on now." : "This test is now available."}</p>
            {test.ends_at && <div className="mt-4"><Countdown target={test.ends_at} serverTime={test.server_time} label="Closes in" onZero={load} /></div>}
            <button type="button" className="btn btn-success mt-5 text-white" onClick={() => setRunning(true)}>
              {status === "IN_PROGRESS" ? "Resume Test" : live || test.timing_mode === "scheduled" || test.assessment_type === "exam" ? "Start Test" : "Start Practice"}
            </button>
          </section>
        )}

        {status === "SUBMITTED" && (
          <section className="mt-7 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="flex items-center gap-2 text-lg font-black text-emerald-900"><CheckCircle2 size={18} aria-hidden="true" /> You've completed this test.</p>
            {test.attempt && <p className="mt-2 font-bold text-slate-700">Score: {test.attempt.score} / {test.attempt.total_marks}</p>}
            <div className="mt-4 flex flex-wrap gap-2"><Link className="btn btn-success text-white" to={`/student/tests/${test.id}/review`}>Review answers</Link><Link className="btn btn-outline btn-success" to="/student/results">View results</Link></div>
          </section>
        )}
        {status === "EXPIRED" && <p role="status" className="mt-7 rounded-xl border border-slate-200 bg-slate-50 p-5 font-bold text-slate-700">{live ? "This live test has ended." : "This test is no longer open."}</p>}
        {status === "CANCELLED" && <p role="status" className="mt-7 rounded-xl border border-red-200 bg-red-50 p-5 font-bold text-red-700">This test has been cancelled.</p>}
        {status === "NOT_AVAILABLE" && <p role="status" className="mt-7 rounded-xl border border-slate-200 bg-slate-50 p-5 font-bold text-slate-700">This test isn't available yet.</p>}

        {(test.instructions || test.description) && (
          <section className="mt-7">
            <h3 className="font-black text-slate-950">Instructions</h3>
            <SafeHtml html={test.instructions || test.description} className="mt-2 text-slate-600" />
          </section>
        )}
      </article>
    );
  }

  return (
    <RoleDashboardShell roleLabel="Student Portal" title="Assessment" items={studentNav}>
      <section className="mx-auto max-w-4xl">
        <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap gap-2">
          <Link className="btn btn-outline btn-sm" to="/student/dashboard/assessments"><ArrowLeft size={15} /> All assessments</Link>
          {test?.enrollment_id && <Link className="btn btn-ghost btn-sm" to={`/student/courses/${test.enrollment_id}`}>Back to course</Link>}
        </nav>
        {body}
      </section>
    </RoleDashboardShell>
  );
}
