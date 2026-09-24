import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Edit3, Trash2 } from "lucide-react";

import { getApiErrorMessage } from "../../../../services/api.js";
import {
  courseApi,
  courseSectionApi,
  courseSubjectApi,
  employeeApi,
  enrollmentApi,
  studentApi,
  teacherAssignmentApi,
} from "../../../../services/resourceApi.js";

const navItems = [
  ["Courses", "/admin/dashboard/courses"],
  ["Sections", "/admin/dashboard/courses/sections"],
  ["Subjects", "/admin/dashboard/courses/subjects"],
  ["Teacher Assignments", "/admin/dashboard/teacher-assignments"],
  ["Enrollments", "/admin/dashboard/enrollments"],
];

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

function defaultAdmissionFormSchema() {
  return [
    { id: crypto.randomUUID(), title: "Student Information", fields: ["Full Name", "Mobile", "Email", "Date of Birth"].map((label) => ({ id: crypto.randomUUID(), name: label.toLowerCase().replaceAll(" ", "-"), label, type: label.includes("Date") ? "date" : label === "Email" ? "email" : "text", required: ["Full Name", "Mobile"].includes(label), placeholder: "", optionsText: "" })) },
    { id: crypto.randomUUID(), title: "Father Information", fields: ["Father Name", "Father Mobile"].map((label) => ({ id: crypto.randomUUID(), name: label.toLowerCase().replaceAll(" ", "-"), label, type: "text", required: false, placeholder: "", optionsText: "" })) },
    { id: crypto.randomUUID(), title: "Mother Information", fields: ["Mother Name", "Mother Mobile"].map((label) => ({ id: crypto.randomUUID(), name: label.toLowerCase().replaceAll(" ", "-"), label, type: "text", required: false, placeholder: "", optionsText: "" })) },
    { id: crypto.randomUUID(), title: "Academic Information", fields: ["Class", "Session", "Shift"].map((label) => ({ id: crypto.randomUUID(), name: label.toLowerCase().replaceAll(" ", "-"), label, type: "text", required: label === "Class", placeholder: "", optionsText: "" })) },
    { id: crypto.randomUUID(), title: "Payment", fields: ["Payment Method", "Amount", "Transaction ID"].map((label) => ({ id: crypto.randomUUID(), name: label.toLowerCase().replaceAll(" ", "-"), label, type: label === "Amount" ? "number" : "text", required: false, placeholder: "", optionsText: "" })) },
  ];
}

function Nav() {
  return (
    <nav className="sticky top-[70px] z-20 flex min-h-11 flex-wrap items-center gap-2 border border-slate-200 bg-white px-3 py-2 shadow-sm">
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
  if (field.type === "admissionFormSchema") {
    const sections = Array.isArray(value) ? value : [];
    const updateSection = (index, key, nextValue) => {
      update(field.name, sections.map((section, sectionIndex) => sectionIndex === index ? { ...section, [key]: nextValue } : section));
    };
    const updateField = (sectionIndex, fieldIndex, key, nextValue) => {
      update(field.name, sections.map((section, index) => {
        if (index !== sectionIndex) return section;
        return {
          ...section,
          fields: (section.fields || []).map((schemaField, schemaFieldIndex) => (
            schemaFieldIndex === fieldIndex ? { ...schemaField, [key]: nextValue } : schemaField
          )),
        };
      }));
    };
    const addField = (sectionIndex) => {
      update(field.name, sections.map((section, index) => index === sectionIndex ? {
        ...section,
        fields: [...(section.fields || []), { id: crypto.randomUUID(), name: "", label: "", type: "text", placeholder: "", required: false, optionsText: "" }],
      } : section));
    };
    const removeField = (sectionIndex, fieldIndex) => {
      update(field.name, sections.map((section, index) => index === sectionIndex ? {
        ...section,
        fields: (section.fields || []).filter((_, currentIndex) => currentIndex !== fieldIndex),
      } : section));
    };
    return (
      <div className="space-y-4 rounded border border-slate-200 bg-white p-3">
        {sections.map((section, sectionIndex) => (
          <div key={`${sectionIndex}-${section.title}`} className="rounded border border-emerald-100 bg-emerald-50/40 p-3">
            <div className="flex flex-col gap-2 md:flex-row">
              <Input value={section.title || ""} onChange={(event) => updateSection(sectionIndex, "title", event.target.value)} placeholder="Section title, e.g. Student Information" />
              <button type="button" className="btn btn-error btn-sm h-9 min-h-9 text-white" onClick={() => update(field.name, sections.filter((_, index) => index !== sectionIndex))}>Remove Section</button>
            </div>
            <div className="mt-3 space-y-2">
              {(section.fields || []).map((schemaField, fieldIndex) => (
                <div key={schemaField.id || `${fieldIndex}-${schemaField.label}`} className="grid gap-2 rounded bg-white p-2 md:grid-cols-[1fr_140px_1fr_170px_auto_auto_auto]">
                  <Input value={schemaField.label || ""} onChange={(event) => updateField(sectionIndex, fieldIndex, "label", event.target.value)} placeholder="Field label" />
                  <Select value={schemaField.type || "text"} onChange={(event) => updateField(sectionIndex, fieldIndex, "type", event.target.value)}>
                    {["text", "email", "tel", "number", "date", "textarea", "select", "file"].map((type) => <option key={type} value={type}>{type}</option>)}
                  </Select>
                  <Input value={schemaField.placeholder || ""} onChange={(event) => updateField(sectionIndex, fieldIndex, "placeholder", event.target.value)} placeholder="Placeholder" />
                  <Input value={schemaField.optionsText || (schemaField.options || []).join(", ")} onChange={(event) => updateField(sectionIndex, fieldIndex, "optionsText", event.target.value)} placeholder="Options, comma separated" />
                   <label className="flex h-9 items-center gap-2 text-sm font-bold">
                    <input type="checkbox" className="checkbox checkbox-sm" checked={Boolean(schemaField.required)} onChange={(event) => updateField(sectionIndex, fieldIndex, "required", event.target.checked)} />
                    Required
                   </label>
                   <div className="flex gap-1"><button type="button" className="btn btn-ghost btn-sm h-9 min-h-9 px-2" disabled={!fieldIndex} onClick={() => update(field.name, sections.map((current, index) => index !== sectionIndex ? current : { ...current, fields: current.fields.map((entry, entryIndex, all) => entryIndex === fieldIndex ? all[fieldIndex - 1] : entryIndex === fieldIndex - 1 ? all[fieldIndex] : entry) }))}>Up</button><button type="button" className="btn btn-ghost btn-sm h-9 min-h-9 px-2" disabled={fieldIndex === section.fields.length - 1} onClick={() => update(field.name, sections.map((current, index) => index !== sectionIndex ? current : { ...current, fields: current.fields.map((entry, entryIndex, all) => entryIndex === fieldIndex ? all[fieldIndex + 1] : entryIndex === fieldIndex + 1 ? all[fieldIndex] : entry) }))}>Down</button></div>
                   <button type="button" className="btn btn-error btn-sm h-9 min-h-9 text-white" onClick={() => removeField(sectionIndex, fieldIndex)}>Remove</button>
                </div>
              ))}
            </div>
            <button type="button" className="btn btn-outline btn-success btn-sm mt-3" onClick={() => addField(sectionIndex)}>Add Field</button>
          </div>
        ))}
        <button
          type="button"
          className="btn btn-success btn-sm text-white"
          onClick={() => update(field.name, [...sections, { id: crypto.randomUUID(), title: "New Section", fields: [] }])}
        >
          Add Form Section
        </button>
      </div>
    );
  }
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

function CrudPage({ title, api, initialForm, fields, columns, lookups = {}, normalize = (form) => form, validate }) {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

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
    setNotice("");
    const validationMessage = validate?.(form);
    if (validationMessage) {
      setNotice(validationMessage);
      return;
    }
    try {
      const payload = normalize(form);
      if (editing) await api.update(editing.id, payload);
      else await api.create(payload);
      reset();
      await reload();
      setNotice(`${title} saved successfully.`);
    } catch (error) {
      setNotice(getApiErrorMessage(error, `Unable to save ${title.toLowerCase()}.`));
    }
  };

  const remove = async (row) => {
    if (!window.confirm(`Delete this ${title.toLowerCase()} record?`)) return;
    try {
      await api.remove(row.id);
      await reload();
      setNotice(`${title} deleted successfully.`);
    } catch (error) {
      setNotice(getApiErrorMessage(error, `Unable to delete ${title.toLowerCase()}.`));
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
    <div className="min-h-[calc(100vh-60px)] bg-[#f4f8f6] p-3">
      <Nav />
      <section className="mt-5 overflow-hidden rounded-md border border-base-300 bg-white shadow-sm">
        <header className="bg-emerald-800 px-5 py-3 text-white">
          <h1 className="text-lg font-black">{title}</h1>
        </header>
        <div className="space-y-5 p-5">
          <form onSubmit={save} className="grid gap-4 rounded-md border border-slate-200 bg-slate-50 p-4 md:grid-cols-2 xl:grid-cols-3">
            {fields.map((field) => (
              <label key={field.name} className={["textarea", "customContent", "admissionFormSchema"].includes(field.type) ? "md:col-span-2 xl:col-span-3" : ""}>
                <span className="mb-1 block text-sm font-bold text-slate-700">{field.label}</span>
                <Field field={field} value={form[field.name]} update={update} form={form} />
              </label>
            ))}
            <div className="flex items-end gap-2 md:col-span-2 xl:col-span-3">
              <button type="submit" className="btn btn-success btn-sm text-white">{editing ? "Update" : "Create"} {title}</button>
              {editing && <button type="button" onClick={reset} className="btn btn-sm">Cancel</button>}
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
                  <tr><td colSpan={columns.length + 1} className="py-8 text-center text-slate-400">Loading...</td></tr>
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
                  <tr><td colSpan={columns.length + 1} className="py-8 text-center text-slate-400">No records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

function cleanCoursePayload(form) {
  const payload = {
    title: form.title?.trim(),
    code: form.code?.trim() || "",
    description: form.description?.trim() || "",
    course_type: form.course_type || "admission",
    admission_fee: Number(form.admission_fee || 0),
    course_fee: Number(form.course_fee || 0),
    capacity: form.capacity ? Number(form.capacity) : null,
    start_date: form.start_date || null,
    end_date: form.end_date || null,
    enrollment_start: form.enrollment_start || null,
    enrollment_end: form.enrollment_end || null,
    status: form.status || "admission_open",
    is_published: Boolean(form.is_published),
    custom_content: Array.isArray(form.custom_content)
      ? form.custom_content
            .map((item) => ({
            id: item.id || crypto.randomUUID(),
            type: item.type || "text",
            label: item.label?.trim() || "",
            value: item.value?.trim() || "",
            url: item.url?.trim() || "",
          }))
          .filter((item) => item.label || item.value || item.url)
      : [],
    admission_form_schema: Array.isArray(form.admission_form_schema)
      ? form.admission_form_schema
            .map((section) => ({
            id: section.id || crypto.randomUUID(),
            title: section.title?.trim() || "",
            fields: Array.isArray(section.fields)
              ? section.fields
                  .map((field) => ({
                    id: field.id || crypto.randomUUID(),
                    label: field.label?.trim() || "",
                    name: field.name?.trim() || "",
                    type: field.type || "text",
                    placeholder: field.placeholder?.trim() || "",
                    required: Boolean(field.required),
                    options: typeof field.optionsText === "string"
                      ? field.optionsText.split(",").map((item) => item.trim()).filter(Boolean)
                      : Array.isArray(field.options) ? field.options : [],
                  }))
                  .filter((field) => field.label)
              : [],
          }))
          .filter((section) => section.title && section.fields.length)
      : [],
  };

  if (form.slug?.trim()) payload.slug = form.slug.trim();

  if (form.thumbnail instanceof File) {
    const data = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        data.append(key, typeof value === "object" ? JSON.stringify(value) : value);
      }
    });
    data.append("thumbnail", form.thumbnail);
    return data;
  }

  return payload;
}

function useLookups() {
  const [lookups, setLookups] = useState({ courses: [], sections: [], subjects: [], teachers: [], students: [] });
  useEffect(() => {
    Promise.all([
      courseApi.listResults(),
      courseSectionApi.listResults(),
      courseSubjectApi.listResults(),
      employeeApi.listResults({ employee_type: "teacher" }),
      studentApi.listResults(),
    ]).then(([courses, sections, subjects, teachers, students]) => {
      setLookups({ courses, sections, subjects, teachers, students });
    }).catch(() => {});
  }, []);
  return lookups;
}

export function CoursesPage() {
  return (
    <CrudPage
      title="Admission Cards / Courses"
      api={courseApi}
      initialForm={{
        title: "",
        slug: "",
        code: "",
        description: "",
        course_type: "admission",
        thumbnail: null,
        admission_fee: 0,
        course_fee: 0,
        capacity: "",
        start_date: "",
        end_date: "",
        enrollment_start: "",
        enrollment_end: "",
        status: "admission_open",
        is_published: true,
        custom_content: [],
        admission_form_schema: defaultAdmissionFormSchema(),
      }}
      fields={[
        { name: "title", label: "Admission Card / Course Name" },
        { name: "thumbnail", label: "Card Image", type: "file", accept: "image/png,image/jpeg,image/webp" },
        { name: "code", label: "Course Code" },
        { name: "course_type", label: "Type", type: "select", options: [{ id: "regular", title: "Regular" }, { id: "admission", title: "Admission" }] },
        { name: "admission_fee", label: "Admission Fee", type: "number", number: true },
        { name: "course_fee", label: "Course Fee", type: "number", number: true },
        { name: "capacity", label: "Capacity", type: "number", number: true },
        { name: "enrollment_start", label: "Admission Start", type: "date" },
        { name: "enrollment_end", label: "Admission End", type: "date" },
        { name: "start_date", label: "Course Start", type: "date" },
        { name: "end_date", label: "Course End", type: "date" },
        { name: "status", label: "Status", type: "select", options: ["draft", "published", "admission_open", "admission_closed", "running", "completed", "archived"].map((id) => ({ id, title: id.replaceAll("_", " ") })) },
        { name: "is_published", label: "Published", type: "checkbox" },
        { name: "slug", label: "Custom Slug (optional)" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "custom_content", label: "Custom Inputs / Details", type: "customContent" },
        { name: "admission_form_schema", label: "Admission Submission Form Builder", type: "admissionFormSchema" },
      ]}
      columns={[{ key: "title", label: "Card / Course" }, { key: "course_type", label: "Type" }, { key: "admission_fee", label: "Admission Fee" }, { key: "course_fee", label: "Course Fee" }, { key: "capacity", label: "Capacity" }, { key: "status", label: "Status" }, { key: "is_published", label: "Published" }]}
      normalize={cleanCoursePayload}
      validate={(form) => !form.title.trim() && "Course name is required."}
    />
  );
}

export function CourseSectionsPage() {
  const { courses, teachers } = useLookups();
  return <CrudPage title="Course Sections" api={courseSectionApi} lookups={{ course: courses, head_teacher: teachers }} initialForm={{ course: "", name: "", description: "", head_teacher: "", status: "active", order: 0 }} fields={[{ name: "course", label: "Course", type: "select", number: true, options: courses }, { name: "name", label: "Section/Group Name" }, { name: "head_teacher", label: "Head Teacher", type: "select", number: true, options: teachers }, { name: "status", label: "Status" }, { name: "order", label: "Order", type: "number", number: true }, { name: "description", label: "Description", type: "textarea" }]} columns={[{ key: "course", label: "Course", lookup: "course" }, { key: "name", label: "Section" }, { key: "head_teacher", label: "Head Teacher", lookup: "head_teacher" }, { key: "status", label: "Status" }, { key: "order", label: "Order" }]} normalize={(form) => ({ ...form, head_teacher: form.head_teacher || null })} validate={(form) => (!form.course || !form.name.trim()) && "Course and section name are required."} />;
}

export function CourseSubjectsPage() {
  const { sections } = useLookups();
  return <CrudPage title="Course Subjects" api={courseSubjectApi} lookups={{ course_section: sections }} initialForm={{ course_section: "", name: "", code: "", description: "", status: "active", order: 0 }} fields={[{ name: "course_section", label: "Section", type: "select", number: true, options: sections }, { name: "name", label: "Subject Name" }, { name: "code", label: "Subject Code" }, { name: "status", label: "Status" }, { name: "order", label: "Order", type: "number", number: true }, { name: "description", label: "Description", type: "textarea" }]} columns={[{ key: "course_section", label: "Section", lookup: "course_section" }, { key: "name", label: "Subject" }, { key: "code", label: "Code" }, { key: "status", label: "Status" }, { key: "order", label: "Order" }]} validate={(form) => (!form.course_section || !form.name.trim()) && "Section and subject name are required."} />;
}

export function TeacherAssignmentsPage() {
  const { courses, sections, subjects, teachers } = useLookups();
  const sectionsForCourse = (form) => sections.filter((section) => String(section.course) === String(form.course));
  const subjectsForSelection = (form) => subjects.filter((subject) => {
    const section = sections.find((item) => String(item.id) === String(subject.course_section));
    return section && String(section.course) === String(form.course) && (!form.course_section || String(subject.course_section) === String(form.course_section));
  });
  return <CrudPage title="Teacher Assignments" api={teacherAssignmentApi} lookups={{ teacher: teachers, course: courses, course_section: sections, subject: subjects }} initialForm={{ teacher: "", course: "", course_section: "", subject: "", role: "head_teacher", is_active: true, assignment_status: "accepted" }} fields={[{ name: "teacher", label: "Teacher", type: "select", number: true, options: teachers }, { name: "course", label: "Admission Program", type: "select", number: true, options: courses }, { name: "course_section", label: "Section (optional for program head)", type: "select", number: true, options: sectionsForCourse }, { name: "subject", label: "Subject (optional for program head)", type: "select", number: true, options: subjectsForSelection }, { name: "role", label: "Role", type: "select", options: ["head_teacher", "subject_teacher", "assistant_teacher", "coordinator"].map((id) => ({ id, title: id.replaceAll("_", " ") })) }, { name: "is_active", label: "Active", type: "checkbox" }]} columns={[{ key: "teacher", label: "Teacher", lookup: "teacher" }, { key: "course", label: "Course", lookup: "course" }, { key: "course_section", label: "Section", lookup: "course_section" }, { key: "subject", label: "Subject", lookup: "subject" }, { key: "role", label: "Role" }, { key: "is_active", label: "Active" }]} normalize={(form) => ({ ...form, course_section: form.course_section || null, subject: form.subject || null, assignment_status: "accepted" })} validate={(form) => (!form.teacher || !form.course) && "Teacher and admission program are required."} />;
}

export function EnrollmentsPage() {
  const { courses, sections, students } = useLookups();
  return <CrudPage title="Enrollments" api={enrollmentApi} lookups={{ student: students, course: courses, course_section: sections }} initialForm={{ student: "", course: "", course_section: "", enrollment_number: "", status: "pending" }} fields={[{ name: "student", label: "Student", type: "select", number: true, options: students }, { name: "course", label: "Course", type: "select", number: true, options: courses }, { name: "course_section", label: "Section", type: "select", number: true, options: sections }, { name: "enrollment_number", label: "Enrollment Number" }, { name: "status", label: "Status", type: "select", options: ["pending", "active", "completed", "cancelled", "expired", "suspended"].map((id) => ({ id, title: id })) }]} columns={[{ key: "enrollment_number", label: "Enrollment No" }, { key: "student", label: "Student", lookup: "student" }, { key: "course", label: "Course", lookup: "course" }, { key: "course_section", label: "Section", lookup: "course_section" }, { key: "status", label: "Status" }]} normalize={(form) => ({ ...form, course_section: form.course_section || null })} validate={(form) => (!form.student || !form.course || !form.enrollment_number.trim()) && "Student, course and enrollment number are required."} />;
}
