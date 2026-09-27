import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, BookOpen, CalendarDays, CheckCircle2, ClipboardList, Clock, Flame, MessageSquare, Megaphone, Sparkles, X } from "lucide-react";

import api, { getApiErrorMessage } from "../../services/api.js";
import { studentDashboardApi, studentPortalApi } from "../../services/resourceApi.js";
import RoleDashboardShell from "../../components/layout/RoleDashboardShell.jsx";
import SafeHtml from "../../components/common/SafeHtml.jsx";
import { studentNav } from "./studentPortalShared.jsx";

function computeLearningStreak(history) {
  const days = new Set();
  (history.attempts || []).forEach((row) => { if (row.submitted_at) days.add(new Date(row.submitted_at).toDateString()); });
  (history.submissions || []).forEach((row) => { const date = row.submitted_at || row.evaluated_at; if (date) days.add(new Date(date).toDateString()); });
  let streak = 0;
  const cursor = new Date();
  // Today doesn't need activity yet for the streak to still be "alive" - only yesterday onward matters.
  if (!days.has(cursor.toDateString())) cursor.setDate(cursor.getDate() - 1);
  while (days.has(cursor.toDateString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function daysUntil(dateString) {
  if (!dateString) return null;
  const diff = new Date(dateString) - new Date(new Date().toDateString());
  return Math.round(diff / 86400000);
}

function DashboardSkeleton() {
  return (
    <section className="mx-auto max-w-7xl space-y-6">
      <div className="h-16 animate-pulse rounded-lg bg-white/60" />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="h-56 animate-pulse rounded-xl bg-white/60" />
        <div className="h-56 animate-pulse rounded-xl bg-white/60" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-20 animate-pulse rounded-lg bg-white/60" />)}
      </div>
      <div className="h-48 animate-pulse rounded-xl bg-white/60" />
    </section>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return <div className="rounded-lg border border-emerald-100 bg-white p-4 shadow-sm"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-50 text-emerald-700"><Icon size={20} /></span><div><p className="text-2xl font-black text-slate-950">{value}</p><p className="text-sm font-bold text-slate-500">{label}</p></div></div></div>;
}

function CourseImage({ course, className }) {
  if (!course.cover_image) {
    return (
      <div className={`grid place-items-center gap-2 bg-gradient-to-br from-emerald-800 to-emerald-950 p-4 text-center ${className}`}>
        <img src="/jasshoreExpert.png" alt="" className="h-12 w-12 rounded-full bg-white/90 p-1 shadow-md" />
        <p className="font-black leading-tight text-white">{course.program}</p>
      </div>
    );
  }
  return <div className={`relative overflow-hidden bg-emerald-900 ${className}`}><img src={course.cover_image} alt="" className="absolute inset-0 h-full w-full object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }} /><div className="relative z-10 flex h-full min-h-full items-center justify-center bg-emerald-950/30 p-5 text-center font-black text-white">{course.program}</div></div>;
}

export default function StudentDashboard() {
  const [dashboard, setDashboard] = useState({ upcoming_tests: 0, live_tests: [] });
  const [performance, setPerformance] = useState({ assignment_count: 0, average_score: 0 });
  const [history, setHistory] = useState({ attempts: [], submissions: [] });
  const [unread, setUnread] = useState(0);
  const [materials, setMaterials] = useState([]);
  const [learning, setLearning] = useState({ enrollments: [], pending_applications: [] });
  const [announcements, setAnnouncements] = useState([]);
  const [activeAnnouncement, setActiveAnnouncement] = useState(null);
  const [recommended, setRecommended] = useState({ interventions: [], feedback: [] });
  const [actions, setActions] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      studentDashboardApi.list(),
      api.get("/assessments/student/assessments/dashboard/").then((response) => response.data),
      api.get("/assessments/student/assessments/performance/").then((response) => response.data).catch(() => null),
      api.get("/assessments/student/assessments/history/").then((response) => response.data).catch(() => null),
      api.get("/sms/notifications/unread_count/").then((response) => response.data?.data || response.data).catch(() => ({ unread: 0 })),
      api.get("/assessments/student/assessments/materials/").then((response) => response.data?.data || response.data || []).catch(() => []),
      api.get("/sms/notifications/?page_size=5").then((response) => { const payload = response.data?.data || response.data; return Array.isArray(payload) ? payload : payload?.results || []; }).catch(() => []),
      api.get("/assessments/student/assessments/recommended/").then((response) => response.data?.data || response.data).catch(() => ({ interventions: [], feedback: [] })),
      studentPortalApi.actions().catch(() => []),
      studentPortalApi.feedback().catch(() => []),
    ]).then(([learningData, assessmentData, performanceData, historyData, notificationData, materialData, notificationList, recommendedData, actionsData, feedbackData]) => {
      setLearning(learningData); setDashboard(assessmentData);
      if (performanceData) setPerformance(performanceData);
      if (historyData) setHistory(historyData);
      setUnread(notificationData?.unread || notificationData?.data?.unread || 0);
      setMaterials(Array.isArray(materialData) ? materialData : materialData?.results || []);
      setAnnouncements(notificationList);
      setRecommended(recommendedData || { interventions: [], feedback: [] });
      setActions(Array.isArray(actionsData) ? actionsData : []);
      setFeedback(Array.isArray(feedbackData) ? feedbackData : []);
    }).catch((requestError) => setError(getApiErrorMessage(requestError, "Unable to load student dashboard.")))
      .finally(() => setLoading(false));
  }, []);

  const currentCourse = learning.enrollments[0];
  const learningStreak = useMemo(() => computeLearningStreak(history), [history]);

  const priorityActions = useMemo(() => {
    const openActions = actions
      .filter((item) => item.status !== "completed")
      .map((item) => {
        const remaining = daysUntil(item.deadline);
        const priority = remaining !== null && remaining <= 0 ? "urgent" : remaining !== null && remaining <= 3 ? "soon" : "normal";
        return { ...item, remaining, priority };
      });
    const order = { urgent: 0, soon: 1, normal: 2 };
    return openActions.sort((a, b) => order[a.priority] - order[b.priority]).slice(0, 4);
  }, [actions]);

  if (loading) {
    return <RoleDashboardShell roleLabel="Student Portal" title="Student Dashboard" items={studentNav}><DashboardSkeleton /></RoleDashboardShell>;
  }

  return <RoleDashboardShell roleLabel="Student Portal" title="Student Dashboard" items={studentNav}>
    <section className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-black uppercase text-emerald-700">Expert Coaching Center</p><h1 className="text-2xl font-black text-slate-950 sm:text-3xl">Welcome back{learning.student?.name ? `, ${learning.student.name.split(" ")[0]}` : ""}</h1><p className="mt-1 font-semibold text-slate-500">Continue your learning and keep track of your course activities.</p></div><Link to="/student/courses" className="btn btn-outline border-emerald-700 text-emerald-800">My Courses</Link></header>
      {error && <div className="rounded border border-red-100 bg-red-50 px-4 py-2 text-sm font-bold text-red-700">{error}</div>}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        {currentCourse ? <section className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm sm:p-5"><div className="grid gap-5 md:grid-cols-[250px_minmax(0,1fr)]"><CourseImage course={currentCourse} className="min-h-44 rounded-lg" /><div className="min-w-0"><span className="rounded bg-amber-50 px-3 py-1 text-xs font-black text-amber-800">CURRENT ADMISSION</span><h2 className="mt-3 break-words text-xl font-black text-slate-950 sm:text-2xl">{currentCourse.program}</h2><p className="mt-1 font-semibold text-slate-500">{[currentCourse.session, currentCourse.section].filter(Boolean).join(" - ") || "Active enrollment"}</p><div className="mt-4 flex items-center gap-3"><span className="text-sm font-bold text-slate-600">Progress</span><div className="h-3 flex-1 overflow-hidden rounded-full bg-emerald-100"><div className="h-full rounded-full bg-emerald-600" style={{ width: `${currentCourse.progress?.percentage || 0}%` }} /></div><span className="text-sm font-black text-emerald-800">{currentCourse.progress?.percentage || 0}%</span></div><p className="mt-3 font-bold text-slate-700">{dashboard.live_tests[0] ? `Next: ${dashboard.live_tests[0].title}` : "Your next published lesson will appear here."}</p><div className="mt-4 flex flex-wrap gap-2"><Link className="btn btn-success text-white" to={`/student/courses/${currentCourse.id}`}>Continue Course</Link><Link className="btn btn-outline border-emerald-700 text-emerald-800" to={`/student/courses/${currentCourse.id}`}>Course Outline</Link><Link className="btn btn-outline border-emerald-700 text-emerald-800" to={`/student/courses/${currentCourse.id}/overview`}>Academic Overview</Link></div></div></div></section> : <section className="rounded-xl border border-dashed border-emerald-200 bg-white p-8"><h2 className="text-xl font-black text-slate-950">Your learning space is ready</h2><p className="mt-2 font-semibold text-slate-500">Your approved courses will appear here.</p></section>}
        <aside className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm"><div className="flex items-center justify-between gap-2"><h2 className="font-black text-slate-950">Announcements</h2><Megaphone size={18} className="text-emerald-700" /></div>{announcements[0] ? <button type="button" className="mt-4 w-full rounded-lg border border-slate-100 p-3 text-left transition hover:border-emerald-300 hover:bg-emerald-50" onClick={() => setActiveAnnouncement(announcements[0])}><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-amber-50 text-amber-700"><Megaphone size={20} /></span><div className="min-w-0"><p className="line-clamp-2 font-black text-slate-950">{announcements[0].title}</p><p className="mt-1 line-clamp-2 text-sm font-medium text-slate-500">{announcements[0].body}</p><p className="mt-2 flex items-center gap-1 text-xs font-bold text-slate-500"><CalendarDays size={13} />{new Date(announcements[0].created_at).toLocaleDateString()}</p></div></div></button> : <p className="mt-5 rounded-lg border border-dashed border-slate-200 p-4 text-sm font-semibold text-slate-500">No announcements available.</p>}<a href="#notifications" className="btn btn-outline btn-sm mt-4 w-full border-emerald-700 text-emerald-800">See All Announcements</a></aside>
      </div>

      {priorityActions.length > 0 && (
        <section id="action-required" className="rounded-xl border border-red-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><AlertTriangle size={18} className="text-red-600" /><h2 className="text-lg font-black text-slate-950">Action Required</h2></div><Link to="/student/actions" className="text-sm font-black text-emerald-700">View all</Link></div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {priorityActions.map((item) => {
              const dot = item.priority === "urgent" ? "bg-red-500" : item.priority === "soon" ? "bg-amber-500" : "bg-blue-500";
              return (
                <article key={item.id} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-start gap-2"><span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${dot}`} /><div className="min-w-0"><p className="text-xs font-black uppercase text-slate-500">{item.subject_name || "General"}</p><p className="font-black text-slate-950">{item.reason}</p>{item.deadline && <p className="mt-1 text-xs font-bold text-slate-400">{item.remaining <= 0 ? "Overdue" : `Due in ${item.remaining} day${item.remaining === 1 ? "" : "s"}`}</p>}</div></div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {(recommended.interventions.length > 0 || recommended.feedback.length > 0) && (
        <section id="recommended" className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-2"><Sparkles size={18} className="text-amber-700" /><h2 className="text-lg font-black text-slate-950">Recommended for You</h2></div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {recommended.interventions.map((item) => (
              <article key={`intervention-${item.id}`} className="rounded-lg border border-amber-200 bg-white p-4">
                <p className="text-xs font-black uppercase text-amber-700">{item.subject_name || "General"}</p>
                <p className="mt-1 font-black text-slate-950">{item.intervention_type.replaceAll("_", " ")}</p>
                <p className="mt-1 text-sm font-semibold text-slate-600">{item.reason}</p>
                {item.action_note && <p className="mt-2 text-sm text-slate-500">Teacher assigned: {item.action_note}</p>}
                {item.deadline && <p className="mt-2 text-xs font-bold text-slate-400">Due: {item.deadline}</p>}
                {item.practice_assessment_title && <Link className="btn btn-success btn-sm mt-3 text-white" to="/student/practice">Start Practice</Link>}
              </article>
            ))}
            {recommended.feedback.map((item) => (
              <article key={`feedback-${item.id}`} className="rounded-lg border border-amber-200 bg-white p-4">
                <p className="flex items-center gap-1 text-xs font-black uppercase text-amber-700"><MessageSquare size={13} /> Teacher Feedback · {item.subject_name || "General"}</p>
                <SafeHtml html={item.body} className="mt-2 text-sm font-semibold text-slate-700" />
              </article>
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"><StatCard icon={BookOpen} label="Active Courses" value={learning.enrollments.length} /><StatCard icon={Clock} label="Upcoming Tests" value={dashboard.upcoming_tests} /><StatCard icon={ClipboardList} label="Pending Work" value={performance.assignment_count || history.submissions.length} /><StatCard icon={CheckCircle2} label="Average Score" value={`${Number(performance.average_percentage || 0).toFixed(1)}%`} /><StatCard icon={Flame} label="Learning Streak" value={`${learningStreak} day${learningStreak === 1 ? "" : "s"}`} /></div>

      <section id="courses"><div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-xl font-black text-slate-950">My Courses</h2><Link to="/student/courses" className="text-sm font-black text-emerald-700">View all</Link></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{learning.enrollments.slice(0, 3).map((course) => <article key={course.id} className="overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-sm"><CourseImage course={course} className="h-40" /><div className="p-4"><p className="font-black text-slate-950">{course.program}</p><p className="mt-1 text-sm font-semibold text-slate-500">{[course.session, course.section].filter(Boolean).join(" - ") || "Active enrollment"}</p><div className="mt-3 h-2 overflow-hidden rounded-full bg-emerald-100"><div className="h-full rounded-full bg-emerald-600" style={{ width: `${course.progress?.percentage || 0}%` }} /></div><div className="mt-4 flex flex-wrap items-center gap-3"><Link className="btn btn-success btn-sm text-white" to={`/student/courses/${course.id}`}>Continue Course</Link><Link className="text-sm font-black text-emerald-700 hover:underline" to={`/student/courses/${course.id}/overview`}>Academic Overview</Link></div></div></article>)}{!learning.enrollments.length && <p className="rounded-lg border border-dashed border-slate-200 bg-white p-5 text-sm font-semibold text-slate-500">Your approved courses will appear here.</p>}</div></section>

      {learning.pending_applications.length > 0 && <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 shadow-sm"><h2 className="text-lg font-black text-slate-950">Admission Applications</h2><div className="mt-3 grid gap-3">{learning.pending_applications.map((application) => <article key={application.id} className="rounded border border-amber-100 bg-white p-4"><p className="font-black">{application.program}</p><p className="text-sm font-semibold text-slate-600">Application #{application.application_no}</p><p className="mt-2 text-sm font-bold text-amber-800">Status: {application.status.replaceAll("_", " ")}</p>{application.rejection_reason && <p className="mt-2 text-sm text-red-700">Reason: {application.rejection_reason}</p>}</article>)}</div></section>}

      <section id="assessments" className="rounded-xl border border-base-300 bg-white p-4 shadow-sm sm:p-5"><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-black text-slate-950">Upcoming Activities</h2><Link to="/student/assessments" className="text-sm font-black text-emerald-700">View all assessments</Link></div><div className="mt-4 grid gap-3 md:grid-cols-2">{dashboard.live_tests.map((test) => <div key={test.id} className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-4"><span className="badge badge-error text-white">LIVE</span><p className="mt-2 font-black text-slate-950">{test.title}</p><p className="text-sm font-semibold text-slate-500">{test.duration_minutes} minutes</p></div>)}{!dashboard.live_tests.length && <div className="rounded border border-dashed border-slate-200 p-4 text-sm font-semibold text-slate-500">No tests are currently available.</div>}</div></section>
      <section id="materials" className="rounded-xl border border-base-300 bg-white p-4 shadow-sm sm:p-5"><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-black text-slate-950">Study Materials</h2><Link to="/student/materials" className="text-sm font-black text-emerald-700">View all materials</Link></div><div className="mt-4 grid gap-3 md:grid-cols-2">{materials.slice(0, 2).map((item) => <article key={item.id} className="rounded border border-emerald-100 bg-emerald-50/40 p-4"><p className="font-black">{item.title}</p>{item.description ? <SafeHtml html={item.description} className="text-sm font-semibold text-slate-500" /> : <p className="text-sm font-semibold text-slate-500">{item.material_type}</p>}</article>)}{!materials.length && <p className="text-sm font-semibold text-slate-500">No study materials have been published yet.</p>}</div></section>
      <section className="rounded-xl border border-base-300 bg-white p-4 shadow-sm sm:p-5"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-black text-slate-950">Analytics</h2><span className="text-sm font-semibold text-slate-500">Your activity at a glance</span></div><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><StatCard icon={BookOpen} label="Course Completion" value={`${currentCourse?.progress?.percentage || 0}%`} /><StatCard icon={CheckCircle2} label="Tests Completed" value={history.attempts.length} /><StatCard icon={ClipboardList} label="Assignments Submitted" value={history.submissions.length} /><StatCard icon={Clock} label="MCQ Performance" value={`${Number(performance.average_percentage || 0).toFixed(1)}%`} /></div></section>
      {feedback.length > 0 && (
        <section id="feedback" className="rounded-xl border border-base-300 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-lg font-black text-slate-950"><MessageSquare size={18} className="text-emerald-700" /> Recent Feedback</h2><Link to="/student/feedback" className="text-sm font-black text-emerald-700">View All Feedback</Link></div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {feedback.slice(0, 3).map((item) => (
              <article key={item.id} className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-4">
                <p className="text-xs font-black uppercase text-emerald-700">{item.teacher_name || "Your teacher"}{item.subject_name ? ` · ${item.subject_name}` : ""}</p>
                <SafeHtml html={item.body} className="mt-2 text-sm font-semibold text-slate-700" />
              </article>
            ))}
          </div>
        </section>
      )}
      <section id="notifications" className="rounded-xl border border-base-300 bg-white p-4 shadow-sm sm:p-5"><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-black text-slate-950">Notifications</h2><Link to="/student/notifications" className="text-sm font-black text-emerald-700">View all</Link></div><p className="mt-2 text-sm font-semibold text-slate-500">{unread} unread notifications.</p></section>
    </section>
    {activeAnnouncement && <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/65 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Announcement"><div className="relative max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-xl border border-emerald-100 bg-white p-6 shadow-2xl"><button type="button" className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3" onClick={() => setActiveAnnouncement(null)} aria-label="Close announcement"><X size={18} /></button><span className="grid h-12 w-12 place-items-center rounded-full bg-amber-50 text-amber-700"><Megaphone size={24} /></span><h2 className="mt-4 pr-8 text-xl font-black text-slate-950">{activeAnnouncement.title}</h2><p className="mt-2 flex items-center gap-1 text-sm font-bold text-slate-500"><CalendarDays size={15} />{new Date(activeAnnouncement.created_at).toLocaleString()}</p><SafeHtml html={activeAnnouncement.body} className="mt-5 rounded-lg bg-emerald-50 p-4 font-medium leading-7 text-slate-700" />{activeAnnouncement.target_url && <a href={activeAnnouncement.target_url} target="_blank" rel="noreferrer" className="btn btn-success btn-sm mt-5 text-white">Open related item</a>}</div></div>}
  </RoleDashboardShell>;
}
