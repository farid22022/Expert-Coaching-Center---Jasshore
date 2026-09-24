import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { BookOpen, CalendarDays, CheckCircle2, ClipboardList, Clock, Megaphone, X } from "lucide-react";

import api, { getApiErrorMessage } from "../../services/api.js";
import { studentDashboardApi } from "../../services/resourceApi.js";
import RoleDashboardShell from "../../components/layout/RoleDashboardShell.jsx";
import { studentNav } from "./StudentPortalPages.jsx";

function StatCard({ icon: Icon, label, value }) {
  return <div className="rounded-lg border border-emerald-100 bg-white p-4 shadow-sm"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-50 text-emerald-700"><Icon size={20} /></span><div><p className="text-2xl font-black text-slate-950">{value}</p><p className="text-sm font-bold text-slate-500">{label}</p></div></div></div>;
}

function CourseImage({ course, className }) {
  return <div className={`relative overflow-hidden bg-emerald-900 ${className}`}><img src={course.cover_image || "/jasshoreExpert.png"} alt="" className="absolute inset-0 h-full w-full object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }} /><div className="relative z-10 flex h-full min-h-full items-center justify-center bg-emerald-950/30 p-5 text-center font-black text-white">{course.program}</div></div>;
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
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      studentDashboardApi.list(),
      api.get("/assessments/student/assessments/dashboard/").then((response) => response.data),
      api.get("/assessments/student/assessments/performance/").then((response) => response.data).catch(() => null),
      api.get("/assessments/student/assessments/history/").then((response) => response.data).catch(() => null),
      api.get("/sms/notifications/unread_count/").then((response) => response.data?.data || response.data).catch(() => ({ unread: 0 })),
      api.get("/assessments/student/assessments/materials/").then((response) => response.data?.data || response.data || []).catch(() => []),
      api.get("/sms/notifications/?page_size=5").then((response) => { const payload = response.data?.data || response.data; return Array.isArray(payload) ? payload : payload?.results || []; }).catch(() => []),
    ]).then(([learningData, assessmentData, performanceData, historyData, notificationData, materialData, notificationList]) => {
      setLearning(learningData); setDashboard(assessmentData);
      if (performanceData) setPerformance(performanceData);
      if (historyData) setHistory(historyData);
      setUnread(notificationData?.unread || notificationData?.data?.unread || 0);
      setMaterials(Array.isArray(materialData) ? materialData : materialData?.results || []);
      setAnnouncements(notificationList);
    }).catch((requestError) => setError(getApiErrorMessage(requestError, "Unable to load student dashboard.")));
  }, []);

  const currentCourse = learning.enrollments[0];

  return <RoleDashboardShell roleLabel="Student Portal" title="Student Dashboard" items={studentNav}>
    <section className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-black uppercase text-emerald-700">Expert Coaching Center</p><h1 className="text-2xl font-black text-slate-950 sm:text-3xl">Welcome back{learning.student?.name ? `, ${learning.student.name.split(" ")[0]}` : ""}</h1><p className="mt-1 font-semibold text-slate-500">Continue your learning and keep track of your course activities.</p></div><Link to="/student/courses" className="btn btn-outline border-emerald-700 text-emerald-800">My Courses</Link></header>
      {error && <div className="rounded border border-red-100 bg-red-50 px-4 py-2 text-sm font-bold text-red-700">{error}</div>}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        {currentCourse ? <section className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm sm:p-5"><div className="grid gap-5 md:grid-cols-[250px_minmax(0,1fr)]"><CourseImage course={currentCourse} className="min-h-44 rounded-lg" /><div className="min-w-0"><span className="rounded bg-amber-50 px-3 py-1 text-xs font-black text-amber-800">CURRENT ADMISSION</span><h2 className="mt-3 break-words text-xl font-black text-slate-950 sm:text-2xl">{currentCourse.program}</h2><p className="mt-1 font-semibold text-slate-500">{[currentCourse.session, currentCourse.section].filter(Boolean).join(" - ") || "Active enrollment"}</p><div className="mt-4 flex items-center gap-3"><span className="text-sm font-bold text-slate-600">Progress</span><div className="h-3 flex-1 overflow-hidden rounded-full bg-emerald-100"><div className="h-full rounded-full bg-emerald-600" style={{ width: `${currentCourse.progress?.percentage || 0}%` }} /></div><span className="text-sm font-black text-emerald-800">{currentCourse.progress?.percentage || 0}%</span></div><p className="mt-3 font-bold text-slate-700">{dashboard.live_tests[0] ? `Next: ${dashboard.live_tests[0].title}` : "Your next published lesson will appear here."}</p><div className="mt-4 flex flex-wrap gap-2"><Link className="btn btn-success text-white" to={`/student/courses/${currentCourse.id}`}>Continue Course</Link><Link className="btn btn-outline border-emerald-700 text-emerald-800" to={`/student/courses/${currentCourse.id}`}>Course Outline</Link></div></div></div></section> : <section className="rounded-xl border border-dashed border-emerald-200 bg-white p-8"><h2 className="text-xl font-black text-slate-950">Your learning space is ready</h2><p className="mt-2 font-semibold text-slate-500">Your approved courses will appear here.</p></section>}
        <aside className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm"><div className="flex items-center justify-between gap-2"><h2 className="font-black text-slate-950">Announcements</h2><Megaphone size={18} className="text-emerald-700" /></div>{announcements[0] ? <button type="button" className="mt-4 w-full rounded-lg border border-slate-100 p-3 text-left transition hover:border-emerald-300 hover:bg-emerald-50" onClick={() => setActiveAnnouncement(announcements[0])}><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-amber-50 text-amber-700"><Megaphone size={20} /></span><div className="min-w-0"><p className="line-clamp-2 font-black text-slate-950">{announcements[0].title}</p><p className="mt-1 line-clamp-2 text-sm font-medium text-slate-500">{announcements[0].body}</p><p className="mt-2 flex items-center gap-1 text-xs font-bold text-slate-500"><CalendarDays size={13} />{new Date(announcements[0].created_at).toLocaleDateString()}</p></div></div></button> : <p className="mt-5 rounded-lg border border-dashed border-slate-200 p-4 text-sm font-semibold text-slate-500">No announcements available.</p>}<a href="#notifications" className="btn btn-outline btn-sm mt-4 w-full border-emerald-700 text-emerald-800">See All Announcements</a></aside>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard icon={BookOpen} label="Active Courses" value={learning.enrollments.length} /><StatCard icon={Clock} label="Upcoming Tests" value={dashboard.upcoming_tests} /><StatCard icon={ClipboardList} label="Pending Work" value={performance.assignment_count || history.submissions.length} /><StatCard icon={CheckCircle2} label="Average Score" value={`${Number(performance.average_score || 0).toFixed(1)}%`} /></div>

      <section id="courses"><div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-xl font-black text-slate-950">My Courses</h2><Link to="/student/courses" className="text-sm font-black text-emerald-700">View all</Link></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{learning.enrollments.slice(0, 3).map((course) => <article key={course.id} className="overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-sm"><CourseImage course={course} className="h-40" /><div className="p-4"><p className="font-black text-slate-950">{course.program}</p><p className="mt-1 text-sm font-semibold text-slate-500">{[course.session, course.section].filter(Boolean).join(" - ") || "Active enrollment"}</p><div className="mt-3 h-2 overflow-hidden rounded-full bg-emerald-100"><div className="h-full rounded-full bg-emerald-600" style={{ width: `${course.progress?.percentage || 0}%` }} /></div><Link className="btn btn-success btn-sm mt-4 text-white" to={`/student/courses/${course.id}`}>Continue Course</Link></div></article>)}{!learning.enrollments.length && <p className="rounded-lg border border-dashed border-slate-200 bg-white p-5 text-sm font-semibold text-slate-500">Your approved courses will appear here.</p>}</div></section>

      {learning.pending_applications.length > 0 && <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 shadow-sm"><h2 className="text-lg font-black text-slate-950">Admission Applications</h2><div className="mt-3 grid gap-3">{learning.pending_applications.map((application) => <article key={application.id} className="rounded border border-amber-100 bg-white p-4"><p className="font-black">{application.program}</p><p className="text-sm font-semibold text-slate-600">Application #{application.application_no}</p><p className="mt-2 text-sm font-bold text-amber-800">Status: {application.status.replaceAll("_", " ")}</p>{application.rejection_reason && <p className="mt-2 text-sm text-red-700">Reason: {application.rejection_reason}</p>}</article>)}</div></section>}

      <section id="assessments" className="rounded-xl border border-base-300 bg-white p-4 shadow-sm sm:p-5"><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-black text-slate-950">Upcoming Activities</h2><Link to="/student/assessments" className="text-sm font-black text-emerald-700">View all assessments</Link></div><div className="mt-4 grid gap-3 md:grid-cols-2">{dashboard.live_tests.map((test) => <div key={test.id} className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-4"><span className="badge badge-error text-white">LIVE</span><p className="mt-2 font-black text-slate-950">{test.title}</p><p className="text-sm font-semibold text-slate-500">{test.duration_minutes} minutes</p></div>)}{!dashboard.live_tests.length && <div className="rounded border border-dashed border-slate-200 p-4 text-sm font-semibold text-slate-500">No tests are currently available.</div>}</div></section>
      <section id="materials" className="rounded-xl border border-base-300 bg-white p-4 shadow-sm sm:p-5"><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-black text-slate-950">Study Materials</h2><Link to="/student/materials" className="text-sm font-black text-emerald-700">View all materials</Link></div><div className="mt-4 grid gap-3 md:grid-cols-2">{materials.slice(0, 2).map((item) => <article key={item.id} className="rounded border border-emerald-100 bg-emerald-50/40 p-4"><p className="font-black">{item.title}</p><p className="text-sm font-semibold text-slate-500">{item.description || item.material_type}</p></article>)}{!materials.length && <p className="text-sm font-semibold text-slate-500">No study materials have been published yet.</p>}</div></section>
      <section className="rounded-xl border border-base-300 bg-white p-4 shadow-sm sm:p-5"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-black text-slate-950">Analytics</h2><span className="text-sm font-semibold text-slate-500">Your activity at a glance</span></div><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><StatCard icon={BookOpen} label="Course Completion" value={`${currentCourse?.progress?.percentage || 0}%`} /><StatCard icon={CheckCircle2} label="Tests Completed" value={history.attempts.length} /><StatCard icon={ClipboardList} label="Assignments Submitted" value={history.submissions.length} /><StatCard icon={Clock} label="MCQ Performance" value={`${Number(performance.average_score || 0).toFixed(1)}%`} /></div></section>
      <section id="notifications" className="rounded-xl border border-base-300 bg-white p-4 shadow-sm sm:p-5"><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-black text-slate-950">Notifications</h2><Link to="/student/notifications" className="text-sm font-black text-emerald-700">View all</Link></div><p className="mt-2 text-sm font-semibold text-slate-500">{unread} unread notifications.</p></section>
    </section>
    {activeAnnouncement && <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/65 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Announcement"><div className="relative max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-xl border border-emerald-100 bg-white p-6 shadow-2xl"><button type="button" className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3" onClick={() => setActiveAnnouncement(null)} aria-label="Close announcement"><X size={18} /></button><span className="grid h-12 w-12 place-items-center rounded-full bg-amber-50 text-amber-700"><Megaphone size={24} /></span><h2 className="mt-4 pr-8 text-xl font-black text-slate-950">{activeAnnouncement.title}</h2><p className="mt-2 flex items-center gap-1 text-sm font-bold text-slate-500"><CalendarDays size={15} />{new Date(activeAnnouncement.created_at).toLocaleString()}</p><div className="mt-5 whitespace-pre-wrap rounded-lg bg-emerald-50 p-4 font-medium leading-7 text-slate-700">{activeAnnouncement.body}</div>{activeAnnouncement.target_url && <a href={activeAnnouncement.target_url} target="_blank" rel="noreferrer" className="btn btn-success btn-sm mt-5 text-white">Open related item</a>}</div></div>}
  </RoleDashboardShell>;
}
