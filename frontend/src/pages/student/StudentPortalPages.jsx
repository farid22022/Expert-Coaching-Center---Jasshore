import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, BookOpen, CheckCircle2, ClipboardList, FileText, LayoutDashboard, UserRound } from "lucide-react";

import api, { getApiErrorMessage } from "../../services/api.js";
import { getStoredUser } from "../../services/authApi.js";
import { studentDashboardApi } from "../../services/resourceApi.js";
import RoleDashboardShell from "../../components/layout/RoleDashboardShell.jsx";

export const studentNav = [
  { label: "Dashboard", to: "/student/dashboard", icon: LayoutDashboard, end: true },
  { label: "My Courses", to: "/student/courses", icon: BookOpen },
  { label: "Assessments", to: "/student/assessments", icon: CheckCircle2 },
  { label: "Study Materials", to: "/student/materials", icon: FileText },
  { label: "Notifications", to: "/student/notifications", icon: Bell },
  { label: "Profile", to: "/student/profile", icon: UserRound },
];

function PortalPage({ title, eyebrow, children }) {
  return <RoleDashboardShell roleLabel="Student Portal" title={title} items={studentNav}><section className="mx-auto max-w-7xl"><header className="mb-6"><p className="text-sm font-black uppercase text-emerald-700">{eyebrow || "Expert Coaching Center"}</p><h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">{title}</h1></header>{children}</section></RoleDashboardShell>;
}

function LoadingOrError({ loading, error }) {
  if (loading) return <div className="animate-pulse rounded-xl border border-emerald-100 bg-white p-8 text-sm font-bold text-slate-500">Loading your learning data...</div>;
  if (error) return <div className="rounded-xl border border-red-100 bg-red-50 p-4 font-bold text-red-700">{error}</div>;
  return null;
}

export function StudentCoursesPage() {
  const [courses, setCourses] = useState([]); const [error, setError] = useState(""); const [loading, setLoading] = useState(true);
  useEffect(() => { studentDashboardApi.list().then((data) => setCourses(data.enrollments || [])).catch((e) => setError(getApiErrorMessage(e, "Unable to load courses."))).finally(() => setLoading(false)); }, []);
  return <PortalPage title="My Courses"><LoadingOrError loading={loading} error={error} />{!loading && !error && <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{courses.map((course) => <article key={course.id} className="overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-sm"><div className="relative h-44 overflow-hidden bg-emerald-950"><img src={course.cover_image || "/jasshoreExpert.png"} alt="" className="h-full w-full object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }} /><div className="absolute inset-0 grid place-items-center bg-emerald-950/35 p-4 text-center font-black text-white">{course.program}</div></div><div className="p-4"><h2 className="font-black text-slate-950">{course.program}</h2><p className="mt-1 text-sm font-semibold text-slate-500">{[course.session, course.section].filter(Boolean).join(" - ") || "Active enrollment"}</p><div className="mt-4 h-2 overflow-hidden rounded-full bg-emerald-100"><div className="h-full rounded-full bg-emerald-600" style={{ width: `${course.progress?.percentage || 0}%` }} /></div><p className="mt-2 text-xs font-bold text-emerald-800">{course.progress?.percentage || 0}% complete · {course.progress?.completed_units || 0}/{course.progress?.total_units || 0} activities</p><Link className="btn btn-success btn-sm mt-4 text-white" to={`/student/courses/${course.id}`}>Continue Course</Link></div></article>)}{!courses.length && <div className="rounded-xl border border-dashed border-emerald-200 bg-white p-8 text-center font-semibold text-slate-500">Your approved courses will appear here.</div>}</div>}</PortalPage>;
}

export function StudentAssessmentsPage() {
  const [data, setData] = useState({ live_tests: [], upcoming_tests: 0 }); const [error, setError] = useState(""); const [loading, setLoading] = useState(true);
  useEffect(() => { api.get("/assessments/student/assessments/dashboard/").then((r) => setData(r.data?.data || r.data)).catch((e) => setError(getApiErrorMessage(e, "Unable to load assessments."))).finally(() => setLoading(false)); }, []);
  return <PortalPage title="Assessments"><LoadingOrError loading={loading} error={error} />{!loading && !error && <div className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h2 className="font-black text-slate-950">Live and upcoming tests</h2><span className="badge badge-success text-white">{data.upcoming_tests || 0} upcoming</span></div><div className="mt-4 grid gap-3 md:grid-cols-2">{(data.live_tests || []).map((test) => <article key={test.id} className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-4"><span className="badge badge-error text-white">LIVE</span><h2 className="mt-2 font-black text-slate-950">{test.title}</h2><p className="text-sm font-semibold text-slate-500">{test.duration_minutes} minutes</p></article>)}{!(data.live_tests || []).length && <p className="rounded-lg border border-dashed border-slate-200 p-5 font-semibold text-slate-500">No tests are currently available.</p>}</div></div>}</PortalPage>;
}

export function StudentMaterialsPage() {
  const [items, setItems] = useState([]); const [error, setError] = useState(""); const [loading, setLoading] = useState(true);
  useEffect(() => { api.get("/assessments/student/assessments/materials/").then((r) => { const data = r.data?.data || r.data || []; setItems(Array.isArray(data) ? data : data.results || []); }).catch((e) => setError(getApiErrorMessage(e, "Unable to load study materials."))).finally(() => setLoading(false)); }, []);
  return <PortalPage title="Study Materials"><LoadingOrError loading={loading} error={error} />{!loading && !error && <div className="grid gap-3 md:grid-cols-2">{items.map((item) => <article key={item.id} className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm"><h2 className="font-black text-slate-950">{item.title}</h2><p className="mt-1 text-sm font-semibold text-slate-500">{item.description || item.material_type}</p>{item.url && <a className="btn btn-outline btn-sm mt-4 border-emerald-700 text-emerald-800" href={item.url} target="_blank" rel="noreferrer">Open material</a>}</article>)}{!items.length && <p className="rounded-xl border border-dashed border-emerald-200 bg-white p-8 text-center font-semibold text-slate-500">No study materials have been published yet.</p>}</div>}</PortalPage>;
}

export function StudentNotificationsPage() {
  const [items, setItems] = useState([]); const [error, setError] = useState(""); const [loading, setLoading] = useState(true);
  useEffect(() => { api.get("/sms/notifications/").then((r) => { const data = r.data?.data || r.data; setItems(Array.isArray(data) ? data : data?.results || []); }).catch((e) => setError(getApiErrorMessage(e, "Unable to load notifications."))).finally(() => setLoading(false)); }, []);
  return <PortalPage title="Notifications"><LoadingOrError loading={loading} error={error} />{!loading && !error && <div className="grid gap-3">{items.map((item) => <article key={item.id} className={`rounded-xl border bg-white p-5 shadow-sm ${item.is_read ? "border-slate-200" : "border-emerald-200"}`}><div className="flex items-start justify-between gap-3"><div><h2 className="font-black text-slate-950">{item.title}</h2><p className="mt-2 whitespace-pre-wrap text-sm font-medium text-slate-600">{item.body}</p><p className="mt-3 text-xs font-bold text-slate-400">{new Date(item.created_at).toLocaleString()}</p></div>{!item.is_read && <span className="badge badge-success text-white">New</span>}</div>{item.target_url && <a href={item.target_url} className="link link-success mt-3 inline-block font-bold">Open related item</a>}</article>)}{!items.length && <p className="rounded-xl border border-dashed border-emerald-200 bg-white p-8 text-center font-semibold text-slate-500">No notifications yet.</p>}</div>}</PortalPage>;
}

export function StudentProfilePage() {
  const user = getStoredUser(); const name = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.username || user?.email || "Student";
  return <PortalPage title="My Profile"><section className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-7"><div className="flex flex-col gap-5 sm:flex-row sm:items-center"><div className="grid h-24 w-24 place-items-center rounded-full bg-emerald-700 text-3xl font-black text-white">{name.charAt(0).toUpperCase()}</div><div><h2 className="text-2xl font-black text-slate-950">{name}</h2><p className="mt-1 font-semibold text-slate-500">Student account</p><div className="mt-4 flex flex-wrap gap-2"><span className="badge badge-success badge-outline">{user?.email || "Email not set"}</span><span className="badge badge-outline">{user?.phone || "Phone not set"}</span></div></div></div></section></PortalPage>;
}
