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
    <StudentDashboardView learning={learning} dashboard={dashboard} history={history} announcements={announcements} actions={priorityActions} feedback={feedback} error={error} />
  </RoleDashboardShell>;
}
import StudentDashboardView from "./StudentDashboardView.jsx";
