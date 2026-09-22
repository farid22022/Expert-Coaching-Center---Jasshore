import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Download, Edit3, Trash2, Upload, X } from "lucide-react";
import { Link } from "react-router-dom";

import { getApiErrorMessage } from "../../../../../services/api.js";
import {
  academicClassApi,
  sessionApi,
  studentGroupApi,
  subjectApi,
} from "../../../../../services/resourceApi.js";
import { useAcademicBase } from "../academicShared.jsx";

function PageRoot({ children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="min-h-[calc(100vh-60px)] bg-[#f5f5f5] p-2 sm:p-3">
      {children}
    </motion.div>
  );
}

function Panel({ title, action, children }) {
  return (
    <section className="overflow-hidden rounded-md border border-base-300 bg-white shadow-sm">
      <div className="flex min-h-[40px] items-center justify-between gap-3 bg-[#456db5] px-4 py-2 text-white">
        <h2 className="text-base font-bold sm:text-lg">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Select({ children, className = "", ...props }) {
  return <select {...props} className={`select select-bordered select-sm h-8 min-h-8 w-full rounded-[3px] border-slate-300 bg-white ${className}`}>{children}</select>;
}

function Input({ className = "", ...props }) {
  return <input {...props} className={`input input-bordered input-sm h-8 min-h-8 w-full rounded-[3px] border-slate-300 bg-white ${className}`} />;
}

function Field({ label, children }) {
  return (
    <div className="grid items-center gap-3 sm:grid-cols-[180px_minmax(0,1fr)]">
      <label className="text-sm font-medium text-black">{label}</label>
      {children}
    </div>
  );
}

function CyanLink({ to, children }) {
  return <Link to={to} className="btn btn-info btn-sm min-h-0 border-cyan-600 bg-cyan-600 text-white hover:bg-cyan-700">{children}</Link>;
}

function PurpleButton({ children, onClick }) {
  return <motion.button whileTap={{ scale: 0.96 }} type="button" onClick={onClick} className="btn btn-sm min-h-0 border-violet-700 bg-violet-700 text-white hover:bg-violet-800">{children}</motion.button>;
}

function subjectToForm(subject) {
  return {
    academic_class: subject?.academic_class || "",
    session: subject?.session || "",
    groups: subject?.groups || [],
    code: subject?.code || "",
    name: subject?.name || "",
    category: subject?.category || "Regular",
  };
}

function SubjectModal({ open, subject, sessions, classes, groups, onClose, onSave }) {
  const [form, setForm] = useState(subjectToForm(subject));

  useEffect(() => {
    setForm(subjectToForm(subject));
  }, [subject]);

  if (!open) return null;

  const update = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));

  const toggleGroup = (id) => {
    setForm((previous) => {
      const next = new Set(previous.groups || []);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...previous, groups: Array.from(next) };
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-2xl overflow-hidden rounded-md bg-white shadow-xl">
        <div className="flex items-center justify-between bg-[#456db5] px-5 py-3 text-white">
          <h3 className="font-bold">{subject ? "Update Subject" : "Create Subject"}</h3>
          <button type="button" onClick={onClose} aria-label="Close subject modal"><X size={20} /></button>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-bold">Session</label>
            <Select value={form.session || ""} onChange={(event) => update("session", Number(event.target.value) || "")}>
              <option value="">Select Session</option>
              {sessions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold">Class</label>
            <Select value={form.academic_class || ""} onChange={(event) => update("academic_class", Number(event.target.value) || "")}>
              <option value="">Select Class</option>
              {classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold">Subject Code</label>
            <Input value={form.code} onChange={(event) => update("code", event.target.value)} placeholder="Subject Code" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold">Subject Name</label>
            <Input value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Subject Name" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold">Subject Category</label>
            <Select value={form.category} onChange={(event) => update("category", event.target.value)}>
              <option>Regular</option>
              <option>Optional</option>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold">Groups</label>
            <div className="flex min-h-8 flex-wrap gap-2 rounded border border-slate-300 px-2 py-1">
              {groups.length ? groups.map((item) => (
                <label key={item.id} className="inline-flex items-center gap-1 text-xs font-bold">
                  <input type="checkbox" checked={(form.groups || []).includes(item.id)} onChange={() => toggleGroup(item.id)} className="checkbox checkbox-xs" />
                  {item.name}
                </label>
              )) : <span className="text-xs font-semibold text-slate-400">No groups found</span>}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-3">
          <button type="button" onClick={onClose} className="btn btn-sm">Cancel</button>
          <button type="button" onClick={() => onSave(form)} className="btn btn-success btn-sm text-white">Save</button>
        </div>
      </motion.div>
    </div>
  );
}

function useSubjectData() {
  const [subjects, setSubjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = async () => {
    setLoading(true);
    setError("");
    try {
      const [subjectRows, sessionRows, classRows, groupRows] = await Promise.all([
        subjectApi.listResults(),
        sessionApi.listResults(),
        academicClassApi.listResults(),
        studentGroupApi.listResults(),
      ]);
      setSubjects(subjectRows);
      setSessions(sessionRows);
      setClasses(classRows);
      setGroups(groupRows);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to load academic data."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  return { subjects, sessions, classes, groups, loading, error, reload };
}

export function SubjectTransferPage() {
  const base = useAcademicBase();
  const { sessions, classes, loading } = useSubjectData();
  const [form, setForm] = useState({ session: "", academicClass: "" });
  const [searched, setSearched] = useState(false);

  return (
    <PageRoot>
      <Panel title="Subject Transfer" action={<CyanLink to={`${base}/subject/subject`}>Back to Subject List</CyanLink>}>
        <div className="px-5 py-5">
          <div className="mx-auto grid max-w-[1320px] gap-x-7 gap-y-5 lg:grid-cols-2">
            <Field label="Session:">
              <Select value={form.session} onChange={(event) => setForm((previous) => ({ ...previous, session: event.target.value }))}>
                <option value="">Select Session</option>
                {sessions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </Select>
            </Field>
            <Field label="Class:">
              <Select value={form.academicClass} onChange={(event) => setForm((previous) => ({ ...previous, academicClass: event.target.value }))}>
                <option value="">Select Class</option>
                {classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </Select>
            </Field>
            <div className="lg:col-start-1">
              <div className="sm:ml-[198px]"><PurpleButton onClick={() => setSearched(true)}>Search</PurpleButton></div>
            </div>
          </div>
          {searched && (
            <div className="mx-auto mt-5 max-w-[1320px] rounded border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
              {loading ? "Loading..." : "Subject transfer service is not implemented in the backend yet."}
            </div>
          )}
        </div>
      </Panel>
    </PageRoot>
  );
}

export function SubjectExcelEntryPage() {
  const base = useAcademicBase();
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState("");

  const downloadTemplate = () => {
    const content = [
      ["Session", "Class", "Groups", "Subject Code", "Subject Name", "Subject Category"],
      ["2026", "SSC", "Science", "101", "Bangla 1st Paper", "Regular"],
    ].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "subject_excel_format.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <PageRoot>
      <Panel title="Subject Quick Excel Entry" action={<CyanLink to={`${base}/subject/subject`}>Create Subject</CyanLink>}>
        <div className="px-5 py-14">
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={(event) => setFileName(event.target.files?.[0]?.name || "")} className="hidden" />
          <div className="mx-auto grid max-w-[1300px] gap-7 lg:grid-cols-2">
            <div>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="btn btn-sm h-8 min-h-8 w-full border-slate-600 bg-gradient-to-b from-slate-500 to-slate-600 text-white hover:bg-slate-700">Upload Excel Format</button>
              <div className="h-4 rounded-b bg-[#eef0f2]" />
              {fileName && <div className="mt-2 flex items-center gap-2 text-xs text-slate-500"><Upload size={14} />{fileName}</div>}
            </div>
            <div>
              <button type="button" onClick={downloadTemplate} className="btn btn-sm h-8 min-h-8 w-full border-violet-700 bg-gradient-to-r from-violet-700 to-purple-600 text-white hover:bg-violet-800">Download Excel Format</button>
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-500"><Download size={14} />Backend import endpoint is not implemented yet.</div>
            </div>
          </div>
        </div>
      </Panel>
    </PageRoot>
  );
}

export function SubjectPage() {
  const { subjects, sessions, classes, groups, loading, error, reload } = useSubjectData();
  const [filters, setFilters] = useState({ session: "", academicClass: "" });
  const [modal, setModal] = useState({ open: false, subject: null });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const classById = useMemo(() => new Map(classes.map((item) => [item.id, item.name])), [classes]);
  const sessionById = useMemo(() => new Map(sessions.map((item) => [item.id, item.name])), [sessions]);
  const groupById = useMemo(() => new Map(groups.map((item) => [item.id, item.name])), [groups]);

  const filteredSubjects = useMemo(() => subjects.filter((subject) => {
    const sessionMatch = !filters.session || String(subject.session || "") === String(filters.session);
    const classMatch = !filters.academicClass || String(subject.academic_class || "") === String(filters.academicClass);
    return sessionMatch && classMatch;
  }), [subjects, filters]);

  const saveSubject = async (form) => {
    if (!form.code.trim() || !form.name.trim()) {
      setNotice("Subject Code and Subject Name are required.");
      return;
    }
    setSaving(true);
    setNotice("");
    try {
      if (modal.subject) await subjectApi.update(modal.subject.id, form);
      else await subjectApi.create(form);
      setModal({ open: false, subject: null });
      await reload();
      setNotice("Subject saved successfully.");
    } catch (requestError) {
      setNotice(getApiErrorMessage(requestError, "Unable to save subject."));
    } finally {
      setSaving(false);
    }
  };

  const deleteSubject = async (subject) => {
    if (!window.confirm(`Delete subject "${subject.name}"?`)) return;
    setNotice("");
    try {
      await subjectApi.remove(subject.id);
      await reload();
      setNotice("Subject deleted successfully.");
    } catch (requestError) {
      setNotice(getApiErrorMessage(requestError, "Unable to delete subject."));
    }
  };

  return (
    <PageRoot>
      <div className="space-y-4">
        <Panel title="Subject List" action={<button type="button" onClick={() => setModal({ open: true, subject: null })} className="btn btn-info btn-sm min-h-0 text-white">Create Subject</button>}>
          <div className="px-5 py-5">
            <div className="mx-auto grid max-w-[1320px] gap-x-7 gap-y-5 lg:grid-cols-2">
              <Field label="Session:">
                <Select value={filters.session} onChange={(event) => setFilters((previous) => ({ ...previous, session: event.target.value }))}>
                  <option value="">All Sessions</option>
                  {sessions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </Select>
              </Field>
              <Field label="Class:">
                <Select value={filters.academicClass} onChange={(event) => setFilters((previous) => ({ ...previous, academicClass: event.target.value }))}>
                  <option value="">All Classes</option>
                  {classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </Select>
              </Field>
            </div>
            {notice && <div className="mt-4 rounded border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-800">{notice}</div>}
            {error && <div className="mt-4 rounded border border-red-100 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">{error}</div>}
          </div>
        </Panel>

        <Panel title="Subject List">
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="table table-xs min-w-[1100px] border border-base-300">
                <thead className="bg-white text-black">
                  <tr>
                    <th className="border border-base-300">Class Name</th>
                    <th className="border border-base-300">Groups</th>
                    <th className="border border-base-300">Subject Code</th>
                    <th className="border border-base-300">Subject Name</th>
                    <th className="border border-base-300">Subject Category</th>
                    <th className="border border-base-300">Session</th>
                    <th className="w-[105px] border border-base-300">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} className="border border-base-300 py-8 text-center text-slate-400">Loading subjects...</td></tr>
                  ) : filteredSubjects.length ? filteredSubjects.map((subject, index) => (
                    <tr key={subject.id} className={index % 2 === 0 ? "bg-[#f0f0f0]" : "bg-white"}>
                      <td className="border border-base-300">{classById.get(subject.academic_class) || "-"}</td>
                      <td className="border border-base-300">{(subject.groups || []).map((id) => groupById.get(id)).filter(Boolean).join(", ") || "-"}</td>
                      <td className="border border-base-300">{subject.code}</td>
                      <td className="border border-base-300">{subject.name}</td>
                      <td className="border border-base-300">{subject.category || "-"}</td>
                      <td className="border border-base-300">{sessionById.get(subject.session) || "-"}</td>
                      <td className="border border-base-300">
                        <div className="flex gap-1">
                          <button type="button" onClick={() => setModal({ open: true, subject })} title="Edit" className="btn btn-info btn-xs h-7 min-h-7 w-7 p-0 text-white"><Edit3 size={14} /></button>
                          <button type="button" onClick={() => deleteSubject(subject)} title="Delete" className="btn btn-error btn-xs h-7 min-h-7 w-7 p-0 text-white"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={7} className="border border-base-300 py-8 text-center text-slate-400">No subjects found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="mt-5 text-sm font-bold text-black">Showing {filteredSubjects.length ? 1 : 0} to {filteredSubjects.length} of {filteredSubjects.length} results.</p>
          </div>
        </Panel>
      </div>

      <SubjectModal
        key={modal.subject?.id ?? "new-subject"}
        open={modal.open}
        subject={modal.subject}
        sessions={sessions}
        classes={classes}
        groups={groups}
        onClose={() => setModal({ open: false, subject: null })}
        onSave={saveSubject}
      />

      {saving && <div className="fixed bottom-4 right-4 rounded bg-slate-950 px-4 py-2 text-sm font-bold text-white shadow-lg">Saving subject...</div>}
    </PageRoot>
  );
}
