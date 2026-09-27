import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Edit3, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "../../../../services/api.js";
import { confirmDelete, notifyError, notifySuccess } from "../../../../services/alerts.js";
import {
  academicStageApi,
  assessmentComponentApi,
  courseApi,
  courseGradeScaleApi,
  courseGradeScaleItemApi,
  courseSectionApi,
  courseSubjectApi,
  employeeApi,
  enrollmentApi,
  studentApi,
  teacherAssignmentApi,
} from "../../../../services/resourceApi.js";

const navItems = [];

function asArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.results)) return payload.data.results;
  return [];
}

function labelOf(item) {
  return item?.title || item?.name || item?.full_name || item?.student_id || item?.enrollment_number || `#${item?.id}`;
}


function Nav() {
  return (
    <nav className="sticky top-0 z-20 flex min-h-11 flex-wrap items-center gap-2 border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <strong className="mr-2 text-sm font-black text-emerald-800">Course Foundation</strong>
      {navItems.map(([label, to]) => (
        <Link key={to} to={to} className="rounded-md px-3 py-2 text-sm font-bold text-slate-900 hover:bg-emerald-50 hover:text-emerald-700">
          {label}
        </Link>
      ))}
    </nav>
  );
}

function Input(props) {
  return <input {...props} className="input input-bordered input-sm h-9 min-h-9 w-full rounded-[3px] bg-white" />;
}

function Select({ children, ...props }) {
  return <select {...props} className="select select-bordered select-sm h-9 min-h-9 w-full rounded-[3px] bg-white">{children}</select>;
}

function Field({ field, value, update, form }) {
  if (field.type === "customContent") {
    const items = Array.isArray(value) ? value : [];
    const updateItem = (index, key, nextValue) => {
      update(field.name, items.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: nextValue } : item));
    };
    return (
      <div className="space-y-3 rounded border border-slate-200 bg-white p-3">
        {items.map((item, index) => (
          <div key={`${index}-${item.label}`} className="grid gap-2 rounded bg-slate-50 p-2 md:grid-cols-4">
            <Select value={item.type || "text"} onChange={(event) => updateItem(index, "type", event.target.value)}>
              {["text", "image", "video", "link", "file", "custom"].map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </Select>
            <Input value={item.label || ""} onChange={(event) => updateItem(index, "label", event.target.value)} placeholder="Label" />
            <Input value={item.value || ""} onChange={(event) => updateItem(index, "value", event.target.value)} placeholder="Text / value" />
            <div className="flex gap-2">
              <Input value={item.url || ""} onChange={(event) => updateItem(index, "url", event.target.value)} placeholder="URL" />
              <button type="button" className="btn btn-error btn-sm h-9 min-h-9 text-white" onClick={() => update(field.name, items.filter((_, itemIndex) => itemIndex !== index))}>Remove</button>
            </div>
          </div>
        ))}
        <button
          type="button"
          className="btn btn-outline btn-success btn-sm"
          onClick={() => update(field.name, [...items, { id: crypto.randomUUID(), type: "text", label: "", value: "", url: "" }])}
        >
          Add Custom Input
        </button>
      </div>
    );
  }
  if (field.type === "file") {
    return <input type="file" accept={field.accept} onChange={(event) => update(field.name, event.target.files?.[0] || null)} className="file-input file-input-bordered file-input-sm h-9 min-h-9 w-full rounded-[3px] bg-white" />;
  }
  if (field.type === "select") {
    const options = typeof field.options === "function" ? field.options(form) : field.options || [];
    return (
      <Select value={value ?? ""} onChange={(event) => update(field.name, field.number ? Number(event.target.value) || "" : event.target.value)}>
        <option value="">{field.placeholder || `Select ${field.label}`}</option>
        {options.map((item) => <option key={item.id} value={item.id}>{labelOf(item)}</option>)}
      </Select>
    );
  }
  if (field.type === "checkbox") {
    return (
      <label className="flex h-9 items-center gap-2 rounded border border-base-300 bg-white px-3 text-sm font-bold">
        <input type="checkbox" checked={Boolean(value)} onChange={(event) => update(field.name, event.target.checked)} className="checkbox checkbox-sm" />
        Enabled
      </label>
    );
  }
  if (field.type === "textarea") {
    return <textarea value={value ?? ""} onChange={(event) => update(field.name, event.target.value)} className="textarea textarea-bordered min-h-20 w-full rounded-[3px] bg-white" />;
  }
  return <Input type={field.type || "text"} value={value ?? ""} onChange={(event) => update(field.name, field.number ? Number(event.target.value) || 0 : event.target.value)} placeholder={field.placeholder || field.label} />;
}

export function CrudPage({ title, api, initialForm, fields, columns, lookups = {}, normalize = (form) => form, validate, showNav = true }) {
  const { t } = useTranslation("common");
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  const lookupMaps = useMemo(() => Object.fromEntries(
    Object.entries(lookups).map(([key, values]) => [key, new Map((values || []).map((item) => [item.id, labelOf(item)]))])
  ), [lookups]);

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
  }, []);

  const update = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));

  const reset = () => {
    setEditing(null);
    setForm(initialForm);
  };

  const save = async (event) => {
    event.preventDefault();
    if (saving) return;
    setNotice("");
    const validationMessage = validate?.(form);
    if (validationMessage) {
      setNotice(validationMessage);
      return;
    }
    setSaving(true);
    try {
      const payload = normalize(form);
      if (editing) await api.update(editing.id, payload);
      else await api.create(payload);
      reset();
      await reload();
      notifySuccess(t("savedSuccessfully", { title }));
    } catch (error) {
      setNotice(getApiErrorMessage(error, `Unable to save ${title.toLowerCase()}.`));
      notifyError(getApiErrorMessage(error, `Unable to save ${title.toLowerCase()}.`));
    } finally { setSaving(false); }
  };

  const remove = async (row) => {
    if (!(await confirmDelete(title.toLowerCase()))) return;
    try {
      await api.remove(row.id);
      await reload();
      notifySuccess(t("deletedSuccessfully", { title }));
    } catch (error) {
      notifyError(getApiErrorMessage(error, `Unable to delete ${title.toLowerCase()}.`));
    }
  };

  const startEdit = (row) => {
    const next = { ...initialForm };
    fields.forEach((field) => {
      next[field.name] = field.type === "file" ? null : row[field.name] ?? "";
    });
    if (Array.isArray(next.admission_form_schema)) {
      next.admission_form_schema = next.admission_form_schema.map((section) => ({
        ...section,
        fields: (section.fields || []).map((schemaField) => ({
          ...schemaField,
          optionsText: (schemaField.options || []).join(", "),
        })),
      }));
    }
    setEditing(row);
    setForm(next);
  };

  return (
    <div className="min-h-[calc(100vh-60px)] bg-soft p-3">
      {showNav && <Nav />}
      <section className="mt-5 overflow-hidden rounded-md border border-base-300 bg-paper shadow-sm">
        <header className="bg-deep-green px-5 py-3 text-white">
          <h1 className="text-lg font-black">{title}</h1>
        </header>
        <div className="space-y-5 p-5">
          <form onSubmit={save} className="grid gap-4 rounded-md border border-slate-200 bg-soft p-4 md:grid-cols-2 xl:grid-cols-3">
            {fields.map((field) => (
              <label key={field.name} className={["textarea", "customContent", "admissionFormSchema"].includes(field.type) ? "md:col-span-2 xl:col-span-3" : ""}>
                <span className="mb-1 block text-sm font-bold text-slate-700">{field.label}</span>
                <Field field={field} value={form[field.name]} update={update} form={form} />
              </label>
            ))}
            <div className="flex items-end gap-2 md:col-span-2 xl:col-span-3">
              <button disabled={saving} type="submit" className="btn btn-success btn-sm text-white">{editing ? t("update") : t("create")} {title}</button>
              {editing && <button type="button" onClick={reset} className="btn btn-sm">{t("cancel")}</button>}
            </div>
          </form>

          {notice && <div className="rounded border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">{notice}</div>}

          <div className="overflow-x-auto rounded-md border border-base-300">
            <table className="table table-xs min-w-[900px] bg-white">
              <thead className="bg-slate-100 text-slate-950">
                <tr>
                  {columns.map((column) => <th key={column.key}>{column.label}</th>)}
                  <th className="w-24">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={columns.length + 1} className="py-8 text-center text-slate-400">{t("loading")}</td></tr>
                ) : rows.length ? rows.map((row) => (
                  <tr key={row.id}>
                    {columns.map((column) => (
                      <td key={column.key}>
                        {column.lookup ? lookupMaps[column.lookup]?.get(row[column.key]) || "-" : typeof row[column.key] === "boolean" ? (row[column.key] ? "Yes" : "No") : row[column.key] || "-"}
                      </td>
                    ))}
                    <td>
                      <div className="flex gap-1">
                        <button type="button" onClick={() => startEdit(row)} className="btn btn-info btn-xs h-7 min-h-7 w-7 p-0 text-white"><Edit3 size={14} /></button>
                        <button type="button" onClick={() => remove(row)} className="btn btn-error btn-xs h-7 min-h-7 w-7 p-0 text-white"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={columns.length + 1} className="py-8 text-center text-slate-400">{t("noRecordsFound")}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

function useLookups() {
  const [lookups, setLookups] = useState({ courses: [], sections: [], subjects: [], teachers: [], students: [], stages: [], gradeScales: [] });
  useEffect(() => {
    Promise.allSettled([
      courseApi.listResults(),
      courseSectionApi.listResults(),
      courseSubjectApi.listResults(),
      employeeApi.listResults({ employee_type: "teacher" }),
      studentApi.listResults(),
      academicStageApi.listResults(),
      courseGradeScaleApi.listResults(),
    ]).then((results) => {
      const keys = ["courses", "sections", "subjects", "teachers", "students", "stages", "gradeScales"];
      // A role may legitimately lack access to an unrelated lookup endpoint.
      // Preserve each permitted response instead of discarding the entire form.
      setLookups(Object.fromEntries(results.map((result, index) => [keys[index], result.status === "fulfilled" ? result.value : []])));
    });
  }, []);
  return lookups;
}


export function CourseSectionsPage({ showNav = true } = {}) {
  const { courses, teachers } = useLookups();
  return <CrudPage title="Course Sections" showNav={showNav} api={courseSectionApi} lookups={{ course: courses, head_teacher: teachers }} initialForm={{ course: "", name: "", description: "", head_teacher: "", status: "active", order: 0 }} fields={[{ name: "course", label: "Course", type: "select", number: true, options: courses }, { name: "name", label: "Section/Group Name" }, { name: "head_teacher", label: "Head Teacher", type: "select", number: true, options: teachers }, { name: "status", label: "Status" }, { name: "order", label: "Order", type: "number", number: true }, { name: "description", label: "Description", type: "textarea" }]} columns={[{ key: "course", label: "Course", lookup: "course" }, { key: "name", label: "Section" }, { key: "head_teacher", label: "Head Teacher", lookup: "head_teacher" }, { key: "status", label: "Status" }, { key: "order", label: "Order" }]} normalize={(form) => ({ ...form, head_teacher: form.head_teacher || null })} validate={(form) => (!form.course || !form.name.trim()) && "Course and section name are required."} />;
}

export function CourseSubjectsPage({ showNav = true } = {}) {
  const { sections, stages } = useLookups();
  const stagesForSelection = (form) => {
    const section = sections.find((item) => String(item.id) === String(form.course_section));
    return stages.filter((stage) => section && String(stage.course) === String(section.course));
  };
  return <CrudPage title="Course Subjects" showNav={showNav} api={courseSubjectApi} lookups={{ course_section: sections, academic_stage: stages }} initialForm={{ course_section: "", academic_stage: "", name: "", code: "", description: "", status: "active", order: 0 }} fields={[{ name: "course_section", label: "Section", type: "select", number: true, options: sections }, { name: "academic_stage", label: "Academic Stage (optional)", type: "select", number: true, options: stagesForSelection }, { name: "name", label: "Subject Name" }, { name: "code", label: "Subject Code" }, { name: "status", label: "Status" }, { name: "order", label: "Order", type: "number", number: true }, { name: "description", label: "Description", type: "textarea" }]} columns={[{ key: "course_section", label: "Section", lookup: "course_section" }, { key: "academic_stage", label: "Stage", lookup: "academic_stage" }, { key: "name", label: "Subject" }, { key: "code", label: "Code" }, { key: "status", label: "Status" }, { key: "order", label: "Order" }]} normalize={(form) => ({ ...form, academic_stage: form.academic_stage || null })} validate={(form) => (!form.course_section || !form.name.trim()) && "Section and subject name are required."} />;
}

export function AcademicStagesPage({ showNav = true } = {}) {
  const { courses } = useLookups();
  return <CrudPage title="Academic Stages" showNav={showNav} api={academicStageApi} lookups={{ course: courses }} initialForm={{ course: "", name: "", display_label: "", stage_type: "phase", order: 0, start_date: "", end_date: "", status: "upcoming" }} fields={[{ name: "course", label: "Admission Program", type: "select", number: true, options: courses }, { name: "name", label: "Stage Name (e.g. Foundation Phase)" }, { name: "display_label", label: "Display Label (e.g. Phase 01)" }, { name: "stage_type", label: "Type", type: "select", options: ["semester", "term", "phase", "module", "track", "custom"].map((id) => ({ id, title: id })) }, { name: "order", label: "Order", type: "number", number: true }, { name: "start_date", label: "Start Date", type: "date" }, { name: "end_date", label: "End Date", type: "date" }, { name: "status", label: "Status", type: "select", options: ["upcoming", "in_progress", "completed", "archived"].map((id) => ({ id, title: id.replaceAll("_", " ") })) }]} columns={[{ key: "course", label: "Admission Program", lookup: "course" }, { key: "display_label", label: "Label" }, { key: "name", label: "Stage" }, { key: "stage_type", label: "Type" }, { key: "order", label: "Order" }, { key: "status", label: "Status" }]} normalize={(form) => ({ ...form, start_date: form.start_date || null, end_date: form.end_date || null })} validate={(form) => (!form.course || !form.name.trim()) && "Admission program and stage name are required."} />;
}

export function AssessmentComponentsPage({ showNav = true } = {}) {
  const { subjects } = useLookups();
  return <CrudPage
    title="Assessment Components" showNav={showNav}
    api={assessmentComponentApi}
    lookups={{ course_subject: subjects }}
    initialForm={{ course_subject: "", name: "", code: "", component_type: "quiz", total_marks: 100, weight_percentage: 10, order: 0, is_required: true, is_visible_to_student: true, include_in_final_grade: true, source_type: "manual", aggregation_rule: "sum_all", status: "active" }}
    fields={[
      { name: "course_subject", label: "Course Subject", type: "select", number: true, options: subjects },
      { name: "name", label: "Component Name (e.g. Quiz)" },
      { name: "code", label: "Code (unique per subject)" },
      { name: "component_type", label: "Type", type: "select", options: ["quiz", "assignment", "attendance", "model_test", "final", "custom"].map((id) => ({ id, title: id.replaceAll("_", " ") })) },
      { name: "total_marks", label: "Total Marks", type: "number", number: true },
      { name: "weight_percentage", label: "Weight %", type: "number", number: true },
      { name: "source_type", label: "Source", type: "select", options: [{ id: "manual", title: "Manual Entry" }, { id: "auto_test", title: "Auto - Online Test" }, { id: "auto_assignment", title: "Auto - Assignment" }] },
      { name: "aggregation_rule", label: "Aggregation Rule", type: "select", options: ["sum_all", "average", "best_n", "latest"].map((id) => ({ id, title: id.replaceAll("_", " ") })) },
      { name: "order", label: "Order", type: "number", number: true },
      { name: "is_required", label: "Required for Publish", type: "checkbox" },
      { name: "is_visible_to_student", label: "Visible to Student", type: "checkbox" },
      { name: "include_in_final_grade", label: "Include in Final Grade", type: "checkbox" },
    ]}
    columns={[{ key: "course_subject", label: "Subject", lookup: "course_subject" }, { key: "name", label: "Component" }, { key: "component_type", label: "Type" }, { key: "weight_percentage", label: "Weight %" }, { key: "source_type", label: "Source" }, { key: "is_required", label: "Required" }]}
    validate={(form) => (!form.course_subject || !form.name.trim()) && "Course subject and component name are required."}
  />;
}

export function CourseGradeScalesPage({ showNav = true } = {}) {
  const { courses } = useLookups();
  return <CrudPage title="Grade Scales" showNav={showNav} api={courseGradeScaleApi} lookups={{ course: courses }} initialForm={{ course: "", name: "Default Grade Scale", is_active: true }} fields={[{ name: "course", label: "Admission Program", type: "select", number: true, options: courses }, { name: "name", label: "Scale Name" }, { name: "is_active", label: "Active", type: "checkbox" }]} columns={[{ key: "course", label: "Admission Program", lookup: "course" }, { key: "name", label: "Scale" }, { key: "is_active", label: "Active" }]} validate={(form) => !form.course && "Admission program is required."} />;
}

export function CourseGradeScaleItemsPage({ showNav = true } = {}) {
  const { gradeScales } = useLookups();
  return <CrudPage
    title="Grade Scale Items" showNav={showNav}
    api={courseGradeScaleItemApi}
    lookups={{ grade_scale: gradeScales }}
    initialForm={{ grade_scale: "", min_percentage: 0, max_percentage: 100, grade: "", grade_point: 0, is_fail: false, order: 0 }}
    fields={[
      { name: "grade_scale", label: "Grade Scale", type: "select", number: true, options: gradeScales },
      { name: "min_percentage", label: "Min %", type: "number", number: true },
      { name: "max_percentage", label: "Max %", type: "number", number: true },
      { name: "grade", label: "Grade (e.g. A+)" },
      { name: "grade_point", label: "Grade Point", type: "number", number: true },
      { name: "is_fail", label: "Is Fail", type: "checkbox" },
      { name: "order", label: "Order", type: "number", number: true },
    ]}
    columns={[{ key: "grade_scale", label: "Scale", lookup: "grade_scale" }, { key: "min_percentage", label: "Min %" }, { key: "max_percentage", label: "Max %" }, { key: "grade", label: "Grade" }, { key: "grade_point", label: "GPA" }, { key: "is_fail", label: "Fail" }]}
    validate={(form) => !form.grade_scale && "Grade scale is required."}
  />;
}

export function TeacherAssignmentsPage({ showNav = true } = {}) {
  const { courses, sections, subjects, teachers } = useLookups();
  const sectionsForCourse = (form) => sections.filter((section) => String(section.course) === String(form.course));
  const subjectsForSelection = (form) => subjects.filter((subject) => {
    const section = sections.find((item) => String(item.id) === String(subject.course_section));
    return section && String(section.course) === String(form.course) && (!form.course_section || String(subject.course_section) === String(form.course_section));
  });
  return <CrudPage title="Teacher Assignments" showNav={showNav} api={teacherAssignmentApi} lookups={{ teacher: teachers, course: courses, course_section: sections, subject: subjects }} initialForm={{ teacher: "", course: "", course_section: "", subject: "", role: "subject_teacher", is_active: true, assignment_status: "accepted" }} fields={[{ name: "teacher", label: "Teacher", type: "select", number: true, options: teachers }, { name: "course", label: "Admission Program", type: "select", number: true, options: courses }, { name: "course_section", label: "Section (optional)", type: "select", number: true, options: sectionsForCourse }, { name: "subject", label: "Subject (optional for section-wide)", type: "select", number: true, options: subjectsForSelection }, { name: "role", label: "Role", type: "select", options: ["subject_teacher", "assistant_teacher", "coordinator"].map((id) => ({ id, title: id.replaceAll("_", " ") })) }, { name: "is_active", label: "Active", type: "checkbox" }]} columns={[{ key: "teacher", label: "Teacher", lookup: "teacher" }, { key: "course", label: "Course", lookup: "course" }, { key: "course_section", label: "Section", lookup: "course_section" }, { key: "subject", label: "Subject", lookup: "subject" }, { key: "role", label: "Role" }, { key: "is_active", label: "Active" }]} normalize={(form) => ({ ...form, course_section: form.course_section || null, subject: form.subject || null, assignment_status: "accepted" })} validate={(form) => (!form.teacher || !form.course) && "Teacher and admission program are required."} />;
}

