import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Edit3,
  Info,
  Trash2,
  Upload,
  Download,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAcademicBase } from "../academicShared.jsx";

/* =========================================================
   DATA
========================================================= */

const sessions = ["2026", "2025", "2024"];

const classOptions = [
  "SSC",
  "HSC",
  "Inter 1st year",
  "Inter 2nd year",
  "Class 09",
  "Class 10",
  "demo",
];

const initialSubjects = [
  {
    id: 1,
    serial: "",
    className: "SSC",
    groups: "Business, Humanities, Science",
    code: "107",
    name: "English 1st Paper",
    category: "Regular",
    session: "2026",
    createdBy: "Expert Coaching Center",
    createdDate: "2026-01-26 17:02:48",
  },
  {
    id: 2,
    serial: "",
    className: "SSC",
    groups: "Business, Humanities, Science",
    code: "109",
    name: "Mathematics",
    category: "Regular",
    session: "2026",
    createdBy: "Expert Coaching Center",
    createdDate: "2026-01-26 17:02:48",
  },
  {
    id: 3,
    serial: "",
    className: "Inter 1st year",
    groups: "Business, Humanities, Science",
    code: "101",
    name: "Bangla 1st Paper",
    category: "Regular",
    session: "2026",
    createdBy: "Expert Coaching Center",
    createdDate: "2026-02-21 15:49:44",
  },
  {
    id: 4,
    serial: "",
    className: "Inter 1st year",
    groups: "Business, Humanities, Science",
    code: "108",
    name: "English 2nd Paper",
    category: "Regular",
    session: "2026",
    createdBy: "Expert Coaching Center",
    createdDate: "2026-02-21 15:49:44",
  },
  {
    id: 5,
    serial: "",
    className: "SSC",
    groups: "Business, Humanities, Science",
    code: "101",
    name: "Bangla 1st Paper",
    category: "Regular",
    session: "2026",
    createdBy: "Expert Coaching Center",
    createdDate: "2026-01-26 17:02:48",
  },
  {
    id: 6,
    serial: "",
    className: "SSC",
    groups: "Business, Humanities, Science",
    code: "108",
    name: "English 2nd Paper",
    category: "Regular",
    session: "2026",
    createdBy: "Expert Coaching Center",
    createdDate: "2026-01-26 17:02:48",
  },
  {
    id: 7,
    serial: "",
    className: "Inter 1st year",
    groups: "Business, Humanities, Science",
    code: "102",
    name: "Bangla 2nd paper",
    category: "Regular",
    session: "2025",
    createdBy: "Expert Coaching Center",
    createdDate: "2025-04-09 16:32:28",
  },
  {
    id: 8,
    serial: "",
    className: "Inter 1st year",
    groups: "Business, Humanities, Science",
    code: "107",
    name: "English 1st Paper",
    category: "Regular",
    session: "2026",
    createdBy: "Expert Coaching Center",
    createdDate: "2026-02-21 15:49:44",
  },
  {
    id: 9,
    serial: "",
    className: "SSC",
    groups: "Business, Humanities, Science",
    code: "102",
    name: "Bangla 2nd Paper",
    category: "Regular",
    session: "2026",
    createdBy: "Expert Coaching Center",
    createdDate: "2026-01-26 17:02:48",
  },
  {
    id: 10,
    serial: "",
    className: "SSC",
    groups: "Business, Humanities, Science",
    code: "154",
    name: "ICT",
    category: "Regular",
    session: "2026",
    createdBy: "Expert Coaching Center",
    createdDate: "2026-01-26 17:02:48",
  },
];

/* =========================================================
   SHARED COMPONENTS
========================================================= */

function PageRoot({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="min-h-[calc(100vh-60px)] bg-[#f5f5f5] p-2 sm:p-3"
    >
      {children}
    </motion.div>
  );
}

function Panel({ title, action, children, className = "" }) {
  return (
    <section
      className={`overflow-hidden rounded-md border border-base-300 bg-white shadow-sm ${className}`}
    >
      <div className="flex min-h-[40px] items-center justify-between gap-3 bg-[#456db5] px-4 py-2 text-white">
        <h2 className="text-base font-bold sm:text-lg">{title}</h2>
        {action}
      </div>

      {children}
    </section>
  );
}

function Select({ children, className = "", ...props }) {
  return (
    <select
      {...props}
      className={`select select-bordered select-sm h-8 min-h-8 w-full rounded-[3px] border-slate-300 bg-white ${className}`}
    >
      {children}
    </select>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`input input-bordered input-sm h-8 min-h-8 w-full rounded-[3px] border-slate-300 bg-white ${className}`}
    />
  );
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
  return (
    <Link
      to={to}
      className="btn btn-info btn-sm min-h-0 border-cyan-600 bg-cyan-600 text-white hover:bg-cyan-700"
    >
      {children}
    </Link>
  );
}

function PurpleButton({ children, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      type="button"
      onClick={onClick}
      className="btn btn-sm min-h-0 border-violet-700 bg-violet-700 text-white hover:bg-violet-800"
    >
      {children}
    </motion.button>
  );
}

/* =========================================================
   1. SUBJECT TRANSFER
========================================================= */

export function SubjectTransferPage() {
  const base = useAcademicBase();

  const [form, setForm] = useState({
    session: "2026",
    className: "",
  });

  const [searched, setSearched] = useState(false);

  return (
    <PageRoot>
      <Panel
        title="Subject Transfer"
        action={
          <CyanLink to={`${base}/subject/subject`}>
            Back to Subject List
          </CyanLink>
        }
      >
        <div className="px-5 py-5">
          <div className="mx-auto grid max-w-[1320px] gap-x-7 gap-y-5 lg:grid-cols-2">
            <Field label="Session:">
              <Select
                value={form.session}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    session: e.target.value,
                  }))
                }
              >
                {sessions.map((session) => (
                  <option key={session} value={session}>
                    {session}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Class:">
              <Select
                value={form.className}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    className: e.target.value,
                  }))
                }
                className={
                  !form.className
                    ? "bg-[#f7f7f7] text-slate-400"
                    : ""
                }
              >
                <option value="">Nothing selected</option>

                {classOptions.map((className) => (
                  <option key={className} value={className}>
                    {className}
                  </option>
                ))}
              </Select>
            </Field>

            <div className="lg:col-start-1">
              <div className="sm:ml-[198px]">
                <PurpleButton onClick={() => setSearched(true)}>
                  Search
                </PurpleButton>
              </div>
            </div>
          </div>

          {searched && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mx-auto mt-5 max-w-[1320px] rounded border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500"
            >
              {form.className
                ? `Subject transfer result for ${form.className}, Session ${form.session}.`
                : "Please select a class to view subject transfer information."}
            </motion.div>
          )}

          <div className="min-h-[10px]" />
        </div>
      </Panel>
    </PageRoot>
  );
}

/* =========================================================
   2. SUBJECT EXCEL ENTRY
========================================================= */

export function SubjectExcelEntryPage() {
  const base = useAcademicBase();
  const fileInputRef = useRef(null);

  const [fileName, setFileName] = useState("");

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setFileName(file.name);
  };

  const downloadTemplate = () => {
    const template = [
      [
        "Session",
        "Class",
        "Groups",
        "Subject Code",
        "Subject Name",
        "Subject Category",
      ],
      [
        "2026",
        "SSC",
        "Business, Humanities, Science",
        "101",
        "Bangla 1st Paper",
        "Regular",
      ],
    ];

    const content = template
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([content], {
      type: "text/csv;charset=utf-8;",
    });

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
      <Panel
        title="Subject Quick Excel Entry"
        action={
          <CyanLink to={`${base}/subject/subject`}>
            Create Subject
          </CyanLink>
        }
      >
        <div className="px-5 py-14">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="mx-auto grid max-w-[1300px] gap-7 lg:grid-cols-2">
            <div>
              <button
                type="button"
                onClick={handleUploadClick}
                className="btn btn-sm h-8 min-h-8 w-full border-slate-600 bg-gradient-to-b from-slate-500 to-slate-600 text-white hover:bg-slate-700"
              >
                Upload Excell Format
              </button>

              <div className="h-4 rounded-b bg-[#eef0f2]" />

              {fileName && (
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                  <Upload size={14} />
                  {fileName}
                </div>
              )}
            </div>

            <div>
              <button
                type="button"
                onClick={downloadTemplate}
                className="btn btn-sm h-8 min-h-8 w-full border-violet-700 bg-gradient-to-r from-violet-700 to-purple-600 text-white hover:bg-violet-800"
              >
                Download Excell Format
              </button>

              {fileName && (
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                  <Download size={14} />
                  Excel file ready for upload
                </div>
              )}
            </div>
          </div>
        </div>
      </Panel>
    </PageRoot>
  );
}

/* =========================================================
   CREATE / EDIT MODAL
========================================================= */

function SubjectModal({
  open,
  subject,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(
    subject || {
      className: "SSC",
      groups: "Business, Humanities, Science",
      code: "",
      name: "",
      category: "Regular",
      session: "2026",
    }
  );

  if (!open) return null;

  const update = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl overflow-hidden rounded-md bg-white shadow-xl"
      >
        <div className="flex items-center justify-between bg-[#456db5] px-5 py-3 text-white">
          <h3 className="font-bold">
            {subject ? "Update Subject" : "Create Subject"}
          </h3>

          <button type="button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-bold">Session</label>

            <Select
              value={form.session}
              onChange={(e) => update("session", e.target.value)}
            >
              {sessions.map((session) => (
                <option key={session}>{session}</option>
              ))}
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold">Class</label>

            <Select
              value={form.className}
              onChange={(e) => update("className", e.target.value)}
            >
              {classOptions.map((className) => (
                <option key={className}>{className}</option>
              ))}
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold">
              Subject Code
            </label>

            <Input
              value={form.code}
              onChange={(e) => update("code", e.target.value)}
              placeholder="Subject Code"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold">
              Subject Name
            </label>

            <Input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Subject Name"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold">
              Subject Category
            </label>

            <Select
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
            >
              <option>Regular</option>
              <option>Optional</option>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold">
              Groups
            </label>

            <Input
              value={form.groups}
              onChange={(e) => update("groups", e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => onSave(form)}
            className="btn btn-success btn-sm text-white"
          >
            Save
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* =========================================================
   3. SUBJECT LIST
========================================================= */

export function SubjectPage() {
  const [filters, setFilters] = useState({
    session: "2026",
    className: "",
  });

  const [appliedFilters, setAppliedFilters] = useState({
    session: "2026",
    className: "",
  });

  const [subjects, setSubjects] = useState(initialSubjects);

  const [modal, setModal] = useState({
    open: false,
    subject: null,
  });

  const filteredSubjects = useMemo(() => {
    return subjects.filter((subject) => {
      const sessionMatch =
        !appliedFilters.session ||
        subject.session === appliedFilters.session;

      const classMatch =
        !appliedFilters.className ||
        subject.className === appliedFilters.className;

      return sessionMatch && classMatch;
    });
  }, [subjects, appliedFilters]);

  const handleSearch = () => {
    setAppliedFilters(filters);
  };

  const deleteSubject = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this subject?"
    );

    if (!confirmed) return;

    setSubjects((prev) =>
      prev.filter((subject) => subject.id !== id)
    );
  };

  const saveSubject = (form) => {
    if (!form.name.trim() || !form.code.trim()) {
      window.alert("Subject Code and Subject Name are required.");
      return;
    }

    if (modal.subject) {
      setSubjects((prev) =>
        prev.map((subject) =>
          subject.id === modal.subject.id
            ? {
                ...subject,
                ...form,
              }
            : subject
        )
      );
    } else {
      setSubjects((prev) => [
        {
          id:
            globalThis.crypto?.randomUUID?.() ??
            `subject-${Date.now()}`,
          serial: "",
          ...form,
          createdBy: "Expert Coaching Center",
          createdDate: new Date()
            .toISOString()
            .replace("T", " ")
            .slice(0, 19),
        },
        ...prev,
      ]);
    }

    setModal({
      open: false,
      subject: null,
    });
  };

  return (
    <PageRoot>
      <div className="space-y-4">
        {/* SEARCH PANEL */}
        <Panel
          title="Subject List"
          action={
            <button
              type="button"
              onClick={() =>
                setModal({
                  open: true,
                  subject: null,
                })
              }
              className="btn btn-info btn-sm min-h-0 text-white"
            >
              Create Subject
            </button>
          }
        >
          <div className="px-5 py-5">
            <div className="mx-auto grid max-w-[1320px] gap-x-7 gap-y-5 lg:grid-cols-2">
              <Field label="Session:">
                <Select
                  value={filters.session}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      session: e.target.value,
                    }))
                  }
                >
                  {sessions.map((session) => (
                    <option key={session}>{session}</option>
                  ))}
                </Select>
              </Field>

              <Field label="Class:">
                <Select
                  value={filters.className}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      className: e.target.value,
                    }))
                  }
                >
                  <option value="">Select Class</option>

                  {classOptions.map((className) => (
                    <option key={className}>{className}</option>
                  ))}
                </Select>
              </Field>

              <div className="lg:col-start-1">
                <div className="sm:ml-[198px]">
                  <PurpleButton onClick={handleSearch}>
                    Search
                  </PurpleButton>
                </div>
              </div>
            </div>

            <div className="min-h-[10px]" />
          </div>
        </Panel>

        {/* SUBJECT TABLE */}
        <Panel
          title="Subject List"
          action={
            <button
              type="button"
              onClick={() =>
                window.alert("Subject serial update mode enabled.")
              }
              className="btn btn-success btn-sm min-h-0 text-white"
            >
              Update Subject Serial
            </button>
          }
        >
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="table table-xs min-w-[1350px] border border-base-300">
                <thead className="bg-white text-black">
                  <tr>
                    <th className="w-[145px] border border-base-300">
                      <span className="flex items-center gap-1">
                        Serial No
                        <Edit3 size={12} />
                        <Info
                          size={14}
                          className="rounded-full bg-cyan-500 p-[2px] text-white"
                        />
                      </span>
                    </th>

                    <th className="border border-base-300">
                      Class Name
                    </th>

                    <th className="min-w-[260px] border border-base-300">
                      Groups
                    </th>

                    <th className="border border-base-300">
                      Subject Code
                    </th>

                    <th className="border border-base-300">
                      Subject Name
                    </th>

                    <th className="border border-base-300">
                      Subject Category
                    </th>

                    <th className="border border-base-300">
                      Session
                    </th>

                    <th className="min-w-[210px] border border-base-300">
                      Created By
                    </th>

                    <th className="w-[105px] border border-base-300">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredSubjects.map((subject, index) => (
                    <tr
                      key={subject.id}
                      className={index % 2 === 0 ? "bg-[#f0f0f0]" : "bg-white"}
                    >
                      <td className="border border-base-300">
                        {subject.serial}
                      </td>

                      <td className="border border-base-300">
                        {subject.className}
                      </td>

                      <td className="border border-base-300">
                        {subject.groups}
                      </td>

                      <td className="border border-base-300">
                        {subject.code}
                      </td>

                      <td className="border border-base-300">
                        {subject.name}
                      </td>

                      <td className="border border-base-300">
                        {subject.category}
                      </td>

                      <td className="border border-base-300">
                        {subject.session}
                      </td>

                      <td className="border border-base-300 leading-5">
                        <div>{subject.createdBy}</div>
                        <div>{subject.createdDate}</div>
                      </td>

                      <td className="border border-base-300">
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              setModal({
                                open: true,
                                subject,
                              })
                            }
                            title="Edit"
                            className="btn btn-info btn-xs h-7 min-h-7 w-7 p-0 text-white"
                          >
                            <Edit3 size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteSubject(subject.id)
                            }
                            title="Delete"
                            className="btn btn-error btn-xs h-7 min-h-7 w-7 p-0 text-white"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredSubjects.length === 0 && (
                    <tr>
                      <td
                        colSpan={9}
                        className="border border-base-300 py-8 text-center text-slate-400"
                      >
                        No subjects found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm font-bold text-black">
                Showing{" "}
                {filteredSubjects.length ? 1 : 0} to{" "}
                {filteredSubjects.length} of{" "}
                {filteredSubjects.length === 10
                  ? 263
                  : filteredSubjects.length}{" "}
                results.
              </p>

              <div className="join">
                <button
                  type="button"
                  className="join-item btn btn-primary btn-xs bg-[#456db5] text-white"
                >
                  1
                </button>

                <button
                  type="button"
                  className="join-item btn btn-xs bg-white"
                >
                  2
                </button>

                <button
                  type="button"
                  className="join-item btn btn-xs bg-white"
                >
                  3
                </button>

                <button
                  type="button"
                  className="join-item btn btn-xs bg-white"
                >
                  &gt;
                </button>

                <button
                  type="button"
                  className="join-item btn btn-xs bg-white"
                >
                  Last &gt;
                </button>
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <SubjectModal
        key={modal.subject?.id ?? "new-subject"}
        open={modal.open}
        subject={modal.subject}
        onClose={() =>
          setModal({
            open: false,
            subject: null,
          })
        }
        onSave={saveSubject}
      />
    </PageRoot>
  );
}