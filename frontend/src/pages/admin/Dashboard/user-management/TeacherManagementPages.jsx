import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowUp,
  BadgeCheck,
  Download,
  Eye,
  FileDown,
  FileSpreadsheet,
  IdCard,
  KeyRound,
  Pencil,
  Plus,
  Printer,
  Search,
  Trash2,
  Upload,
  UserPlus,
  X,
} from "lucide-react";

import { genders, religions } from "./../data/studentAdminData.js";
import {
  demoTeachers,
  teacherDesignations,
  teacherLayouts,
  teacherPayrolls,
  teacherShifts,
  teacherStorageKeys,
  teacherTemplates,
  teacherTemplateSides,
} from "./../data/teacherAdminData.js";
import { UserManagementNav } from "./UserManagementDashboard.jsx";

import "./../styles/studentManagement.css";

/* =========================================================
   STORAGE HELPERS
========================================================= */

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Demo storage only. Ignore unavailable localStorage.
  }
}

function getExtraTeachers() {
  return readJSON(teacherStorageKeys.extraTeachers, []);
}

function getDisabledIds() {
  return readJSON(teacherStorageKeys.disabledTeacherIds, []);
}

function getAllTeachers() {
  return [...demoTeachers, ...getExtraTeachers()];
}

function getActiveTeachers() {
  const disabled = new Set(getDisabledIds());
  return getAllTeachers().filter((teacher) => !disabled.has(teacher.id));
}

/* =========================================================
   SHARED COMPONENTS
========================================================= */

function TeacherPage({ children }) {
  return (
    <div className="student-admin-page teacher-admin-page">
      <UserManagementNav />
      {children}
    </div>
  );
}

function Panel({ title, action, children, className = "" }) {
  return (
    <section className={`student-panel ${className}`}>
      <div className="student-panel-title">
        <span>{title}</span>
        {action ? <div className="student-panel-action">{action}</div> : null}
      </div>
      <div className="student-panel-body">{children}</div>
    </section>
  );
}

function Field({ label, required = false, children }) {
  return (
    <div className="student-field">
      <label>
        {label}
        {required ? <span className="required-star">*</span> : null}
      </label>
      {children}
    </div>
  );
}

function Input({ name, value, onChange, type = "text", placeholder = "" }) {
  return (
    <input
      className="student-input"
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  );
}

function Select({ name, value, onChange, options, placeholder = "Select" }) {
  return (
    <select className="student-input" name={name} value={value} onChange={onChange}>
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function TeacherModal({ title, open, onClose, children }) {
  if (!open) return null;

  return (
    <div className="teacher-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="teacher-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="teacher-modal-header">
          <h3>{title}</h3>
          <button type="button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>
        <div className="teacher-modal-body">{children}</div>
      </section>
    </div>
  );
}

function downloadTextFile(filename, text, type = "text/csv;charset=utf-8") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function downloadTeacherTemplate() {
  downloadTextFile(
    "teacher-quick-entry-template.csv",
    "Teacher ID,Name,Join Date,Gender,Religion,Mobile,Payroll,Designation,Shift\n"
  );
}

function createBlankTeacher(index = 0) {
  return {
    id: `${Date.now()}${index}`.slice(-8),
    name: "",
    designation: "TEACHER",
    shift: "",
    joinDate: new Date().toISOString().slice(0, 10),
    mobile: "",
    email: "",
    gender: "Male",
    religion: "Islam",
    payroll: "Monthly",
    image: "/jasshoreExpert.png",
    signature: "",
  };
}

/* =========================================================
   TEACHER LIST
========================================================= */

export function TeacherList() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState(() => getActiveTeachers());
  const [query, setQuery] = useState("");
  const [pageSize, setPageSize] = useState(50);
  const [page, setPage] = useState(1);
  const [viewTeacher, setViewTeacher] = useState(null);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [adding, setAdding] = useState(false);
  const [deletedIds, setDeletedIds] = useState([]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return teachers.filter((teacher) => {
      if (deletedIds.includes(teacher.id)) return false;
      if (!q) return true;

      return [
        teacher.id,
        teacher.name,
        teacher.designation,
        teacher.shift,
        teacher.mobile,
        teacher.email,
      ].some((value) => String(value || "").toLowerCase().includes(q));
    });
  }, [teachers, query, deletedIds]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const refresh = () => setTeachers(getActiveTeachers());

  const saveTeacher = (teacher, isNew = false) => {
    const extras = getExtraTeachers();

    if (isNew) {
      const next = [...extras, teacher];
      writeJSON(teacherStorageKeys.extraTeachers, next);
      setAdding(false);
    } else {
      const exists = extras.some((item) => item.id === teacher.id);
      const next = exists
        ? extras.map((item) => (item.id === teacher.id ? teacher : item))
        : [...extras, teacher];
      writeJSON(teacherStorageKeys.extraTeachers, next);
      setEditingTeacher(null);
    }

    refresh();
  };

  const exportCsv = () => {
    const header = "Teacher ID,Full Name,Designation,Shift,Join Date,Mobile,Email\n";
    const rows = filtered
      .map((teacher) =>
        [
          teacher.id,
          teacher.name,
          teacher.designation,
          teacher.shift,
          teacher.joinDate,
          teacher.mobile,
          teacher.email,
        ]
          .map((value) => `"${String(value || "").replaceAll('"', '""')}"`)
          .join(",")
      )
      .join("\n");

    downloadTextFile("teacher-list.csv", header + rows);
  };

  return (
    <TeacherPage>
      <Panel
        title="Teacher List"
        action={
          <div className="teacher-toolbar">
            <button className="student-btn student-btn-success" type="button" onClick={() => window.print()}>
              <IdCard size={14} /> CV Print
            </button>
            <button className="student-btn student-btn-secondary" type="button" onClick={() => setAdding(true)}>
              <UserPlus size={14} /> Add Teacher
            </button>
            <button className="student-btn student-btn-secondary" type="button" onClick={exportCsv}>
              <FileSpreadsheet size={14} /> Excel System
            </button>
            <button className="student-btn student-btn-secondary" type="button" onClick={() => window.print()}>
              <FileDown size={14} /> PDF Download
            </button>
          </div>
        }
      >
        <div className="teacher-table-controls">
          <label>
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <span>entries per page</span>
          </label>

          <label className="teacher-search-box">
            <span>Search:</span>
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
            />
          </label>
        </div>

        <div className="teacher-table-wrap">
          <table className="teacher-table">
            <thead>
              <tr>
                <th>SL No.</th>
                <th>Teacher ID</th>
                <th>Image</th>
                <th>Signature</th>
                <th>Full Name</th>
                <th>Designation</th>
                <th>Shift</th>
                <th>Join Date</th>
                <th>Mobile</th>
                <th>Email</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((teacher, index) => (
                <tr key={`${teacher.id}-${index}`}>
                  <td>{(safePage - 1) * pageSize + index + 1}</td>
                  <td>{teacher.id}</td>
                  <td>
                    <img className="teacher-thumb" src={teacher.image || "/jasshoreExpert.png"} alt={teacher.name} />
                  </td>
                  <td>
                    {teacher.signature ? (
                      <img className="teacher-signature" src={teacher.signature} alt={`${teacher.name} signature`} />
                    ) : (
                      <span className="teacher-signature-empty">—</span>
                    )}
                  </td>
                  <td>{teacher.name}</td>
                  <td>{teacher.designation}</td>
                  <td className="teacher-shift-cell">{teacher.shift}</td>
                  <td>{teacher.joinDate}</td>
                  <td>{teacher.mobile}</td>
                  <td>{teacher.email}</td>
                  <td>
                    <div className="teacher-row-actions">
                      <button type="button" className="teacher-icon-btn green" title="ID Card" onClick={() => navigate("/dashboard/user-management/teacher/teacher-id-card")}>
                        <IdCard size={15} />
                      </button>
                      <button type="button" className="teacher-icon-btn gold" title="Reset password" onClick={() => alert(`Password reset demo for ${teacher.name}`)}>
                        <KeyRound size={15} />
                      </button>
                      <button type="button" className="teacher-icon-btn cyan" title="Edit" onClick={() => setEditingTeacher({ ...teacher })}>
                        <Pencil size={15} />
                      </button>
                      <button type="button" className="teacher-icon-btn red" title="Delete" onClick={() => {
                        if (window.confirm(`Remove ${teacher.name} from this demo list?`)) {
                          setDeletedIds((current) => [...current, teacher.id]);
                        }
                      }}>
                        <Trash2 size={15} />
                      </button>
                      <button type="button" className="teacher-icon-btn green" title="Admission/CV settings" onClick={() => navigate("/dashboard/user-management/teacher/teacher-settings")}>
                        <ArrowUp size={15} />
                      </button>
                      <button type="button" className="teacher-icon-btn blue" title="View" onClick={() => setViewTeacher(teacher)}>
                        <Eye size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!visible.length ? (
                <tr>
                  <td colSpan="11" className="teacher-empty-row">No teachers found.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="teacher-pagination">
          <span>
            Showing {filtered.length ? (safePage - 1) * pageSize + 1 : 0} to {Math.min(safePage * pageSize, filtered.length)} of {filtered.length} entries
          </span>
          <div>
            <button type="button" disabled={safePage <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>‹</button>
            <span>{safePage}</span>
            <button type="button" disabled={safePage >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>›</button>
          </div>
        </div>
      </Panel>

      <TeacherModal title="Teacher Details" open={Boolean(viewTeacher)} onClose={() => setViewTeacher(null)}>
        {viewTeacher ? <TeacherDetails teacher={viewTeacher} /> : null}
      </TeacherModal>

      <TeacherModal title="Add Teacher" open={adding} onClose={() => setAdding(false)}>
        <TeacherForm
          initialTeacher={createBlankTeacher()}
          submitLabel="Create Teacher"
          onSubmit={(teacher) => saveTeacher(teacher, true)}
        />
      </TeacherModal>

      <TeacherModal title="Edit Teacher" open={Boolean(editingTeacher)} onClose={() => setEditingTeacher(null)}>
        {editingTeacher ? (
          <TeacherForm
            initialTeacher={editingTeacher}
            submitLabel="Save Changes"
            onSubmit={(teacher) => saveTeacher(teacher, false)}
          />
        ) : null}
      </TeacherModal>
    </TeacherPage>
  );
}

function TeacherDetails({ teacher }) {
  return (
    <div className="teacher-details-card">
      <img src={teacher.image || "/jasshoreExpert.png"} alt={teacher.name} />
      <div>
        <h4>{teacher.name}</h4>
        <p><strong>ID:</strong> {teacher.id}</p>
        <p><strong>Designation:</strong> {teacher.designation}</p>
        <p><strong>Shift:</strong> {teacher.shift || "—"}</p>
        <p><strong>Join Date:</strong> {teacher.joinDate || "—"}</p>
        <p><strong>Mobile:</strong> {teacher.mobile || "—"}</p>
        <p><strong>Email:</strong> {teacher.email || "—"}</p>
      </div>
    </div>
  );
}

function TeacherForm({ initialTeacher, onSubmit, submitLabel }) {
  const [form, setForm] = useState(initialTeacher);

  const change = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  return (
    <form
      className="teacher-modal-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (!form.id.trim() || !form.name.trim()) return;
        onSubmit(form);
      }}
    >
      <div className="teacher-form-grid">
        <Field label="Teacher ID" required>
          <Input name="id" value={form.id} onChange={change} placeholder="Teacher ID" />
        </Field>
        <Field label="Full Name" required>
          <Input name="name" value={form.name} onChange={change} placeholder="Full Name" />
        </Field>
        <Field label="Join Date">
          <Input type="date" name="joinDate" value={form.joinDate} onChange={change} />
        </Field>
        <Field label="Gender">
          <Select name="gender" value={form.gender} onChange={change} options={genders} />
        </Field>
        <Field label="Religion">
          <Select name="religion" value={form.religion} onChange={change} options={religions} />
        </Field>
        <Field label="Mobile">
          <Input name="mobile" value={form.mobile} onChange={change} placeholder="01XXXXXXXXX" />
        </Field>
        <Field label="Email">
          <Input type="email" name="email" value={form.email} onChange={change} placeholder="Email" />
        </Field>
        <Field label="Payroll">
          <Select name="payroll" value={form.payroll} onChange={change} options={teacherPayrolls} />
        </Field>
        <Field label="Designation">
          <Select name="designation" value={form.designation} onChange={change} options={teacherDesignations} />
        </Field>
        <Field label="Shift">
          <Select name="shift" value={form.shift} onChange={change} options={teacherShifts} placeholder="Select Shift" />
        </Field>
      </div>

      <div className="teacher-modal-actions">
        <button type="submit" className="student-btn student-btn-success">
          <BadgeCheck size={15} /> {submitLabel}
        </button>
      </div>
    </form>
  );
}

/* =========================================================
   TEACHER QUICK ENTRY
========================================================= */

export function TeacherQuickEntry() {
  const [count, setCount] = useState(1);
  const [rows, setRows] = useState(() => [createBlankTeacher(0)]);
  const [fileName, setFileName] = useState("");

  const generateRows = () => {
    const amount = Math.min(50, Math.max(1, Number(count) || 1));
    setRows(Array.from({ length: amount }, (_, index) => createBlankTeacher(index)));
  };

  const changeRow = (index, field, value) => {
    setRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row
      )
    );
  };

  const submit = () => {
    const validRows = rows.filter((row) => row.id.trim() && row.name.trim());
    const extras = getExtraTeachers();
    const existingIds = new Set(extras.map((teacher) => teacher.id));
    const next = [...extras];

    validRows.forEach((teacher) => {
      const index = next.findIndex((item) => item.id === teacher.id);
      if (index >= 0) next[index] = teacher;
      else if (!existingIds.has(teacher.id)) next.push(teacher);
    });

    writeJSON(teacherStorageKeys.extraTeachers, next);
    alert(`${validRows.length} teacher record(s) saved in demo storage.`);
  };

  return (
    <TeacherPage>
      <Panel
        title="Teacher Quick Create"
        action={
          <div className="teacher-quick-count">
            <input type="number" min="1" max="50" value={count} onChange={(event) => setCount(event.target.value)} />
            <button type="button" className="student-btn student-btn-secondary" onClick={generateRows}>Add</button>
          </div>
        }
      >
        <div className="excel-tools-grid teacher-excel-tools">
          <div>
            <label className="excel-upload-button">
              <Upload size={16} /> Upload Excel Format
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                hidden
                onChange={(event) => setFileName(event.target.files?.[0]?.name || "")}
              />
            </label>
            <div className="excel-file-placeholder">{fileName}</div>
          </div>
          <div className="excel-download-stack">
            <button type="button" className="student-btn student-btn-purple student-wide-button" onClick={() => downloadTextFile("teacher-data.csv", "Teacher ID,Full Name,Designation,Shift,Join Date,Mobile,Email\n") }>
              <Download size={15} /> Download Teacher Excel Data
            </button>
            <button type="button" className="student-btn student-btn-purple student-wide-button" onClick={downloadTeacherTemplate}>
              <Download size={15} /> Teacher Quick Excel Format
            </button>
            <p className="student-help-text teacher-help-text">
              ***Download Teacher Excel Format. Fill up with teacher information and upload this file to quick data entry.
            </p>
          </div>
        </div>
      </Panel>

      <Panel title="Teacher Create">
        <div className="student-alert">(*) field required</div>

        <div className="teacher-table-wrap">
          <table className="teacher-table teacher-quick-table">
            <thead>
              <tr>
                <th>Teacher ID</th>
                <th>Name</th>
                <th>Join Date</th>
                <th>Gender</th>
                <th>Religion</th>
                <th>Mobile</th>
                <th>Payroll</th>
                <th>Designation</th>
                <th>Shift</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  <td><input className="student-input" value={row.id} onChange={(event) => changeRow(index, "id", event.target.value)} /></td>
                  <td><input className="student-input" value={row.name} onChange={(event) => changeRow(index, "name", event.target.value)} /></td>
                  <td><input className="student-input" type="date" value={row.joinDate} onChange={(event) => changeRow(index, "joinDate", event.target.value)} /></td>
                  <td><select className="student-input" value={row.gender} onChange={(event) => changeRow(index, "gender", event.target.value)}>{genders.map((value) => <option key={value}>{value}</option>)}</select></td>
                  <td><select className="student-input" value={row.religion} onChange={(event) => changeRow(index, "religion", event.target.value)}>{religions.map((value) => <option key={value}>{value}</option>)}</select></td>
                  <td><input className="student-input" value={row.mobile} onChange={(event) => changeRow(index, "mobile", event.target.value)} /></td>
                  <td><select className="student-input" value={row.payroll} onChange={(event) => changeRow(index, "payroll", event.target.value)}>{teacherPayrolls.map((value) => <option key={value}>{value}</option>)}</select></td>
                  <td><select className="student-input" value={row.designation} onChange={(event) => changeRow(index, "designation", event.target.value)}>{teacherDesignations.map((value) => <option key={value}>{value}</option>)}</select></td>
                  <td><select className="student-input" value={row.shift} onChange={(event) => changeRow(index, "shift", event.target.value)}><option value="">Select Shift</option>{teacherShifts.map((value) => <option key={value}>{value}</option>)}</select></td>
                  <td>
                    <button type="button" className="teacher-icon-btn red" onClick={() => setRows((current) => current.filter((_, rowIndex) => rowIndex !== index))}>
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="student-form-footer teacher-submit-row">
          <button type="button" className="student-btn student-btn-success" onClick={submit}>Submit</button>
        </div>
      </Panel>
    </TeacherPage>
  );
}

/* =========================================================
   TEACHER QUICK UPDATE
========================================================= */

export function TeacherQuickUpdate() {
  const [shift, setShift] = useState("");
  const [searched, setSearched] = useState(false);

  const results = useMemo(() => {
    if (!searched) return [];
    const teachers = getActiveTeachers();
    return shift ? teachers.filter((teacher) => teacher.shift.toLowerCase().includes(shift.toLowerCase())) : teachers;
  }, [searched, shift]);

  return (
    <TeacherPage>
      <Panel title="Teacher Quick Update">
        <div className="teacher-single-search">
          <Field label="School Shift">
            <Select value={shift} onChange={(event) => setShift(event.target.value)} options={teacherShifts} placeholder="Select Shift" />
          </Field>
          <div className="teacher-single-search-action">
            <button type="button" className="student-btn student-btn-purple" onClick={() => setSearched(true)}>
              <Search size={14} /> Search
            </button>
          </div>
        </div>

        {searched ? (
          <div className="teacher-search-results">
            <div className="teacher-table-wrap">
              <table className="teacher-table">
                <thead><tr><th>Teacher ID</th><th>Full Name</th><th>Designation</th><th>Shift</th><th>Mobile</th></tr></thead>
                <tbody>
                  {results.map((teacher) => (
                    <tr key={teacher.id}>
                      <td>{teacher.id}</td><td>{teacher.name}</td><td>{teacher.designation}</td><td>{teacher.shift}</td><td>{teacher.mobile}</td>
                    </tr>
                  ))}
                  {!results.length ? <tr><td colSpan="5" className="teacher-empty-row">No teachers found for this shift.</td></tr> : null}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </Panel>
    </TeacherPage>
  );
}

/* =========================================================
   DISABLE / RESTORE
========================================================= */

export function TeacherDisable() {
  const [teachers, setTeachers] = useState(() => getActiveTeachers());
  const [selected, setSelected] = useState([]);

  const toggle = (id) => {
    setSelected((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  };

  const update = () => {
    const disabled = new Set(getDisabledIds());
    selected.forEach((id) => disabled.add(id));
    writeJSON(teacherStorageKeys.disabledTeacherIds, [...disabled]);
    setTeachers(getActiveTeachers());
    setSelected([]);
  };

  return (
    <TeacherPage>
      <Panel title="Teacher Disable List" action={<button type="button" className="student-btn student-btn-success" onClick={update}>Update</button>}>
        <SelectionTable teachers={teachers} selected={selected} toggle={toggle} />
      </Panel>
    </TeacherPage>
  );
}

export function TeacherRestore() {
  const [disabledIds, setDisabledIds] = useState(() => getDisabledIds());
  const [selected, setSelected] = useState([]);

  const disabledTeachers = useMemo(() => {
    const ids = new Set(disabledIds);
    return getAllTeachers().filter((teacher) => ids.has(teacher.id));
  }, [disabledIds]);

  const toggle = (id) => {
    setSelected((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  };

  const update = () => {
    const restore = new Set(selected);
    const next = disabledIds.filter((id) => !restore.has(id));
    writeJSON(teacherStorageKeys.disabledTeacherIds, next);
    setDisabledIds(next);
    setSelected([]);
  };

  return (
    <TeacherPage>
      <Panel title="Teacher Restore List" action={<button type="button" className="student-btn student-btn-success" onClick={update}>Update</button>}>
        <div className="teacher-table-wrap">
          <table className="teacher-table">
            <thead>
              <tr><th></th><th>Teacher ID</th><th>Full Name</th><th>Designation</th><th>Disabled At</th><th>Remarks</th></tr>
            </thead>
            <tbody>
              {disabledTeachers.map((teacher) => (
                <tr key={teacher.id}>
                  <td><input type="checkbox" checked={selected.includes(teacher.id)} onChange={() => toggle(teacher.id)} /></td>
                  <td><strong>{teacher.id}</strong></td>
                  <td>{teacher.name}</td>
                  <td>{teacher.designation}</td>
                  <td>{new Date().toISOString().slice(0, 10)}</td>
                  <td>Disabled in demo</td>
                </tr>
              ))}
              {!disabledTeachers.length ? <tr><td colSpan="6" className="teacher-empty-row">No disabled teachers.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </Panel>
    </TeacherPage>
  );
}

function SelectionTable({ teachers, selected, toggle }) {
  const allSelected = teachers.length > 0 && teachers.every((teacher) => selected.includes(teacher.id));

  return (
    <div className="teacher-table-wrap">
      <table className="teacher-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={() => {
                  if (allSelected) teachers.forEach((teacher) => selected.includes(teacher.id) && toggle(teacher.id));
                  else teachers.forEach((teacher) => !selected.includes(teacher.id) && toggle(teacher.id));
                }}
              />
            </th>
            <th>Teacher ID</th><th>Full Name</th><th>Designation</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map((teacher) => (
            <tr key={teacher.id}>
              <td><input type="checkbox" checked={selected.includes(teacher.id)} onChange={() => toggle(teacher.id)} /></td>
              <td><strong>{teacher.id}</strong></td><td>{teacher.name}</td><td>{teacher.designation}</td>
            </tr>
          ))}
          {!teachers.length ? <tr><td colSpan="4" className="teacher-empty-row">No active teachers.</td></tr> : null}
        </tbody>
      </table>
    </div>
  );
}

/* =========================================================
   TEACHER ID CARD
========================================================= */

export function TeacherIdCard() {
  const teachers = useMemo(() => getActiveTeachers(), []);
  const [teacherId, setTeacherId] = useState("");
  const [template, setTemplate] = useState("Vertical 1");
  const [templateSide, setTemplateSide] = useState("Both Side");
  const [layout, setLayout] = useState("Portrait");
  const [issueDate, setIssueDate] = useState("2026-01-01");
  const [expireDate, setExpireDate] = useState("2026-12-31");
  const [searched, setSearched] = useState(false);

  const selectedTeachers = useMemo(() => {
    if (!searched) return [];
    if (!teacherId) return teachers;
    return teachers.filter((teacher) => teacher.id === teacherId);
  }, [searched, teacherId, teachers]);

  return (
    <TeacherPage>
      <Panel title="Teacher ID Card">
        <div className="student-search-grid teacher-id-form">
          <Field label="Designation">
            <select className="student-input" value={teacherId} onChange={(event) => setTeacherId(event.target.value)}>
              <option value="">Select Teacher</option>
              {teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name} ({teacher.id})</option>)}
            </select>
          </Field>
          <Field label="Template">
            <Select value={template} onChange={(event) => setTemplate(event.target.value)} options={teacherTemplates} />
          </Field>
          <Field label="Template Side">
            <Select value={templateSide} onChange={(event) => setTemplateSide(event.target.value)} options={teacherTemplateSides} />
          </Field>
          <Field label="Layout">
            <Select value={layout} onChange={(event) => setLayout(event.target.value)} options={teacherLayouts} />
          </Field>
          <Field label="Issue Date">
            <Input type="date" value={issueDate} onChange={(event) => setIssueDate(event.target.value)} />
          </Field>
          <Field label="Expire Date">
            <Input type="date" value={expireDate} onChange={(event) => setExpireDate(event.target.value)} />
          </Field>
        </div>

        <div className="student-action-row">
          <button type="button" className="student-btn student-btn-secondary" onClick={() => setSearched(true)}><Search size={14} /> Search</button>
          <button type="button" className="student-btn student-btn-success" onClick={() => window.print()}><Printer size={14} /> Print</button>
          <button type="button" className="student-btn student-btn-blue" onClick={() => window.print()}><FileDown size={14} /> PDF</button>
          <button type="button" className="student-btn student-btn-muted" onClick={() => alert("Demo ID-card design configuration")}>Design & Config</button>
        </div>

        {searched ? (
          <div className={`teacher-id-preview-grid ${layout.toLowerCase()}`}>
            {selectedTeachers.map((teacher) => (
              <article className="teacher-id-card-preview" key={teacher.id}>
                <div className="teacher-id-brand">EXPERT COACHING CENTER</div>
                <img src={teacher.image || "/jasshoreExpert.png"} alt={teacher.name} />
                <h3>{teacher.name}</h3>
                <p>{teacher.designation}</p>
                <dl>
                  <div><dt>ID</dt><dd>{teacher.id}</dd></div>
                  <div><dt>Mobile</dt><dd>{teacher.mobile}</dd></div>
                  <div><dt>Issue</dt><dd>{issueDate}</dd></div>
                  <div><dt>Expire</dt><dd>{expireDate}</dd></div>
                </dl>
                <small>{template} · {templateSide}</small>
              </article>
            ))}
            {!selectedTeachers.length ? <p className="teacher-empty-row">No matching teacher.</p> : null}
          </div>
        ) : null}
      </Panel>
    </TeacherPage>
  );
}

/* =========================================================
   TEACHER SETTINGS
========================================================= */

export function TeacherSettings() {
  const stored = readJSON(teacherStorageKeys.teacherSettings, {
    approval: "Active",
    cvTitle: "CV Of Teacher",
  });

  const [approval, setApproval] = useState(stored.approval);
  const [cvTitle, setCvTitle] = useState(stored.cvTitle);

  const submit = (event) => {
    event.preventDefault();
    writeJSON(teacherStorageKeys.teacherSettings, { approval, cvTitle });
    alert("Teacher settings saved for this demo.");
  };

  return (
    <TeacherPage>
      <Panel
        title="Online Admission Update"
        action={
          <Link className="student-btn student-btn-secondary" to="/dashboard/user-management/teacher">
            Back to Teacher List
          </Link>
        }
      >
        <div className="student-alert">(*) field required</div>

        <form className="teacher-settings-form" onSubmit={submit}>
          <Field label="Admission Approval" required>
            <select className="student-input" value={approval} onChange={(event) => setApproval(event.target.value)}>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </Field>

          <Field label="CV Title" required>
            <Input value={cvTitle} onChange={(event) => setCvTitle(event.target.value)} />
          </Field>

          <div className="teacher-settings-submit">
            <button type="submit" className="student-btn student-btn-success">Submit</button>
          </div>
        </form>
      </Panel>
    </TeacherPage>
  );
}
