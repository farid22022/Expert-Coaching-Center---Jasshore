import CurriculumManager from "./CurriculumManager.jsx";
import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../../services/api.js";
import { confirmDelete, notifyError, notifySuccess } from "../../services/alerts.js";
import { courseSyllabusItemApi, teacherDashboardApi } from "../../services/resourceApi.js";
import RoleDashboardShell from "../../components/layout/RoleDashboardShell.jsx";
import { teacherNav } from "./TeacherModulePages.jsx";

const blank = {
  title: "",
  summary: "",
  content_type: "text",
  content: "",
  url: "",
  course: "",
  course_section: "",
  subject: "",
  order: 0,
  is_public: true,
  file: null,
  custom_fields: [],
};

const blankCustomField = () => ({ id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, type: "text", label: "", value: "", url: "" });

function Shell({ children }) {
  return <RoleDashboardShell roleLabel="Teacher Portal" title="Course Outline" items={teacherNav}><section className="mx-auto max-w-7xl space-y-5">{children}</section></RoleDashboardShell>;
}

export default function TeacherCourseOutlinePage() {
  const [data, setData] = useState({ assigned_courses: [], assigned_sections: [], assigned_subjects: [] });
  const [rows, setRows] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);
    try {
      const [dashboard, syllabus] = await Promise.all([teacherDashboardApi.list(), courseSyllabusItemApi.listResults()]);
      setData(dashboard);
      setRows(syllabus);
      setError("");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to load course outline."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  const remove = async (item) => {
    if (!(await confirmDelete(`"${item.title}"`))) return;
    try {
      await courseSyllabusItemApi.remove(item.id);
      notifySuccess("Outline item deleted.");
      await reload();
    } catch (requestError) {
      notifyError(getApiErrorMessage(requestError, "Could not delete this outline item."));
    }
  };

  return (
    <Shell>
      <CurriculumManager data={data} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">Course Outline & Syllabus</h1>
          <p className="font-semibold text-slate-500">Create public subject modules with text, images, videos, links, and files.</p>
        </div>
        <button className="btn btn-success text-white" onClick={() => setEditing(blank)}>+ Add Outline Item</button>
      </div>
      {error && <p className="alert alert-error text-sm">{error}</p>}
      {loading && <p className="rounded border border-dashed border-emerald-200 bg-emerald-50/50 p-5 font-bold text-emerald-700">Loading course outline...</p>}
      {!loading && <div className="grid gap-3">
        {rows.map((item) => (
          <article key={item.id} className="rounded border bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase text-emerald-700">{item.section_name || "Course-wide"} · {item.subject_name || "All subjects"}</p>
                <h2 className="text-lg font-black">{item.title}</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">{item.summary || item.content_type}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge ${item.is_public ? "badge-success text-white" : "badge-outline"}`}>{item.is_public ? "Public" : "Hidden"}</span>
                <button className="btn btn-info btn-xs text-white" onClick={() => setEditing({ ...blank, ...item, file: null })}>Edit</button>
                <button className="btn btn-error btn-xs text-white" onClick={() => remove(item)}>Delete</button>
              </div>
            </div>
          </article>
        ))}
        {!rows.length && <p className="rounded border bg-white p-5 font-semibold text-slate-500">No course outline items created yet. Click "+ Add Outline Item" to create your first module.</p>}
      </div>}
      {editing && <SyllabusEditor data={data} item={editing} onClose={() => setEditing(null)} onSaved={reload} />}
    </Shell>
  );
}

function SyllabusEditor({ data, item, onClose, onSaved }) {
  const [form, setForm] = useState(item);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const sections = data.assigned_sections.filter((section) => !form.course || String(section.course) === String(form.course));
  const subjects = data.assigned_subjects.filter((subject) => sections.some((section) => String(section.id) === String(subject.course_section)) && (!form.course_section || String(subject.course_section) === String(form.course_section)));
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = new FormData();
      Object.entries({ ...form, course_section: form.course_section || "", subject: form.subject || "" }).forEach(([key, value]) => {
        if (key !== "id" && key !== "custom_fields" && value !== null && value !== "") payload.append(key, value);
      });
      payload.append("custom_fields", JSON.stringify(form.custom_fields || []));
      if (form.id) await courseSyllabusItemApi.update(form.id, payload);
      else await courseSyllabusItemApi.create(payload);
      notifySuccess(form.id ? "Outline item updated successfully." : "Outline item created successfully.");
      await onSaved();
      onClose();
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, "Unable to save this outline item.");
      setError(message); notifyError(message);
    } finally {
      setSaving(false);
    }
  }

  const updateCustomField = (index, key, value) => {
    setForm((current) => ({
      ...current,
      custom_fields: (current.custom_fields || []).map((field, currentIndex) => currentIndex === index ? { ...field, [key]: value } : field),
    }));
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-3">
      <form onSubmit={submit} className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-black">{form.id ? "Edit Outline Item" : "Create Outline Item"}</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">Build the public syllabus for a course or specific subject.</p>
          </div>
          <button type="button" className="btn btn-sm" onClick={onClose}>Close</button>
        </div>
        {error && <p className="alert alert-error mt-4 text-sm">{error}</p>}
        <div className="mt-5 grid gap-3">
          <label className="grid gap-1 text-sm font-bold text-slate-700">Title<input required className="input input-bordered" value={form.title} onChange={(event) => update("title", event.target.value)} /></label>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="grid gap-1 text-sm font-bold text-slate-700">Admission / Course<select required className="select select-bordered" value={form.course} onChange={(event) => update("course", event.target.value)}><option value="">Select course</option>{data.assigned_courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select></label>
            <label className="grid gap-1 text-sm font-bold text-slate-700">Subject group<select className="select select-bordered" value={form.course_section} onChange={(event) => { update("course_section", event.target.value); update("subject", ""); }}><option value="">Course-wide</option>{sections.map((section) => <option key={section.id} value={section.id}>{section.name}</option>)}</select></label>
            <label className="grid gap-1 text-sm font-bold text-slate-700">Subject<select className="select select-bordered" value={form.subject} onChange={(event) => update("subject", event.target.value)}><option value="">All subjects</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select></label>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="grid gap-1 text-sm font-bold text-slate-700">Content type<select className="select select-bordered" value={form.content_type} onChange={(event) => update("content_type", event.target.value)}><option value="text">Text module</option><option value="image">Image</option><option value="video">Video</option><option value="link">Link</option><option value="file">File</option></select></label>
            <label className="grid gap-1 text-sm font-bold text-slate-700">Order<input type="number" className="input input-bordered" value={form.order} onChange={(event) => update("order", event.target.value)} /></label>
            <label className="label mt-6 cursor-pointer justify-start gap-2 font-bold"><input type="checkbox" className="checkbox checkbox-success" checked={Boolean(form.is_public)} onChange={(event) => update("is_public", event.target.checked)} />Show publicly</label>
          </div>
          <label className="grid gap-1 text-sm font-bold text-slate-700">Short summary<textarea className="textarea textarea-bordered" value={form.summary} onChange={(event) => update("summary", event.target.value)} /></label>
          <label className="grid gap-1 text-sm font-bold text-slate-700">Detailed text<textarea className="textarea textarea-bordered min-h-32" value={form.content} onChange={(event) => update("content", event.target.value)} /></label>
          <section className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-black text-slate-950">Custom fields</h3>
                <p className="text-sm font-semibold text-slate-500">Add multiple text, image, video, link, or file blocks to this outline item.</p>
              </div>
              <button type="button" className="btn btn-outline btn-success btn-sm" onClick={() => update("custom_fields", [...(form.custom_fields || []), blankCustomField()])}>Add custom field</button>
            </div>
            <div className="mt-3 grid gap-3">
              {(form.custom_fields || []).map((field, index) => (
                <div key={field.id || index} className="grid gap-2 rounded-lg border border-emerald-100 bg-white p-3 lg:grid-cols-[150px_1fr_1fr_1fr_auto]">
                  <select className="select select-bordered select-sm" value={field.type || "text"} onChange={(event) => updateCustomField(index, "type", event.target.value)}>
                    <option value="text">Text</option>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="link">Link</option>
                    <option value="file">File</option>
                  </select>
                  <input className="input input-bordered input-sm" placeholder="Label" value={field.label || ""} onChange={(event) => updateCustomField(index, "label", event.target.value)} />
                  <input className="input input-bordered input-sm" placeholder="Text/value" value={field.value || ""} onChange={(event) => updateCustomField(index, "value", event.target.value)} />
                  <input className="input input-bordered input-sm" placeholder="URL or media path" value={field.url || ""} onChange={(event) => updateCustomField(index, "url", event.target.value)} />
                  <button type="button" className="btn btn-error btn-sm text-white" onClick={() => update("custom_fields", (form.custom_fields || []).filter((_, currentIndex) => currentIndex !== index))}>Remove</button>
                </div>
              ))}
              {!(form.custom_fields || []).length && <p className="rounded border border-dashed border-emerald-200 bg-white p-4 text-sm font-semibold text-slate-500">No custom fields yet.</p>}
            </div>
          </section>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-1 text-sm font-bold text-slate-700">Video or link URL<input className="input input-bordered" value={form.url} onChange={(event) => update("url", event.target.value)} placeholder="https://..." /></label>
            <label className="grid gap-1 text-sm font-bold text-slate-700">Upload image or file<input type="file" className="file-input file-input-bordered" onChange={(event) => update("file", event.target.files?.[0] || null)} /></label>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2"><button type="button" className="btn" onClick={onClose}>Cancel</button><button disabled={saving} className="btn btn-success text-white">{saving ? "Saving..." : "Save outline item"}</button></div>
      </form>
    </div>
  );
}
