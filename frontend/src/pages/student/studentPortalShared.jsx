import PageIllustration, { illustrationForPage } from "../../components/common/PageIllustration.jsx";
import { Children } from "react";
import { StudentMotion } from "../../components/common/StudentMotion.jsx";
import { Award, BarChart3, Bell, BookOpen, CheckCircle2, ClipboardList, CreditCard, FileText, LayoutDashboard, ListChecks, MessageSquare, TrendingUp, UserRound } from "lucide-react";

import RoleDashboardShell from "../../components/layout/RoleDashboardShell.jsx";

export const studentNav = [
  { label: "Dashboard", to: "/student/dashboard", icon: LayoutDashboard, end: true },
  { label: "My Courses", to: "/student/dashboard/courses", icon: BookOpen },
  { label: "Assessments", to: "/student/dashboard/assessments", icon: CheckCircle2 },
  { label: "Assignments", to: "/student/dashboard/assignments", icon: ClipboardList },
  { label: "Study Materials", to: "/student/dashboard/materials", icon: FileText },
  { label: "Results", to: "/student/dashboard/results", icon: Award },
  { label: "My Payments", to: "/student/payments", icon: CreditCard },
  { label: "Action Required", to: "/student/actions", icon: ListChecks },
  {
    label: "Practice",
    icon: TrendingUp,
    children: [
      { label: "Practice Center", to: "/student/practice" },
      { label: "My Mistakes", to: "/student/practice/mistakes" },
      { label: "Bookmarks", to: "/student/bookmarks" },
    ],
  },
  { label: "My Progress", to: "/student/progress", icon: BarChart3 },
  { label: "Feedback", to: "/student/feedback", icon: MessageSquare },
  { label: "Notifications", to: "/student/dashboard/notifications", icon: Bell },
  { label: "Profile", to: "/student/dashboard/profile", icon: UserRound },
];

export function PortalPage({ title, eyebrow, children }) {
  return (
    <RoleDashboardShell roleLabel="Student Portal" title={title} items={studentNav}>
      <section className="mx-auto max-w-7xl">
        <StudentMotion as="header" className="mb-6 flex items-center justify-between gap-4">
          <div className="min-w-0">
          <p className="text-sm font-black uppercase text-emerald-700">{eyebrow || "Expert Coaching Center"}</p>
          <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">{title}</h1>
          </div>
          <PageIllustration kind={illustrationForPage(title)} className="hidden sm:block" />
        </StudentMotion>
        {Children.toArray(children).map((child, index) => <StudentMotion key={child.key ?? index} index={index + 1}>{child}</StudentMotion>)}
      </section>
    </RoleDashboardShell>
  );
}

export function LoadingOrError({ loading, error }) {
  if (loading) return <div className="animate-pulse rounded-xl border border-emerald-100 bg-white p-8 text-sm font-bold text-slate-500">Loading your learning data...</div>;
  if (error) return <div className="rounded-xl border border-red-100 bg-red-50 p-4 font-bold text-red-700">{error}</div>;
  return null;
}
