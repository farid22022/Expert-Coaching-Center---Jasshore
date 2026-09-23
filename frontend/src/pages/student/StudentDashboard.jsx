import { useEffect, useState } from "react";
import { Bell, BookOpen, CheckCircle2, ClipboardList, Clock, LayoutDashboard, Radio, UserRound } from "lucide-react";

import api, { getApiErrorMessage } from "../../services/api.js";
import RoleDashboardShell from "../../components/layout/RoleDashboardShell.jsx";

function Card({ icon: Icon, label, value }) {
  return (
    <div className="rounded-md border border-emerald-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-50 text-emerald-700"><Icon size={20} /></span>
        <div>
          <p className="text-2xl font-black text-slate-950">{value}</p>
          <p className="text-sm font-bold text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [dashboard, setDashboard] = useState({ upcoming_tests: 0, live_tests: [], results: [] });
  const [performance, setPerformance] = useState({ attempt_count: 0, assignment_count: 0, average_score: 0, average_assignment_marks: 0 });
  const [history, setHistory] = useState({ attempts: [], submissions: [] });
  const [unread, setUnread] = useState(0);
  const [materials, setMaterials] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/assessments/student/assessments/dashboard/").then((response) => response.data),
      api.get("/assessments/student/assessments/performance/").then((response) => response.data).catch(() => null),
      api.get("/assessments/student/assessments/history/").then((response) => response.data).catch(() => null),
      api.get("/sms/notifications/unread_count/").then((response) => response.data?.data || response.data).catch(() => ({ unread: 0 })),
      api.get("/assessments/student/assessments/materials/").then((response) => response.data?.data || response.data || []).catch(() => []),
    ]).then(([assessmentData, performanceData, historyData, notificationData, materialData]) => {
      setDashboard(assessmentData);
      if (performanceData) setPerformance(performanceData);
      if (historyData) setHistory(historyData);
      setUnread(notificationData?.unread || notificationData?.data?.unread || 0);
      setMaterials(Array.isArray(materialData) ? materialData : materialData?.results || []);
    }).catch((requestError) => setError(getApiErrorMessage(requestError, "Unable to load student dashboard.")));
  }, []);

  const navItems = [
    { label: "Dashboard", to: "/student/dashboard", icon: LayoutDashboard, end: true },
    { label: "My Courses", to: "/student/dashboard#courses", icon: BookOpen },
    { label: "Assessments", to: "/student/dashboard#assessments", icon: CheckCircle2 },
    { label: "Study Materials", to: "/student/dashboard#materials", icon: BookOpen },
    { label: "Notifications", to: "/student/dashboard#notifications", icon: Bell },
    { label: "Profile", to: "/profile", icon: UserRound },
  ];

  return (
    <RoleDashboardShell roleLabel="Student Portal" title="Student Dashboard" items={navItems}>
      <section className="mx-auto max-w-7xl space-y-5">
        <div>
          <p className="text-sm font-black uppercase text-emerald-700">Expert Coaching Center</p>
          <h1 className="text-3xl font-black text-slate-950">Student Dashboard</h1>
        </div>

        {error && <div className="rounded border border-red-100 bg-red-50 px-4 py-2 text-sm font-bold text-red-700">{error}</div>}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card icon={BookOpen} label="Active Courses" value={2} />
          <Card icon={Clock} label="Upcoming Tests" value={dashboard.upcoming_tests} />
          <Card icon={ClipboardList} label="Pending Work" value={performance.assignment_count || history.submissions.length} />
          <Card icon={CheckCircle2} label="Average Score" value={`${Number(performance.average_score || 0).toFixed(1)}%`} />
        </div>

        <section id="courses" className="rounded-md border border-base-300 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-black text-slate-950">My Courses</h2>
            <span className="badge badge-success text-white">2 Active</span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {["SSC 2027 - Science", "University Admission - A Unit"].map((course) => (
              <article key={course} className="rounded-md border border-emerald-100 bg-emerald-50/50 p-4">
                <p className="font-black text-slate-950">{course}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-emerald-800">
                  {["Overview", "Subjects", "Class Work", "Assessments", "Results"].map((item) => <span key={item} className="rounded bg-white px-2 py-1">{item}</span>)}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="assessments" className="rounded-md border border-base-300 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-black text-slate-950">Assessments</h2>
            <div className="tabs tabs-boxed bg-emerald-50">
              {["Upcoming", "Live", "Assignments", "Completed"].map((tab) => (
                <button key={tab} type="button" className={`tab text-sm font-bold ${activeTab === tab ? "tab-active" : ""}`} onClick={() => setActiveTab(tab)}>{tab}</button>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {dashboard.live_tests.map((test) => (
              <div key={test.id} className="rounded border border-emerald-100 bg-emerald-50/40 p-4">
                <span className="badge badge-error text-white">LIVE</span>
                <p className="font-black text-slate-950">{test.title}</p>
                <p className="text-sm font-semibold text-slate-500">{test.duration_minutes} minutes</p>
                <button type="button" className="btn btn-success btn-sm mt-3 text-white">Join Now</button>
              </div>
            ))}
            {!dashboard.live_tests.length && (
              <div className="rounded border border-slate-200 p-4">
                <p className="font-black text-slate-950">{activeTab === "Assignments" ? "No pending assignments" : "Chemistry Chapter Test"}</p>
                <p className="text-sm font-semibold text-slate-500">{activeTab === "Live" ? "No live tests right now." : "Upcoming schedule will appear here."}</p>
              </div>
            )}
          </div>
        </section>

        <section id="notifications" className="rounded-md border border-base-300 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-950">Notifications</h2>
          <p className="mt-2 text-sm font-semibold text-slate-500">{unread} unread notifications.</p>
        </section>

        <section id="materials" className="rounded-md border border-base-300 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-950">Study Materials</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {materials.map((item) => <article key={item.id} className="rounded border border-emerald-100 bg-emerald-50/40 p-4"><p className="font-black">{item.title}</p><p className="text-sm font-semibold text-slate-500">{item.description || item.material_type}</p>{item.url && <a className="link link-success mt-2 inline-block font-bold" href={item.url} target="_blank" rel="noreferrer">Open resource</a>}</article>)}
            {!materials.length && <p className="text-sm font-semibold text-slate-500">Published study materials will appear here.</p>}
          </div>
        </section>

        <section className="rounded-md border border-base-300 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-950">Assessment History</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded border border-slate-200 p-4">
              <p className="font-black">MCQ / Exam Attempts</p>
              <p className="text-2xl font-black text-emerald-700">{history.attempts.length}</p>
            </div>
            <div className="rounded border border-slate-200 p-4">
              <p className="font-black">Assignment Submissions</p>
              <p className="text-2xl font-black text-emerald-700">{history.submissions.length}</p>
              <p className="text-xs font-semibold text-slate-500">Average marks: {Number(performance.average_assignment_marks || 0).toFixed(1)}</p>
            </div>
          </div>
        </section>
      </section>
    </RoleDashboardShell>
  );
}
