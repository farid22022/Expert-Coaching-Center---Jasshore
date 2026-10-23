import SharedPageHeader from "../../components/common/PageHeader.jsx";
import { WelcomePanel, StatCard } from "../../components/experience/ExperienceUI.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "../../components/common/motionVariants.js";
const MotionLink = motion.create(Link);
import { useEffect, useMemo, useRef, useState } from "react";
import { cleanSchemaForSave } from "../../services/admissionFormSchema.js";
import { admissionCardSetup, buildCardEditorLink } from "../../services/admissionCardSetup.js";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../services/queryClient.js";
import { AlertCircle, Bell, BookOpen, CalendarClock, CheckCircle2, ClipboardCheck, FilePenLine, GraduationCap, Image, Plus, Trash2, UserPlus, Users } from "lucide-react";
import api, { getApiErrorMessage, unwrapResults, API_BASE_URL } from "../../services/api.js";
import { confirmAction, confirmDelete, notifyError, notifySuccess } from "../../services/alerts.js";
import RichTextEditor from "../../components/common/RichTextEditor.jsx";
import Modal from "../../components/common/Modal.jsx";
import ImageUploader from "../../components/common/ImageUploader.jsx";
import {
  admissionPaymentApi,
  applicantDocumentApi,
  applicationApi,
  courseApi,
  courseSectionApi,
  courseSubjectApi,
  employeeApi,
  galleryApi,
  noticeApi,
  teacherAccountApi,
  teacherAssignmentApi,
} from "../../services/resourceApi.js";

const admissionStates = ["draft", "admission_open", "admission_closed", "running", "completed", "archived"];
const fieldTypes = ["text", "email", "tel", "number", "date", "textarea", "select", "file"];
const contentTypes = ["text", "image", "video", "link", "file", "banner", "teacher_card", "success_student", "success_story", "custom"];
const noticeCategories = ["Admission", "Exam", "Result", "Holiday", "Event", "Success Story", "General"];
const asArray = (value) => Array.isArray(value) ? value : value?.results || value?.data?.results || value?.data || [];
const message = (error) => getApiErrorMessage(error) || "Something went wrong. Please try again.";
const label = (record) => record?.title || record?.name || record?.full_name || "Untitled";

const newId = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
const blankFormSection = () => ({ id: newId(), title: "New Section", fields: [] });
const blankFormField = () => ({ id: newId(), label: "", name: "", type: "text", placeholder: "", required: false, optionsText: "" });
const blankCustomContent = () => ({ id: newId(), type: "text", label: "", value: "", url: "" });

function normalizeSchemaForEdit(schema) {
  return (Array.isArray(schema) ? schema : []).map((section) => ({
    id: section.id || newId(),
    title: section.title || "",
    fields: (section.fields || []).map((field) => ({
      id: field.id || newId(),
      label: field.label || "",
      name: field.name || "",
      type: field.type || "text",
      placeholder: field.placeholder || "",
      required: Boolean(field.required),
      optionsText: Array.isArray(field.options) ? field.options.join(", ") : "",
    })),
  }));
}

function normalizeContentForEdit(content) {
  return (Array.isArray(content) ? content : []).map((item) => ({
    id: item.id || newId(),
    type: item.type || "text",
    label: item.label || "",
    value: item.value || "",
    url: item.url || "",
  }));
}

function cleanContentForSave(content) {
  return content
    .map((item) => ({
      id: item.id || newId(),
      type: item.type || "text",
      label: item.label.trim(),
      value: item.value.trim(),
      url: item.url.trim(),
    }))
    .filter((item) => item.label || item.value || item.url);
}

function PageHeader({ action, ...props }) {
  return <SharedPageHeader {...props} actions={action} className="mb-6" />;
}

function Empty({ children }) {
  const animatedBook = String(children).startsWith("Create an admission card first");
  return <EmptyState description={children} animatedBook={animatedBook} />;
}

function Status({ value }) {
  const color = value === "approved" || value === "active" || value === "admission_open" ? "badge-success" : value === "rejected" || value === "archived" ? "badge-error" : "badge-warning";
  return <span className={`badge badge-sm ${color} font-bold text-white`}>{String(value || "pending").replaceAll("_", " ")}</span>;
}

const ADMIN_LISTS = {
  courses: { key: (p) => queryKeys.courses(p), params: { page_size: 100 }, fetch: (p) => courseApi.listResults(p) },
  teachers: { key: (p) => queryKeys.employees(p), params: { employee_type: "teacher", page_size: 100 }, fetch: (p) => employeeApi.listResults(p) },
  assignments: { key: (p) => queryKeys.teacherAssignments(p), params: { page_size: 200 }, fetch: (p) => teacherAssignmentApi.listResults(p) },
  applications: { key: (p) => queryKeys.applications(p), params: { page_size: 200, ordering: "-created_at" }, fetch: (p) => applicationApi.listResults(p) },
};

// Shared, cached admin lists. Every page asks only for what it renders; identical requests
// from different components share one cache entry instead of refetching on every mount.
function useAdminData(needs = ["courses", "teachers", "assignments", "applications"]) {
  const queryClient = useQueryClient();
  const results = Object.fromEntries(
    Object.entries(ADMIN_LISTS).map(([name, spec]) => [
      name,
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useQuery({ queryKey: spec.key(spec.params), queryFn: () => spec.fetch(spec.params), enabled: needs.includes(name), select: asArray }),
    ]),
  );
  const loading = needs.some((name) => results[name].isLoading);
  const reload = () => Promise.all(needs.map((name) => queryClient.invalidateQueries({ queryKey: ADMIN_LISTS[name].key(ADMIN_LISTS[name].params).slice(0, 1) })));
  return {
    courses: results.courses.data || EMPTY_LIST,
    teachers: results.teachers.data || EMPTY_LIST,
    assignments: results.assignments.data || EMPTY_LIST,
    applications: results.applications.data || EMPTY_LIST,
    loading,
    reload,
  };
}
const EMPTY_LIST = [];

export function AdminPortalDashboard() {
  const { data: stats, isLoading: loading } = useQuery({
    queryKey: queryKeys.adminStats,
    queryFn: ({ signal }) => api.get("/dashboard/admin-stats/", { signal }).then((response) => response.data),
  });
  // Only the 5 newest pending applications are shown, so ask the server for exactly those.
  const { data: pending = EMPTY_LIST, isLoading: pendingLoading } = useQuery({
    queryKey: queryKeys.applications({ status__in: "pending,under_review", page_size: 5, ordering: "-created_at" }),
    queryFn: ({ signal }) => api.get("/applications/", { params: { status__in: "pending,under_review", page_size: 5, ordering: "-created_at" }, signal }).then((response) => unwrapResults(response.data)),
  });
  const { data: navigationUsage } = useQuery({
    queryKey: ["admin-navigation-usage", 30],
    queryFn: () => api.get("/audit/navigation-usage/").then(({ data }) => data?.data || data),
    staleTime: 60_000,
  });
  const { courses } = useAdminData(["courses"]);
  const admissionSetups = useMemo(() => {
    const cards = (courses || []).filter((course) => course.course_type === "admission");
    return cards
      .map((course) => ({ course, setup: admissionCardSetup(course) }))
      .sort((a, b) => a.setup.percent - b.setup.percent || a.course.title.localeCompare(b.course.title));
  }, [courses]);
  const incompleteCount = admissionSetups.filter((row) => !row.setup.complete).length;
  const statCards = [
    ["Teachers", stats?.teachers ?? 0, GraduationCap, "/admin/dashboard/teachers", "text-emerald-700"],
    ["Admissions", stats?.admissions ?? 0, BookOpen, "/admin/dashboard/admissions", "text-blue-600"],
    ["Assignments", stats?.teacher_assignments ?? 0, Users, "/admin/dashboard/teacher-assignments", "text-purple-600"],
    ["Pending review", stats?.pending_applications ?? 0, ClipboardCheck, "/admin/dashboard/admission-applications", "text-amber-600"],
  ];
  const quickLinks = [
    ["Notices", "/admin/dashboard/notices", Bell, "Create & manage public notices, banners, stories"],
    ["Gallery", "/admin/dashboard/gallery", Image, "Upload photos and videos to the gallery"],
    ["Admission Forms", "/admin/dashboard/admission-form-builder", FilePenLine, "Build custom admission form fields"],
    ["Routine Builder", "/admin/dashboard/routine-builder", CalendarClock, "Create and maintain weekly class schedules"],
  ];
  return (
    <div>
      <WelcomePanel tone="admin" eyebrow="Expert · Control center" title="Everything in view. Everyone moving forward." description="Manage admissions, support your teachers and keep your institution’s next chapter on track." action={<Link className="btn experience-primary-cta" to="/admin/dashboard/admissions"><Plus size={17}/> New admission</Link>}/>
      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid gap-3 grid-cols-2 xl:grid-cols-4">
        {statCards.map(([name, value, Icon, to, iconColor]) => (
          <StatCard key={name} label={name} value={loading ? "…" : value} icon={Icon} to={to} tone={name === "Teachers" ? "mint" : name === "Admissions" ? "blue" : name === "Assignments" ? "lilac" : "amber"}/>
        ))}
      </motion.div>
      <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {quickLinks.map(([name, to, Icon, desc]) => (
          <Link key={name} to={to} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-emerald-300 hover:bg-emerald-50/40 transition">
            <Icon className="text-emerald-700 shrink-0 mt-0.5" size={18} />
            <div><p className="font-bold text-sm">{name}</p><p className="text-xs text-slate-500 mt-0.5">{desc}</p></div>
          </Link>
        ))}
      </div>
      <section className="mt-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-black text-slate-950">Admission card setup</h2>
            <p className="mt-0.5 text-sm font-medium text-slate-500">Finish each admission card so its public landing page is complete.</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-black ${incompleteCount ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-800"}`}>
            {incompleteCount ? `${incompleteCount} need${incompleteCount === 1 ? "s" : ""} setup` : "All cards ready"}
          </span>
        </div>
        <div className="mt-3 space-y-2">
          {admissionSetups.map(({ course, setup }) => {
            const missing = setup.items.filter((item) => !item.done);
            return (
              <div key={course.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {setup.complete ? <CheckCircle2 className="text-emerald-600 shrink-0" size={18} /> : <AlertCircle className="text-amber-500 shrink-0" size={18} />}
                    <Link to={buildCardEditorLink(course.id, "overview")} className="font-bold text-slate-900 hover:text-emerald-700">{course.title}</Link>
                    <span className="text-xs font-semibold text-slate-400">{setup.doneCount}/{setup.total}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-200" aria-hidden="true"><div className={`h-full rounded-full ${setup.complete ? "bg-emerald-500" : "bg-amber-400"}`} style={{ width: `${setup.percent}%` }} /></div>
                    <span className="w-9 text-right text-xs font-black text-slate-600">{setup.percent}%</span>
                  </div>
                </div>
                {missing.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {missing.map((item) => (
                      <Link key={item.key} to={buildCardEditorLink(course.id, item.tab)} title={item.hint} className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 hover:bg-amber-100">
                        <AlertCircle size={12} />{item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {!admissionSetups.length && <Empty>No admission cards yet. Create one to get started.</Empty>}
        </div>
      </section>
      <section className="mt-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-black text-slate-950">Admin navigation activity</h2><p className="mt-1 text-sm text-slate-500">Last 30 days · repeat visits to the same page are grouped into five-minute windows.</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-800">Route telemetry</span></div>
        {navigationUsage?.routes?.length ? <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{navigationUsage.routes.slice(0, 6).map((item) => <div key={item.record_id} className="min-w-0 rounded-lg border border-slate-100 bg-slate-50 p-3"><p className="truncate text-xs font-bold text-slate-700" title={item.record_id}>{item.record_id}</p><p className="mt-1 text-sm font-black text-emerald-800">{item.visits} visits · {item.staff} staff</p></div>)}</div> : <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-500">Navigation activity will appear as staff open admin pages. Existing routes stay available while usage is measured.</p>}
      </section>
      <section className="mt-5 rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4 sm:p-5">
          <div>
            <h2 className="font-black text-slate-950">Pending applications</h2>
            <p className="mt-0.5 text-sm font-medium text-slate-500">Review before students are enrolled.</p>
          </div>
          <Link className="btn btn-outline btn-sm" to="/admin/dashboard/admission-applications">View all</Link>
        </div>
        <div className="divide-y">
          {pending.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 p-3 sm:p-4">
              <div>
                <p className="font-bold text-sm">{item.applicant_name || "Applicant"}</p>
                <p className="text-xs text-slate-500">{item.course_title || item.course_name || `Program #${item.course || "-"}`} · {item.application_no}</p>
              </div>
              <Status value={item.status} />
            </div>
          ))}
          {!pendingLoading && !pending.length && <div className="p-4"><Empty>No applications are waiting for review.</Empty></div>}
        </div>
      </section>
    </div>
  );
}

const TEACHERS_PAGE_SIZE = 10;

export function AdminTeachersPage() {
  const { teachers, assignments, courses, loading, reload } = useAdminData(["courses", "teachers", "assignments"]);
  const [form, setForm] = useState({ employee_id: "", full_name: "", email: "", phone: "", joining_date: "", gender: "", qualification: "", specialization: "", bio: "", status: "active" });
  const [photo, setPhoto] = useState(null);
  const [saving, setSaving] = useState(false); const [error, setError] = useState(""); const [done, setDone] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async (event) => { event.preventDefault(); setSaving(true); setError(""); setDone(""); try { const payload = new FormData(); Object.entries(form).forEach(([key, value]) => { if (value !== "") payload.append(key, value); }); if (photo) payload.append("photo", photo); await teacherAccountApi.create(payload); setForm({ employee_id: "", full_name: "", email: "", phone: "", joining_date: "", gender: "", qualification: "", specialization: "", bio: "", status: "active" }); setPhoto(null); setDone("Teacher account and profile created. A password-setup invitation can be delivered when mail is connected."); notifySuccess("Teacher account created."); reload(); } catch (err) { setError(message(err)); notifyError(message(err)); } finally { setSaving(false); } };
  const visibleTeachers = teachers.filter((teacher) => `${teacher.full_name} ${teacher.email} ${teacher.phone}`.toLowerCase().includes(query.toLowerCase()));
  const pageCount = Math.max(1, Math.ceil(visibleTeachers.length / TEACHERS_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pagedTeachers = visibleTeachers.slice((currentPage - 1) * TEACHERS_PAGE_SIZE, currentPage * TEACHERS_PAGE_SIZE);
  const assignmentsFor = (teacher) => assignments.filter((assignment) => String(assignment.teacher) === String(teacher.id));
  const courseFor = (id) => label(courses.find((course) => String(course.id) === String(id)));
  return <div><PageHeader eyebrow="People" title="Teachers" description="Create teacher login accounts and maintain the teacher directory. A teacher account can then be assigned to one or more admissions and subjects." action={<Link className="btn btn-success text-white" to="/admin/teachers/create"><Plus size={17}/>Create teacher</Link>} />
    <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]"><form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm xl:sticky xl:top-6 xl:self-start"><h2 className="font-black">Create teacher</h2><p className="mt-1 text-sm text-slate-500">An invitation-ready account is created with a generated, hashed secret. No permanent password is displayed or stored in plain text.</p>{error && <p className="alert alert-error mt-4 text-sm">{error}</p>}{done && <p className="alert alert-success mt-4 text-sm">{done}</p>}<div className="mt-4 grid gap-3">{[["employee_id", "Teacher ID", "text"], ["full_name", "Full name", "text"], ["email", "Email", "email"], ["phone", "Mobile", "tel"], ["joining_date", "Joining date", "date"], ["qualification", "Qualification", "text"], ["specialization", "Specialization", "text"]].map(([name, placeholder, type]) => <label key={name} className="form-control"><span className="mb-1 text-sm font-bold">{placeholder}</span><input required={["employee_id", "full_name", "email"].includes(name)} name={name} type={type} value={form[name]} onChange={update} className="input input-bordered w-full" /></label>)}<label className="form-control"><span className="mb-1 text-sm font-bold">Photo</span><input type="file" accept="image/*" onChange={(event) => setPhoto(event.target.files?.[0] || null)} className="file-input file-input-bordered w-full" /></label><label className="form-control"><span className="mb-1 text-sm font-bold">Gender</span><select name="gender" value={form.gender} onChange={update} className="select select-bordered"><option value="">Not specified</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></label><label className="form-control"><span className="mb-1 text-sm font-bold">Account status</span><select name="status" value={form.status} onChange={update} className="select select-bordered"><option value="active">Active</option><option value="inactive">Inactive</option></select></label><label className="form-control md:col-span-2"><span className="mb-1 text-sm font-bold">Bio</span><textarea name="bio" value={form.bio} onChange={update} className="textarea textarea-bordered min-h-20" /></label></div><button disabled={saving} className="btn btn-success mt-5 w-full text-white"><UserPlus size={17}/>{saving ? "Creating..." : "Create teacher account"}</button></form>
      <section className="min-w-0 rounded-lg border border-slate-200 bg-white shadow-sm"><div className="border-b p-5"><h2 className="font-black">Teacher directory</h2><div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-slate-500">{loading ? "Loading teachers..." : `${teachers.length} teacher accounts available for assignment.`}</p><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} className="input input-bordered input-sm w-full sm:w-64" placeholder="Search name, email, phone" /></div></div><div className="overflow-x-auto"><table className="table"><thead><tr><th>Teacher</th><th>Contact</th><th>Assigned admissions</th><th>Assigned subjects</th><th>Status</th><th></th></tr></thead><tbody>{pagedTeachers.map((teacher) => { const teacherAssignments = assignmentsFor(teacher); return <tr key={teacher.id}><td><p className="font-bold">{teacher.full_name}</p><p className="text-xs text-slate-500">{teacher.employee_id}</p></td><td>{teacher.email}<br/><span className="text-xs text-slate-500">{teacher.phone || "-"}</span></td><td>{[...new Set(teacherAssignments.map((assignment) => courseFor(assignment.course)))].join(", ") || "-"}</td><td>{teacherAssignments.filter((assignment) => assignment.subject).map((assignment) => `#${assignment.subject}`).join(", ") || "Program-wide"}</td><td><Status value={teacher.status}/></td><td>{teacher.status === "active" && <button onClick={async () => { if (await confirmAction({ title: `Deactivate ${teacher.full_name}?`, text: "Their content will remain available as historical data.", confirmText: "Yes, deactivate", danger: true })) { try { await employeeApi.action(teacher.id, "deactivate"); notifySuccess("Teacher deactivated."); reload(); } catch (err) { notifyError(message(err)); } } }} className="btn btn-error btn-xs text-white">Deactivate</button>}</td></tr>; })}</tbody></table></div>{!loading && !teachers.length && <div className="p-5"><Empty>No teacher accounts have been created yet.</Empty></div>}{!loading && teachers.length > 0 && !visibleTeachers.length && <div className="p-5"><Empty>No teachers match your search.</Empty></div>}{pageCount > 1 && <div className="flex items-center justify-between gap-3 border-t p-4"><p className="text-xs font-bold text-slate-500">Page {currentPage} of {pageCount} · {visibleTeachers.length} teachers</p><div className="flex gap-2"><button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} className="btn btn-outline btn-sm">Previous</button><button type="button" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)} className="btn btn-outline btn-sm">Next</button></div></div>}</section></div></div>;
}

export function AdminAdmissionsPage() {
  const { courses, reload } = useAdminData(["courses"]); const [selected, setSelected] = useState(null); const [form, setForm] = useState({ title: "", code: "", description: "", admission_fee: "0", capacity: "", enrollment_start: "", enrollment_end: "", status: "admission_open", is_published: true }); const [error, setError] = useState("");
  const admissions = courses.filter((course) => course.course_type === "admission");
  const loadDetails = (course) => { setSelected(course); setForm({ ...course, admission_fee: course.admission_fee ?? "0", capacity: course.capacity ?? "", enrollment_start: course.enrollment_start || "", enrollment_end: course.enrollment_end || "" }); };
  const submit = async (event) => { event.preventDefault(); setError(""); const payload = { ...form, course_type: "admission", capacity: form.capacity || null, enrollment_start: form.enrollment_start || null, enrollment_end: form.enrollment_end || null, is_published: Boolean(form.is_published), course_fee: 0 }; try { const saved = selected ? await courseApi.update(selected.id, payload) : await courseApi.create(payload); await reload(); loadDetails(saved); notifySuccess(selected ? "Admission updated." : "Admission created."); } catch (err) { setError(message(err)); notifyError(message(err)); } };
  const deleteAdmission = async () => { if (!selected) return; if (!(await confirmAction({ title: `Delete ${selected.title}?`, text: "Existing applications prevent unsafe deletion. This action cannot be undone.", confirmText: "Yes, delete", danger: true }))) return; try { await courseApi.remove(selected.id); setSelected(null); await reload(); notifySuccess("Admission deleted."); } catch (err) {
    if (err?.response?.status === 409 && err.response.data?.action === "archive") {
      // Historical applications reference this admission: offer the safe alternative instead of a dead-end error.
      if (await confirmAction({ title: "Archive instead?", text: message(err), confirmText: "Archive admission" })) {
        try { await courseApi.update(selected.id, { status: "archived", is_published: false }); setSelected(null); await reload(); notifySuccess("Admission archived. Existing applications were kept."); } catch (archiveErr) { notifyError(message(archiveErr)); }
      }
      return;
    }
    setError(message(err)); notifyError(message(err));
  } };
  return <div><PageHeader eyebrow="Admissions" title="Admissions" description="Create and publish admission programs. Once created, assign a Head Teacher to build its academic structure (subjects, sections, grading)." /><div className="grid gap-6 xl:grid-cols-[350px_minmax(0,1fr)]"><aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><button onClick={() => { setSelected(null); setForm({ title: "", code: "", description: "", admission_fee: "0", capacity: "", enrollment_start: "", enrollment_end: "", status: "admission_open", is_published: true }); }} className="btn btn-success mb-3 w-full text-white"><Plus size={17}/>New admission</button><div className="space-y-2">{admissions.map((course) => <button key={course.id} onClick={() => loadDetails(course)} className={`w-full rounded-lg border p-3 text-left ${selected?.id === course.id ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-emerald-200"}`}><p className="font-bold">{course.title}</p><p className="mt-1 text-xs text-slate-500">{course.code || "No code"} · <Status value={course.status}/></p></button>)}{!admissions.length && <Empty>No admission programs yet.</Empty>}</div></aside><div className="min-w-0 space-y-6"><form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-black">{selected ? `Edit ${selected.title}` : "Create admission program"}</h2>{selected && <button type="button" onClick={deleteAdmission} className="btn btn-error btn-sm text-white"><Trash2 size={16}/>Delete admission</button>}</div>{error && <p className="alert alert-error mt-3 text-sm">{error}</p>}<div className="mt-4 grid gap-3 md:grid-cols-2">{[["title", "Program name", "text"], ["code", "Program code", "text"], ["admission_fee", "Admission fee (BDT)", "number"], ["capacity", "Seats available", "number"], ["enrollment_start", "Application opens", "date"], ["enrollment_end", "Application closes", "date"]].map(([name, placeholder, type]) => <label key={name} className="form-control"><span className="mb-1 text-sm font-bold">{placeholder}</span><input required={name === "title"} name={name} type={type} value={form[name] ?? ""} onChange={(e) => setForm({ ...form, [name]: e.target.value })} className="input input-bordered w-full" /></label>)}<label className="form-control"><span className="mb-1 text-sm font-bold">Status</span><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="select select-bordered">{admissionStates.map((state) => <option key={state}>{state}</option>)}</select></label><label className="form-control md:col-span-2"><span className="mb-1 text-sm font-bold">Description</span><RichTextEditor value={form.description || ""} onChange={(value) => setForm({ ...form, description: value })} placeholder="Describe this admission program..." /></label><label className="label justify-start gap-2 font-bold"><input type="checkbox" checked={Boolean(form.is_published)} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="checkbox checkbox-success"/>Published on the public admission page</label></div><button className="btn btn-success mt-5 text-white">{selected ? "Save admission" : "Create admission"}</button></form>{selected && <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">Subjects, sections, academic stages, assessment scheme and grading are managed by this admission's assigned Head Teacher once one is assigned below.</div>}</div></div></div>;
}

export function AdminTeacherAssignmentsPage() {
  const { courses, teachers, assignments, reload } = useAdminData(["courses", "teachers", "assignments"]); const [form, setForm] = useState({ teacher: "", course: "" }); const [error, setError] = useState("");
  const admissions = courses.filter((course) => course.course_type === "admission");
  const headTeacherAssignments = assignments.filter((assignment) => assignment.role === "head_teacher");
  const submit = async (event) => { event.preventDefault(); setError(""); try { await teacherAssignmentApi.create({ teacher: form.teacher, course: form.course, course_section: null, subject: null, role: "head_teacher", assignment_status: "accepted", is_active: true }); setForm({ teacher: "", course: "" }); notifySuccess("Head Teacher assigned."); reload(); } catch (err) { setError(message(err)); notifyError(message(err)); } };
  const removeAssignment = async (assignment) => { if (!(await confirmDelete("this Head Teacher assignment"))) return; try { await teacherAssignmentApi.remove(assignment.id); notifySuccess("Head Teacher assignment removed."); reload(); } catch (err) { notifyError(message(err)); } };
  const teacherName = (id) => label(teachers.find((teacher) => String(teacher.id) === String(id)));
  const courseName = (id) => label(courses.find((course) => String(course.id) === String(id)));
  return <div><PageHeader eyebrow="Admissions" title="Assign Head Teacher" description="Assign one Head Teacher per admission program. The Head Teacher then builds that admission's academic structure and assigns subject teachers." /><div className="grid gap-6 xl:grid-cols-[400px_minmax(0,1fr)]"><form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-black">Assign Head Teacher</h2>{error && <p className="alert alert-error mt-3 text-sm">{error}</p>}<div className="mt-4 grid gap-3">{[["teacher", "Teacher", teachers], ["course", "Admission", admissions]].map(([name, caption, options]) => <label key={name} className="form-control"><span className="mb-1 text-sm font-bold">{caption} *</span><select required value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} className="select select-bordered"><option value="">Select {caption.toLowerCase()}</option>{options.map((option) => <option key={option.id} value={option.id}>{label(option)}</option>)}</select></label>)}</div><button className="btn btn-success mt-5 w-full text-white">Assign Head Teacher</button></form><section className="rounded-lg border border-slate-200 bg-white shadow-sm"><div className="border-b p-5"><h2 className="font-black">Current Head Teachers</h2></div><div className="overflow-x-auto"><table className="table"><thead><tr><th>Teacher</th><th>Admission</th><th></th></tr></thead><tbody>{headTeacherAssignments.map((assignment) => <tr key={assignment.id}><td>{teacherName(assignment.teacher)}</td><td>{courseName(assignment.course)}</td><td><button onClick={() => removeAssignment(assignment)} className="btn btn-ghost btn-sm text-error" aria-label="Remove assignment"><Trash2 size={16}/></button></td></tr>)}</tbody></table></div>{!headTeacherAssignments.length && <div className="p-5"><Empty>No Head Teachers assigned yet.</Empty></div>}</section></div></div>;
}

const landingTabs = [
  ["overview", "Overview"],
  ["landing", "Landing Page"],
  ["teachers", "Teachers"],
  ["subjects", "Subjects"],
  ["form", "Application Form"],
];

const blankLandingPage = () => ({
  highlights: [],
  about: { title: "", description: "", image: "" },
  audience: [],
  features: [],
  requirements: [],
  faqs: [],
  cta: { title: "", subtitle: "" },
  nav: { enabled: true },
});
const blankHighlight = () => ({ id: newId(), value: "", label: "" });
const blankAudienceItem = () => ({ id: newId(), text: "" });
const blankFeature = () => ({ id: newId(), title: "", description: "" });
const blankRequirement = () => ({ id: newId(), text: "" });
const blankFaq = () => ({ id: newId(), question: "", answer: "", order: 0 });

function normalizeLandingPageForEdit(landingPage) {
  const source = landingPage && typeof landingPage === "object" ? landingPage : {};
  return {
    highlights: (Array.isArray(source.highlights) ? source.highlights : []).map((h) => ({ id: h.id || newId(), value: h.value || "", label: h.label || "" })),
    about: { title: source.about?.title || "", description: source.about?.description || "", image: source.about?.image || "" },
    audience: (Array.isArray(source.audience) ? source.audience : []).map((a) => ({ id: a.id || newId(), text: a.text || "" })),
    features: (Array.isArray(source.features) ? source.features : []).map((f) => ({ id: f.id || newId(), title: f.title || "", description: f.description || "" })),
    requirements: (Array.isArray(source.requirements) ? source.requirements : []).map((r) => ({ id: r.id || newId(), text: r.text || "" })),
    faqs: (Array.isArray(source.faqs) ? source.faqs : []).map((f) => ({ id: f.id || newId(), question: f.question || "", answer: f.answer || "", order: f.order ?? 0 })),
    cta: { title: source.cta?.title || "", subtitle: source.cta?.subtitle || "" },
    nav: { enabled: source.nav?.enabled !== false },
  };
}

export function AdminAdmissionFormBuilderPage() {
  const { courses, teachers, reload } = useAdminData(["courses", "teachers"]);
  const admissions = courses.filter((course) => course.course_type === "admission");
  const [selectedId, setSelectedId] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [form, setForm] = useState(null);
  const [schema, setSchema] = useState([]);
  const [content, setContent] = useState([]);
  const [landingPage, setLandingPage] = useState(blankLandingPage());
  // Image state holds the public URL (uploaded via Django -> ImgBB), not a File.
  const [thumbnail, setThumbnail] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [contentFiles, setContentFiles] = useState({});
  const [teacherRows, setTeacherRows] = useState([]);
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();
  const deepLinkApplied = useRef(false);

  const setContentFileFor = (itemId, file) => {
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setContentFiles((prev) => ({ ...prev, [itemId]: { file, previewUrl } }));
    } else {
      setContentFiles((prev) => {
        if (prev[itemId]?.previewUrl) URL.revokeObjectURL(prev[itemId].previewUrl);
        const { [itemId]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const selected = admissions.find((course) => String(course.id) === String(selectedId));

  useEffect(() => {
    if (!selected) { setTeacherRows([]); return; }
    setTeacherLoading(true);
    teacherAssignmentApi
      .listResults({ course: selected.id, page_size: 100 })
      .then((data) => setTeacherRows(asArray(data)))
      .catch(() => setTeacherRows([]))
      .finally(() => setTeacherLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  const updateTeacherRow = async (row, patch) => {
    setTeacherRows((current) => current.map((r) => (r.id === row.id ? { ...r, ...patch } : r)));
    try {
      await teacherAssignmentApi.update(row.id, patch);
    } catch (err) {
      setError(message(err));
    }
  };

  const loadAdmission = (course) => {
    setSelectedId(course?.id || "");
    setActiveTab("overview");
    setThumbnail(course?.thumbnail || "");
    setCoverImage(course?.cover_image || "");
    setHeroImage(course?.hero_image || "");
    setContentFiles({});
    setNotice("");
    setError("");
    if (!course) {
      setForm(null);
      setSchema([]);
      setContent([]);
      setLandingPage(blankLandingPage());
      return;
    }
    setForm({
      title: course.title || "",
      code: course.code || "",
      description: course.description || "",
      short_description: course.short_description || "",
      admission_fee: course.admission_fee ?? 0,
      course_fee: course.course_fee ?? 0,
      offer_fee: course.offer_fee ?? "",
      capacity: course.capacity ?? "",
      enrollment_start: course.enrollment_start || "",
      enrollment_end: course.enrollment_end || "",
      start_date: course.start_date || "",
      end_date: course.end_date || "",
      status: course.status || "admission_open",
      is_published: Boolean(course.is_published),
      slug: course.slug || "",
      hero_badge: course.hero_badge || "",
      hero_title: course.hero_title || "",
      hero_subtitle: course.hero_subtitle || "",
      promo_video_url: course.promo_video_url || "",
      landing_page_enabled: course.landing_page_enabled !== false,
      meta_title: course.meta_title || "",
      meta_description: course.meta_description || "",
    });
    setSchema(normalizeSchemaForEdit(course.admission_form_schema));
    setContent(normalizeContentForEdit(course.custom_content));
    setLandingPage(normalizeLandingPageForEdit(course.landing_page));
  };

  const setCard = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const editSchema = (updater) => { setNotice(""); setSchema(updater); };
  const updateSection = (index, key, value) => editSchema((current) => current.map((section, currentIndex) => currentIndex === index ? { ...section, [key]: value } : section));
  const updateField = (sectionIndex, fieldIndex, key, value) => editSchema((current) => current.map((section, currentIndex) => currentIndex !== sectionIndex ? section : { ...section, fields: section.fields.map((field, index) => index === fieldIndex ? { ...field, [key]: value } : field) }));
  const updateContent = (index, key, value) => setContent((current) => current.map((item, currentIndex) => currentIndex === index ? { ...item, [key]: value } : item));

  const updateLanding = (key, value) => setLandingPage((current) => ({ ...current, [key]: value }));
  const updateLandingListItem = (key, index, field, value) => setLandingPage((current) => ({ ...current, [key]: current[key].map((item, i) => (i === index ? { ...item, [field]: value } : item)) }));
  const addLandingItem = (key, factory) => setLandingPage((current) => ({ ...current, [key]: [...current[key], factory()] }));
  const removeLandingItem = (key, index) => setLandingPage((current) => ({ ...current, [key]: current[key].filter((_, i) => i !== index) }));

  const save = async (event) => {
    event.preventDefault();
    if (!selected || !form) return;
    let savedSchema;
    try {
      savedSchema = cleanSchemaForSave(schema);
    } catch (validationError) {
      setActiveTab("form");
      setNotice("");
      setError(validationError.message);
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    try {
      // Upload any pending content files first, then embed their URLs into the content JSON
      let finalContent = content.map((item) => ({ ...item }));
      const pendingUploads = Object.entries(contentFiles);
      for (const [itemId, { file }] of pendingUploads) {
        const item = finalContent.find((c) => c.id === itemId);
        if (!file || !item) continue;
        const fd = new FormData();
        fd.append("type", item.type === "video" ? "video" : "photo");
        fd.append("title", `${selected.title} — ${item.label || item.type}`);
        fd.append("file", file);
        fd.append("published", "false");
        try {
          const result = await galleryApi.create(fd);
          const fileUrl = result.file
            ? (result.file.startsWith("http") ? result.file : `${API_BASE_URL}${result.file}`)
            : result.url || "";
          item.url = fileUrl;
        } catch { /* keep existing url on upload failure */ }
      }
      setContent(finalContent);
      setContentFiles({});

      const { slug: _slugUnused, ...formWithoutSlug } = form;
      const payload = {
        ...formWithoutSlug,
        course_type: "admission",
        capacity: form.capacity === "" ? null : Number(form.capacity),
        admission_fee: Number(form.admission_fee || 0),
        course_fee: Number(form.course_fee || 0),
        offer_fee: form.offer_fee === "" ? null : Number(form.offer_fee),
        enrollment_start: form.enrollment_start || null,
        enrollment_end: form.enrollment_end || null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        custom_content: cleanContentForSave(finalContent),
        admission_form_schema: savedSchema,
        landing_page: landingPage,
      };
      // Only changed images are sent (as the hosted public URL); unchanged ones are left alone.
      if (thumbnail !== (selected.thumbnail || "")) payload.thumbnail = thumbnail;
      if (coverImage !== (selected.cover_image || "")) payload.cover_image = coverImage;
      if (heroImage !== (selected.hero_image || "")) payload.hero_image = heroImage;
      const body = payload;
      const saved = await courseApi.update(selected.id, body);
      await reload();
      loadAdmission(saved);
      const fieldCount = (saved.admission_form_schema || []).reduce((count, section) => count + section.fields.length, 0);
      const savedMessage = fieldCount ? `Admission saved with ${fieldCount} application fields. ${saved.is_published && saved.status === "admission_open" ? "Applicants can now use this form." : "Publish this admission and open applications to make the form available."}` : "Admission saved without application fields. Add fields in Application Form before applicants can apply.";
      setNotice(savedMessage);
      notifySuccess(savedMessage);
    } catch (err) {
      setError(message(err));
      notifyError(message(err));
    } finally {
      setSaving(false);
    }
  };

  // Deep-link from the dashboard setup panel: ?card=<id>&tab=<tab> auto-selects
  // the card and opens the relevant tab once the admissions list has loaded.
  useEffect(() => {
    if (deepLinkApplied.current || !admissions.length) return;
    const cardId = searchParams.get("card");
    if (!cardId) { deepLinkApplied.current = true; return; }
    const match = admissions.find((course) => String(course.id) === String(cardId));
    if (!match) return;
    deepLinkApplied.current = true;
    loadAdmission(match);
    const tab = searchParams.get("tab");
    if (tab && landingTabs.some(([key]) => key === tab)) setActiveTab(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admissions, searchParams]);

  const setup = useMemo(() => (selected ? admissionCardSetup(selected) : null), [selected]);
  const tabStatus = useMemo(() => {
    if (!setup) return {};
    const map = {};
    setup.items.forEach((item) => { map[item.tab] = (map[item.tab] ?? true) && item.done; });
    return map;
  }, [setup]);

  return (
    <div>
      <PageHeader
        eyebrow="Admissions"
        title="Admission Form Builder"
        description="Edit each admission card, its public landing page, and the application form students will submit."
        action={
          <div className="flex gap-2">
            <button type="button" className="btn btn-outline btn-sm" onClick={() => (form ? setActiveTab("subjects") : notifyError("Select an admission card first to manage its subjects."))}>Subjects →</button>
            <Link className="btn btn-outline btn-sm" to="/admin/dashboard/admission-applications">Applications →</Link>
          </div>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[330px_minmax(0,1fr)]">
        <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="font-black">Admission cards</h2>
          <div className="mt-4 space-y-2">
            {admissions.map((course) => {
              const cardSetup = admissionCardSetup(course);
              return (
                <button key={course.id} type="button" onClick={() => loadAdmission(course)} className={`w-full rounded-lg border p-3 text-left ${String(selectedId) === String(course.id) ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-emerald-200"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="min-w-0 truncate font-bold">{course.title}</p>
                    <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-black ${cardSetup.complete ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{cardSetup.percent}%</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{course.code || "No code"} · {course.status}</p>
                </button>
              );
            })}
            {!admissions.length && <Empty>Create an admission card first.</Empty>}
          </div>
        </aside>

        {form ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
              <div className="flex flex-wrap gap-1">
                {landingTabs.map(([key, tabLabel]) => {
                  const status = tabStatus[key];
                  return (
                    <button key={key} type="button" onClick={() => setActiveTab(key)} className={`btn btn-sm gap-1 ${activeTab === key ? "btn-success text-white" : "btn-ghost"}`}>
                      {tabLabel}
                      {status === true && <CheckCircle2 size={14} className={activeTab === key ? "text-white" : "text-emerald-600"} />}
                      {status === false && <AlertCircle size={14} className={activeTab === key ? "text-white" : "text-amber-500"} />}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                {selected?.slug && <a href={`/admission/online/${selected.slug}?preview=1`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">Preview</a>}
                <button form="admission-editor-form" disabled={saving} className="btn btn-success btn-sm text-white">{saving ? "Saving..." : "Save all changes"}</button>
              </div>
            </div>

            {setup && !setup.complete && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-sm font-bold text-amber-800">Setup {setup.doneCount}/{setup.total} — finish these for a complete public landing page:</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {setup.items.filter((item) => !item.done).map((item) => (
                    <button key={item.key} type="button" onClick={() => setActiveTab(item.tab)} title={item.hint} className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-white px-2.5 py-1 text-xs font-bold text-amber-800 hover:bg-amber-100">
                      <AlertCircle size={12} />{item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {setup && setup.complete && (
              <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-800"><CheckCircle2 size={16} /> This admission card is fully set up.</div>
            )}

            {notice && <p className="alert alert-success text-sm">{notice}</p>}
            {error && <p className="alert alert-error text-sm">{error}</p>}

            <form id="admission-editor-form" onSubmit={save} className="space-y-6">
              {activeTab === "overview" && (
                <OverviewTab
                  form={form}
                  setCard={setCard}
                  thumbnail={thumbnail}
                  setThumbnail={setThumbnail}
                  coverImage={coverImage}
                  setCoverImage={setCoverImage}
                  heroImage={heroImage}
                  setHeroImage={setHeroImage}
                />
              )}
              {activeTab === "landing" && (
                <LandingTab
                  landingPage={landingPage}
                  updateLanding={updateLanding}
                  updateLandingListItem={updateLandingListItem}
                  addLandingItem={addLandingItem}
                  removeLandingItem={removeLandingItem}
                  content={content}
                  setContent={setContent}
                  contentFiles={contentFiles}
                  setContentFileFor={setContentFileFor}
                  updateContent={updateContent}
                />
              )}
              {activeTab === "teachers" && (
                <TeachersTab teacherRows={teacherRows} teacherLoading={teacherLoading} teachers={teachers} updateTeacherRow={updateTeacherRow} />
              )}
              {activeTab === "form" && (
                <FormSchemaTab schema={schema} setSchema={editSchema} updateSection={updateSection} updateField={updateField} />
              )}
            </form>
            {/* Rendered outside the editor form: subjects save through their own form, and HTML forms cannot nest. */}
            {activeTab === "subjects" && selected && <SubjectsTab course={selected} />}
          </div>
        ) : (
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><Empty>Select an admission card to edit its card fields, subjects and application form.</Empty></section>
        )}
      </div>
    </div>
  );
}

function OverviewTab({ form, setCard, thumbnail, setThumbnail, coverImage, setCoverImage, heroImage, setHeroImage }) {
  return (
    <>
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-black">Admission card fields</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {[["title", "Card title", "text"], ["code", "Code / class", "text"], ["admission_fee", "Admission fee (BDT)", "number"], ["offer_fee", "Offer fee (BDT, optional)", "number"], ["capacity", "Seats available", "number"], ["enrollment_start", "Admission start", "date"], ["enrollment_end", "Admission end", "date"], ["start_date", "Course start", "date"], ["end_date", "Course end", "date"]].map(([key, caption, type]) => (
            <label key={key} className="form-control">
              <span className="mb-1 text-sm font-bold">{caption}</span>
              <input required={key === "title"} type={type} value={form[key] ?? ""} onChange={(event) => setCard(key, event.target.value)} className="input input-bordered" />
            </label>
          ))}
          <label className="form-control">
            <span className="mb-1 text-sm font-bold">Status</span>
            <select value={form.status} onChange={(event) => setCard("status", event.target.value)} className="select select-bordered">
              {admissionStates.map((state) => <option key={state} value={state}>{state.replaceAll("_", " ")}</option>)}
            </select>
          </label>
          <label className="form-control">
            <span className="mb-1 text-sm font-bold">Slug (URL) {form.is_published && <span className="text-xs font-normal text-slate-400">— locked after publishing</span>}</span>
            <input value={form.slug || "auto-generated"} readOnly disabled className="input input-bordered bg-slate-50 text-slate-500" />
          </label>
          <label className="label justify-start gap-2 font-bold"><input type="checkbox" checked={Boolean(form.is_published)} onChange={(event) => setCard("is_published", event.target.checked)} className="checkbox checkbox-success" /> Published</label>
          <label className="label justify-start gap-2 font-bold"><input type="checkbox" checked={Boolean(form.landing_page_enabled)} onChange={(event) => setCard("landing_page_enabled", event.target.checked)} className="checkbox checkbox-success" /> Landing page enabled</label>
          <label className="form-control md:col-span-2">
            <span className="mb-1 text-sm font-bold">Short description (card summary)</span>
            <input value={form.short_description || ""} onChange={(event) => setCard("short_description", event.target.value)} className="input input-bordered" placeholder="One-line summary shown on listing cards" />
          </label>
          <label className="form-control md:col-span-2">
            <span className="mb-1 text-sm font-bold">Full description</span>
            <RichTextEditor value={form.description || ""} onChange={(value) => setCard("description", value)} placeholder="Describe this admission program..." />
          </label>
          <ImageUploader label="Card image (listing thumbnail)" context="thumbnail" value={thumbnail} onChange={(url) => setThumbnail(url)} />
          <ImageUploader label="Cover image" context="admission_cover" value={coverImage} onChange={(url) => setCoverImage(url)} />
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-black">Hero section</h2>
        <p className="mt-1 text-sm text-slate-500">The large banner at the top of the public landing page.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="form-control">
            <span className="mb-1 text-sm font-bold">Hero badge</span>
            <input value={form.hero_badge || ""} onChange={(event) => setCard("hero_badge", event.target.value)} className="input input-bordered" placeholder="e.g. Admission Open 2027" />
          </label>
          <label className="form-control">
            <span className="mb-1 text-sm font-bold">Hero title</span>
            <input value={form.hero_title || ""} onChange={(event) => setCard("hero_title", event.target.value)} className="input input-bordered" placeholder="Falls back to card title" />
          </label>
          <label className="form-control md:col-span-2">
            <span className="mb-1 text-sm font-bold">Hero subtitle</span>
            <input value={form.hero_subtitle || ""} onChange={(event) => setCard("hero_subtitle", event.target.value)} className="input input-bordered" />
          </label>
          <ImageUploader label="Hero image" context="admission_cover" value={heroImage} onChange={(url) => setHeroImage(url)} />
          <label className="form-control">
            <span className="mb-1 text-sm font-bold">Promo video URL (optional)</span>
            <input value={form.promo_video_url || ""} onChange={(event) => setCard("promo_video_url", event.target.value)} className="input input-bordered" placeholder="YouTube embed URL — shown instead of the hero image" />
          </label>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-black">SEO</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="form-control">
            <span className="mb-1 text-sm font-bold">Meta title</span>
            <input value={form.meta_title || ""} onChange={(event) => setCard("meta_title", event.target.value)} className="input input-bordered" />
          </label>
          <label className="form-control">
            <span className="mb-1 text-sm font-bold">Meta description</span>
            <input value={form.meta_description || ""} onChange={(event) => setCard("meta_description", event.target.value)} className="input input-bordered" />
          </label>
        </div>
      </section>
    </>
  );
}

function LandingTab({ landingPage, updateLanding, updateLandingListItem, addLandingItem, removeLandingItem, content, setContent, contentFiles, setContentFileFor, updateContent }) {
  return (
    <>
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-black">Highlights</h2>
          <button type="button" className="btn btn-outline btn-success btn-sm" onClick={() => addLandingItem("highlights", blankHighlight)}>Add highlight</button>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {landingPage.highlights.map((item, index) => (
            <div key={item.id} className="flex gap-2 rounded border border-slate-200 bg-slate-50 p-2">
              <input value={item.value} onChange={(event) => updateLandingListItem("highlights", index, "value", event.target.value)} className="input input-bordered input-sm w-24" placeholder="120+" />
              <input value={item.label} onChange={(event) => updateLandingListItem("highlights", index, "label", event.target.value)} className="input input-bordered input-sm flex-1" placeholder="Classes" />
              <button type="button" className="btn btn-error btn-xs text-white" onClick={() => removeLandingItem("highlights", index)}>Remove</button>
            </div>
          ))}
          {!landingPage.highlights.length && <Empty>No highlights yet.</Empty>}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-black">About this program</h2>
        <div className="mt-4 grid gap-3">
          <label className="form-control">
            <span className="mb-1 text-sm font-bold">Section title</span>
            <input value={landingPage.about.title} onChange={(event) => updateLanding("about", { ...landingPage.about, title: event.target.value })} className="input input-bordered" placeholder="About the Program" />
          </label>
          <label className="form-control">
            <span className="mb-1 text-sm font-bold">Description</span>
            <RichTextEditor value={landingPage.about.description} onChange={(value) => updateLanding("about", { ...landingPage.about, description: value })} placeholder="Describe this program..." />
          </label>
          <label className="form-control">
            <span className="mb-1 text-sm font-bold">Image URL (optional)</span>
            <input value={landingPage.about.image} onChange={(event) => updateLanding("about", { ...landingPage.about, image: event.target.value })} className="input input-bordered" />
          </label>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-black">Who is this for?</h2>
          <button type="button" className="btn btn-outline btn-success btn-sm" onClick={() => addLandingItem("audience", blankAudienceItem)}>Add item</button>
        </div>
        <div className="mt-4 grid gap-2">
          {landingPage.audience.map((item, index) => (
            <div key={item.id} className="flex gap-2">
              <input value={item.text} onChange={(event) => updateLandingListItem("audience", index, "text", event.target.value)} className="input input-bordered input-sm flex-1" placeholder="e.g. HSC Science students" />
              <button type="button" className="btn btn-error btn-xs text-white" onClick={() => removeLandingItem("audience", index)}>Remove</button>
            </div>
          ))}
          {!landingPage.audience.length && <Empty>No audience items yet.</Empty>}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="font-black">Features</h2><p className="mt-1 text-sm text-slate-500">What students will get — also used for assessments/materials marketing blocks.</p></div>
          <button type="button" className="btn btn-outline btn-success btn-sm" onClick={() => addLandingItem("features", blankFeature)}>Add feature</button>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {landingPage.features.map((item, index) => (
            <div key={item.id} className="rounded border border-slate-200 bg-slate-50 p-2 space-y-1">
              <input value={item.title} onChange={(event) => updateLandingListItem("features", index, "title", event.target.value)} className="input input-bordered input-sm w-full" placeholder="Feature title" />
              <input value={item.description} onChange={(event) => updateLandingListItem("features", index, "description", event.target.value)} className="input input-bordered input-sm w-full" placeholder="Short description" />
              <button type="button" className="btn btn-error btn-xs text-white" onClick={() => removeLandingItem("features", index)}>Remove</button>
            </div>
          ))}
          {!landingPage.features.length && <Empty>No features yet.</Empty>}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-black">Requirements</h2>
          <button type="button" className="btn btn-outline btn-success btn-sm" onClick={() => addLandingItem("requirements", blankRequirement)}>Add requirement</button>
        </div>
        <div className="mt-4 grid gap-2">
          {landingPage.requirements.map((item, index) => (
            <div key={item.id} className="flex gap-2">
              <input value={item.text} onChange={(event) => updateLandingListItem("requirements", index, "text", event.target.value)} className="input input-bordered input-sm flex-1" placeholder="e.g. SSC/HSC transcript" />
              <button type="button" className="btn btn-error btn-xs text-white" onClick={() => removeLandingItem("requirements", index)}>Remove</button>
            </div>
          ))}
          {!landingPage.requirements.length && <Empty>No requirements yet.</Empty>}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-black">FAQ</h2>
          <button type="button" className="btn btn-outline btn-success btn-sm" onClick={() => addLandingItem("faqs", blankFaq)}>Add FAQ</button>
        </div>
        <div className="mt-4 grid gap-2">
          {landingPage.faqs.map((item, index) => (
            <div key={item.id} className="rounded border border-slate-200 bg-slate-50 p-2 space-y-1">
              <input value={item.question} onChange={(event) => updateLandingListItem("faqs", index, "question", event.target.value)} className="input input-bordered input-sm w-full" placeholder="Question" />
              <textarea value={item.answer} onChange={(event) => updateLandingListItem("faqs", index, "answer", event.target.value)} className="textarea textarea-bordered textarea-sm w-full" placeholder="Answer" />
              <button type="button" className="btn btn-error btn-xs text-white" onClick={() => removeLandingItem("faqs", index)}>Remove</button>
            </div>
          ))}
          {!landingPage.faqs.length && <Empty>No FAQs yet.</Empty>}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-black">Final call-to-action</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="form-control">
            <span className="mb-1 text-sm font-bold">CTA title override (optional)</span>
            <input value={landingPage.cta.title} onChange={(event) => updateLanding("cta", { ...landingPage.cta, title: event.target.value })} className="input input-bordered" />
          </label>
          <label className="form-control">
            <span className="mb-1 text-sm font-bold">CTA subtitle</span>
            <input value={landingPage.cta.subtitle} onChange={(event) => updateLanding("cta", { ...landingPage.cta, subtitle: event.target.value })} className="input input-bordered" placeholder="Start your structured preparation today." />
          </label>
        </div>
        <label className="label mt-2 justify-start gap-2 font-bold">
          <input type="checkbox" checked={Boolean(landingPage.nav.enabled)} onChange={(event) => updateLanding("nav", { enabled: event.target.checked })} className="checkbox checkbox-success" />
          Show sticky section navigation
        </label>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="font-black">Custom admission card fields</h2><p className="mt-1 text-sm text-slate-500">Free-form extra blocks — banner, teacher cards, success stories, etc.</p></div>
          <button type="button" className="btn btn-outline btn-success btn-sm" onClick={() => setContent((current) => [...current, blankCustomContent()])}>Add custom field</button>
        </div>
        <div className="mt-4 space-y-3">
          {content.map((item, index) => {
            const isFileSupported = ["image", "banner", "teacher_card", "success_student", "success_story", "video", "file"].includes(item.type);
            const isImagePreviewable = ["image", "banner", "teacher_card", "success_student", "success_story"].includes(item.type);
            const fileAccept = item.type === "video" ? "video/*" : item.type === "file" ? "*/*" : "image/*";
            const previewUrl = contentFiles[item.id]?.previewUrl || (isImagePreviewable ? item.url : null);
            return (
              <div key={item.id} className="rounded-lg border border-emerald-100 bg-emerald-50/30 p-4 space-y-3">
                <div className="flex flex-wrap gap-2 items-center justify-between">
                  <select value={item.type} onChange={(event) => updateContent(index, "type", event.target.value)} className="select select-bordered select-sm min-w-[160px]">
                    {contentTypes.map((type) => <option key={type} value={type}>{type.replace(/_/g, " ")}</option>)}
                  </select>
                  <button type="button" className="btn btn-error btn-xs text-white ml-auto" onClick={() => { setContentFileFor(item.id, null); setContent((current) => current.filter((_, i) => i !== index)); }}>Remove</button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <input value={item.label} onChange={(event) => updateContent(index, "label", event.target.value)} className="input input-bordered input-sm" placeholder={item.type === "teacher_card" ? "Teacher name" : item.type === "success_student" ? "Student name / batch" : item.type === "banner" ? "Banner title" : "Label / title"} />
                  <input value={item.value} onChange={(event) => updateContent(index, "value", event.target.value)} className="input input-bordered input-sm" placeholder={item.type === "teacher_card" ? "Subject / designation" : item.type === "success_story" ? "Brief story text" : item.type === "success_student" ? "Achievement / result" : "Text value"} />
                </div>
                {isFileSupported && (
                  <label className="form-control">
                    <span className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Upload {item.type === "video" ? "video" : item.type === "file" ? "file" : "image"}</span>
                    <input type="file" accept={fileAccept} onChange={(e) => setContentFileFor(item.id, e.target.files?.[0] || null)} className="file-input file-input-bordered file-input-sm w-full" />
                  </label>
                )}
                {isImagePreviewable && previewUrl && <img src={previewUrl} alt="preview" className="h-28 w-full rounded-lg object-cover" onError={(e) => { e.target.style.display = "none"; }} />}
                <label className="form-control">
                  <span className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">{isFileSupported ? "Or paste URL" : "URL / link"}</span>
                  <input value={item.url} onChange={(event) => updateContent(index, "url", event.target.value)} className="input input-bordered input-sm w-full" placeholder={item.type === "banner" ? "https://... banner image URL" : item.type === "video" ? "https://www.youtube.com/embed/..." : item.type === "teacher_card" ? "https://... teacher photo URL" : item.type === "success_student" ? "https://... student photo URL" : item.type === "image" ? "https://... image URL" : item.type === "file" ? "https://... file URL" : "URL or link"} />
                </label>
              </div>
            );
          })}
          {!content.length && <Empty>No custom card content yet. Add admission banner, teacher cards, success stories, and more.</Empty>}
        </div>
      </section>
    </>
  );
}

function TeachersTab({ teacherRows, teacherLoading, teachers, updateTeacherRow }) {
  const teacherName = (id) => label(teachers.find((teacher) => String(teacher.id) === String(id)));
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-black">Teachers on this admission</h2>
      <p className="mt-1 text-sm text-slate-500">Choose which assigned teachers appear on the public landing page, and their display order. Changes here save immediately.</p>
      <div className="mt-4 overflow-x-auto">
        <table className="table">
          <thead><tr><th>Teacher</th><th>Role</th><th>Featured on landing page</th><th>Order</th></tr></thead>
          <tbody>
            {teacherRows.map((row) => (
              <tr key={row.id}>
                <td className="font-bold">{teacherName(row.teacher)}</td>
                <td><Status value={row.role} /></td>
                <td>
                  <input type="checkbox" checked={Boolean(row.featured_on_landing_page)} onChange={(event) => updateTeacherRow(row, { featured_on_landing_page: event.target.checked })} className="checkbox checkbox-success checkbox-sm" />
                </td>
                <td>
                  <input type="number" value={row.landing_order ?? 0} onChange={(event) => updateTeacherRow(row, { landing_order: Number(event.target.value) || 0 })} className="input input-bordered input-sm w-20" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!teacherLoading && !teacherRows.length && <Empty>No teachers are assigned to this admission yet. Assign teachers from Teacher Assignments.</Empty>}
    </section>
  );
}

const NEW_SECTION = "__new__";
const blankSubjectForm = (sectionId) => ({ course_section: sectionId ? String(sectionId) : NEW_SECTION, new_section: "General", name: "", code: "", order: 0, description: "" });
// CourseSubject is unique per (section, code), so a blank code would collide with the next blank one.
const subjectCodeFromName = (name) => name.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

function SubjectsTab({ course }) {
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(blankSubjectForm());
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const rows = asArray(await courseSectionApi.listResults({ course: course.id, page_size: 200 }));
      const lists = await Promise.all(rows.map((section) => courseSubjectApi.listResults({ course_section: section.id, page_size: 200 })));
      setSections(rows);
      setSubjects(lists.flatMap(asArray));
      return rows;
    } catch (err) {
      setError(message(err));
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setEditing(null);
    setError("");
    load().then((rows) => setForm(blankSubjectForm(rows[0]?.id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course.id]);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const sectionName = (id) => sections.find((section) => String(section.id) === String(id))?.name || "-";
  const cancelEdit = () => { setEditing(null); setError(""); setForm(blankSubjectForm(form.course_section === NEW_SECTION ? sections[0]?.id : form.course_section)); };
  const startEdit = (subject) => {
    setError("");
    setEditing(subject);
    setForm({ course_section: String(subject.course_section), new_section: "", name: subject.name || "", code: subject.code || "", order: subject.order ?? 0, description: subject.description || "" });
  };

  const save = async (event) => {
    event.preventDefault();
    const name = form.name.trim();
    const newSectionName = form.new_section.trim();
    if (!name) { setError("Subject name is required."); return; }
    if (form.course_section === NEW_SECTION && !newSectionName) { setError("Enter a name for the new section."); return; }
    setSaving(true);
    setError("");
    try {
      let sectionId = form.course_section;
      if (sectionId === NEW_SECTION) {
        const section = await courseSectionApi.create({ course: course.id, name: newSectionName, status: "active", order: sections.length });
        sectionId = String(section.id);
        // Keep the new section selected so a failed subject save can be retried without re-creating it.
        setSections((current) => [...current, section]);
        set("course_section", sectionId);
      }
      const payload = { course_section: Number(sectionId), name, code: form.code.trim() || subjectCodeFromName(name), order: Number(form.order) || 0, description: form.description.trim() };
      if (editing) await courseSubjectApi.update(editing.id, payload);
      else await courseSubjectApi.create({ ...payload, status: "active" });
      notifySuccess(editing ? "Subject updated." : `${name} added to ${course.title}.`);
      setEditing(null);
      setForm(blankSubjectForm(sectionId));
      await load();
    } catch (err) {
      setError(message(err));
      notifyError(message(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (subject) => {
    if (!(await confirmDelete(`The subject "${subject.name}"`))) return;
    try {
      await courseSubjectApi.remove(subject.id);
      notifySuccess("Subject deleted.");
      if (editing?.id === subject.id) cancelEdit();
      await load();
    } catch (err) {
      notifyError(message(err));
    }
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-black">Subjects for {course.title}</h2>
      <p className="mt-1 text-sm text-slate-500">Subjects are grouped under a section (for example Science or A Unit). Changes here save immediately.</p>
      {error && <p className="alert alert-error mt-4 text-sm">{error}</p>}
      <form onSubmit={save} className="mt-4 grid gap-3 rounded-lg border border-emerald-100 bg-emerald-50/30 p-4 md:grid-cols-2">
        <label className="form-control">
          <span className="mb-1 text-sm font-bold">Section *</span>
          <select value={form.course_section} onChange={(event) => set("course_section", event.target.value)} className="select select-bordered">
            {sections.map((section) => <option key={section.id} value={String(section.id)}>{section.name}</option>)}
            <option value={NEW_SECTION}>+ New section…</option>
          </select>
        </label>
        {form.course_section === NEW_SECTION ? (
          <label className="form-control">
            <span className="mb-1 text-sm font-bold">New section name *</span>
            <input value={form.new_section} onChange={(event) => set("new_section", event.target.value)} className="input input-bordered" placeholder="e.g. Science, A Unit, General" />
          </label>
        ) : <div className="hidden md:block" />}
        <label className="form-control">
          <span className="mb-1 text-sm font-bold">Subject name *</span>
          <input value={form.name} onChange={(event) => set("name", event.target.value)} className="input input-bordered" placeholder="e.g. Physics" />
        </label>
        <label className="form-control">
          <span className="mb-1 text-sm font-bold">Subject code</span>
          <input value={form.code} onChange={(event) => set("code", event.target.value)} className="input input-bordered" placeholder="Auto-generated from the name if left blank" />
        </label>
        <label className="form-control">
          <span className="mb-1 text-sm font-bold">Display order</span>
          <input type="number" min="0" value={form.order} onChange={(event) => set("order", event.target.value)} className="input input-bordered" />
        </label>
        <label className="form-control md:col-span-2">
          <span className="mb-1 text-sm font-bold">Description (optional)</span>
          <textarea value={form.description} onChange={(event) => set("description", event.target.value)} className="textarea textarea-bordered min-h-16" />
        </label>
        <div className="flex gap-2 md:col-span-2">
          <button disabled={saving || loading} className="btn btn-success btn-sm text-white"><Plus size={16} />{saving ? "Saving..." : editing ? "Update subject" : "Add subject"}</button>
          {editing && <button type="button" onClick={cancelEdit} className="btn btn-ghost btn-sm">Cancel</button>}
        </div>
      </form>
      <div className="mt-4 overflow-x-auto">
        <table className="table">
          <thead><tr><th>Section</th><th>Subject</th><th>Code</th><th>Order</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {subjects.map((subject) => (
              <tr key={subject.id} className={editing?.id === subject.id ? "bg-emerald-50" : ""}>
                <td>{sectionName(subject.course_section)}</td>
                <td className="font-bold">{subject.name}</td>
                <td>{subject.code || "-"}</td>
                <td>{subject.order ?? 0}</td>
                <td><Status value={subject.status} /></td>
                <td>
                  <div className="flex justify-end gap-1">
                    <button type="button" onClick={() => startEdit(subject)} className="btn btn-outline btn-xs">Edit</button>
                    <button type="button" onClick={() => remove(subject)} className="btn btn-ghost btn-xs text-error" aria-label={`Delete ${subject.name}`}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {loading && <p className="mt-3 text-sm text-slate-500">Loading subjects...</p>}
      {!loading && !subjects.length && <Empty>No subjects yet. Add the first subject for this admission above.</Empty>}
    </section>
  );
}

function FormSchemaTab({ schema, setSchema, updateSection, updateField }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="font-black">Application form fields</h2><p className="mt-1 text-sm text-slate-500">Sections group your fields. Each field needs its own label, such as Full name or Phone. Save all changes to publish the form configuration.</p></div>
        <button type="button" className="btn btn-outline btn-success btn-sm" onClick={() => setSchema((current) => [...current, blankFormSection()])}>Add section</button>
      </div>
      <div className="mt-4 space-y-4">
        {schema.map((section, sectionIndex) => (
          <article key={section.id} className="rounded-lg border border-emerald-100 bg-white p-4">
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="grid flex-1 gap-1 text-xs font-semibold text-slate-600">Section heading (for example Personal details)<input aria-label={`Section ${sectionIndex + 1} heading`} value={section.title} onChange={(event) => updateSection(sectionIndex, "title", event.target.value)} className="input input-bordered w-full" placeholder="Section heading" /></label>
              <button type="button" className="btn btn-outline btn-success" onClick={() => updateSection(sectionIndex, "fields", [...section.fields, blankFormField()])}>Add field</button>
              <button type="button" className="btn btn-error text-white" onClick={() => setSchema((current) => current.filter((_, currentIndex) => currentIndex !== sectionIndex))}>Remove section</button>
            </div>
            <div className="mt-3 space-y-2">
              {section.fields.map((field, fieldIndex) => (
                <div key={field.id} className="grid gap-2 rounded border border-slate-200 bg-slate-50 p-3 lg:grid-cols-[1fr_140px_1fr_180px_auto_auto]">
                  <input aria-label={`Section ${sectionIndex + 1}, field ${fieldIndex + 1} label`} aria-required="true" value={field.label} onChange={(event) => updateField(sectionIndex, fieldIndex, "label", event.target.value)} className="input input-bordered input-sm" placeholder="Field label: Full name, Phone…" />
                  <select value={field.type} onChange={(event) => updateField(sectionIndex, fieldIndex, "type", event.target.value)} className="select select-bordered select-sm">
                    {fieldTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                  </select>
                  <input value={field.placeholder} onChange={(event) => updateField(sectionIndex, fieldIndex, "placeholder", event.target.value)} className="input input-bordered input-sm" placeholder="Placeholder" />
                  <input value={field.optionsText} onChange={(event) => updateField(sectionIndex, fieldIndex, "optionsText", event.target.value)} className="input input-bordered input-sm" placeholder="Select options, comma separated" />
                  <label className="label cursor-pointer justify-start gap-2">
                    <input type="checkbox" checked={Boolean(field.required)} onChange={(event) => updateField(sectionIndex, fieldIndex, "required", event.target.checked)} className="checkbox checkbox-sm checkbox-success" />
                    <span className="label-text font-bold">Required</span>
                  </label>
                  <button type="button" className="btn btn-error btn-sm text-white" onClick={() => updateSection(sectionIndex, "fields", section.fields.filter((_, currentIndex) => currentIndex !== fieldIndex))}>Remove</button>
                </div>
              ))}
              {!section.fields.length && <Empty>No fields in this section.</Empty>}
            </div>
          </article>
        ))}
        {!schema.length && <Empty>No form sections yet. Add a section to start building the application form.</Empty>}
      </div>
    </section>
  );
}

function schemaLabelMap(course) {
  const map = {};
  (course?.admission_form_schema || []).forEach((section) => {
    (section.fields || []).forEach((field) => {
      if (field.name) map[field.name] = field.label || field.name;
    });
  });
  return map;
}

function ApplicationDetailsModal({ application, course, onClose, onAction, busy }) {
  const [documents, setDocuments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loadingExtras, setLoadingExtras] = useState(true);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!application) return;
    setLoadingExtras(true); setRejecting(false); setReason(""); setError("");
    Promise.all([
      applicantDocumentApi.listResults({ application: application.id }),
      admissionPaymentApi.listResults({ application: application.id }),
      api.get("/payments/admin/", { params: { application: application.id } }).then(({ data }) => data.data || []).catch(() => []),
    ]).then(([docs, legacyPays, gatewayPays]) => { setDocuments(asArray(docs)); setPayments([...asArray(gatewayPays), ...asArray(legacyPays)]); }).finally(() => setLoadingExtras(false));
  }, [application?.id]);

  if (!application) return null;
  const labels = schemaLabelMap(course);
  const formEntries = Object.entries(application.form_data || {});

  const runAction = async (name) => {
    setError("");
    try {
      await onAction(name, name === "reject" ? { reason } : {});
      if (name !== "reject" || reason) { setRejecting(false); setReason(""); }
    } catch (err) { setError(message(err)); }
  };

  const Section = ({ title, children }) => <section className="border-t border-slate-100 p-5 first:border-t-0"><h4 className="text-sm font-black uppercase tracking-wide text-emerald-700">{title}</h4><div className="mt-3">{children}</div></section>;
  const Field = ({ label: fieldLabel, value }) => (value === undefined || value === null || value === "") ? null : <div className="mb-2"><dt className="text-xs font-bold text-slate-500">{fieldLabel}</dt><dd className="text-sm font-semibold text-slate-800">{String(value)}</dd></div>;

  return (
    <Modal open={Boolean(application)} title={`${application.applicant_name} · ${application.application_no}`} onClose={onClose} size="lg">
      <Section title="Applicant Information">
        <dl className="grid gap-2 sm:grid-cols-2">
          <Field label="Full Name" value={application.applicant_name} />
          <Field label="Name (Bangla)" value={application.applicant_name_bn} />
          <Field label="Email" value={application.applicant_email} />
          <Field label="Phone" value={application.applicant_phone} />
          <Field label="Gender" value={application.gender} />
          <Field label="Religion" value={application.religion} />
          <Field label="Blood Group" value={application.blood_group} />
          <Field label="Date of Birth" value={application.date_of_birth} />
          <Field label="Birth Certificate No" value={application.birth_certificate_no} />
          <Field label="Student UID" value={application.student_uid} />
          <Field label="Previous Institute" value={application.previous_institute} />
          <Field label="Address" value={application.address} />
        </dl>
        {application.photo && <img src={application.photo} alt="Applicant" className="mt-3 h-24 w-24 rounded-lg border border-slate-200 object-cover" />}
      </Section>
      <Section title="Guardian / Father / Mother Information">
        <dl className="grid gap-2 sm:grid-cols-2">
          <Field label="Guardian Name" value={application.guardian_name} />
          <Field label="Guardian Phone" value={application.guardian_phone} />
          <Field label="Guardian Relation" value={application.guardian_relation} />
          <Field label="Father Name" value={application.father_name} />
          <Field label="Father Phone" value={application.father_phone} />
          <Field label="Father NID" value={application.father_nid} />
          <Field label="Father Profession" value={application.father_profession} />
          <Field label="Mother Name" value={application.mother_name} />
          <Field label="Mother Phone" value={application.mother_phone} />
          <Field label="Mother NID" value={application.mother_nid} />
          <Field label="Mother Profession" value={application.mother_profession} />
        </dl>
      </Section>
      <Section title="Admission Information">
        <dl className="grid gap-2 sm:grid-cols-2">
          <Field label="Admission" value={course?.title} />
          <Field label="Application ID" value={application.application_no} />
          <Field label="Submitted" value={application.submitted_at} />
          <Field label="Current Status" value={application.status} />
        </dl>
      </Section>
      {formEntries.length > 0 && (
        <Section title="Application Form Responses">
          <dl className="grid gap-2 sm:grid-cols-2">
            {formEntries.map(([key, value]) => <Field key={key} label={labels[key] || key.replaceAll("-", " ").replaceAll("_", " ")} value={value} />)}
          </dl>
        </Section>
      )}
      <Section title="Documents">
        {loadingExtras ? <p className="text-sm text-slate-400">Loading...</p> : documents.length ? (
          <ul className="grid gap-2">
            {documents.map((doc) => <li key={doc.id}><a href={doc.file} target="_blank" rel="noreferrer" className="text-sm font-bold text-emerald-700 hover:underline">{doc.title || "Document"} — View / Download</a></li>)}
          </ul>
        ) : <p className="text-sm text-slate-400">No documents uploaded.</p>}
      </Section>
      <Section title="Payment">
        {loadingExtras ? <p className="text-sm text-slate-400">Loading...</p> : payments.length ? (
          <div className="grid gap-2">
            {payments.map((payment) => <div key={payment.public_id || payment.id} className="rounded border border-slate-200 p-3 text-sm"><div className="flex flex-wrap items-center justify-between gap-2"><span className="font-bold">{payment.amount} {payment.currency || "BDT"} · {payment.provider || payment.method || "bKash"}</span><Status value={payment.status} /></div><dl className="mt-2 grid gap-1 text-xs text-slate-500 sm:grid-cols-2"><Field label="Environment" value={payment.environment} /><Field label="Agreement" value={payment.agreement?.status} /><Field label="Payment ID" value={payment.provider_payment_id} /><Field label="Transaction ID" value={payment.transaction_id || payment.reference} /><Field label="Merchant Invoice" value={payment.merchant_invoice_number} /><Field label="Verified At" value={payment.verified_at} /><Field label="Enrollment" value={payment.enrollment_status} /></dl></div>)}
          </div>
        ) : <p className="text-sm text-slate-400">No payment records. Payment status: <Status value={application.payment_status} /></p>}
      </Section>
      <Section title="Timeline">
        <dl className="grid gap-2 sm:grid-cols-2">
          <Field label="Submitted" value={application.submitted_at} />
          <Field label="Reviewed" value={application.reviewed_at} />
          <Field label="Approved" value={application.approved_at} />
          <Field label="Rejected" value={application.rejected_at} />
          <Field label="Rejection Reason" value={application.rejection_reason} />
        </dl>
      </Section>
      {error && <p className="alert alert-error mx-5 mb-3 text-sm">{error}</p>}
      {["pending", "under_review"].includes(application.status) && (
        <Section title="Actions">
          {rejecting ? (
            <div className="space-y-2">
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} className="textarea textarea-bordered w-full text-sm" placeholder="Reason for rejection" />
              <div className="flex gap-2">
                <button disabled={!reason || busy} onClick={() => runAction("reject")} className="btn btn-error btn-sm text-white">Confirm Reject</button>
                <button onClick={() => setRejecting(false)} className="btn btn-ghost btn-sm">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button disabled={busy} onClick={() => runAction("under_review")} className="btn btn-outline btn-sm">Mark under review</button>
              <button disabled={busy} onClick={() => runAction("approve")} className="btn btn-success btn-sm text-white"><CheckCircle2 size={16} />Approve application</button>
              <button disabled={busy} onClick={() => setRejecting(true)} className="btn btn-error btn-sm text-white">Reject application</button>
            </div>
          )}
        </Section>
      )}
    </Modal>
  );
}

export function AdminAdmissionApplicationsPage() {
  const { applications, courses, reload, loading } = useAdminData(["applications", "courses"]); const [selected, setSelected] = useState(null); const [busy, setBusy] = useState(false); const program = (id) => label(courses.find((course) => String(course.id) === String(id)));
  const action = async (name, payload = {}) => {
    if (name === "approve" && !(await confirmAction({ title: "Approve this application?", text: "Paid admissions will require verified payment before enrollment. Free admissions activate immediately.", confirmText: "Yes, approve" }))) return;
    if (name === "reject" && !(await confirmAction({ title: "Reject this application?", text: "The applicant will be notified. This action cannot be undone.", confirmText: "Yes, reject", danger: true }))) return;
    setBusy(true);
    try {
      await applicationApi.action(selected.id, name, payload);
      notifySuccess(name === "approve" ? "Application approved. Payment or free-admission activation will follow the configured fee." : name === "reject" ? "Application rejected." : "Application marked under review.");
      if (name !== "reject") setSelected(null);
      await reload();
    } catch (err) { notifyError(message(err)); throw err; } finally { setBusy(false); }
  };
  return <div><PageHeader eyebrow="Admissions" title="Admission applications" description="Review student information, documents, approval, and gateway-verified payment state. Paid admissions activate only after verified payment." /><section className="rounded-lg border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="table table-sm"><thead><tr><th>Applicant</th><th className="hidden sm:table-cell">Admission</th><th className="hidden md:table-cell">Payment</th><th>Status</th><th></th></tr></thead><tbody>{applications.map((application) => <tr key={application.id}><td><b className="block">{application.applicant_name}</b><p className="text-xs text-slate-500">{application.application_no}</p><p className="text-xs text-slate-400 sm:hidden">{program(application.course)}</p></td><td className="hidden sm:table-cell">{program(application.course)}</td><td className="hidden md:table-cell"><Status value={application.payment_status}/></td><td><Status value={application.status}/></td><td><button className="btn btn-outline btn-xs" onClick={() => setSelected(application)}>View Details</button></td></tr>)}</tbody></table></div>{!loading && !applications.length && <div className="p-5"><Empty>No admission applications have been submitted.</Empty></div>}</section>
    <ApplicationDetailsModal application={selected} course={courses.find((course) => String(course.id) === String(selected?.course))} onClose={() => setSelected(null)} onAction={action} busy={busy} />
  </div>;
}

function requiredAdmissionDocuments(course) {
  return (course?.admission_form_schema || []).flatMap((section) => section.fields || []).filter((field) => field.required && field.type === "file").map((field) => field.label || field.name).filter(Boolean);
}

export function AdminAdmissionPipelinePage() {
  const { applications, courses, reload, loading } = useAdminData(["applications", "courses"]);
  const documents = useQuery({ queryKey: ["admin-admission-pipeline-documents"], queryFn: async () => {
    const all = [];
    let page = 1;
    while (page <= 100) {
      const response = await api.get("/applications/documents/", { params: { page, page_size: 200 } });
      const payload = response.data?.data || response.data;
      all.push(...(Array.isArray(payload?.results) ? payload.results : asArray(payload)));
      if (!payload?.next || !Array.isArray(payload?.results)) break;
      page += 1;
    }
    return all;
  }, staleTime: 20_000 });
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const attached = asArray(documents.data);
  const docsByApplication = useMemo(() => {
    const result = new Map();
    attached.forEach((item) => result.set(String(item.application), [...(result.get(String(item.application)) || []), item]));
    return result;
  }, [documents.data]);
  const openCards = courses.filter((course) => course.course_type === "admission" && course.is_published && course.status === "admission_open");
  const courseFor = (application) => courses.find((course) => String(course.id) === String(application.course));
  const stateFor = (application) => {
    const course = courseFor(application);
    const required = requiredAdmissionDocuments(course);
    const uploaded = docsByApplication.get(String(application.id)) || [];
    const missing = required.filter((label) => !uploaded.some((doc) => doc.title?.trim().toLowerCase() === label.trim().toLowerCase()));
    const paid = Number(course?.admission_fee || application.admission_fee || 0) > 0;
    let next = "Application closed";
    if (["pending", "under_review"].includes(application.status)) {
      if (missing.length) next = `Request ${missing.length} missing document${missing.length === 1 ? "" : "s"}`;
      else if (application.status === "pending") next = "Review application";
      else next = "Approve application";
    } else if (application.status === "approved" && paid && application.payment_status !== "paid") next = "Verify payment";
    else if (application.status === "approved" && application.approved_student) next = "Enrollment active";
    else if (application.status === "approved") next = "Check enrollment";
    const documentState = required.length ? `${required.length - missing.length}/${required.length} required` : `${uploaded.length} uploaded · no required files`;
    return { course, required, missing, uploaded, paid, next, documentState };
  };
  const action = async (name, payload = {}) => {
    if (!selected) return;
    if (name === "approve" && !(await confirmAction({ title: "Approve this application?", text: "Paid admissions will require verified payment before enrollment. Free admissions activate immediately.", confirmText: "Yes, approve" }))) return;
    if (name === "reject" && !(await confirmAction({ title: "Reject this application?", text: "The applicant will be notified. This action cannot be undone.", confirmText: "Yes, reject", danger: true }))) return;
    setBusy(true);
    try {
      const result = await applicationApi.action(selected.id, name, payload);
      if (name === "request_documents") notifySuccess(result?.notified ? "Missing-document request sent in the applicant’s notification inbox." : "This applicant has no linked account, so the document request could not be delivered.");
      else notifySuccess(name === "approve" ? "Application approved. Payment verification or enrollment activation will follow the configured fee." : name === "reject" ? "Application rejected and the applicant notified." : "Application marked under review and the applicant notified.");
      if (name !== "reject") setSelected(null);
      await reload();
    } catch (error) { notifyError(message(error)); throw error; }
    finally { setBusy(false); }
  };
  const sendDocumentRequest = async (application) => {
    if (documents.isLoading || documents.isError) return;
    const { missing } = stateFor(application);
    if (!missing.length) return;
    setBusy(true);
    try {
      const result = await applicationApi.action(application.id, "request_documents", { documents: missing });
      notifySuccess(result?.notified ? `Requested: ${missing.join(", ")}.` : "The applicant has no linked account, so the request could not be delivered.");
    } catch (error) { notifyError(message(error)); }
    finally { setBusy(false); setSelected(null); }
  };
  const counts = {
    published: openCards.length,
    applications: applications.length,
    documents: applications.filter((item) => stateFor(item).missing.length > 0).length,
    payments: applications.filter((item) => item.status === "approved" && stateFor(item).paid && item.payment_status !== "paid").length,
    enrolled: applications.filter((item) => item.status === "approved" && item.approved_student).length,
  };
  return <div className="space-y-5">
    <PageHeader eyebrow="Admissions workflow" title="Admission pipeline" description="Track published admission cards through applicant review, document completion, verified payment and active enrollment. Each applicant has a visible next action." />
    <div className="grid gap-3 grid-cols-2 xl:grid-cols-5">{[["Published cards", counts.published, "/admin/dashboard/admissions"], ["Applications", counts.applications, "/admin/dashboard/admission-applications"], ["Documents needed", counts.documents, "#pipeline-applicants"], ["Payment verification", counts.payments, "/admin/dashboard/payments"], ["Enrolled", counts.enrolled, "/admin/dashboard/admission-applications"]].map(([title, value, to]) => <Link key={title} to={to} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-300"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{title}</p><strong className="mt-1 block text-2xl font-black text-slate-950">{loading ? "…" : value}</strong></Link>)}</div>
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-black text-slate-950">Published admission cards</h2><p className="mt-1 text-sm text-slate-500">Cards currently visible for applications.</p></div><Link className="btn btn-outline btn-sm" to="/admin/dashboard/admissions">Manage cards</Link></div>{openCards.length ? <ul className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{openCards.map((course) => <li key={course.id} className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-3"><p className="font-bold text-slate-900">{course.title}</p><p className="mt-1 text-xs font-semibold text-slate-500">{Number(course.admission_fee || 0) ? `Fee · ৳${course.admission_fee}` : "No admission fee"}</p></li>)}</ul> : <p className="mt-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-500">No published admission cards are currently open.</p>}</section>
    <section id="pipeline-applicants" className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><header className="flex flex-wrap items-center justify-between gap-3 border-b p-4"><div><h2 className="font-black text-slate-950">Applicant next actions</h2><p className="mt-1 text-xs text-slate-500">Document counts use required file fields on each admission card.</p></div><Link className="btn btn-outline btn-sm" to="/admin/dashboard/admission-applications">Full application list</Link></header>{documents.isError && <p className="m-4 rounded bg-amber-50 p-3 text-sm text-amber-800">Document totals are unavailable. Open application details to check uploaded files.</p>}{applications.length ? <div className="overflow-x-auto"><table className="table table-sm"><thead><tr><th>Applicant</th><th className="hidden md:table-cell">Card / class</th><th>Documents</th><th className="hidden sm:table-cell">Payment</th><th>Next action</th><th></th></tr></thead><tbody>{applications.map((application) => { const state = stateFor(application); return <tr key={application.id}><td><b className="block">{application.applicant_name}</b><span className="text-xs text-slate-500">{application.application_no} · <Status value={application.status}/></span></td><td className="hidden md:table-cell">{state.course?.title || `Program #${application.course || "—"}`}</td><td>{state.documentState}{state.missing.length > 0 && <p className="mt-1 text-xs font-bold text-amber-700">Missing: {state.missing.join(", ")}</p>}</td><td className="hidden sm:table-cell"><Status value={application.payment_status}/></td><td><b className="text-sm">{state.next}</b>{state.next === "Verify payment" && <Link className="ml-2 text-xs font-bold text-emerald-700 underline" to="/admin/dashboard/payments">Open payments</Link>}</td><td><div className="flex gap-1">{state.missing.length > 0 && ["pending", "under_review"].includes(application.status) && <button disabled={busy || documents.isLoading} className="btn btn-outline btn-xs" onClick={() => sendDocumentRequest(application)}>Request docs</button>}<button className="btn btn-outline btn-xs" onClick={() => setSelected(application)}>Details</button></div></td></tr>; })}</tbody></table></div> : !loading && <div className="p-8 text-center text-sm font-semibold text-slate-500">No applications are in the pipeline yet.</div>}</section>
    <ApplicationDetailsModal application={selected} course={courseFor(selected || {})} onClose={() => setSelected(null)} onAction={action} busy={busy} />
  </div>;
}

export function AdminNoticeManagementPage() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const blankForm = () => ({ title: "", summary: "", body: "", category: "Admission", is_public: true, is_published: true, publish_at: "", expires_at: "", target_url: "" });
  const [form, setForm] = useState(blankForm());

  const load = async () => {
    setLoading(true);
    try {
      const data = await noticeApi.listResults({ page_size: 100, ordering: "-created_at" });
      setNotices(asArray(data));
    } catch { setNotices([]); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const selectNotice = (item) => {
    setSelected(item);
    setError("");
    setNotice("");
    setForm({
      title: item.title || "",
      summary: item.summary || "",
      body: item.body || "",
      category: item.category || "Admission",
      is_public: Boolean(item.is_public),
      is_published: Boolean(item.is_published),
      publish_at: item.publish_at ? item.publish_at.slice(0, 16) : "",
      expires_at: item.expires_at ? item.expires_at.slice(0, 16) : "",
      target_url: item.target_url || "",
    });
  };

  const newNotice = () => { setSelected(null); setForm(blankForm()); setError(""); setNotice(""); };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const payload = {
        ...form,
        publish_at: form.publish_at || null,
        expires_at: form.expires_at || null,
        target_url: form.target_url || "",
        course: null,
        course_section: null,
        subject: null,
      };
      if (selected) {
        await noticeApi.update(selected.id, payload);
        setNotice("Notice updated successfully.");
        notifySuccess("Notice updated.");
      } else {
        await noticeApi.create(payload);
        setNotice("Notice created successfully.");
        notifySuccess("Notice created.");
        setForm(blankForm());
        setSelected(null);
      }
      await load();
    } catch (err) { setError(message(err)); notifyError(message(err)); } finally { setSaving(false); }
  };

  const remove = async (item) => {
    if (!(await confirmDelete(`Notice "${item.title}"`))) return;
    try { await noticeApi.remove(item.id); setSelected(null); setForm(blankForm()); await load(); notifySuccess("Notice deleted."); } catch (err) { setError(message(err)); notifyError(message(err)); }
  };

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div>
      <PageHeader
        eyebrow="Content"
        title="Notice Management"
        description="Create and publish notices shown on the public notices page and home banner. Use for admissions, events, success stories, and announcements."
        action={<button onClick={newNotice} className="btn btn-success text-white btn-sm"><Plus size={16} /> New notice</button>}
      />
      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-black text-sm">All Notices</h2>
            <span className="badge badge-success badge-sm">{notices.length}</span>
          </div>
          <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
            {loading && <p className="text-sm text-slate-500 py-2">Loading...</p>}
            {!loading && notices.map((item) => (
              <button
                key={item.id}
                onClick={() => selectNotice(item)}
                className={`w-full rounded-lg border p-2.5 text-left transition text-sm ${selected?.id === item.id ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-emerald-200"}`}
              >
                <p className="font-bold truncate">{item.title}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  <span className="badge badge-xs badge-outline">{item.category}</span>
                  {item.is_public && <span className="badge badge-xs badge-success text-white">Public</span>}
                  {!item.is_published && <span className="badge badge-xs badge-warning">Draft</span>}
                </div>
              </button>
            ))}
            {!loading && !notices.length && <Empty>No notices yet. Create the first one.</Empty>}
          </div>
        </aside>
        <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-black">{selected ? `Edit: ${selected.title.slice(0, 40)}` : "Create new notice"}</h2>
            <div className="flex gap-2">
              {selected && <button type="button" onClick={() => remove(selected)} className="btn btn-error btn-sm text-white"><Trash2 size={15} /> Delete</button>}
              <button disabled={saving} className="btn btn-success btn-sm text-white">{saving ? "Saving..." : selected ? "Update notice" : "Create notice"}</button>
            </div>
          </div>
          {notice && <p className="alert alert-success text-sm py-2">{notice}</p>}
          {error && <p className="alert alert-error text-sm py-2">{error}</p>}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="form-control sm:col-span-2">
              <span className="mb-1 text-xs font-bold text-slate-600 uppercase tracking-wide">Notice title *</span>
              <input required value={form.title} onChange={(e) => update("title", e.target.value)} className="input input-bordered input-sm" placeholder="e.g. Admission Open 2025 — Class 9 & 10" />
            </label>
            <label className="form-control">
              <span className="mb-1 text-xs font-bold text-slate-600 uppercase tracking-wide">Category</span>
              <select value={form.category} onChange={(e) => update("category", e.target.value)} className="select select-bordered select-sm">
                {noticeCategories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </label>
            <label className="form-control">
              <span className="mb-1 text-xs font-bold text-slate-600 uppercase tracking-wide">Link URL (optional)</span>
              <input value={form.target_url} onChange={(e) => update("target_url", e.target.value)} className="input input-bordered input-sm" placeholder="https://..." />
            </label>
            <label className="form-control">
              <span className="mb-1 text-xs font-bold text-slate-600 uppercase tracking-wide">Publish at (optional)</span>
              <input type="datetime-local" value={form.publish_at} onChange={(e) => update("publish_at", e.target.value)} className="input input-bordered input-sm" />
            </label>
            <label className="form-control">
              <span className="mb-1 text-xs font-bold text-slate-600 uppercase tracking-wide">Expires at (optional)</span>
              <input type="datetime-local" value={form.expires_at} onChange={(e) => update("expires_at", e.target.value)} className="input input-bordered input-sm" />
            </label>
            <label className="form-control sm:col-span-2">
              <span className="mb-1 text-xs font-bold text-slate-600 uppercase tracking-wide">Summary (shown on cards)</span>
              <input value={form.summary} onChange={(e) => update("summary", e.target.value)} className="input input-bordered input-sm" placeholder="Short summary shown in notice cards and home banner" />
            </label>
            <label className="form-control sm:col-span-2">
              <span className="mb-1 text-xs font-bold text-slate-600 uppercase tracking-wide">Full body / content</span>
              <textarea value={form.body} onChange={(e) => update("body", e.target.value)} className="textarea textarea-bordered min-h-28 text-sm" placeholder="Full notice content (supports plain text or HTML)" />
            </label>
            <div className="flex flex-wrap gap-4 sm:col-span-2">
              <label className="label cursor-pointer justify-start gap-2 font-bold">
                <input type="checkbox" checked={Boolean(form.is_public)} onChange={(e) => update("is_public", e.target.checked)} className="checkbox checkbox-success checkbox-sm" />
                <span className="label-text">Visible on public notices page</span>
              </label>
              <label className="label cursor-pointer justify-start gap-2 font-bold">
                <input type="checkbox" checked={Boolean(form.is_published)} onChange={(e) => update("is_published", e.target.checked)} className="checkbox checkbox-success checkbox-sm" />
                <span className="label-text">Published (live)</span>
              </label>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AdminGalleryManagementPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const blankForm = () => ({ type: "photo", title: "", url: "", published: true });
  const [form, setForm] = useState(blankForm());
  const [file, setFile] = useState(null);

  const load = async () => {
    setLoading(true);
    try { setItems(asArray(await galleryApi.listResults({ page_size: 200 }))); } catch { setItems([]); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const resolveUrl = (url) => {
    if (!url) return "";
    if (/^https?:\/\//.test(url)) return url;
    return `${API_BASE_URL.replace(/\/api\/v1$/, "")}${url}`;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError("Title is required.");
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const payload = new FormData();
      payload.append("type", form.type);
      payload.append("title", form.title);
      payload.append("url", form.url || "");
      payload.append("published", String(form.published));
      if (file) payload.append("file", file);
      await galleryApi.create(payload);
      setNotice("Gallery item added successfully.");
      notifySuccess("Gallery item added.");
      setForm(blankForm());
      setFile(null);
      await load();
    } catch (err) { setError(message(err)); notifyError(message(err)); } finally { setSaving(false); } };

  const remove = async (item) => {
    if (!(await confirmDelete(`"${item.title}"`))) return;
    try { await galleryApi.remove(item.id); await load(); notifySuccess("Gallery item deleted."); } catch (err) { setError(message(err)); notifyError(message(err)); }
  };

  const togglePublish = async (item) => {
    try { await galleryApi.update(item.id, { published: !item.published }); await load(); } catch (err) { setError(message(err)); notifyError(message(err)); }
  };

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const visible = filter === "all" ? items : items.filter((item) => item.type === filter);

  return (
    <div>
      <PageHeader
        eyebrow="Content"
        title="Gallery Management"
        description="Upload photos and videos to the public gallery. Add titles and custom descriptions for each item."
      />
      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-3">
          <h2 className="font-black">Add gallery item</h2>
          {notice && <p className="alert alert-success text-sm py-2">{notice}</p>}
          {error && <p className="alert alert-error text-sm py-2">{error}</p>}
          <label className="form-control">
            <span className="mb-1 text-xs font-bold text-slate-600 uppercase tracking-wide">Type</span>
            <select value={form.type} onChange={(e) => update("type", e.target.value)} className="select select-bordered select-sm">
              <option value="photo">Photo / Image</option>
              <option value="video">Video</option>
            </select>
          </label>
          <label className="form-control">
            <span className="mb-1 text-xs font-bold text-slate-600 uppercase tracking-wide">Title *</span>
            <input required value={form.title} onChange={(e) => update("title", e.target.value)} className="input input-bordered input-sm" placeholder="e.g. Annual Day 2025" />
          </label>
          {form.type === "photo" && (
            <label className="form-control">
              <span className="mb-1 text-xs font-bold text-slate-600 uppercase tracking-wide">Upload image</span>
              <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="file-input file-input-bordered file-input-sm w-full" />
            </label>
          )}
          {form.type === "video" && (
            <>
              <label className="form-control">
                <span className="mb-1 text-xs font-bold text-slate-600 uppercase tracking-wide">Upload video</span>
                <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="file-input file-input-bordered file-input-sm w-full" />
              </label>
              <label className="form-control">
                <span className="mb-1 text-xs font-bold text-slate-600 uppercase tracking-wide">Or paste a YouTube embed URL</span>
                <input value={form.url} onChange={(e) => update("url", e.target.value)} className="input input-bordered input-sm" placeholder="https://www.youtube.com/embed/..." />
              </label>
            </>
          )}
          <label className="label cursor-pointer justify-start gap-2">
            <input type="checkbox" checked={Boolean(form.published)} onChange={(e) => update("published", e.target.checked)} className="checkbox checkbox-success checkbox-sm" />
            <span className="label-text font-bold">Published (visible on gallery page)</span>
          </label>
          <button disabled={saving} className="btn btn-success w-full text-white btn-sm"><Image size={16} />{saving ? "Uploading..." : "Add to gallery"}</button>
        </form>
        <div className="space-y-4 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              {["all", "photo", "video"].map((f) => (
                <button key={f} onClick={() => setFilter(f)} className={`btn btn-xs ${filter === f ? "btn-success text-white" : "btn-outline"}`}>
                  {f === "all" ? `All (${items.length})` : `${f === "photo" ? "Photos" : "Videos"} (${items.filter((i) => i.type === f).length})`}
                </button>
              ))}
            </div>
            {loading && <span className="text-sm text-slate-500">Loading...</span>}
          </div>
          {error && <p className="alert alert-error text-sm py-2">{error}</p>}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-sm">
                {item.type === "photo" && item.file && (
                  <img src={resolveUrl(item.file)} alt={item.title} className="h-36 w-full object-cover" />
                )}
                {item.type === "video" && item.url && (
                  <div className="bg-emerald-950 h-36 grid place-items-center">
                    <span className="text-white text-xs font-bold px-3 text-center truncate">{item.url}</span>
                  </div>
                )}
                {!item.file && !item.url && (
                  <div className="h-36 bg-slate-100 grid place-items-center">
                    <Image size={32} className="text-slate-400" />
                  </div>
                )}
                <div className="p-3">
                  <p className="font-bold text-sm truncate">{item.title}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5 justify-between">
                    <span className={`badge badge-xs ${item.type === "video" ? "badge-info" : "badge-success"} text-white`}>{item.type}</span>
                    <div className="flex gap-1">
                      <button onClick={() => togglePublish(item)} className={`btn btn-xs ${item.published ? "btn-success text-white" : "btn-outline"}`}>{item.published ? "Live" : "Draft"}</button>
                      <button onClick={() => remove(item)} className="btn btn-error btn-xs text-white"><Trash2 size={12} /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {!loading && !visible.length && <Empty>{filter === "all" ? "No gallery items yet." : `No ${filter} items yet.`}</Empty>}
        </div>
      </div>
    </div>
  );
}


