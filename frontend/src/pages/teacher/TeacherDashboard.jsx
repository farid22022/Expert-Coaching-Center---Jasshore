import { useEffect, useState } from "react";
import { Bell, BookOpen, ClipboardList, HelpCircle, LayoutDashboard, Layers, UserRound, Users } from "lucide-react";

import { getApiErrorMessage } from "../../services/api.js";
import { assessmentApi, assessmentQuestionApi, materialApi, questionApi, questionOptionApi, teacherDashboardApi } from "../../services/resourceApi.js";
import api from "../../services/api.js";
import RoleDashboardShell from "../../components/layout/RoleDashboardShell.jsx";

function Stat({ icon: Icon, label, value }) {
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

function findById(rows, id) {
  return (rows || []).find((item) => String(item.id) === String(id));
}

function courseTitleFor(assignment, data) {
  return findById(data.assigned_courses, assignment.course)?.title || `Assigned Course #${assignment.course || assignment.id}`;
}

function sectionTitleFor(assignment, data) {
  return findById(data.assigned_sections, assignment.course_section)?.name || "All Sections";
}

function subjectTitleFor(assignment, data) {
  return findById(data.assigned_subjects, assignment.subject)?.name || "";
}

export function CreatePanel({ mode, data, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: "", text: "", description: "", assessment_type: mode === "assignment" ? "assignment" : "mcq",
    course: data.assigned_courses[0]?.id || "", course_section: data.assigned_sections[0]?.id || "",
    subject: data.assigned_subjects[0]?.id || "", duration_minutes: 20, starts_at: "", ends_at: "",
    status: "published", question_type: "single", options: ["", "", "", ""], correct: [0],
    material_type: "note", url: "", is_published: true, questionText: "", questionOptions: ["", "", "", ""], questionCorrect: [0],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  async function submit(event) {
    event.preventDefault();
    setSaving(true); setError("");
    try {
      if (mode === "question") {
        const question = await questionApi.create({ course: form.course, course_section: form.course_section || null, subject: form.subject || null, text: form.text, question_type: form.question_type, marks: 1, status: "active" });
        const options = form.options.filter(Boolean);
        await Promise.all(options.map((text, order) => questionOptionApi.create({ question: question.id, text, order, is_correct: form.correct.includes(order) })));
      } else if (mode === "material") {
        await materialApi.create({ course: form.course, course_section: form.course_section || null, subject: form.subject || null, title: form.title, description: form.description, material_type: form.material_type, url: form.url, is_published: form.is_published });
      } else {
        const assessment = await assessmentApi.create({ title: form.title, assessment_type: form.assessment_type, course: form.course, course_section: form.course_section || null, subject: form.subject || null, duration_minutes: Number(form.duration_minutes), starts_at: form.starts_at || null, ends_at: form.ends_at || null, status: form.status });
        if (form.assessment_type !== "assignment" && form.questionText.trim()) {
          const question = await questionApi.create({ course: form.course, course_section: form.course_section || null, subject: form.subject || null, text: form.questionText, question_type: "single", marks: 1, status: "active" });
          const options = form.questionOptions.filter(Boolean);
          await Promise.all(options.map((text, order) => questionOptionApi.create({ question: question.id, text, order, is_correct: form.questionCorrect.includes(order) })));
          await assessmentQuestionApi.create({ assessment: assessment.id, question: question.id, order: 1, marks: 1 });
        }
      }
      await onSaved();
      onClose();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Could not save this item."));
    } finally { setSaving(false); }
  }

  const heading = mode === "question" ? "Add Question" : mode === "material" ? "Add Study Material" : "Create Assessment";
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
    <form onSubmit={submit} className="max-h-[90vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-lg bg-white p-5 shadow-2xl">
      <div className="flex items-center justify-between"><h3 className="text-xl font-black">{heading}</h3><button type="button" className="btn btn-sm" onClick={onClose}>Close</button></div>
      {error && <div className="rounded bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{error}</div>}
      {mode === "question" ? <>
        <textarea required className="textarea textarea-bordered w-full" placeholder="Question text" value={form.text} onChange={(e) => update("text", e.target.value)} />
        <div className="grid gap-3 sm:grid-cols-2">{form.options.map((value, index) => <div key={index} className="flex gap-2"><input className="input input-bordered w-full" placeholder={`Option ${index + 1}`} value={value} onChange={(e) => update("options", form.options.map((item, i) => i === index ? e.target.value : item))} /><input type={form.question_type === "single" ? "radio" : "checkbox"} name="correct" className={form.question_type === "single" ? "radio radio-success" : "checkbox checkbox-success"} checked={form.correct.includes(index)} onChange={() => update("correct", form.question_type === "single" ? [index] : (form.correct.includes(index) ? form.correct.filter((item) => item !== index) : [...form.correct, index]))} /></div>)}</div>
        <select className="select select-bordered w-full" value={form.question_type} onChange={(e) => update("question_type", e.target.value)}><option value="single">Single answer</option><option value="multiple">Multiple answers</option></select>
      </> : <>
        <input required className="input input-bordered w-full" placeholder={mode === "material" ? "Material title" : "Assessment title"} value={form.title} onChange={(e) => update("title", e.target.value)} />
        {mode === "material" && <><textarea className="textarea textarea-bordered w-full" placeholder="Study notes or description" value={form.description} onChange={(e) => update("description", e.target.value)} /><select className="select select-bordered w-full" value={form.material_type} onChange={(e) => update("material_type", e.target.value)}><option value="note">Study note</option><option value="link">Web link</option><option value="video">Video</option><option value="file">File link</option></select><input className="input input-bordered w-full" placeholder="Resource URL (optional)" value={form.url} onChange={(e) => update("url", e.target.value)} /></>}
        {mode !== "material" && <><div className="grid gap-3 sm:grid-cols-2"><select className="select select-bordered" value={form.assessment_type} onChange={(e) => update("assessment_type", e.target.value)}><option value="mcq">MCQ Test</option><option value="exam">Online Exam</option><option value="assignment">Assignment</option></select><input type="number" min="1" className="input input-bordered" value={form.duration_minutes} onChange={(e) => update("duration_minutes", e.target.value)} placeholder="Minutes" /><input type="datetime-local" className="input input-bordered" value={form.starts_at} onChange={(e) => update("starts_at", e.target.value)} /><input type="datetime-local" className="input input-bordered" value={form.ends_at} onChange={(e) => update("ends_at", e.target.value)} /></div>{form.assessment_type !== "assignment" && <><textarea className="textarea textarea-bordered w-full" placeholder="First MCQ question (optional; you can add more from Question Bank)" value={form.questionText} onChange={(e) => update("questionText", e.target.value)} />{form.questionOptions.map((value, index) => <input key={index} className="input input-bordered w-full" placeholder={`Answer option ${index + 1}`} value={value} onChange={(e) => update("questionOptions", form.questionOptions.map((item, i) => i === index ? e.target.value : item))} />)}</>}</>}
      </>}
      <div className="grid gap-3 sm:grid-cols-3"><select required className="select select-bordered" value={form.course} onChange={(e) => update("course", e.target.value)}><option value="">Select course</option>{data.assigned_courses.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select><select className="select select-bordered" value={form.course_section} onChange={(e) => update("course_section", e.target.value)}><option value="">All sections</option>{data.assigned_sections.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><select className="select select-bordered" value={form.subject} onChange={(e) => update("subject", e.target.value)}><option value="">All subjects</option>{data.assigned_subjects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
      <div className="flex justify-end gap-2"><button type="button" className="btn" onClick={onClose}>Cancel</button><button disabled={saving} className="btn btn-success text-white">{saving ? "Saving..." : "Save and publish"}</button></div>
    </form>
  </div>;
}

export default function TeacherDashboard() {
  const [assessmentTab, setAssessmentTab] = useState("All");
  const [createOpen, setCreateOpen] = useState(false);
  const [data, setData] = useState({ assigned_courses: [], assigned_sections: [], assigned_subjects: [], assignments: [], students: [] });
  const [assessments, setAssessments] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [analytics, setAnalytics] = useState({ assessment_count: 0, participant_count: 0, average_score: 0, highest_score: 0, lowest_score: 0 });
  const [error, setError] = useState("");
  const [createMode, setCreateMode] = useState(null);

  async function reloadContent() {
    const [assessmentRows, questionRows, materialRows] = await Promise.all([assessmentApi.listResults(), questionApi.listResults(), materialApi.listResults()]);
    setAssessments(assessmentRows); setQuestions(questionRows); setMaterials(materialRows);
  }

  useEffect(() => {
    Promise.all([
      teacherDashboardApi.list().catch((requestError) => {
        setError(getApiErrorMessage(requestError, "Unable to load teacher assignments."));
        return null;
      }),
      assessmentApi.listResults().catch(() => []),
      questionApi.listResults().catch(() => []),
      api.get("/assessments/analytics/teacher/").then((response) => response.data).catch(() => null),
      materialApi.listResults().catch(() => []),
    ]).then(([dashboard, assessmentRows, questionRows, analyticsData, materialRows]) => {
      if (dashboard) setData(dashboard);
      setAssessments(assessmentRows);
      setQuestions(questionRows);
      if (analyticsData) setAnalytics(analyticsData);
      setMaterials(materialRows);
    });
  }, []);

  const navItems = [
    { label: "Dashboard", to: "/teacher/dashboard", icon: LayoutDashboard, end: true },
    { label: "My Courses", to: "/teacher/dashboard/courses", icon: BookOpen },
    { label: "Assessments", to: "/teacher/dashboard/assessments", icon: ClipboardList },
    { label: "Question Bank", to: "/teacher/dashboard/question-bank", icon: HelpCircle },
    { label: "Students", to: "/teacher/dashboard/students", icon: Users },
    { label: "Notifications", to: "/teacher/dashboard/notifications", icon: Bell },
    { label: "Profile", to: "/profile", icon: UserRound },
  ];

  const createOptions = [
    ["MCQ Test", "Multiple choice assessment"],
    ["Live MCQ", "Scheduled live test"],
    ["Assignment", "PDF/Image submission"],
    ["Online Exam", "Full examination"],
  ];

  return (
    <RoleDashboardShell roleLabel="Teacher Portal" title="Teacher Dashboard" items={navItems}>
      <section className="mx-auto max-w-7xl space-y-5">
        <div>
          <p className="text-sm font-black uppercase text-emerald-700">Expert Coaching Center</p>
          <h1 className="text-3xl font-black text-slate-950">Teacher Dashboard</h1>
        </div>

        {error && <div className="rounded border border-red-100 bg-red-50 px-4 py-2 text-sm font-bold text-red-700">{error}</div>}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat icon={BookOpen} label="Assigned Courses" value={data.assigned_courses.length} />
          <Stat icon={Users} label="Students" value={analytics.participant_count || "-"} />
          <Stat icon={ClipboardList} label="Upcoming Tests" value={assessments.filter((item) => item.status === "scheduled").length} />
          <Stat icon={Layers} label="Pending Reviews" value={assessments.filter((item) => item.status === "submitted").length} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat icon={ClipboardList} label="Participants" value={analytics.participant_count} />
          <Stat icon={BookOpen} label="Average Score" value={Number(analytics.average_score || 0).toFixed(1)} />
          <Stat icon={Layers} label="Highest Score" value={Number(analytics.highest_score || 0).toFixed(1)} />
          <Stat icon={Users} label="Lowest Score" value={Number(analytics.lowest_score || 0).toFixed(1)} />
        </div>

        <section id="courses" className="rounded-md border border-base-300 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-950">My Courses</h2>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <div className="mt-4 space-y-3">
              {data.assignments.map((item) => (
                <div key={item.id} className="rounded border border-slate-200 p-3">
                  <p className="font-black">{courseTitleFor(item, data)}</p>
                  <p className="text-sm font-semibold text-slate-500">
                    {sectionTitleFor(item, data)}{subjectTitleFor(item, data) ? ` - ${subjectTitleFor(item, data)}` : ""} - {item.role?.replaceAll("_", " ")}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-emerald-800">
                    {["Overview", "Content", "Assessments", "Students"].map((label) => <span key={label} className="rounded bg-emerald-50 px-2 py-1">{label}</span>)}
                  </div>
                </div>
              ))}
              {!data.assignments.length && <p className="text-sm font-semibold text-slate-500">No active assignments found.</p>}
            </div>
          </div>
        </section>

        <section id="assessments" className="rounded-md border border-base-300 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-black text-slate-950">Assessments</h2>
            <button type="button" className="btn btn-success btn-sm text-white" onClick={() => setCreateOpen((value) => !value)}>+ Create Assessment</button>
          </div>
          <div className="tabs tabs-boxed mt-4 bg-emerald-50">
            {["All", "Draft", "Scheduled", "Live", "Completed"].map((tab) => (
              <button key={tab} type="button" className={`tab text-sm font-bold ${assessmentTab === tab ? "tab-active" : ""}`} onClick={() => setAssessmentTab(tab)}>{tab}</button>
            ))}
          </div>
          {createOpen && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {createOptions.map(([title, description]) => (
                <button key={title} type="button" onClick={() => setCreateMode(title === "Assignment" ? "assignment" : "assessment")} className="rounded-md border border-emerald-100 bg-emerald-50 p-4 text-left hover:border-emerald-400">
                  <p className="font-black text-slate-950">{title}</p>
                  <p className="text-sm font-semibold text-slate-500">{description}</p>
                </button>
              ))}
            </div>
          )}
          <div className="mt-4 space-y-2">
            {assessments.slice(0, 6).map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded border border-slate-200 px-3 py-2">
                <span className="font-bold">{item.title}</span>
                <span className="badge badge-success text-white">{item.status}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="question-bank" className="rounded-md border border-base-300 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-950">Question Bank</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">{questions.length} questions available for assigned academic work.</p>
            </div>
            <button type="button" onClick={() => setCreateMode("question")} className="btn btn-sm bg-emerald-700 text-white">+ Add Question</button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-slate-600">
            {["All Questions", "My Questions", "Course", "Section", "Subject", "Chapter", "Question Type", "Difficulty"].map((label) => <span key={label} className="rounded-md border border-slate-200 px-3 py-2">{label}</span>)}
          </div>
        </section>

        <section className="rounded-md border border-base-300 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-black text-slate-950">Study Materials</h2><p className="text-sm font-semibold text-slate-500">Publish notes, links, videos, and files for your assigned students.</p></div><button type="button" onClick={() => setCreateMode("material")} className="btn btn-sm bg-emerald-700 text-white">+ Add Material</button></div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">{materials.slice(0, 6).map((item) => <div key={item.id} className="rounded border border-slate-200 p-3"><p className="font-black">{item.title}</p><p className="text-sm text-slate-500">{item.material_type}</p></div>)}{!materials.length && <p className="text-sm font-semibold text-slate-500">No study materials published yet.</p>}</div>
        </section>

        <section id="students" className="rounded-md border border-base-300 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-950">Students</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">{data.students.length} active students from your authorized courses.</p>
          <div className="mt-4 grid gap-2 md:grid-cols-2">{data.students.slice(0, 12).map((student) => <div key={`${student.student_id}-${student.course_id}`} className="rounded border border-slate-200 px-3 py-2"><p className="font-bold">{student.student__full_name}</p><p className="text-xs text-slate-500">{student.student__student_id} · {student.student__email}</p></div>)}</div>
        </section>

        <section id="notifications" className="rounded-md border border-base-300 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-950">Notifications</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">Assessment updates and review reminders will appear here.</p>
        </section>
      </section>
      {createMode && <CreatePanel mode={createMode} data={data} onClose={() => setCreateMode(null)} onSaved={reloadContent} />}
    </RoleDashboardShell>
  );
}
