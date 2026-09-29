import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, BookOpen, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock, Megaphone, MessageSquare } from "lucide-react";
import { StudentMotion } from "../../components/common/StudentMotion.jsx";
import Modal from "../../components/common/Modal.jsx";
import SafeHtml from "../../components/common/SafeHtml.jsx";
import { API_BASE_URL } from "../../services/api.js";

const percent = (course) => Math.min(100, Math.max(0, Number(course?.progress?.percentage) || 0));
const dateKey = (date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
const coursePath = (course) => `/student/courses/${course.id}`;

export function CourseArtwork({ course, className = "" }) {
  const [failed, setFailed] = useState(false);
  const source = course.cover_image;
  return <div className={`relative overflow-hidden rounded-lg bg-emerald-50 ${className}`}>
    <img className={`course-art ${!source || failed ? "!object-contain p-4" : ""}`} loading="lazy" alt={source && !failed ? course.program : ""}
      src={source && !failed ? (/^https?:/.test(source) ? source : `${API_BASE_URL.replace(/\/api\/v1$/, "")}${source}`) : "/expertjasshore/undraw_education_3vwh.svg"}
      onError={() => setFailed(true)} />
  </div>;
}

function Progress({ course }) {
  return <div className="flex items-center gap-3 text-sm text-slate-500"><span>Progress</span><progress aria-label={`${course.program} progress`} value={percent(course)} max="100" className="progress progress-success h-2 flex-1"/><span className="tabular-nums">{percent(course)}%</span></div>;
}

export function LearningCourseCard({ course, index = 0 }) {
  return <StudentMotion as="article" index={index} className="learning-panel flex h-full flex-col p-3 sm:p-4">
    <Link to={coursePath(course)} aria-label={`Continue ${course.program}`} className="relative block"><CourseArtwork course={course}/><span className="absolute left-3 top-3 rounded-md bg-emerald-700 px-3 py-1 text-xs font-semibold text-white">My course</span></Link>
    <h3 className="mt-4 text-lg font-bold leading-snug">{course.program}</h3>
    <p className="mt-2 text-sm text-slate-500">{[course.session, course.section].filter(Boolean).join(" · ") || "Active enrollment"}</p>
    <div className="mt-4"><Progress course={course}/></div>
    <div className="mt-auto pt-5"><Link className="learning-button primary" to={coursePath(course)}>Continue Course <ArrowUpRight size={16}/></Link></div>
  </StudentMotion>;
}

function LearningAnalytics({ history }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const [range, setRange] = useState(7);
  const events = useMemo(() => [...(history.attempts || []), ...(history.submissions || [])]
    .filter((row) => row.submitted_at)
    .map((row) => new Date(row.submitted_at)).filter((date) => !Number.isNaN(date.getTime())), [history]);
  const today = new Date();
  const month = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const activeDays = new Set(events.map(dateKey));
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const chart = Array.from({ length: range }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - range + index + 1);
    return { date, count: events.filter((event) => dateKey(event) === dateKey(date)).length };
  });
  const max = Math.max(1, ...chart.map((day) => day.count));
  const total = chart.reduce((sum, day) => sum + day.count, 0);
  return <section aria-label="Learning analytics">
    <StudentMotion as="header"><h2 className="mb-4 text-xl font-bold">Analytics</h2></StudentMotion>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)]">
      <StudentMotion className="learning-panel p-5 sm:p-6" index={1}>
        <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-lg font-bold">Learning activity</h3><div className="flex items-center gap-2 text-xs text-slate-500"><button aria-label="Previous month" className="rounded p-1 hover:bg-slate-100" onClick={() => setMonthOffset((n) => n - 1)}><ChevronLeft size={17}/></button><span>{month.toLocaleDateString(undefined, {month:"short",year:"numeric"})}</span><button aria-label="Next month" disabled={monthOffset >= 0} className="rounded p-1 hover:bg-slate-100 disabled:opacity-30" onClick={() => setMonthOffset((n) => n + 1)}><ChevronRight size={17}/></button></div></div>
        <div className="mt-6 grid grid-cols-7 gap-2" aria-label="Days with submitted work">{["S","M","T","W","T","F","S"].map((day,i) => <span key={i} className="text-center text-xs text-slate-400">{day}</span>)}{Array.from({length:month.getDay()}, (_,i) => <span key={`empty-${i}`}/>)}{Array.from({length:days}, (_,i) => {
          const date = new Date(month.getFullYear(), month.getMonth(), i + 1);
          const active = activeDays.has(dateKey(date));
          return <span key={i} title={`${date.toLocaleDateString()}: ${active ? "Work submitted" : "No submissions"}`} className={`grid aspect-square max-h-11 place-items-center rounded text-sm ${active ? "bg-emerald-600 font-bold text-white" : "bg-slate-100 text-slate-500"} ${dateKey(date) === dateKey(today) ? "ring-2 ring-emerald-500 ring-offset-2" : ""}`}>{i+1}</span>;
        })}</div><p className="mt-5 flex items-center gap-2 text-xs text-slate-500"><span className="h-2 w-2 rounded bg-emerald-600"/> Days with a test or assignment submission</p>
      </StudentMotion>
      <StudentMotion className="learning-panel p-5 sm:p-6" index={2}>
        <div className="flex items-center justify-between gap-3"><h3 className="text-lg font-bold">Completed activities</h3><select aria-label="Activity chart period" value={range} onChange={(e) => setRange(Number(e.target.value))} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500"><option value={7}>Last 7 days</option><option value={30}>Last 30 days</option></select></div>
        <p className="mt-4 inline-flex items-center gap-2 rounded bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700"><CheckCircle2 size={14}/>Total: {total} submissions</p>
        <div className="relative mt-6 h-48 border-b border-slate-200" role="img" aria-label={`${total} submitted tests and assignments in the last ${range} days`}>
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">{Array.from({length:5}, (_,i) => <div key={i} className="border-t border-slate-100"/>)}</div>
          <div className="absolute inset-0 flex items-end gap-1 px-2">{chart.map(({date,count}) => <div key={dateKey(date)} className="group relative flex h-full min-w-0 flex-1 items-end justify-center" title={`${date.toLocaleDateString()}: ${count} submissions`}><div className="w-full max-w-9 origin-bottom rounded-t bg-emerald-500" style={{height:`${count/max*90}%`}}/>{range === 7 && <span className="absolute -bottom-6 whitespace-nowrap text-[10px] text-slate-400">{date.toLocaleDateString(undefined,{day:"numeric",month:"short"})}</span>}</div>)}</div>
          {!total && <div className="absolute inset-0 grid place-items-center text-sm text-slate-400">Your completed work will appear here</div>}
        </div><p className="mt-10 text-xs text-slate-500">Based on your submitted tests and assignments.</p>
      </StudentMotion>
    </div>
  </section>;
}

export default function StudentDashboardView({ learning, dashboard, history, announcements, actions, feedback, error }) {
  const [announcement, setAnnouncement] = useState(null);
  const courses = learning.enrollments || [];
  const current = courses.find((course) => percent(course) < 100) || courses[0];
  return <div className="mx-auto max-w-[1320px] space-y-7">
    <StudentMotion as="header" className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">Your learning space</p><h1 className="mt-1 text-2xl font-bold">Welcome back{learning.student?.name ? `, ${learning.student.name.split(" ")[0]}` : ""}</h1></div><Link className="text-sm font-semibold text-emerald-700" to="/student/progress">View my progress <ArrowUpRight className="inline" size={15}/></Link></StudentMotion>
    {error && <StudentMotion className="rounded-lg bg-red-50 p-4 text-red-700" role="alert">{error}</StudentMotion>}
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-6">
        <StudentMotion as="section" index={1} className="learning-panel p-4 sm:p-5">
          {current ? <div className="grid items-center gap-5 sm:grid-cols-[minmax(150px,0.65fr)_minmax(0,1fr)]"><CourseArtwork course={current}/><div><span className="rounded-md bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">Continue learning</span><h2 className="mb-3 mt-3 text-xl font-bold">{current.program}</h2><Progress course={current}/><p className="mt-3 text-sm text-slate-500">{percent(current) === 100 ? "All currently published activities completed. Well done!" : `${current.progress?.completed_units || 0} of ${current.progress?.total_units || 0} published activities completed`}</p><div className="mt-4 flex flex-wrap gap-2"><Link className="learning-button primary" to={coursePath(current)}>Continue Course</Link><Link className="learning-button" to={coursePath(current)}>Course Outline</Link></div></div></div> : <div className="py-6 text-center"><BookOpen className="mx-auto text-emerald-600"/><h2 className="mt-3 text-xl font-bold">Your learning space is ready</h2><p className="mt-2 text-sm text-slate-500">Your approved courses will appear here.</p><Link className="learning-button mt-4" to="/admission/online">Explore admissions</Link></div>}
        </StudentMotion>
        <section><StudentMotion as="header" index={2} className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold">All Courses</h2><Link className="text-sm text-emerald-700" to="/student/courses">View all</Link></StudentMotion><div className="grid gap-5 sm:grid-cols-2">{courses.map((course,index) => <LearningCourseCard key={course.id} course={course} index={index}/>)}</div></section>
      </div>
      <aside className="space-y-6">
        <StudentMotion index={2} className="learning-panel p-4"><div className="flex items-center justify-between"><h2 className="font-bold">Announcements</h2><Megaphone size={18} className="text-amber-500"/></div>{announcements[0] ? <button className="mt-4 w-full rounded-xl border border-slate-100 p-3 text-left hover:bg-slate-50" onClick={() => setAnnouncement(announcements[0])}><p className="flex items-center gap-1 text-xs text-slate-400"><CalendarDays size={12}/>{new Date(announcements[0].created_at).toLocaleDateString()}</p><p className="mt-2 font-semibold">{announcements[0].title}</p><p className="mt-2 line-clamp-3 text-sm text-slate-500">{(announcements[0].body || "").replace(/<[^>]*>/g, " ")}</p><span className="mt-3 block text-xs font-semibold text-emerald-700">View details →</span></button> : <p className="py-6 text-sm text-slate-500">No announcements yet.</p>}<Link className="learning-button mt-4 w-full" to="/student/notifications">See All Announcements</Link></StudentMotion>
        <StudentMotion index={3} className="learning-panel p-4"><h2 className="flex items-center gap-2 font-bold"><Clock size={17} className="text-emerald-600"/> Upcoming activities</h2><div className="mt-4 space-y-3">{(dashboard.live_tests || []).slice(0,4).map((test,i) => <StudentMotion key={test.id} index={i} className="rounded-lg bg-emerald-50 p-3"><Link to="/student/assessments" className="text-sm font-semibold text-emerald-800">{test.title}</Link><p className="mt-1 text-xs text-emerald-700">{test.duration_minutes} minutes · Available now</p></StudentMotion>)}{!dashboard.live_tests?.length && <p className="text-sm text-slate-500">No assessments are available right now.</p>}</div></StudentMotion>
        <StudentMotion index={3} className="learning-panel p-4"><h2 className="flex items-center gap-2 font-bold"><MessageSquare size={17} className="text-emerald-600"/> Teacher guidance</h2><p className="mt-3 text-sm leading-6 text-slate-500">Review your teacher’s feedback and stay on track with your next steps.</p><Link className="learning-button mt-4 w-full" to="/student/feedback">View feedback{feedback.length ? ` (${feedback.length})` : ""}</Link></StudentMotion>
      </aside>
    </div>
    <LearningAnalytics history={history}/>
    {actions.length > 0 && <StudentMotion as="section" className="learning-panel p-5"><h2 className="text-lg font-bold">Your next steps</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{actions.map((item,i) => <StudentMotion key={item.id} index={i} className="rounded-lg bg-amber-50 p-4"><p className="text-sm font-semibold">{item.reason}</p><Link className="mt-2 inline-block text-xs font-semibold text-emerald-700" to="/student/actions">View action →</Link></StudentMotion>)}</div></StudentMotion>}
    {(learning.pending_applications || []).length > 0 && <StudentMotion as="section" className="learning-panel p-5"><h2 className="text-lg font-bold">Admission applications</h2>{learning.pending_applications.map((application) => <div key={application.id} className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-amber-50 p-4 text-sm"><div><p className="font-semibold">{application.program}</p><p className="mt-1 text-amber-800">{application.application_no} · {application.status.replaceAll("_"," ")}</p>{application.rejection_reason && <p className="mt-2 text-red-700">{application.rejection_reason}</p>}</div>{application.status === "approved" && application.payment_status !== "paid" && <div className="text-right"><p className="mb-2 font-bold text-amber-900">Payment Required · ৳{Number(application.admission_fee || 0).toLocaleString("en-BD")}</p><Link className="learning-button primary" to={`/student/admissions/${application.id}/payment`}>Pay Now</Link></div>}</div>)}</StudentMotion>}
    <Modal open={Boolean(announcement)} onClose={() => setAnnouncement(null)} title={announcement?.title || "Announcement"} size="md">{announcement && <SafeHtml html={announcement.body} className="p-6 text-sm leading-7"/>}</Modal>
  </div>;
}
