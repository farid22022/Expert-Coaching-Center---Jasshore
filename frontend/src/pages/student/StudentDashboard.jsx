import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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

const EMPTY_LIST = [];
const EMPTY_LEARNING = { enrollments: [], pending_applications: [] };
const EMPTY_DASHBOARD = { upcoming_tests: 0, live_tests: [] };
const EMPTY_HISTORY = { attempts: [], submissions: [] };
const asRows = (response) => { const payload = response.data?.data || response.data; return Array.isArray(payload) ? payload : payload?.results || []; };

// Each panel is its own cached query: the page renders as soon as the two core calls return, the
// secondary panels fill in as they arrive, and revisiting the dashboard is served from cache
// (30 s) instead of re-running every request. Only data the dashboard actually renders is fetched.
function useDashboardQuery(key, queryFn, options = {}) {
  return useQuery({ queryKey: ["studentDashboard", key], queryFn, staleTime: 30_000, ...options });
}

export default function StudentDashboard() {
  const learningQuery = useDashboardQuery("learning", () => studentDashboardApi.list());
  const dashboardQuery = useDashboardQuery("assessments", ({ signal }) => api.get("/assessments/student/assessments/dashboard/", { signal }).then((response) => response.data));
  const historyQuery = useDashboardQuery("history", ({ signal }) => api.get("/assessments/student/assessments/history/", { signal }).then((response) => response.data), { retry: false });
  const announcementsQuery = useDashboardQuery("announcements", ({ signal }) => api.get("/sms/notifications/", { params: { page_size: 5 }, signal }).then(asRows), { retry: false });
  const actionsQuery = useDashboardQuery("actions", () => studentPortalApi.actions(), { retry: false });
  const feedbackQuery = useDashboardQuery("feedback", () => studentPortalApi.feedback(), { retry: false });

  const learning = learningQuery.data || EMPTY_LEARNING;
  const dashboard = dashboardQuery.data || EMPTY_DASHBOARD;
  const history = historyQuery.data || EMPTY_HISTORY;
  const announcements = announcementsQuery.data || EMPTY_LIST;
  const actions = Array.isArray(actionsQuery.data) ? actionsQuery.data : EMPTY_LIST;
  const feedback = Array.isArray(feedbackQuery.data) ? feedbackQuery.data : EMPTY_LIST;
  const loading = learningQuery.isLoading || dashboardQuery.isLoading;
  const coreError = learningQuery.error || dashboardQuery.error;
  const error = coreError ? getApiErrorMessage(coreError, "Unable to load student dashboard.") : "";

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
    <StudentDashboardView learning={learning} dashboard={dashboard} history={history} announcements={announcements} actions={priorityActions} feedback={feedback} error={error} />
  </RoleDashboardShell>;
}
import StudentDashboardView from "./StudentDashboardView.jsx";
