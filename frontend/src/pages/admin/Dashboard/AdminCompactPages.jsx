import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ClipboardList, CreditCard, Megaphone, Settings, Trash2, Users } from "lucide-react";
import { courseApi, courseSectionApi, courseSubjectApi, noticeApi } from "../../../services/resourceApi.js";
import { getApiErrorMessage } from "../../../services/api.js";

const tabs = {
  academic: [
    ["Courses", "courses"],
    ["Sections", "courses/sections"],
    ["Subjects", "courses/subjects"],
    ["Teacher Assignments", "teacher-assignments"],
  ],
  users: [
    ["Students", "user-management/student"],
    ["Teachers", "user-management/teacher"],
    ["Employees", "user-management/employee"],
    ["Management", "user-management/management"],
  ],
  assessments: [
    ["All", "examination"],
    ["MCQ", "online-application/admission-exam"],
    ["Assignments", "student-work/assignment"],
    ["Exams", "examination/exam-list"],
  ],
  payments: [
    ["Fees Collection", "manage-accounts/fees-collection"],
    ["Fees Category", "manage-accounts/fees-category"],
    ["Expense", "manage-accounts/expense"],
    ["Income", "manage-accounts/income"],
  ],
  settings: [
    ["System Setup", "system-setup"],
    ["Admin Panel", "admin-panel"],
    ["Dynamic Website", "dynamic-website"],
    ["SMS/Mail", "mail-sms-service"],
  ],
};

function rootFromLocation() {
  return window.location.pathname.startsWith("/admin/dashboard") ? "/admin/dashboard" : "/dashboard";
}

function CompactPage({ title, eyebrow, icon: Icon, description, tabKey, actionLabel, actionTo, cards = [], quickActions = [] }) {
  const root = rootFromLocation();
  const localTabs = tabs[tabKey] || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase text-emerald-700">{eyebrow}</p>
          <h1 className="text-3xl font-black text-slate-950">{title}</h1>
          <p className="mt-1 max-w-3xl text-sm font-semibold text-slate-500">{description}</p>
        </div>
        {actionLabel && (
          <Link to={`${root}/${actionTo || ""}`} className="btn btn-success btn-sm text-white">
            {actionLabel}
          </Link>
        )}
      </div>

      {localTabs.length > 0 && (
        <nav className="flex flex-wrap gap-2 rounded-md border border-slate-200 bg-white p-2 shadow-sm">
          {localTabs.map(([label, path]) => (
            <Link key={label} to={`${root}/${path}`} className="rounded-md px-3 py-2 text-sm font-black text-slate-800 hover:bg-emerald-50 hover:text-emerald-700">
              {label}
            </Link>
          ))}
        </nav>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value]) => (
          <article key={label} className="rounded-md border border-emerald-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-50 text-emerald-700"><Icon size={20} /></span>
              <div>
                <p className="text-2xl font-black text-slate-950">{value}</p>
                <p className="text-sm font-bold text-slate-500">{label}</p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-md border border-base-300 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black text-slate-950">Overview</h2>
        <p className="mt-2 text-sm font-semibold text-slate-500">
          Use the tabs above to manage the related tools. The sidebar stays compact, while each section keeps its detailed workflow inside this parent destination.
        </p>
        {quickActions.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {quickActions.map(([label, path]) => (
              <Link key={label} to={`${root}/${path}`} className="btn btn-sm border-emerald-100 bg-emerald-50 text-emerald-800 hover:bg-emerald-100">
                {label}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export function AdminAcademicPage() {
  return <CompactPage title="Academic Management" eyebrow="Admin" icon={BookOpen} description="Create admission/course cards, manage sections and subjects, then assign teachers to courses, admissions, sections, and subjects." tabKey="academic" actionLabel="+ Create Admission / Course" actionTo="courses" cards={[["Active Courses", 12], ["Sections", 18], ["Subjects", 42], ["Teachers", 32]]} quickActions={[["+ Assign Teacher", "teacher-assignments"], ["Manage Sections", "courses/sections"], ["Manage Subjects", "courses/subjects"]]} />;
}

export function AdminUsersPage() {
  return <CompactPage title="Users" eyebrow="Admin" icon={Users} description="Manage students, teachers, employees, and management accounts." tabKey="users" actionLabel="+ Add User" cards={[["Students", 1250], ["Teachers", 32], ["Employees", 14], ["Management", 4]]} />;
}

export function AdminAssessmentsPage() {
  return <CompactPage title="Assessments" eyebrow="Admin" icon={ClipboardList} description="Inspect MCQs, assignments, live tests, and exams with contextual filters." tabKey="assessments" actionLabel="+ Create Assessment" cards={[["All", 64], ["Live", 2], ["Scheduled", 8], ["Completed", 54]]} />;
}

export function AdminPaymentsPage() {
  return <CompactPage title="Payments" eyebrow="Admin" icon={CreditCard} description="Manage collections, fee categories, expenses, income, and account reports." tabKey="payments" actionLabel="+ Record Payment" actionTo="manage-accounts/fees-collection/fees-collection-create" cards={[["Collected", "৳0"], ["Due", "৳0"], ["Expenses", "৳0"], ["Reports", 4]]} />;
}

export function AdminNotificationsPage() {
  const emptyForm = { title: "", summary: "", body: "", category: "Admission", course: "", course_section: "", subject: "", target_url: "", publish_at: "", expires_at: "", is_public: true, is_published: true };
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [notices, setNotices] = useState([]);
  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const [noticeRows, courseRows, sectionRows, subjectRows] = await Promise.all([
        noticeApi.listResults(),
        courseApi.listResults(),
        courseSectionApi.listResults(),
        courseSubjectApi.listResults(),
      ]);
      setNotices(noticeRows);
      setCourses(courseRows);
      setSections(sectionRows);
      setSubjects(subjectRows);
    } catch (error) {
      setMessage(getApiErrorMessage(error, "Unable to load notices."));
    }
  };
  useEffect(() => { load(); }, []);

  const filteredSections = useMemo(() => sections.filter((section) => !form.course || String(section.course) === String(form.course)), [form.course, sections]);
  const filteredSubjects = useMemo(() => subjects.filter((subject) => !form.course_section || String(subject.course_section) === String(form.course_section)), [form.course_section, subjects]);
  const payload = () => Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value === "" ? null : value]));
  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      if (editing) await noticeApi.update(editing.id, payload());
      else await noticeApi.create(payload());
      setForm(emptyForm);
      setEditing(null);
      setMessage("Notice saved and synchronized with public and student admission pages.");
      await load();
    } catch (error) {
      setMessage(getApiErrorMessage(error, "Unable to save notice."));
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
    if (!window.confirm(`Delete notice "${notice.title}"?`)) return;
    await noticeApi.remove(notice.id);
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase text-emerald-700">Admin</p>
          <h1 className="text-3xl font-black text-slate-950">Notices</h1>
          <p className="mt-1 max-w-3xl text-sm font-semibold text-slate-500">Create, update, and remove admission notices shown on the public notices page and enrolled student admission cards.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-800"><Megaphone size={18} /> {notices.length} notices</span>
      </div>
      {message && <p className="rounded-md border border-emerald-100 bg-emerald-50 p-3 text-sm font-bold text-emerald-800">{message}</p>}
      <div className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
        <form onSubmit={save} className="rounded-md border border-emerald-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-950">{editing ? "Update notice" : "Create notice"}</h2>
          <div className="mt-4 grid gap-3">
            <label className="grid gap-1 text-sm font-bold text-slate-700">Title<input required className="input input-bordered" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
            <label className="grid gap-1 text-sm font-bold text-slate-700">Short summary<input className="input input-bordered" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} /></label>
            <label className="grid gap-1 text-sm font-bold text-slate-700">Full notice<textarea required className="textarea textarea-bordered min-h-28" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-sm font-bold text-slate-700">Category<input className="input input-bordered" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></label>
              <label className="grid gap-1 text-sm font-bold text-slate-700">Admission / Course<select className="select select-bordered" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value, course_section: "", subject: "" })}><option value="">All admissions</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select></label>
              <label className="grid gap-1 text-sm font-bold text-slate-700">Subject group<select className="select select-bordered" value={form.course_section} onChange={(e) => setForm({ ...form, course_section: e.target.value, subject: "" })}><option value="">All groups</option>{filteredSections.map((section) => <option key={section.id} value={section.id}>{section.name}</option>)}</select></label>
              <label className="grid gap-1 text-sm font-bold text-slate-700">Subject<select className="select select-bordered" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}><option value="">All subjects</option>{filteredSubjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select></label>
              <label className="grid gap-1 text-sm font-bold text-slate-700">Publish at<input type="datetime-local" className="input input-bordered" value={form.publish_at} onChange={(e) => setForm({ ...form, publish_at: e.target.value })} /></label>
              <label className="grid gap-1 text-sm font-bold text-slate-700">Expire at<input type="datetime-local" className="input input-bordered" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} /></label>
            </div>
            <label className="grid gap-1 text-sm font-bold text-slate-700">Related link<input className="input input-bordered" value={form.target_url} onChange={(e) => setForm({ ...form, target_url: e.target.value })} /></label>
            <div className="flex flex-wrap gap-4">
              <label className="label cursor-pointer gap-2 font-bold"><input type="checkbox" className="checkbox checkbox-success" checked={form.is_public} onChange={(e) => setForm({ ...form, is_public: e.target.checked })} /> Show on public notices</label>
              <label className="label cursor-pointer gap-2 font-bold"><input type="checkbox" className="checkbox checkbox-success" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} /> Published</label>
            </div>
          </div>
          <div className="mt-5 flex gap-2">
            <button disabled={saving} className="btn btn-success flex-1 text-white">{saving ? "Saving..." : editing ? "Update notice" : "Create notice"}</button>
            {editing && <button type="button" className="btn" onClick={() => { setEditing(null); setForm(emptyForm); }}>Cancel</button>}
          </div>
        </form>
        <section className="grid gap-3">
          {notices.map((notice) => <article key={notice.id} className="rounded-md border border-emerald-100 bg-white p-4 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-black uppercase text-emerald-700">{notice.category || "Notice"}{notice.course_title ? ` / ${notice.course_title}` : ""}</p><h2 className="mt-1 text-lg font-black text-slate-950">{notice.title}</h2><p className="mt-1 text-sm font-semibold text-slate-500">{notice.summary || notice.body}</p></div><div className="flex gap-2"><button className="btn btn-info btn-xs text-white" onClick={() => edit(notice)}>Edit</button><button className="btn btn-error btn-xs text-white" onClick={() => remove(notice)}><Trash2 size={14} /> Delete</button></div></div></article>)}
          {!notices.length && <p className="rounded-md border border-dashed border-emerald-200 bg-white p-8 text-center font-semibold text-slate-500">No notices have been created yet.</p>}
        </section>
      </div>
    </div>
  );
}

export function AdminSettingsPage() {
  return <CompactPage title="Settings" eyebrow="Admin" icon={Settings} description="Configure system setup, roles, website settings, and communication options." tabKey="settings" actionLabel="+ Configure" cards={[["Roles", 0], ["Setup Lists", 12], ["Website", 1], ["Security", "On"]]} />;
}
