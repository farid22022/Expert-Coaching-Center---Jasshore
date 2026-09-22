import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Edit3, Trash2 } from "lucide-react";

import { getApiErrorMessage } from "../../../../services/api.js";
import {
  academicClassApi,
  buildingApi,
  classTeacherApi,
  classroomApi,
  combinedSubjectApi,
  employeeApi,
  floorApi,
  sectionApi,
  sessionApi,
  shiftApi,
  studentCategoryApi,
  studentGroupApi,
  subjectApi,
  syllabusApi,
} from "../../../../services/resourceApi.js";
import { AcademicPageShell } from "./academicShared.jsx";

function Page({ title, children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <AcademicPageShell title={title}>{children}</AcademicPageShell>
    </motion.div>
  );
}

function Input({ className = "", ...props }) {
  return <input {...props} className={`input input-bordered input-sm h-9 min-h-9 rounded-[3px] bg-white ${className}`} />;
}

function Select({ children, className = "", ...props }) {
  return <select {...props} className={`select select-bordered select-sm h-9 min-h-9 rounded-[3px] bg-white ${className}`}>{children}</select>;
}

function Textarea({ className = "", ...props }) {
  return <textarea {...props} className={`textarea textarea-bordered min-h-20 rounded-[3px] bg-white ${className}`} />;
}

function asArray(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.results)) return response.data.results;
  return [];
}

function optionLabel(item, fallback = "name") {
  return item?.[fallback] || item?.full_name || item?.room_no || item?.email || `#${item?.id}`;
}

function useCrudPage(api, dependencies = []) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  const reload = async () => {
    setLoading(true);
    try {
      setRows(asArray(await api.list()));
    } catch (error) {
      setNotice(getApiErrorMessage(error, "Unable to load records."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { rows, loading, notice, setNotice, reload };
}

function CrudPage({
  title,
  api,
  initialForm,
  fields,
  columns,
  dependencies = {},
  normalize = (form) => form,
  validate,
}) {
  const { rows, loading, notice, setNotice, reload } = useCrudPage(api);
  const [form, setForm] = useState(initialForm);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const dependencyMaps = useMemo(() => {
    return Object.fromEntries(
      Object.entries(dependencies).map(([key, values]) => [
        key,
        new Map((values || []).map((item) => [item.id, optionLabel(item)])),
      ])
    );
  }, [dependencies]);

  const update = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));

  const reset = () => {
    setForm(initialForm);
    setEditing(null);
  };

  const save = async (event) => {
    event.preventDefault();
    setNotice("");
    const error = validate?.(form);
    if (error) {
      setNotice(error);
      return;
    }

    setSaving(true);
    try {
      const payload = normalize(form);
      if (editing) await api.update(editing.id, payload);
      else await api.create(payload);
      reset();
      await reload();
      setNotice(`${title} saved successfully.`);
    } catch (requestError) {
      setNotice(getApiErrorMessage(requestError, `Unable to save ${title.toLowerCase()}.`));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row) => {
    if (!window.confirm(`Delete ${title.toLowerCase()} record?`)) return;
    setNotice("");
    try {
      await api.remove(row.id);
      await reload();
      setNotice(`${title} deleted successfully.`);
    } catch (requestError) {
      setNotice(getApiErrorMessage(requestError, `Unable to delete ${title.toLowerCase()}.`));
    }
  };

  const startEdit = (row) => {
    setEditing(row);
    const nextForm = { ...initialForm };
    fields.forEach((field) => {
      nextForm[field.name] = field.multiple ? row[field.name] || [] : row[field.name] ?? "";
    });
    setForm(nextForm);
  };

  const renderValue = (row, column) => {
    const value = row[column.key];
    if (column.render) return column.render(row, dependencyMaps);
    if (column.lookup) return dependencyMaps[column.lookup]?.get(value) || "-";
    if (Array.isArray(value)) return value.map((id) => dependencyMaps[column.lookupMany]?.get(id) || id).join(", ") || "-";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return value || "-";
  };

  return (
    <Page title={title}>
      <div className="space-y-5">
        <form onSubmit={save} className="grid gap-4 rounded-md border border-slate-200 bg-slate-50 p-4 md:grid-cols-2 xl:grid-cols-3">
          {fields.map((field) => (
            <label key={field.name} className={field.type === "textarea" ? "md:col-span-2 xl:col-span-3" : ""}>
              <span className="mb-1 block text-sm font-bold text-slate-700">{field.label}</span>
              {field.type === "select" ? (
                <Select value={form[field.name] ?? ""} onChange={(event) => update(field.name, field.number ? Number(event.target.value) || "" : event.target.value)}>
                  <option value="">{field.placeholder || `Select ${field.label}`}</option>
                  {(field.options || []).map((item) => (
                    <option key={item.id} value={item.id}>{optionLabel(item, field.optionLabel)}</option>
                  ))}
                </Select>
              ) : field.type === "multi" ? (
                <div className="flex min-h-9 flex-wrap gap-2 rounded border border-base-300 bg-white px-2 py-1">
                  {(field.options || []).map((item) => (
                    <label key={item.id} className="inline-flex items-center gap-1 text-xs font-bold">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-xs"
                        checked={(form[field.name] || []).includes(item.id)}
                        onChange={() => update(field.name, (form[field.name] || []).includes(item.id)
                          ? (form[field.name] || []).filter((id) => id !== item.id)
                          : [...(form[field.name] || []), item.id])}
                      />
                      {optionLabel(item, field.optionLabel)}
                    </label>
                  ))}
                </div>
              ) : field.type === "checkbox" ? (
                <label className="flex h-9 items-center gap-2 rounded border border-base-300 bg-white px-3 text-sm font-bold">
                  <input type="checkbox" checked={Boolean(form[field.name])} onChange={(event) => update(field.name, event.target.checked)} className="checkbox checkbox-sm" />
                  Enabled
                </label>
              ) : field.type === "textarea" ? (
                <Textarea value={form[field.name] ?? ""} onChange={(event) => update(field.name, event.target.value)} placeholder={field.placeholder || field.label} />
              ) : (
                <Input type={field.type || "text"} value={form[field.name] ?? ""} onChange={(event) => update(field.name, field.number ? Number(event.target.value) || 0 : event.target.value)} placeholder={field.placeholder || field.label} />
              )}
            </label>
          ))}

          <div className="flex items-end gap-2 md:col-span-2 xl:col-span-3">
            <button type="submit" disabled={saving} className="btn btn-success btn-sm text-white">{editing ? "Update" : "Create"} {title}</button>
            {editing && <button type="button" onClick={reset} className="btn btn-sm">Cancel</button>}
          </div>
        </form>

        {notice && <div className="rounded border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-800">{notice}</div>}

        <div className="overflow-x-auto rounded-md border border-base-300 bg-white">
          <table className="table table-xs min-w-[900px]">
            <thead className="bg-slate-100 text-slate-950">
              <tr>
                {columns.map((column) => <th key={column.key}>{column.label}</th>)}
                <th className="w-24">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={columns.length + 1} className="py-8 text-center text-slate-400">Loading...</td></tr>
              ) : rows.length ? rows.map((row) => (
                <tr key={row.id}>
                  {columns.map((column) => <td key={column.key}>{renderValue(row, column)}</td>)}
                  <td>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => startEdit(row)} className="btn btn-info btn-xs h-7 min-h-7 w-7 p-0 text-white" title="Edit"><Edit3 size={14} /></button>
                      <button type="button" onClick={() => remove(row)} className="btn btn-error btn-xs h-7 min-h-7 w-7 p-0 text-white" title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={columns.length + 1} className="py-8 text-center text-slate-400">No records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Page>
  );
}

function useAcademicLookups() {
  const [lookups, setLookups] = useState({
    buildings: [],
    floors: [],
    classes: [],
    shifts: [],
    sessions: [],
    sections: [],
    subjects: [],
    teachers: [],
  });

  useEffect(() => {
    Promise.all([
      buildingApi.listResults(),
      floorApi.listResults(),
      academicClassApi.listResults(),
      shiftApi.listResults(),
      sessionApi.listResults(),
      sectionApi.listResults(),
      subjectApi.listResults(),
      employeeApi.listResults({ employee_type: "teacher" }),
    ]).then(([buildings, floors, classes, shifts, sessions, sections, subjects, teachers]) => {
      setLookups({ buildings, floors, classes, shifts, sessions, sections, subjects, teachers });
    }).catch(() => {});
  }, []);

  return lookups;
}

export function BuildingListPage() {
  return <CrudPage title="Building List" api={buildingApi} initialForm={{ name: "", full_name: "" }} fields={[{ name: "name", label: "Building Name" }, { name: "full_name", label: "Full Name" }]} columns={[{ key: "name", label: "Building Name" }, { key: "full_name", label: "Full Name" }]} validate={(form) => !form.name.trim() && "Building name is required."} />;
}

export function FloorListPage() {
  const { buildings } = useAcademicLookups();
  return <CrudPage title="Floor List" api={floorApi} dependencies={{ building: buildings }} initialForm={{ building: "", name: "", full_name: "" }} fields={[{ name: "building", label: "Building", type: "select", number: true, options: buildings }, { name: "name", label: "Floor Name" }, { name: "full_name", label: "Full Name" }]} columns={[{ key: "building", label: "Building", lookup: "building" }, { key: "name", label: "Floor Name" }, { key: "full_name", label: "Full Name" }]} validate={(form) => (!form.building || !form.name.trim()) && "Building and floor name are required."} />;
}

export function ClassRoomListPage() {
  const { buildings, floors } = useAcademicLookups();
  return <CrudPage title="Class Room List" api={classroomApi} dependencies={{ building: buildings, floor: floors }} initialForm={{ building: "", floor: "", room_no: "", full_name: "" }} fields={[{ name: "building", label: "Building", type: "select", number: true, options: buildings }, { name: "floor", label: "Floor", type: "select", number: true, options: floors }, { name: "room_no", label: "Room No" }, { name: "full_name", label: "Full Name" }]} columns={[{ key: "building", label: "Building", lookup: "building" }, { key: "floor", label: "Floor", lookup: "floor" }, { key: "room_no", label: "Room No" }, { key: "full_name", label: "Full Name" }]} validate={(form) => (!form.building || !form.room_no.trim()) && "Building and room no are required."} />;
}

export function ClassPage() {
  return <CrudPage title="Class" api={academicClassApi} initialForm={{ sorting: 0, name: "", group_required: false }} fields={[{ name: "sorting", label: "Sorting", type: "number", number: true }, { name: "name", label: "Class Name" }, { name: "group_required", label: "Group Required", type: "checkbox" }]} columns={[{ key: "sorting", label: "Sorting" }, { key: "name", label: "Class Name" }, { key: "group_required", label: "Group Required" }]} validate={(form) => !form.name.trim() && "Class name is required."} />;
}

export function SectionPage() {
  const { classes, shifts } = useAcademicLookups();
  return <CrudPage title="Section" api={sectionApi} dependencies={{ academic_class: classes, shift: shifts }} initialForm={{ academic_class: "", shift: "", name: "" }} fields={[{ name: "academic_class", label: "Class", type: "select", number: true, options: classes }, { name: "shift", label: "Shift", type: "select", number: true, options: shifts }, { name: "name", label: "Section Name" }]} columns={[{ key: "academic_class", label: "Class", lookup: "academic_class" }, { key: "shift", label: "Shift", lookup: "shift" }, { key: "name", label: "Section Name" }]} validate={(form) => (!form.academic_class || !form.name.trim()) && "Class and section name are required."} />;
}

export function ShiftPage() {
  return <CrudPage title="Shift" api={shiftApi} initialForm={{ sorting: 0, name: "", start_time: "", late_time: "", end_time: "" }} fields={[{ name: "sorting", label: "Sorting", type: "number", number: true }, { name: "name", label: "Shift Name" }, { name: "start_time", label: "Start Time", type: "time" }, { name: "late_time", label: "Late Time", type: "time" }, { name: "end_time", label: "End Time", type: "time" }]} columns={[{ key: "sorting", label: "Sorting" }, { key: "name", label: "Shift Name" }, { key: "start_time", label: "Start Time" }, { key: "late_time", label: "Late Time" }, { key: "end_time", label: "End Time" }]} validate={(form) => !form.name.trim() && "Shift name is required."} />;
}

export function StudentGroupPage() {
  return <CrudPage title="Student Group" api={studentGroupApi} initialForm={{ name: "" }} fields={[{ name: "name", label: "Group Name" }]} columns={[{ key: "name", label: "Group Name" }]} validate={(form) => !form.name.trim() && "Group name is required."} />;
}

export function StudentCategoryPage() {
  return <CrudPage title="Student Category" api={studentCategoryApi} initialForm={{ name: "" }} fields={[{ name: "name", label: "Category Name" }]} columns={[{ key: "name", label: "Category Name" }]} validate={(form) => !form.name.trim() && "Category name is required."} />;
}

export function SyllabusPage() {
  const { sessions } = useAcademicLookups();
  return <CrudPage title="Syllabus" api={syllabusApi} dependencies={{ session: sessions }} initialForm={{ session: "", title: "", description: "" }} fields={[{ name: "session", label: "Session", type: "select", number: true, options: sessions }, { name: "title", label: "Title" }, { name: "description", label: "Description", type: "textarea" }]} columns={[{ key: "session", label: "Session", lookup: "session" }, { key: "title", label: "Title" }, { key: "description", label: "Description" }]} validate={(form) => (!form.session || !form.title.trim()) && "Session and title are required."} />;
}

export function ClassTeacherAssignListPage() {
  const { teachers, classes, sections, sessions } = useAcademicLookups();
  return <CrudPage title="Class Teacher Assign List" api={classTeacherApi} dependencies={{ teacher: teachers, academic_class: classes, section: sections, session: sessions }} initialForm={{ teacher: "", academic_class: "", section: "", session: "" }} fields={[{ name: "teacher", label: "Teacher", type: "select", number: true, options: teachers, optionLabel: "full_name" }, { name: "academic_class", label: "Class", type: "select", number: true, options: classes }, { name: "section", label: "Section", type: "select", number: true, options: sections }, { name: "session", label: "Session", type: "select", number: true, options: sessions }]} columns={[{ key: "teacher", label: "Teacher", lookup: "teacher" }, { key: "academic_class", label: "Class", lookup: "academic_class" }, { key: "section", label: "Section", lookup: "section" }, { key: "session", label: "Session", lookup: "session" }]} validate={(form) => (!form.teacher || !form.academic_class || !form.session) && "Teacher, class and session are required."} />;
}

export function SubjectCombineCreatePage() {
  const { classes, subjects } = useAcademicLookups();
  return <CrudPage title="Subject Combine Create" api={combinedSubjectApi} dependencies={{ academic_class: classes, subjects }} initialForm={{ academic_class: "", name: "", subjects: [] }} fields={[{ name: "academic_class", label: "Class", type: "select", number: true, options: classes }, { name: "name", label: "Subject Combine Name" }, { name: "subjects", label: "Subjects", type: "multi", options: subjects }]} columns={[{ key: "academic_class", label: "Class", lookup: "academic_class" }, { key: "name", label: "Subject Combine Name" }, { key: "subjects", label: "Subjects", lookupMany: "subjects" }]} validate={(form) => (!form.academic_class || !form.name.trim()) && "Class and subject combine name are required."} />;
}

export function AcademicSetupPage() {
  const { sessions } = useAcademicLookups();
  return <CrudPage title="Academic Setup" api={sessionApi} initialForm={{ name: "", starts_on: "", ends_on: "", is_active: true }} fields={[{ name: "name", label: "Session Name" }, { name: "starts_on", label: "Starts On", type: "date" }, { name: "ends_on", label: "Ends On", type: "date" }, { name: "is_active", label: "Active", type: "checkbox" }]} columns={[{ key: "name", label: "Session Name" }, { key: "starts_on", label: "Starts On" }, { key: "ends_on", label: "Ends On" }, { key: "is_active", label: "Active" }]} validate={(form) => !form.name.trim() && "Session name is required."} dependencies={{ sessions }} />;
}
