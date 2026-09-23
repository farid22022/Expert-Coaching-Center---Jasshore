import { useEffect, useState } from "react";
import { Bell, BookOpen, ClipboardList, HelpCircle, LayoutDashboard, UserRound, Users } from "lucide-react";

import api, { getApiErrorMessage } from "../../services/api.js";
import { assessmentApi, materialApi, questionApi, teacherDashboardApi } from "../../services/resourceApi.js";
import RoleDashboardShell from "../../components/layout/RoleDashboardShell.jsx";
import { AssessmentBuilder, MaterialEditor, QuestionEditor } from "./TeacherBuilders.jsx";

const items = [
  { label: "Dashboard", to: "/teacher/dashboard", icon: LayoutDashboard, end: true },
  { label: "My Courses", to: "/teacher/dashboard/courses", icon: BookOpen, end: true },
  { label: "Assessments", to: "/teacher/dashboard/assessments", icon: ClipboardList, end: true },
  { label: "Question Bank", to: "/teacher/dashboard/question-bank", icon: HelpCircle, end: true },
  { label: "Study Materials", to: "/teacher/dashboard/materials", icon: BookOpen, end: true },
  { label: "Students", to: "/teacher/dashboard/students", icon: Users, end: true },
  { label: "Notifications", to: "/teacher/dashboard/notifications", icon: Bell, end: true },
  { label: "Profile", to: "/profile", icon: UserRound },
];

function Shell({ title, children }) {
  return <RoleDashboardShell roleLabel="Teacher Portal" title={title} items={items}><section className="mx-auto max-w-7xl space-y-5">{children}</section></RoleDashboardShell>;
}

function useTeacherData() {
  const [data, setData] = useState({ assigned_courses: [], assigned_sections: [], assigned_subjects: [], assignments: [], students: [] });
  const [assessments, setAssessments] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [error, setError] = useState("");
  const reload = async () => {
    try {
      const [dashboard, assessmentRows, questionRows, materialRows] = await Promise.all([teacherDashboardApi.list(), assessmentApi.listResults(), questionApi.listResults(), materialApi.listResults()]);
      setData(dashboard); setAssessments(assessmentRows); setQuestions(questionRows); setMaterials(materialRows);
    } catch (requestError) { setError(getApiErrorMessage(requestError, "Unable to load teacher data.")); }
  };
  useEffect(() => { reload(); }, []);
  return { data, assessments, questions, materials, error, reload };
}

export function TeacherOverviewPage() {
  const { data, assessments, questions, materials, error } = useTeacherData();
  return <Shell title="Teacher Dashboard"><div><p className="text-sm font-black uppercase text-emerald-700">Expert Coaching Center</p><h1 className="text-3xl font-black">Teacher Dashboard</h1></div>{error && <p className="rounded bg-red-50 p-3 font-bold text-red-700">{error}</p>}<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><div className="rounded border bg-white p-5 shadow-sm"><p className="text-3xl font-black">{data.assigned_courses.length}</p><p className="font-bold text-slate-500">Assigned Courses</p></div><div className="rounded border bg-white p-5 shadow-sm"><p className="text-3xl font-black">{data.students.length}</p><p className="font-bold text-slate-500">Students</p></div><div className="rounded border bg-white p-5 shadow-sm"><p className="text-3xl font-black">{assessments.length}</p><p className="font-bold text-slate-500">Assessments</p></div><div className="rounded border bg-white p-5 shadow-sm"><p className="text-3xl font-black">{questions.length}</p><p className="font-bold text-slate-500">Questions</p></div></div><div className="grid gap-4 md:grid-cols-2"><article className="rounded border bg-white p-5 shadow-sm"><h2 className="text-lg font-black">Recent Assessments</h2>{assessments.slice(0, 5).map((item) => <p key={item.id} className="mt-3 flex justify-between border-b pb-2 font-bold"><span>{item.title}</span><span className="text-emerald-700">{item.status}</span></p>)}{!assessments.length && <p className="mt-3 text-slate-500">No assessments created yet.</p>}</article><article className="rounded border bg-white p-5 shadow-sm"><h2 className="text-lg font-black">Study Materials</h2>{materials.slice(0, 5).map((item) => <p key={item.id} className="mt-3 border-b pb-2 font-bold">{item.title}</p>)}{!materials.length && <p className="mt-3 text-slate-500">No study materials published yet.</p>}</article></div></Shell>;
}

export function TeacherCoursesPage() {
  const { data, error } = useTeacherData();
  return <Shell title="My Courses"><h1 className="text-3xl font-black">My Courses</h1>{error && <p className="rounded bg-red-50 p-3 font-bold text-red-700">{error}</p>}<div className="grid gap-4 md:grid-cols-2">{data.assignments.map((item) => <article key={item.id} className="rounded-md border border-emerald-100 bg-white p-5 shadow-sm"><h2 className="text-lg font-black">{data.assigned_courses.find((course) => course.id === item.course)?.title || "Assigned course"}</h2><p className="mt-1 font-semibold text-slate-500">{item.role?.replaceAll("_", " ")}</p><div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-emerald-800"><span className="rounded bg-emerald-50 px-2 py-1">Overview</span><span className="rounded bg-emerald-50 px-2 py-1">Content</span><span className="rounded bg-emerald-50 px-2 py-1">Assessments</span><span className="rounded bg-emerald-50 px-2 py-1">Students</span></div></article>)}{!data.assignments.length && <p className="rounded border bg-white p-5 font-semibold text-slate-500">No active course assignments found.</p>}</div></Shell>;
}

export function TeacherAssessmentsPage() {
  const { data, assessments, error, reload } = useTeacherData();
  const [createMode, setCreateMode] = useState(null);
  return <Shell title="Assessments"><div className="flex items-center justify-between"><h1 className="text-3xl font-black">Assessments</h1><button className="btn btn-success text-white" onClick={() => setCreateMode("assessment")}>+ Create Assessment</button></div>{error && <p className="rounded bg-red-50 p-3 font-bold text-red-700">{error}</p>}<div className="grid gap-3">{assessments.map((item) => <article key={item.id} className="flex items-center justify-between rounded border bg-white p-4 shadow-sm"><div><h2 className="font-black">{item.title}</h2><p className="text-sm font-semibold text-slate-500">{item.assessment_type} · {item.duration_minutes} minutes</p></div><span className="badge badge-success text-white">{item.status}</span></article>)}{!assessments.length && <p className="rounded border bg-white p-5 font-semibold text-slate-500">No assessments created yet.</p>}</div>{createMode && <CreatePanel mode={createMode} data={data} onClose={() => setCreateMode(null)} onSaved={reload} />}</Shell>;
}

export function TeacherQuestionBankPage() {
  const { data, questions, error, reload } = useTeacherData();
  const [open, setOpen] = useState(false);
  return <Shell title="Question Bank"><div className="flex items-center justify-between"><div><h1 className="text-3xl font-black">Question Bank</h1><p className="font-semibold text-slate-500">{questions.length} questions available.</p></div><button className="btn bg-emerald-700 text-white" onClick={() => setOpen(true)}>+ Add Question</button></div>{error && <p className="rounded bg-red-50 p-3 font-bold text-red-700">{error}</p>}<div className="grid gap-3">{questions.map((item, index) => <article key={item.id} className="rounded border bg-white p-4 shadow-sm"><p className="font-black">{index + 1}. {item.text}</p><p className="mt-1 text-sm font-semibold text-slate-500">{item.question_type} · {item.marks} marks</p></article>)}</div>{open && <CreatePanel mode="question" data={data} onClose={() => setOpen(false)} onSaved={reload} />}</Shell>;
}

export function TeacherStudentsPage() {
  const { data, error } = useTeacherData();
  return <Shell title="Students"><h1 className="text-3xl font-black">Students</h1>{error && <p className="rounded bg-red-50 p-3 font-bold text-red-700">{error}</p>}<p className="font-semibold text-slate-500">{data.students.length} active students in your assigned courses.</p><div className="grid gap-3 md:grid-cols-2">{data.students.map((student) => <article key={`${student.student_id}-${student.course_id}`} className="rounded border bg-white p-4 shadow-sm"><p className="font-black">{student.student__full_name}</p><p className="text-sm text-slate-500">{student.student__student_id} · {student.student__email}</p></article>)}</div></Shell>;
}

export function TeacherNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  useEffect(() => { api.get("/sms/notifications/").then((response) => setNotifications(response.data?.data?.results || response.data?.results || response.data || [])).catch(() => setNotifications([])); }, []);
  return <Shell title="Notifications"><h1 className="text-3xl font-black">Notifications</h1><div className="grid gap-3">{notifications.map((item) => <article key={item.id} className="rounded border bg-white p-4 shadow-sm"><p className="font-black">{item.title || item.message || "Notification"}</p><p className="text-sm text-slate-500">{item.created_at || ""}</p></article>)}{!notifications.length && <p className="rounded border bg-white p-5 font-semibold text-slate-500">No notifications yet.</p>}</div></Shell>;
}
