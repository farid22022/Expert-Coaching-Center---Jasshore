import PageIllustration from "../../components/common/PageIllustration.jsx";
import { useEffect, useMemo, useState } from "react";
import DOMPurify from "dompurify";
import { Award, Bell, BookOpen, CheckCircle2, ClipboardList, FileQuestion, GraduationCap, HelpCircle, LayoutDashboard, ListTree, Search, UserRound, Users } from "lucide-react";

import api, { getApiErrorMessage } from "../../services/api.js";
import { confirmAction, confirmDelete, notifyError, notifySuccess } from "../../services/alerts.js";
import RichTextEditor from "../../components/common/RichTextEditor.jsx";
import { assessmentApi, assessmentAttemptApi, assignmentSubmissionApi, courseSyllabusItemApi, materialApi, noticeApi, questionApi, teacherDashboardApi } from "../../services/resourceApi.js";
import RoleDashboardShell from "../../components/layout/RoleDashboardShell.jsx";
import { AssessmentBuilder, isBlankRichText, MaterialEditor, QuestionEditor } from "./TeacherBuilders.jsx";

export const teacherNav = [
  { label: "Dashboard", to: "/teacher/dashboard", icon: LayoutDashboard, end: true },
  { label: "My Subjects", to: "/teacher/dashboard/courses", icon: BookOpen, end: true },
  { label: "MCQ & Tests", to: "/teacher/online-tests", icon: FileQuestion, end: true },
  { label: "Study Materials", to: "/teacher/dashboard/materials", icon: BookOpen, end: true },
  { label: "Course Outline", to: "/teacher/dashboard/course-outline", icon: ListTree, end: true },
  { label: "Question Bank", to: "/teacher/dashboard/question-bank", icon: HelpCircle, end: true },
  { label: "Gradebook", to: "/teacher/dashboard/gradebook", icon: ClipboardList, end: true },
  {
    label: "Students",
    icon: GraduationCap,
    children: [
      { label: "All Students", to: "/teacher/dashboard/students" },
      { label: "Performance Center", to: "/teacher/dashboard/performance" },
      { label: "Needs Attention", to: "/teacher/dashboard/performance?flag=attention" },
      { label: "Interventions & Feedback", to: "/teacher/dashboard/interventions" },
    ],
  },
  {
    label: "Academic Structure",
    icon: Award,
    children: [
      { label: "Sections", to: "/teacher/dashboard/academic/sections" },
      { label: "Subjects", to: "/teacher/dashboard/academic/subjects" },
      { label: "Academic Stages", to: "/teacher/dashboard/academic/stages" },
      { label: "Assessment Components", to: "/teacher/dashboard/academic/assessment-components" },
      { label: "Grade Scales", to: "/teacher/dashboard/academic/grade-scales" },
      { label: "Grade Scale Items", to: "/teacher/dashboard/academic/grade-scale-items" },
      { label: "Subject Teacher Assignments", to: "/teacher/dashboard/academic/teacher-assignments" },
    ],
  },
  { label: "Teacher Assignments", to: "/teacher/dashboard/assignments", icon: Users, end: true },
  { label: "Content Review", to: "/teacher/dashboard/review", icon: CheckCircle2, end: true },
  { label: "Notices", to: "/teacher/dashboard/notifications", icon: Bell, end: true },
  { label: "Profile", to: "/profile", icon: UserRound, end: true },
];

export function Shell({ title, children }) { return <RoleDashboardShell roleLabel="Teacher Portal" title={title} items={teacherNav}><section className="mx-auto max-w-7xl space-y-4 sm:space-y-5">{children}</section></RoleDashboardShell>; }

export function useTeacherData() {
  const [data, setData] = useState({ assigned_courses: [], assigned_sections: [], assigned_subjects: [], assignments: [], students: [], pending_invitations: [], available_teachers: [], is_head_teacher: false });
  const [assessments, setAssessments] = useState([]); const [questions, setQuestions] = useState([]); const [materials, setMaterials] = useState([]); const [syllabus, setSyllabus] = useState([]); const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const reload = async () => {
    setLoading(true);
    try {
      const [dashboard, assessmentRows, questionRows, materialRows, syllabusRows] = await Promise.all([teacherDashboardApi.list(), assessmentApi.listResults(), questionApi.listResults(), materialApi.listResults(), courseSyllabusItemApi.listResults()]);
      setData(dashboard); setAssessments(assessmentRows); setQuestions(questionRows); setMaterials(materialRows); setSyllabus(syllabusRows); setError("");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to load teacher data."));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { reload(); }, []);
  const studentsById = useMemo(() => Object.fromEntries(data.students.map((student) => [String(student.student_id), student])), [data.students]);
  return { data, assessments, questions, materials, syllabus, error, loading, reload, studentsById };
}

export function ErrorMessage({ error }) { return error ? <p className="rounded bg-red-50 p-3 font-bold text-red-700">{error}</p> : null; }

export function Loading({ label = "Loading..." }) { return <div className="flex items-center gap-2 rounded border border-dashed border-emerald-200 bg-emerald-50/50 p-5 font-bold text-emerald-700"><span className="loading loading-spinner loading-sm" />{label}</div>; }

function SafeHtml({ html, className }) {
  if (!html) return null;
  const clean = DOMPurify.sanitize(html, { ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "s", "ul", "ol", "li", "a", "span", "h1", "h2", "h3"], ALLOWED_ATTR: ["href", "target", "rel", "style", "class"] });
  return <div className={`rich-text-content ${className || ""}`} dangerouslySetInnerHTML={{ __html: clean }} />;
}

export function TeacherOverviewPage() {
  const { data, assessments, questions, materials, error, loading, reload } = useTeacherData(); const [responding, setResponding] = useState("");
  const respond = async (assignment, decision) => {
    setResponding(assignment.id);
    try {
      await api.post("/courses/teacher/dashboard/respond_to_invitation/", { assignment: assignment.id, decision });
      notifySuccess(decision === "accept" ? "Invitation accepted." : "Invitation declined.");
      await reload();
    } catch (requestError) {
      notifyError(getApiErrorMessage(requestError, "Could not respond to this invitation."));
    } finally { setResponding(""); }
  };
  return <Shell title="Teacher Dashboard"><div className="flex items-center justify-between gap-4"><div><p className="text-sm font-black uppercase text-emerald-700">Expert Coaching Center</p><h1 className="text-3xl font-black">Teacher Dashboard</h1><p className="mt-1 font-semibold text-slate-500">Create content only for accepted admission and subject assignments.</p></div><PageIllustration kind="teacher" className="hidden sm:block" /></div><ErrorMessage error={error} />
    {loading ? <Loading label="Loading dashboard..." /> : <>
      {data.pending_invitations.length > 0 && <section className="rounded-xl border border-amber-200 bg-amber-50 p-5"><h2 className="font-black">Teaching invitations</h2><div className="mt-3 grid gap-3">{data.pending_invitations.map((assignment) => <article key={assignment.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white p-4"><div><p className="font-black">{assignment.course_title || `Admission #${assignment.course}`}</p><p className="text-sm text-slate-500">Subject assignment awaiting your response</p></div><div className="flex gap-2"><button disabled={responding === assignment.id} className="btn btn-success btn-sm text-white" onClick={() => respond(assignment, "accept")}>Accept</button><button disabled={responding === assignment.id} className="btn btn-ghost btn-sm" onClick={() => respond(assignment, "decline")}>Decline</button></div></article>)}</div></section>}
      {!data.assigned_courses.length && !data.pending_invitations.length && <p className="rounded border border-dashed border-emerald-200 bg-white p-6 text-center font-semibold text-slate-500">You haven't been assigned to an admission course yet. Ask an admin or head teacher to assign you.</p>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[[data.assigned_courses.length, "Admissions"], [data.assigned_subjects.length, "Assigned Subjects"], [assessments.length, "Tests"], [materials.length, "Materials"]].map(([value, label]) => <div key={label} className="rounded border bg-white p-5 shadow-sm"><p className="text-3xl font-black">{value}</p><p className="font-bold text-slate-500">{label}</p></div>)}</div>
      <div className="grid gap-4 md:grid-cols-2"><article className="rounded border bg-white p-5 shadow-sm"><h2 className="text-lg font-black">MCQ and online tests</h2>{assessments.slice(0, 5).map((item) => <p key={item.id} className="mt-3 flex justify-between border-b pb-2 font-bold"><span>{item.title}</span><span className="text-emerald-700">{item.review_status || item.status}</span></p>)}{!assessments.length && <p className="mt-3 text-sm font-semibold text-slate-500">No tests created yet.</p>}</article><article className="rounded border bg-white p-5 shadow-sm"><h2 className="text-lg font-black">Study materials</h2>{materials.slice(0, 5).map((item) => <p key={item.id} className="mt-3 flex justify-between border-b pb-2 font-bold"><span>{item.title}</span><span className="text-emerald-700">{item.review_status || "draft"}</span></p>)}{!materials.length && <p className="mt-3 text-sm font-semibold text-slate-500">No materials added yet.</p>}</article></div>
    </>}
  </Shell>;
}

export function TeacherCoursesPage() {
  const { data, error, loading } = useTeacherData();
  return <Shell title="My Courses"><h1 className="text-3xl font-black">My Courses</h1><ErrorMessage error={error} />{loading ? <Loading label="Loading your courses..." /> : <div className="grid gap-4 md:grid-cols-2">{data.assignments.map((item) => <article key={item.id} className="rounded border border-emerald-100 bg-white p-5 shadow-sm"><h2 className="text-lg font-black">{data.assigned_courses.find((course) => course.id === item.course)?.title || "Assigned course"}</h2><p className="mt-1 font-semibold text-slate-500">{item.role?.replaceAll("_", " ")}</p></article>)}{!data.assignments.length && <p className="rounded border border-dashed border-emerald-200 bg-white p-6 text-center font-semibold text-slate-500 md:col-span-2">You haven't been assigned to an admission course yet.</p>}</div>}</Shell>;
}

export function TeacherAssessmentsPage() {
  const { data, assessments, error, loading, reload } = useTeacherData(); const [editing, setEditing] = useState(null); const [removing, setRemoving] = useState("");
  const remove = async (item) => {
    if (!(await confirmDelete(`"${item.title}"`))) return;
    setRemoving(item.id);
    try { await assessmentApi.remove(item.id); notifySuccess("Assessment deleted."); await reload(); } catch (requestError) { notifyError(getApiErrorMessage(requestError, "Could not delete this assessment.")); } finally { setRemoving(""); }
  };
  return <Shell title="Assessments"><div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-3xl font-black">Assessments</h1><p className="font-semibold text-slate-500">Build chapter-based MCQ tests with unlimited questions and individual marks.</p></div><button className="btn btn-success text-white" onClick={() => setEditing({})}>+ Create Assessment</button></div><ErrorMessage error={error} />{loading ? <Loading label="Loading assessments..." /> : <div className="grid gap-3">{assessments.map((item) => <article key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded border bg-white p-4 shadow-sm"><div><h2 className="font-black">{item.title}</h2><p className="text-sm font-semibold text-slate-500">{item.chapter || "No chapter"} · {item.assessment_type} · {item.duration_minutes} minutes</p></div><div className="flex items-center gap-2"><span className="badge badge-success text-white">{item.status}</span><button className="btn btn-info btn-xs text-white" onClick={() => setEditing(item)}>Edit</button><button disabled={removing === item.id} className="btn btn-error btn-xs text-white" onClick={() => remove(item)}>Delete</button></div></article>)}{!assessments.length && <p className="rounded border bg-white p-5 font-semibold text-slate-500">No assessments created yet. Click "+ Create Assessment" to build your first MCQ, online exam, or file submission test.</p>}</div>}{editing && <AssessmentBuilder data={data} assessment={editing.id ? editing : null} onClose={() => setEditing(null)} onSaved={reload} />}</Shell>;
}

export function TeacherCreateTestPage() {
  const { data, error, reload } = useTeacherData();
  const [open, setOpen] = useState(true);
  return <Shell title="Create Online Test"><h1 className="text-3xl font-black">Create Online Test</h1><p className="font-semibold text-slate-500">Choose MCQ, online exam, or file/PDF submission test and configure access for enrolled students.</p><ErrorMessage error={error} />{open && <AssessmentBuilder data={data} onClose={() => setOpen(false)} onSaved={reload} />}</Shell>;
}

function timeAgo(iso) { return iso ? new Date(iso).toLocaleString() : "-"; }

function GradeSubmissionDialog({ submission, assessmentTitle, onClose, onGraded }) {
  const totalMarks = Number(submission.total_marks) || 100;
  const [marks, setMarks] = useState(submission.marks_obtained ?? "");
  const [feedback, setFeedback] = useState(submission.feedback || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  async function submit(event) {
    event.preventDefault();
    const value = Number(marks);
    if (marks === "" || Number.isNaN(value) || value < 0 || value > totalMarks) { setError(`Marks must be between 0 and ${totalMarks}.`); return; }
    setSaving(true); setError("");
    try {
      await assignmentSubmissionApi.action(submission.id, "evaluate", { marks_obtained: value, feedback });
      notifySuccess("Assignment graded successfully.");
      await onGraded(); onClose();
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, "Could not save the grade.");
      setError(message); notifyError(message);
    } finally { setSaving(false); }
  }
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-2 sm:p-4"><div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-5 shadow-2xl">
    <div className="mb-4 flex items-start justify-between gap-3"><h2 className="text-lg font-black">Grade Submission</h2><button type="button" className="btn btn-sm" onClick={onClose}>Close</button></div>
    <p className="mb-3 text-sm font-semibold text-slate-500">{assessmentTitle}</p>
    {error && <p className="mb-3 rounded bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}
    <form onSubmit={submit} className="space-y-4">
      <label className="grid gap-1 text-sm font-bold text-slate-700"><span>Marks obtained (out of {totalMarks})</span><input required type="number" min="0" max={totalMarks} step="0.5" className="input input-bordered" value={marks} onChange={(event) => setMarks(event.target.value)} /></label>
      <label className="grid gap-1 text-sm font-bold text-slate-700"><span>Feedback</span><RichTextEditor value={feedback} onChange={setFeedback} placeholder="Write feedback for the student..." /></label>
      <div className="flex justify-end gap-2"><button type="button" className="btn" onClick={onClose}>Cancel</button><button disabled={saving} className="btn btn-success text-white">{saving ? "Saving..." : "Save grade"}</button></div>
    </form>
  </div></div>;
}

export function TeacherResultsSubmissionsPage() {
  const { assessments, studentsById, loading: teacherDataLoading } = useTeacherData();
  const [tab, setTab] = useState("submissions");
  const [submissions, setSubmissions] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(null);
  const assessmentsById = useMemo(() => Object.fromEntries(assessments.map((item) => [String(item.id), item])), [assessments]);

  const loadSubmissions = () => assignmentSubmissionApi.listResults().then(setSubmissions).catch((requestError) => notifyError(getApiErrorMessage(requestError, "Unable to load submissions.")));
  const loadAttempts = () => assessmentAttemptApi.listResults().then((rows) => setAttempts(rows.filter((row) => row.status !== "in_progress"))).catch((requestError) => notifyError(getApiErrorMessage(requestError, "Unable to load results.")));

  useEffect(() => {
    setLoading(true);
    Promise.all([loadSubmissions(), loadAttempts()]).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const studentLabel = (studentId) => studentsById[String(studentId)]?.student__full_name || `Student #${studentId}`;
  const isLoading = loading || teacherDataLoading;

  return <Shell title="Results & Submissions">
    <div><h1 className="text-3xl font-black">Results & Submissions</h1><p className="font-semibold text-slate-500">Grade file/PDF submissions and review MCQ test results for your assigned subjects.</p></div>
    <div className="flex gap-2">
      <button type="button" onClick={() => setTab("submissions")} className={`btn btn-sm ${tab === "submissions" ? "btn-success text-white" : "btn-outline"}`}>Assignment Submissions</button>
      <button type="button" onClick={() => setTab("results")} className={`btn btn-sm ${tab === "results" ? "btn-success text-white" : "btn-outline"}`}>MCQ Results</button>
    </div>
    {isLoading ? <Loading label="Loading..." /> : tab === "submissions" ? (
      <div className="grid gap-3">
        {submissions.map((submission) => {
          const assessment = assessmentsById[String(submission.assessment)];
          const late = assessment?.ends_at && submission.submitted_at && new Date(submission.submitted_at) > new Date(assessment.ends_at);
          return <article key={submission.id} className="flex flex-wrap items-center justify-between gap-3 rounded border bg-white p-4 shadow-sm">
            <div>
              <p className="font-black">{studentLabel(submission.student)}</p>
              <p className="text-sm font-semibold text-slate-500">{assessment?.title || `Assessment #${submission.assessment}`} · Submitted {timeAgo(submission.submitted_at)} {late && <span className="text-amber-600">(Late)</span>}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`badge text-white ${submission.status === "evaluated" ? "badge-success" : "badge-warning"}`}>{submission.status}</span>
              <span className="text-sm font-bold text-slate-600">{submission.marks_obtained != null ? `${submission.marks_obtained}/${submission.total_marks}` : "Not graded"}</span>
              <button className="btn btn-info btn-xs text-white" onClick={() => setGrading({ submission, assessmentTitle: assessment?.title || `Assessment #${submission.assessment}` })}>Grade</button>
            </div>
          </article>;
        })}
        {!submissions.length && <p className="rounded border bg-white p-5 font-semibold text-slate-500">No assignment submissions yet.</p>}
      </div>
    ) : (
      <div className="grid gap-3">
        {attempts.map((attempt) => {
          const assessment = assessmentsById[String(attempt.assessment)];
          const percentage = attempt.total_marks ? Math.round((Number(attempt.score) / Number(attempt.total_marks)) * 100) : 0;
          return <article key={attempt.id} className="flex flex-wrap items-center justify-between gap-3 rounded border bg-white p-4 shadow-sm">
            <div>
              <p className="font-black">{studentLabel(attempt.student)}</p>
              <p className="text-sm font-semibold text-slate-500">{assessment?.title || `Assessment #${attempt.assessment}`} · Submitted {timeAgo(attempt.submitted_at)}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-600">{attempt.score}/{attempt.total_marks} ({percentage}%)</span>
              <span className={`badge text-white ${attempt.status === "auto_submitted" ? "badge-warning" : "badge-success"}`}>{attempt.status.replaceAll("_", " ")}</span>
            </div>
          </article>;
        })}
        {!attempts.length && <p className="rounded border bg-white p-5 font-semibold text-slate-500">No completed MCQ attempts yet.</p>}
      </div>
    )}
    {grading && <GradeSubmissionDialog submission={grading.submission} assessmentTitle={grading.assessmentTitle} onClose={() => setGrading(null)} onGraded={loadSubmissions} />}
  </Shell>;
}

export function TeacherQuestionBankPage() {
  const { data, questions, error, loading, reload } = useTeacherData(); const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState(""); const [subjectFilter, setSubjectFilter] = useState(""); const [difficultyFilter, setDifficultyFilter] = useState(""); const [typeFilter, setTypeFilter] = useState("");
  const remove = async (item) => {
    if (!(await confirmDelete("This question"))) return;
    try { await questionApi.remove(item.id); notifySuccess("Question deleted."); await reload(); } catch (requestError) { notifyError(getApiErrorMessage(requestError, "Could not delete this question.")); }
  };
  const visibleQuestions = useMemo(() => questions.filter((item) => {
    const plainText = (item.text || "").replace(/<[^>]*>/g, " ").toLowerCase();
    if (search && !plainText.includes(search.toLowerCase()) && !(item.topic || "").toLowerCase().includes(search.toLowerCase())) return false;
    if (subjectFilter && String(item.subject) !== subjectFilter) return false;
    if (difficultyFilter && item.difficulty !== difficultyFilter) return false;
    if (typeFilter && item.question_type !== typeFilter) return false;
    return true;
  }), [questions, search, subjectFilter, difficultyFilter, typeFilter]);
  return <Shell title="Question Bank"><div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-3xl font-black">Question Bank</h1><p className="font-semibold text-slate-500">Reusable questions, grouped by course, subject, and chapter.</p></div><button className="btn bg-emerald-700 text-white" onClick={() => setEditing({})}>+ Add Question</button></div><ErrorMessage error={error} />
    <div className="grid gap-3 rounded border bg-white p-4 shadow-sm sm:grid-cols-[1fr_repeat(3,160px)]">
      <label className="flex items-center gap-2 rounded border border-slate-200 px-3"><Search size={16} className="text-slate-400" /><input className="input input-sm w-full border-0 focus:outline-none" placeholder="Search question text or topic" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
      <select className="select select-bordered select-sm" value={subjectFilter} onChange={(event) => setSubjectFilter(event.target.value)}><option value="">All subjects</option>{data.assigned_subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select>
      <select className="select select-bordered select-sm" value={difficultyFilter} onChange={(event) => setDifficultyFilter(event.target.value)}><option value="">All difficulty</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select>
      <select className="select select-bordered select-sm" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}><option value="">All types</option><option value="single">Single answer</option><option value="multiple">Multiple answers</option></select>
    </div>
    {loading ? <Loading label="Loading question bank..." /> : <div className="grid gap-3">{visibleQuestions.map((item, index) => <article key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded border bg-white p-4 shadow-sm"><div><div className="flex items-baseline gap-1 font-black"><span>{index + 1}.</span><SafeHtml html={item.text} /></div><p className="mt-1 text-sm font-semibold text-slate-500">{item.chapter || "No chapter"} · {item.question_type} · {item.difficulty} · {item.marks} marks</p></div><div className="flex gap-2"><button className="btn btn-info btn-xs text-white" onClick={() => setEditing(item)}>Edit</button><button className="btn btn-error btn-xs text-white" onClick={() => remove(item)}>Delete</button></div></article>)}{!visibleQuestions.length && <p className="rounded border bg-white p-5 font-semibold text-slate-500">{questions.length ? "No questions match your search/filters." : 'Your Question Bank is empty. Click "+ Add Question" to create your first reusable question.'}</p>}</div>}
    {editing && <QuestionEditor data={data} question={editing.id ? editing : null} onClose={() => setEditing(null)} onSaved={reload} />}</Shell>;
}

export function TeacherMaterialsPage() {
  const { data, materials, error, loading, reload } = useTeacherData(); const [editing, setEditing] = useState(null);
  const remove = async (item) => {
    if (!(await confirmDelete(`"${item.title}"`))) return;
    try { await materialApi.remove(item.id); notifySuccess("Study material deleted."); await reload(); } catch (requestError) { notifyError(getApiErrorMessage(requestError, "Could not delete this material.")); }
  };
  return <Shell title="Study Materials"><div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-3xl font-black">Study Materials</h1><p className="font-semibold text-slate-500">Create chapter-specific notes, links, videos, and file resources for enrolled students.</p></div><button className="btn btn-success text-white" onClick={() => setEditing({})}>+ Create Material</button></div><ErrorMessage error={error} />{loading ? <Loading label="Loading study materials..." /> : <div className="grid gap-3">{materials.map((item) => <article key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded border bg-white p-4 shadow-sm"><div><h2 className="font-black">{item.title}</h2><p className="text-sm font-semibold text-slate-500">{item.chapter || "No chapter"} · {item.material_type} · {item.is_published ? "Published" : "Draft"}</p></div><div className="flex gap-2"><button className="btn btn-info btn-xs text-white" onClick={() => setEditing(item)}>Edit</button><button className="btn btn-error btn-xs text-white" onClick={() => remove(item)}>Delete</button></div></article>)}{!materials.length && <p className="rounded border bg-white p-5 font-semibold text-slate-500">No study materials created yet. Click "+ Create Material" to add your first resource.</p>}</div>}{editing && <MaterialEditor data={data} material={editing.id ? editing : null} onClose={() => setEditing(null)} onSaved={reload} />}</Shell>;
}

export function TeacherStudentsPage() {
  const { data, error, loading } = useTeacherData();
  const [search, setSearch] = useState("");
  const visible = data.students.filter((student) => !search || `${student.student__full_name} ${student.student__student_id} ${student.student__email}`.toLowerCase().includes(search.toLowerCase()));
  return <Shell title="Students">
    <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-black">Students</h1><input className="input input-bordered input-sm w-full sm:w-64" placeholder="Search students" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
    <ErrorMessage error={error} />
    {loading ? <Loading label="Loading students..." /> : <>
      <p className="font-semibold text-slate-500">{visible.length} of {data.students.length} active students in your assigned courses.</p>
      <div className="grid gap-3 md:grid-cols-2">{visible.map((student) => <article key={`${student.student_id}-${student.course_id}`} className="rounded border bg-white p-4 shadow-sm"><p className="font-black">{student.student__full_name}</p><p className="text-sm text-slate-500">{student.student__student_id} · {student.student__email}</p></article>)}</div>
      {!data.students.length && <p className="rounded border bg-white p-5 font-semibold text-slate-500">No students are enrolled in your assigned courses yet.</p>}
    </>}
  </Shell>;
}

export function TeacherNotificationsPage() {
  const emptyForm = { title: "", summary: "", body: "", category: "Admission", course: "", course_section: "", subject: "", target_url: "", publish_at: "", expires_at: "", is_public: true, is_published: true };
  const { data, error } = useTeacherData();
  const [notices, setNotices] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const loadNotices = async () => { try { setNotices(await noticeApi.listResults()); } catch (requestError) { setMessage(getApiErrorMessage(requestError, "Unable to load notices.")); } };
  useEffect(() => { loadNotices(); }, []);
  const courseSections = data.assigned_sections.filter((section) => !form.course || String(section.course) === String(form.course));
  const courseSubjects = data.assigned_subjects.filter((subject) => courseSections.some((section) => String(section.id) === String(subject.course_section)) && (!form.course_section || String(subject.course_section) === String(form.course_section)));
  const payload = () => Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value === "" ? null : value]));
  const save = async (event) => {
    event.preventDefault();
    if (isBlankRichText(form.body)) { setMessage("Notice details are required."); return; }
    setSaving(true);
    setMessage("");
    try {
      if (editing) await noticeApi.update(editing.id, payload());
      else await noticeApi.create(payload());
      setForm(emptyForm);
      setEditing(null);
      setMessage("Notice saved. Enrolled students will see it on their admission card.");
      notifySuccess(editing ? "Notice updated successfully." : "Notice created successfully.");
      await loadNotices();
    } catch (requestError) {
      const errorMessage = getApiErrorMessage(requestError, "Unable to save notice.");
      setMessage(errorMessage); notifyError(errorMessage);
    } finally {
      setSaving(false);
    }
  };
  const edit = (notice) => {
    setEditing(notice);
    setForm({
      title: notice.title || "",
      summary: notice.summary || "",
      body: notice.body || "",
      category: notice.category || "Admission",
      course: notice.course || "",
      course_section: notice.course_section || "",
      subject: notice.subject || "",
      target_url: notice.target_url || "",
      publish_at: notice.publish_at ? notice.publish_at.slice(0, 16) : "",
      expires_at: notice.expires_at ? notice.expires_at.slice(0, 16) : "",
      is_public: Boolean(notice.is_public),
      is_published: Boolean(notice.is_published),
    });
  };
  const remove = async (notice) => {
    if (!(await confirmDelete(`Notice "${notice.title}"`))) return;
    try { await noticeApi.remove(notice.id); notifySuccess("Notice deleted."); await loadNotices(); } catch (requestError) { notifyError(getApiErrorMessage(requestError, "Could not delete this notice.")); }
  };
  return (
    <Shell title="Notices">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-3xl font-black">Admission Notices</h1><p className="font-semibold text-slate-500">Create, update, and delete notices for your assigned admission courses and subjects.</p></div>
        <span className="rounded bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-800">{notices.length} notices</span>
      </div>
      <ErrorMessage error={error || message} />
      <div className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
        <form onSubmit={save} className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black">{editing ? "Update notice" : "Create notice"}</h2>
          <div className="mt-4 grid gap-3">
            <label className="grid gap-1 text-sm font-bold text-slate-700">Title<input required className="input input-bordered" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
            <label className="grid gap-1 text-sm font-bold text-slate-700">Short summary<input className="input input-bordered" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} /></label>
            <label className="grid gap-1 text-sm font-bold text-slate-700">Notice details<RichTextEditor value={form.body} onChange={(value) => setForm({ ...form, body: value })} placeholder="Write the notice details..." /></label>
            <label className="grid gap-1 text-sm font-bold text-slate-700">Admission / Course<select required className="select select-bordered" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value, course_section: "", subject: "" })}><option value="">Select admission</option>{data.assigned_courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select></label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-sm font-bold text-slate-700">Subject group<select className="select select-bordered" value={form.course_section} onChange={(e) => setForm({ ...form, course_section: e.target.value, subject: "" })}><option value="">All groups</option>{courseSections.map((section) => <option key={section.id} value={section.id}>{section.name}</option>)}</select></label>
              <label className="grid gap-1 text-sm font-bold text-slate-700">Subject<select className="select select-bordered" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}><option value="">All subjects</option>{courseSubjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select></label>
              <label className="grid gap-1 text-sm font-bold text-slate-700">Publish at<input type="datetime-local" className="input input-bordered" value={form.publish_at} onChange={(e) => setForm({ ...form, publish_at: e.target.value })} /></label>
              <label className="grid gap-1 text-sm font-bold text-slate-700">Expire at<input type="datetime-local" className="input input-bordered" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} /></label>
            </div>
            <label className="grid gap-1 text-sm font-bold text-slate-700">Related link<input className="input input-bordered" value={form.target_url} onChange={(e) => setForm({ ...form, target_url: e.target.value })} /></label>
            <div className="flex flex-wrap gap-4">
              <label className="label cursor-pointer gap-2 font-bold"><input type="checkbox" className="checkbox checkbox-success" checked={form.is_public} onChange={(e) => setForm({ ...form, is_public: e.target.checked })} /> Public</label>
              <label className="label cursor-pointer gap-2 font-bold"><input type="checkbox" className="checkbox checkbox-success" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} /> Published</label>
            </div>
          </div>
          <div className="mt-5 flex gap-2">
            <button disabled={saving} className="btn btn-success flex-1 text-white">{saving ? "Saving..." : editing ? "Update notice" : "Create notice"}</button>
            {editing && <button type="button" className="btn" onClick={() => { setEditing(null); setForm(emptyForm); }}>Cancel</button>}
          </div>
        </form>
        <section className="grid gap-3">
          {notices.map((notice) => <article key={notice.id} className="rounded border border-emerald-100 bg-white p-4 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-black uppercase text-emerald-700">{notice.course_title || "Assigned admission"}{notice.subject_name ? ` / ${notice.subject_name}` : ""}</p><h2 className="font-black">{notice.title}</h2>{notice.summary ? <p className="mt-1 text-sm font-semibold text-slate-500">{notice.summary}</p> : <SafeHtml html={notice.body} className="mt-1 text-sm font-semibold text-slate-500" />}</div><div className="flex gap-2"><button className="btn btn-info btn-xs text-white" onClick={() => edit(notice)}>Edit</button><button className="btn btn-error btn-xs text-white" onClick={() => remove(notice)}>Delete</button></div></div></article>)}
          {!notices.length && <p className="rounded border border-dashed border-emerald-200 bg-white p-8 text-center font-semibold text-slate-500">No notices created for your admissions yet.</p>}
        </section>
      </div>
    </Shell>
  );
}

export function TeacherAssignmentsPage() {
  const { data, error, loading, reload } = useTeacherData(); const [form, setForm] = useState({ teacher: "", course: "", course_section: "", subject: "", role: "subject_teacher" }); const [saving, setSaving] = useState(false); const [message, setMessage] = useState("");
  const courseSections = data.assigned_sections.filter((section) => String(section.course) === String(form.course));
  const courseSubjects = data.assigned_subjects.filter((subject) => courseSections.some((section) => String(section.id) === String(subject.course_section)) && (!form.course_section || String(subject.course_section) === String(form.course_section)));
  const invite = async (event) => {
    event.preventDefault(); setSaving(true); setMessage("");
    try {
      await api.post("/courses/teacher/dashboard/invite_teacher/", { ...form, course_section: form.course_section || null, subject: form.subject || null });
      setForm({ teacher: "", course: "", course_section: "", subject: "", role: "subject_teacher" });
      setMessage("Invitation sent. The teacher must accept before creating content.");
      notifySuccess("Teacher invitation sent.");
      await reload();
    } catch (requestError) {
      const errorMessage = getApiErrorMessage(requestError, "Unable to send invitation.");
      setMessage(errorMessage); notifyError(errorMessage);
    } finally { setSaving(false); }
  };
  if (loading) return <Shell title="Teacher Assignments"><Loading label="Loading..." /></Shell>;
  if (!data.is_head_teacher) return <Shell title="Teacher Assignments"><div className="rounded-xl border border-amber-200 bg-amber-50 p-6"><h1 className="text-2xl font-black">Head teacher access required</h1><p className="mt-2 font-semibold text-slate-600">Only a head teacher can invite teachers to admission subjects.</p></div></Shell>;
  return <Shell title="Teacher Assignments"><div className="grid gap-6 xl:grid-cols-[400px_minmax(0,1fr)]"><form onSubmit={invite} className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm"><h1 className="text-2xl font-black">Assign a teacher</h1><p className="mt-1 text-sm font-semibold text-slate-500">The invited teacher must accept before they can create material or tests.</p>{message && <p className="mt-4 rounded bg-emerald-50 p-3 text-sm font-bold text-emerald-800">{message}</p>}<div className="mt-4 grid gap-3"><select required className="select select-bordered" value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })}><option value="">Select teacher</option>{data.available_teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.full_name} · {teacher.email}</option>)}</select><select required className="select select-bordered" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value, course_section: "", subject: "" })}><option value="">Select admission</option>{data.assigned_courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select><select className="select select-bordered" value={form.course_section} onChange={(e) => setForm({ ...form, course_section: e.target.value, subject: "" })}><option value="">Select subject group</option>{courseSections.map((section) => <option key={section.id} value={section.id}>{section.name}</option>)}</select><select className="select select-bordered" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}><option value="">Select subject</option>{courseSubjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select></div><button disabled={saving} className="btn btn-success mt-5 w-full text-white">{saving ? "Sending..." : "Send teacher invitation"}</button></form><section className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm"><h2 className="font-black">Your active teaching structure</h2><div className="mt-4 grid gap-3">{data.assignments.map((assignment) => <article key={assignment.id} className="rounded-lg border border-slate-200 p-4"><p className="font-black">{data.assigned_courses.find((course) => String(course.id) === String(assignment.course))?.title || "Admission"}</p><p className="mt-1 text-sm font-semibold text-slate-500">{data.assigned_subjects.find((subject) => String(subject.id) === String(assignment.subject))?.name || "Program-wide"} · {assignment.role.replaceAll("_", " ")}</p></article>)}</div></section></div><ErrorMessage error={error} /></Shell>;
}

export function TeacherReviewPage() {
  const { data, assessments, materials, error, loading, reload } = useTeacherData(); const [busy, setBusy] = useState("");
  const review = async (type, item, decision) => {
    if (decision === "reject" && !(await confirmAction({ title: "Request changes?", text: `"${item.title}" will be sent back to the teacher for revision.`, confirmText: "Yes, request changes", danger: true }))) return;
    setBusy(`${type}-${item.id}`);
    try {
      const resource = type === "material" ? materialApi : assessmentApi;
      await resource.action(item.id, "review", { decision });
      notifySuccess(decision === "approve" ? "Content approved and published." : "Sent back for changes.");
      await reload();
    } catch (requestError) {
      notifyError(getApiErrorMessage(requestError, "Could not process this review."));
    } finally { setBusy(""); }
  };
  if (loading) return <Shell title="Content Review"><Loading label="Loading review queue..." /></Shell>;
  if (!data.is_head_teacher) return <Shell title="Content Review"><div className="rounded-xl border border-amber-200 bg-amber-50 p-6"><h1 className="text-2xl font-black">Head teacher access required</h1><p className="mt-2 font-semibold text-slate-600">Head teachers review teacher-created materials and assessments before students can access them.</p></div></Shell>;
  const pendingMaterials = materials.filter((item) => item.review_status === "pending"); const pendingAssessments = assessments.filter((item) => item.review_status === "pending");
  const row = (type, item) => <article key={`${type}-${item.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4"><div><p className="font-black">{item.title}</p><p className="text-sm font-semibold text-slate-500">{item.chapter || "No chapter"} · {item.subject || "Admission-wide"}</p></div><div className="flex gap-2"><button disabled={busy === `${type}-${item.id}`} onClick={() => review(type, item, "approve")} className="btn btn-success btn-sm text-white">Approve & publish</button><button disabled={busy === `${type}-${item.id}`} onClick={() => review(type, item, "reject")} className="btn btn-error btn-sm text-white">Request changes</button></div></article>;
  return <Shell title="Content Review"><div><p className="text-sm font-black uppercase text-emerald-700">Head teacher workspace</p><h1 className="text-3xl font-black">Review submitted content</h1><p className="mt-1 font-semibold text-slate-500">Students only receive approved content for their active admission enrollment.</p></div><ErrorMessage error={error} /><section className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm"><h2 className="font-black">Study materials awaiting review</h2><div className="mt-4 grid gap-3">{pendingMaterials.map((item) => row("material", item))}{!pendingMaterials.length && <p className="text-sm font-semibold text-slate-500">No materials waiting for review.</p>}</div></section><section className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm"><h2 className="font-black">MCQ and online tests awaiting review</h2><div className="mt-4 grid gap-3">{pendingAssessments.map((item) => row("assessment", item))}{!pendingAssessments.length && <p className="text-sm font-semibold text-slate-500">No assessments waiting for review.</p>}</div></section></Shell>;
}
