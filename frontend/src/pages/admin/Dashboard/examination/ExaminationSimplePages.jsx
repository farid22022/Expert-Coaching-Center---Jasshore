import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  Edit3,
  FileDown,
  Plus,
  Printer,
  Search,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import { ExaminationNav } from "./examinationShared.jsx";

/* =========================================================
   STORAGE
========================================================= */

const EXAM_STORAGE_KEY = "expertExaminationExamList";
const ROUTINE_STORAGE_KEY = "expertExaminationRoutineList";
const ASSIGNMENT_STORAGE_KEY = "expertTeacherExamSubjectAssignments";

/* =========================================================
   OPTIONS
========================================================= */

const sessions = ["2026", "2025", "2024"];

const shifts = [
  "9.30AM- 11.30AM Morning",
  "All shift for HSC",
  "All Shift",
  "Day",
  "Evening",
];

const classes = [
  "Class 06",
  "Class 07",
  "Class 08",
  "Class 09",
  "Class 10",
  "SSC",
  "Inter 1st year",
  "Inter 2nd year",
];

const sections = ["A", "B", "C", "Day"];

const groups = [
  "Science",
  "Business",
  "Humanities",
  "General",
];

const genders = ["Male", "Female", "Other"];

const subjects = [
  "Bangla 1st paper",
  "Bangla 2nd paper",
  "English 1st paper",
  "English 2nd paper",
  "Mathematics",
  "ICT",
  "Economics",
  "Chemistry",
  "Physics",
  "Science",
  "Business studies",
  "History",
  "BGS",
  "Geography & environment",
  "Finance & banking",
  "Accounting",
  "Agriculture studies",
  "Home science",
  "Biology",
  "Higher math",
  "Hindu & moral studies",
];

const teachers = [
  "Deen Islam",
  "MD NAIMUR RAHMAN",
  "RASEL AHMED",
  "K M ABDULLAH",
  "Rasel mahmud",
  "MD ASHIQ",
  "UZZAL KUMAR",
  "MASUL BILLAH",
  "MD ALAMIN",
];

/* =========================================================
   DEMO DATA
========================================================= */

const demoExams = [
  [
    "Weekly Exam",
    "2025-04-16",
    "2025-04-16",
    "2025-04-17 22:40:48",
  ],
  [
    "1026525 WK GEOGRAPHY",
    "2025-05-26",
    "2025-05-26",
    "2025-05-28 16:45:09",
  ],
  [
    "1029525 WK ENGLISH",
    "2025-05-29",
    "2025-05-29",
    "2025-05-29 17:22:46",
  ],
  [
    "1026525 WK BUSINESS",
    "2025-05-26",
    "2025-05-26",
    "2025-05-29 18:31:16",
  ],
  [
    "931525 WK MATHEMATICS",
    "2025-05-31",
    "2025-05-31",
    "2025-05-31 10:06:42",
  ],
  [
    "94625 WK BANGLA",
    "2025-06-04",
    "2025-06-04",
    "2025-06-04 16:26:51",
  ],
  [
    "104625 WK BANGLA",
    "2025-06-04",
    "2025-06-04",
    "2025-06-04 16:27:19",
  ],
  [
    "1017625 WK HISTORY",
    "2025-06-17",
    "2025-06-17",
    "2025-06-18 17:39:03",
  ],
  [
    "1017625 WK PHYSICS",
    "2025-06-17",
    "2025-06-17",
    "2025-06-18 17:40:47",
  ],
  [
    "1017625 WK FINANCE",
    "2025-06-17",
    "2025-06-17",
    "2025-06-18 17:42:22",
  ],
  [
    "918625 EX MATH",
    "2025-06-18",
    "2025-06-18",
    "2025-06-21 17:32:12",
  ],
  [
    "1020625 FR 3RD WEEK JUNE",
    "2025-06-20",
    "2025-06-20",
    "2025-06-23 11:24:14",
  ],
  [
    "920625 FR 3RD WEEK JUNE",
    "2025-06-20",
    "2025-06-20",
    "2025-06-23 11:30:00",
  ],
  [
    "1025625 WK MATH",
    "2025-06-25",
    "2025-06-25",
    "2025-06-28 17:24:47",
  ],
  [
    "1027625 FR 4TH WEEK JUNE",
    "2025-06-27",
    "2025-06-27",
    "2025-06-28 17:31:00",
  ],
  [
    "101725 WK HIGHER MATH",
    "2025-07-01",
    "2025-07-01",
    "2025-07-02 13:36:43",
  ],
  [
    "102725 WK SCIENCE",
    "2025-07-02",
    "2025-07-02",
    "2025-07-02 17:25:05",
  ],
  [
    "105725 FR 1ST WEEK JULY",
    "2025-07-04",
    "2025-07-04",
    "2025-07-05 17:25:04",
  ],
].map(([examName, startDate, endDate, createdDate], index) => ({
  id: `EXAM-${index + 1}`,
  examName,
  startDate,
  endDate,
  createdBy: "Expert Coaching Center",
  createdDate,
  monthlyExam: "---",
  sorting: index + 1,
}));

const routineSubjects = [
  ["Economics", "2026-09-22"],
  ["Chemistry", "2026-09-16"],
  ["Physics", "2026-10-22"],
  ["Science", "2026-09-24"],
  ["Business studies", "2026-09-15"],
  ["History", "2026-09-15"],
  ["BGS", "2026-09-11"],
  ["Geography & environment", "2026-09-13"],
  ["Finance & banking", "2026-09-22"],
  ["Accounting", "2026-09-13"],
  ["Agriculture studies", "2026-09-11"],
  ["Home science", "2026-09-11"],
  ["Biology", "2026-09-13"],
  ["Higher math", "2026-09-24"],
  ["Hindu & moral studies", "2026-09-10"],
];

const demoRoutines = routineSubjects.map(
  ([subject, date], index) => ({
    id: `ROUTINE-${index + 1}`,
    session: "2026",
    exam: "PRE MODEL TEST 02 SSC 2027",
    className: "Class 10",
    subject,
    date,
    startTime: "10:00 AM",
    endTime: "05:00 PM",
  })
);

const demoAssignments = [
  {
    id: "ASG-1",
    teacher: "MD NAIMUR RAHMAN",
    exam: "PRE MODEL TEST 02 SSC 2027",
    className: "Class 10",
    section: "A",
    group: "Science",
    subject: "Mathematics",
    shift: "All Shift",
    session: "2026",
    createdBy: "Expert Coaching Center",
    createdDate: "2026-09-03 12:38:12",
  },
  {
    id: "ASG-2",
    teacher: "MD ASHIQ",
    exam: "PRE MODEL TEST 02 SSC 2027",
    className: "Class 10",
    section: "A",
    group: "Science",
    subject: "English 1st paper",
    shift: "All Shift",
    session: "2026",
    createdBy: "Expert Coaching Center",
    createdDate: "2026-09-03 12:40:18",
  },
];

/* =========================================================
   STORAGE HELPERS
========================================================= */

function loadStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function saveStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function uid(prefix) {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random()}`;
}

function now() {
  return new Date()
    .toISOString()
    .replace("T", " ")
    .slice(0, 19);
}

/* =========================================================
   SHARED UI
========================================================= */

function Page({ children }) {
  return (
    <div className="space-y-5">
      <ExaminationNav />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {children}
      </motion.div>
    </div>
  );
}

function Panel({
  title,
  action,
  children,
  bodyClassName = "p-5",
}) {
  return (
    <section className="overflow-hidden rounded-md border border-base-300 bg-base-100 shadow-sm">
      <header className="flex min-h-10 items-center justify-between gap-3 bg-[#456db5] px-5 py-2 text-white">
        <h2 className="text-base font-bold sm:text-lg">
          {title}
        </h2>

        {action}
      </header>

      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

function Field({ label, required = false, children }) {
  return (
    <label className="grid gap-2 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-center">
      <span className="text-sm font-medium">
        {label}
        {required && <span className="text-error">*</span>}
      </span>

      {children}
    </label>
  );
}

function Select({
  value,
  onChange,
  options,
  placeholder,
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="select select-bordered select-sm w-full bg-base-100"
    >
      {placeholder && (
        <option value="">{placeholder}</option>
      )}

      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function RequiredAlert() {
  return (
    <div className="rounded-md border border-warning/30 bg-warning/15 px-5 py-4 text-sm font-bold text-error">
      (*) field required
    </div>
  );
}

function CyanButton({ children, ...props }) {
  return (
    <motion.button
      whileHover={{ scale: 1.025 }}
      whileTap={{ scale: 0.97 }}
      className="btn btn-sm border-0 bg-cyan-600 text-white hover:bg-cyan-700"
      {...props}
    >
      {children}
    </motion.button>
  );
}

function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="btn btn-success btn-sm text-white"
    >
      <Printer size={15} />
      Print
    </button>
  );
}

function PdfButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="btn btn-sm border-0 bg-violet-600 text-white hover:bg-violet-700"
      title="Use the browser's Save as PDF option"
    >
      <FileDown size={15} />
      Download PDF
    </button>
  );
}

/* =========================================================
   GENERIC MODAL
========================================================= */

function Modal({ open, title, onClose, children }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] grid place-items-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="w-full max-w-3xl overflow-hidden rounded-lg bg-base-100 shadow-2xl"
          >
            <header className="flex items-center justify-between bg-[#456db5] px-5 py-3 text-white">
              <h3 className="font-bold">{title}</h3>

              <button
                type="button"
                onClick={onClose}
                className="btn btn-circle btn-ghost btn-sm text-white"
              >
                <X size={18} />
              </button>
            </header>

            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* =========================================================
   SIGNATURE SHEET
========================================================= */

export function SignatureSheetPage() {
  const [form, setForm] = useState({
    session: "2026",
    exam: "",
    shift: "",
    className: "",
    section: "",
    group: "",
    roll: "",
    gender: "",
    type: "Student Wise",
  });

  const update = (key, value) =>
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));

  return (
    <Page>
      <Panel title="Exam Signature Sheet">
        <div className="mx-auto grid max-w-6xl gap-x-8 gap-y-4 lg:grid-cols-2">
          <Field label="Session Year:">
            <Select
              value={form.session}
              onChange={(e) => update("session", e.target.value)}
              options={sessions}
            />
          </Field>

          <Field label="Exam:">
            <Select
              value={form.exam}
              onChange={(e) => update("exam", e.target.value)}
              options={demoExams.map((x) => x.examName)}
              placeholder="Select Exam"
            />
          </Field>

          <Field label="School Shift:">
            <Select
              value={form.shift}
              onChange={(e) => update("shift", e.target.value)}
              options={shifts}
              placeholder="Select Shift"
            />
          </Field>

          <Field label="Class:">
            <Select
              value={form.className}
              onChange={(e) => update("className", e.target.value)}
              options={classes}
              placeholder="Select class"
            />
          </Field>

          <Field label="Section:">
            <Select
              value={form.section}
              onChange={(e) => update("section", e.target.value)}
              options={sections}
              placeholder="Select Section"
            />
          </Field>

          <Field label="Group:">
            <Select
              value={form.group}
              onChange={(e) => update("group", e.target.value)}
              options={groups}
              placeholder="Select Group"
            />
          </Field>

          <Field label="Roll:">
            <input
              value={form.roll}
              onChange={(e) => update("roll", e.target.value)}
              placeholder="Enter roll"
              className="input input-bordered input-sm w-full"
            />
          </Field>

          <Field label="Gender:">
            <Select
              value={form.gender}
              onChange={(e) => update("gender", e.target.value)}
              options={genders}
              placeholder="Select Gender"
            />
          </Field>

          <Field label="Type:">
            <Select
              value={form.type}
              onChange={(e) => update("type", e.target.value)}
              options={[
                "Student Wise",
                "Subject Wise",
                "Room Wise",
              ]}
            />
          </Field>
        </div>

        <div className="mt-5 flex justify-center gap-1">
          <PrintButton />
          <PdfButton />
        </div>
      </Panel>
    </Page>
  );
}

/* =========================================================
   EXAM LIST
========================================================= */

function ExamFormModal({
  open,
  editing,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(
    editing
      ? { ...editing }
      : {
          examName: "",
          startDate: "",
          endDate: "",
          monthlyExam: "---",
          sorting: "",
        }
  );

  const submit = (e) => {
    e.preventDefault();

    if (!form.examName || !form.startDate || !form.endDate) {
      alert("Exam Name, Start Date and End Date are required.");
      return;
    }

    onSave(form);
  };

  return (
    <Modal
      open={open}
      title={editing ? "Update Exam" : "Create Exam"}
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-4 p-6">
        <label className="form-control">
          <span className="mb-1 text-sm font-bold">
            Exam Name *
          </span>

          <input
            value={form.examName}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                examName: e.target.value,
              }))
            }
            className="input input-bordered input-sm"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="form-control">
            <span className="mb-1 text-sm font-bold">
              Start Date *
            </span>

            <input
              type="date"
              value={form.startDate}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  startDate: e.target.value,
                }))
              }
              className="input input-bordered input-sm"
            />
          </label>

          <label className="form-control">
            <span className="mb-1 text-sm font-bold">
              End Date *
            </span>

            <input
              type="date"
              value={form.endDate}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  endDate: e.target.value,
                }))
              }
              className="input input-bordered input-sm"
            />
          </label>

          <label className="form-control">
            <span className="mb-1 text-sm font-bold">
              Is Monthly Exam
            </span>

            <select
              value={form.monthlyExam}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  monthlyExam: e.target.value,
                }))
              }
              className="select select-bordered select-sm"
            >
              <option value="---">---</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </label>

          <label className="form-control">
            <span className="mb-1 text-sm font-bold">
              Sorting
            </span>

            <input
              type="number"
              value={form.sorting}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  sorting: e.target.value,
                }))
              }
              className="input input-bordered input-sm"
            />
          </label>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="btn btn-success btn-sm text-white"
          >
            {editing ? "Update Exam" : "Create Exam"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function ExamListPage() {
  const [examsList, setExamsList] = useState(() =>
    loadStorage(EXAM_STORAGE_KEY, demoExams)
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const saveExam = (form) => {
    let updated;

    if (editing) {
      updated = examsList.map((exam) =>
        exam.id === editing.id
          ? {
              ...exam,
              ...form,
            }
          : exam
      );
    } else {
      updated = [
        ...examsList,
        {
          ...form,
          id: uid("EXAM"),
          createdBy: "Expert Coaching Center",
          createdDate: now(),
          sorting:
            form.sorting ||
            examsList.length + 1,
        },
      ];
    }

    setExamsList(updated);
    saveStorage(EXAM_STORAGE_KEY, updated);
    setModalOpen(false);
    setEditing(null);
  };

  const removeExam = (id) => {
    if (!window.confirm("Delete this exam?")) return;

    const updated = examsList.filter((exam) => exam.id !== id);

    setExamsList(updated);
    saveStorage(EXAM_STORAGE_KEY, updated);
  };

  return (
    <Page>
      <Panel
        title="Exam List"
        action={
          <CyanButton
            type="button"
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            <Plus size={15} />
            Create Exam
          </CyanButton>
        }
      >
        <div className="overflow-x-auto">
          <table className="table table-zebra table-sm min-w-[1200px]">
            <thead>
              <tr className="bg-base-200">
                <th>SL</th>
                <th>Exam Name</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Created By</th>
                <th>Created Date</th>
                <th>Is Monthly Exam</th>
                <th>Sorting</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {examsList.map((exam, index) => (
                <tr key={exam.id}>
                  <td>{index + 1}</td>
                  <td>{exam.examName}</td>
                  <td>{exam.startDate}</td>
                  <td>{exam.endDate}</td>
                  <td>{exam.createdBy}</td>
                  <td>{exam.createdDate}</td>
                  <td>{exam.monthlyExam}</td>
                  <td>{exam.sorting}</td>

                  <td>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(exam);
                          setModalOpen(true);
                        }}
                        className="btn btn-square btn-sm border-0 bg-cyan-500 text-white hover:bg-cyan-600"
                      >
                        <Edit3 size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => removeExam(exam.id)}
                        className="btn btn-error btn-square btn-sm text-white"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {modalOpen && (
        <ExamFormModal
          key={editing?.id || "new-exam"}
          open={modalOpen}
          editing={editing}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          onSave={saveExam}
        />
      )}
    </Page>
  );
}

/* =========================================================
   EXAM ROUTINE
========================================================= */

function RoutineModal({
  open,
  editing,
  onClose,
  onSave,
  title = "Create Exam Routine",
}) {
  const [form, setForm] = useState(
    editing
      ? { ...editing }
      : {
          session: "2026",
          exam: "",
          className: "",
          subject: "",
          date: "",
          startTime: "10:00",
          endTime: "17:00",
        }
  );

  const submit = (e) => {
    e.preventDefault();

    if (
      !form.exam ||
      !form.className ||
      !form.subject ||
      !form.date
    ) {
      alert("Exam, Class, Subject and Date are required.");
      return;
    }

    onSave({
      ...form,
      startTime:
        form.startTime.includes("AM") ||
        form.startTime.includes("PM")
          ? form.startTime
          : formatTime(form.startTime),
      endTime:
        form.endTime.includes("AM") ||
        form.endTime.includes("PM")
          ? form.endTime
          : formatTime(form.endTime),
    });
  };

  return (
    <Modal open={open} title={title} onClose={onClose}>
      <form onSubmit={submit} className="grid gap-4 p-6 sm:grid-cols-2">
        <label className="form-control">
          <span className="mb-1 text-sm font-bold">Session</span>
          <Select
            value={form.session}
            onChange={(e) =>
              setForm((p) => ({ ...p, session: e.target.value }))
            }
            options={sessions}
          />
        </label>

        <label className="form-control">
          <span className="mb-1 text-sm font-bold">Exam *</span>
          <Select
            value={form.exam}
            onChange={(e) =>
              setForm((p) => ({ ...p, exam: e.target.value }))
            }
            options={[
              "PRE MODEL TEST 02 SSC 2027",
              ...demoExams.map((x) => x.examName),
            ]}
            placeholder="Select Exam"
          />
        </label>

        <label className="form-control">
          <span className="mb-1 text-sm font-bold">Class *</span>
          <Select
            value={form.className}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                className: e.target.value,
              }))
            }
            options={classes}
            placeholder="Select Class"
          />
        </label>

        <label className="form-control">
          <span className="mb-1 text-sm font-bold">Subject *</span>
          <Select
            value={form.subject}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                subject: e.target.value,
              }))
            }
            options={subjects}
            placeholder="Select Subject"
          />
        </label>

        <label className="form-control">
          <span className="mb-1 text-sm font-bold">Exam Date *</span>
          <input
            type="date"
            value={form.date}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                date: e.target.value,
              }))
            }
            className="input input-bordered input-sm"
          />
        </label>

        <div />

        <label className="form-control">
          <span className="mb-1 text-sm font-bold">Start Time</span>
          <input
            type="time"
            value={
              form.startTime.includes("AM") ||
              form.startTime.includes("PM")
                ? "10:00"
                : form.startTime
            }
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                startTime: e.target.value,
              }))
            }
            className="input input-bordered input-sm"
          />
        </label>

        <label className="form-control">
          <span className="mb-1 text-sm font-bold">End Time</span>
          <input
            type="time"
            value={
              form.endTime.includes("AM") ||
              form.endTime.includes("PM")
                ? "17:00"
                : form.endTime
            }
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                endTime: e.target.value,
              }))
            }
            className="input input-bordered input-sm"
          />
        </label>

        <div className="sm:col-span-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="btn btn-success btn-sm text-white"
          >
            Save Routine
          </button>
        </div>
      </form>
    </Modal>
  );
}

function formatTime(value) {
  if (!value) return "";

  const [hourString, minute] = value.split(":");
  let hour = Number(hourString);
  const suffix = hour >= 12 ? "PM" : "AM";

  hour %= 12;
  if (hour === 0) hour = 12;

  return `${String(hour).padStart(2, "0")}:${minute} ${suffix}`;
}

export function ExamRoutinePage() {
  const [routines, setRoutines] = useState(() =>
    loadStorage(ROUTINE_STORAGE_KEY, demoRoutines)
  );

  const [filters, setFilters] = useState({
    session: "",
    className: "",
    exam: "",
  });

  const [appliedFilters, setAppliedFilters] = useState({
    session: "",
    className: "",
    exam: "",
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [singleModalOpen, setSingleModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const filtered = useMemo(() => {
    return routines.filter((row) => {
      if (
        appliedFilters.session &&
        row.session !== appliedFilters.session
      )
        return false;

      if (
        appliedFilters.className &&
        row.className !== appliedFilters.className
      )
        return false;

      if (
        appliedFilters.exam &&
        row.exam !== appliedFilters.exam
      )
        return false;

      return true;
    });
  }, [routines, appliedFilters]);

  const saveRoutine = (form) => {
    let updated;

    if (editing) {
      updated = routines.map((routine) =>
        routine.id === editing.id
          ? {
              ...routine,
              ...form,
            }
          : routine
      );
    } else {
      updated = [
        ...routines,
        {
          ...form,
          id: uid("ROUTINE"),
        },
      ];
    }

    setRoutines(updated);
    saveStorage(ROUTINE_STORAGE_KEY, updated);

    setModalOpen(false);
    setSingleModalOpen(false);
    setEditing(null);
  };

  const deleteRoutine = (id) => {
    if (!window.confirm("Delete this routine?")) return;

    const updated = routines.filter((row) => row.id !== id);

    setRoutines(updated);
    saveStorage(ROUTINE_STORAGE_KEY, updated);
  };

  return (
    <Page>
      <Panel
        title="Exam Routine List"
        action={
          <div className="flex flex-wrap gap-2">
            <CyanButton
              type="button"
              onClick={() => {
                setEditing(null);
                setModalOpen(true);
              }}
            >
              Create Exam routine
            </CyanButton>

            <CyanButton
              type="button"
              onClick={() => {
                setEditing(null);
                setSingleModalOpen(true);
              }}
            >
              Single Routine Create
            </CyanButton>
          </div>
        }
      >
        <div className="max-w-3xl space-y-4">
          <Field label="Session Year:">
            <Select
              value={filters.session}
              onChange={(e) =>
                setFilters((p) => ({
                  ...p,
                  session: e.target.value,
                }))
              }
              options={sessions}
              placeholder="Select Session Year"
            />
          </Field>

          <Field label="Class:">
            <Select
              value={filters.className}
              onChange={(e) =>
                setFilters((p) => ({
                  ...p,
                  className: e.target.value,
                }))
              }
              options={classes}
              placeholder="Select Class"
            />
          </Field>

          <Field label="Exam:">
            <Select
              value={filters.exam}
              onChange={(e) =>
                setFilters((p) => ({
                  ...p,
                  exam: e.target.value,
                }))
              }
              options={[
                "PRE MODEL TEST 02 SSC 2027",
                ...demoExams.map((x) => x.examName),
              ]}
              placeholder="Select Exam"
            />
          </Field>

          <div className="flex gap-1 pl-0 sm:pl-[170px]">
            <CyanButton
              type="button"
              onClick={() =>
                setAppliedFilters({ ...filters })
              }
            >
              <Search size={15} />
              Search
            </CyanButton>

            <PrintButton />

            <button
              type="button"
              onClick={() => window.print()}
              className="btn btn-sm border-0 bg-violet-600 text-white"
            >
              Create PDF
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="table table-zebra table-sm min-w-[1000px]">
            <thead>
              <tr className="bg-base-200">
                <th>Exam Name</th>
                <th>Exam Date</th>
                <th>Class Name</th>
                <th>Subject Name</th>
                <th>Time (Start-End)</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((row) => (
                <tr key={row.id}>
                  <td>{row.exam}</td>
                  <td>{row.date}</td>
                  <td>{row.className}</td>
                  <td>{row.subject}</td>
                  <td>
                    {row.startTime} to {row.endTime}
                  </td>

                  <td>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(row);
                          setModalOpen(true);
                        }}
                        className="btn btn-square btn-sm border-0 bg-cyan-500 text-white"
                      >
                        <Edit3 size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteRoutine(row.id)}
                        className="btn btn-error btn-square btn-sm text-white"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {modalOpen && (
        <RoutineModal
          key={editing?.id || "routine"}
          open={modalOpen}
          editing={editing}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          onSave={saveRoutine}
        />
      )}

      {singleModalOpen && (
        <RoutineModal
          key="single-routine"
          open={singleModalOpen}
          editing={null}
          title="Single Exam Routine Create"
          onClose={() => setSingleModalOpen(false)}
          onSave={saveRoutine}
        />
      )}
    </Page>
  );
}

/* =========================================================
   EXAM ROUTINE EDIT
========================================================= */

export function ExamRoutineEditPage() {
  const [rows, setRows] = useState([
    {
      id: uid("ROW"),
      date: "",
      subject: "",
      startTime: "",
      endTime: "",
    },
  ]);

  const [form, setForm] = useState({
    session: "2026",
    exam: "",
    className: "",
  });

  const addRow = () => {
    setRows((previous) => [
      ...previous,
      {
        id: uid("ROW"),
        date: "",
        subject: "",
        startTime: "",
        endTime: "",
      },
    ]);
  };

  const updateRow = (id, key, value) => {
    setRows((previous) =>
      previous.map((row) =>
        row.id === id
          ? {
              ...row,
              [key]: value,
            }
          : row
      )
    );
  };

  const removeRow = (id) =>
    setRows((previous) =>
      previous.filter((row) => row.id !== id)
    );

  const submit = () => {
    if (!form.exam || !form.className) {
      alert("Select Exam and Class.");
      return;
    }

    const validRows = rows.filter(
      (row) => row.date && row.subject
    );

    if (!validRows.length) {
      alert("Add at least one Date and Subject.");
      return;
    }

    const current = loadStorage(
      ROUTINE_STORAGE_KEY,
      demoRoutines
    );

    const created = validRows.map((row) => ({
      id: uid("ROUTINE"),
      session: form.session,
      exam: form.exam,
      className: form.className,
      subject: row.subject,
      date: row.date,
      startTime: row.startTime
        ? formatTime(row.startTime)
        : "N/A",
      endTime: row.endTime
        ? formatTime(row.endTime)
        : "N/A",
    }));

    saveStorage(ROUTINE_STORAGE_KEY, [
      ...current,
      ...created,
    ]);

    alert("Exam routine saved successfully.");
  };

  return (
    <Page>
      <Panel
        title="Edit Exam Routine"
        action={
          <button
            type="button"
            onClick={() => window.history.back()}
            className="btn btn-sm border-0 bg-cyan-500 text-white"
          >
            Back to Exam routine List
          </button>
        }
      >
        <div className="space-y-5">
          <RequiredAlert />

          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Session:" required>
              <Select
                value={form.session}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    session: e.target.value,
                  }))
                }
                options={sessions}
              />
            </Field>

            <Field label="Exam:" required>
              <Select
                value={form.exam}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    exam: e.target.value,
                  }))
                }
                options={[
                  "PRE MODEL TEST 02 SSC 2027",
                  ...demoExams.map((x) => x.examName),
                ]}
                placeholder="Select Exam"
              />
            </Field>

            <Field label="Class:" required>
              <Select
                value={form.className}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    className: e.target.value,
                  }))
                }
                options={classes}
                placeholder="Select Class"
              />
            </Field>
          </div>

          <div className="grid gap-2 lg:grid-cols-[240px_1fr]">
            <div className="text-sm font-semibold">
              Date & Subject:
              <span className="text-error">*</span>
            </div>

            <div className="overflow-hidden rounded border border-[#456db5]">
              <div className="flex items-center justify-between bg-[#456db5] px-5 py-2 text-white">
                <h3 className="font-bold">
                  Date & Subject List
                </h3>

                <button
                  type="button"
                  onClick={addRow}
                  className="btn btn-success btn-xs text-white"
                >
                  <Plus size={13} />
                  Add
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="table table-sm min-w-[900px]">
                  <thead>
                    <tr>
                      <th>Date*</th>
                      <th>Subject</th>
                      <th>Start Time</th>
                      <th>End Time</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id}>
                        <td>
                          <input
                            type="date"
                            value={row.date}
                            onChange={(e) =>
                              updateRow(
                                row.id,
                                "date",
                                e.target.value
                              )
                            }
                            className="input input-bordered input-sm w-full"
                          />
                        </td>

                        <td>
                          <Select
                            value={row.subject}
                            onChange={(e) =>
                              updateRow(
                                row.id,
                                "subject",
                                e.target.value
                              )
                            }
                            options={subjects}
                            placeholder="Enter Subject Name"
                          />
                        </td>

                        <td>
                          <input
                            type="time"
                            value={row.startTime}
                            onChange={(e) =>
                              updateRow(
                                row.id,
                                "startTime",
                                e.target.value
                              )
                            }
                            className="input input-bordered input-sm"
                          />
                        </td>

                        <td>
                          <input
                            type="time"
                            value={row.endTime}
                            onChange={(e) =>
                              updateRow(
                                row.id,
                                "endTime",
                                e.target.value
                              )
                            }
                            className="input input-bordered input-sm"
                          />
                        </td>

                        <td>
                          <button
                            type="button"
                            disabled={rows.length === 1}
                            onClick={() => removeRow(row.id)}
                            className="btn btn-error btn-square btn-sm text-white"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="pl-0 lg:pl-[240px]">
            <button
              type="button"
              onClick={submit}
              className="btn btn-success btn-sm text-white"
            >
              Submit
            </button>
          </div>
        </div>
      </Panel>
    </Page>
  );
}

/* =========================================================
   DESIGN CONFIG
========================================================= */

function DesignConfigModal({
  open,
  title,
  onClose,
}) {
  const [config, setConfig] = useState({
    template: "Vertical 1",
    side: "Both Side",
    layout: "Portrait",
  });

  return (
    <Modal
      open={open}
      title={`${title} Design & Config`}
      onClose={onClose}
    >
      <div className="grid gap-4 p-6 sm:grid-cols-2">
        <label className="form-control">
          <span className="mb-1 text-sm font-bold">
            Template
          </span>

          <Select
            value={config.template}
            onChange={(e) =>
              setConfig((p) => ({
                ...p,
                template: e.target.value,
              }))
            }
            options={[
              "Vertical 1",
              "Vertical 2",
              "Horizontal 1",
            ]}
          />
        </label>

        <label className="form-control">
          <span className="mb-1 text-sm font-bold">
            Template Side
          </span>

          <Select
            value={config.side}
            onChange={(e) =>
              setConfig((p) => ({
                ...p,
                side: e.target.value,
              }))
            }
            options={[
              "Both Side",
              "Front Side",
              "Back Side",
            ]}
          />
        </label>

        <label className="form-control">
          <span className="mb-1 text-sm font-bold">
            Layout
          </span>

          <Select
            value={config.layout}
            onChange={(e) =>
              setConfig((p) => ({
                ...p,
                layout: e.target.value,
              }))
            }
            options={["Portrait", "Landscape"]}
          />
        </label>
      </div>

      <div className="flex justify-end gap-2 border-t border-base-300 p-4">
        <button
          type="button"
          onClick={onClose}
          className="btn btn-ghost btn-sm"
        >
          Close
        </button>

        <button
          type="button"
          onClick={() => {
            alert("Design configuration saved.");
            onClose();
          }}
          className="btn btn-success btn-sm text-white"
        >
          Save Config
        </button>
      </div>
    </Modal>
  );
}

/* =========================================================
   ADMIT CARD REPORT
========================================================= */

export function AdmitCardReportPage() {
  const [configOpen, setConfigOpen] = useState(false);

  const [form, setForm] = useState({
    session: "2026",
    exam: "",
    shift: "",
    className: "",
    section: "",
    roll: "",
    routineStatus: "Without Routine",
  });

  const update = (key, value) =>
    setForm((p) => ({
      ...p,
      [key]: value,
    }));

  return (
    <Page>
      <Panel title="Exam Admit Card">
        <div className="mx-auto grid max-w-6xl gap-x-8 gap-y-4 lg:grid-cols-2">
          <Field label="Session Year:">
            <Select
              value={form.session}
              onChange={(e) =>
                update("session", e.target.value)
              }
              options={sessions}
            />
          </Field>

          <Field label="Exam:">
            <Select
              value={form.exam}
              onChange={(e) =>
                update("exam", e.target.value)
              }
              options={[
                "PRE MODEL TEST 02 SSC 2027",
                ...demoExams.map((x) => x.examName),
              ]}
              placeholder="Select Exam"
            />
          </Field>

          <Field label="School Shift:">
            <Select
              value={form.shift}
              onChange={(e) =>
                update("shift", e.target.value)
              }
              options={shifts}
              placeholder="Select Shift"
            />
          </Field>

          <Field label="Class:">
            <Select
              value={form.className}
              onChange={(e) =>
                update("className", e.target.value)
              }
              options={classes}
              placeholder="Select class"
            />
          </Field>

          <Field label="Section:">
            <Select
              value={form.section}
              onChange={(e) =>
                update("section", e.target.value)
              }
              options={sections}
              placeholder="Select Section"
            />
          </Field>

          <Field label="Roll:">
            <input
              value={form.roll}
              onChange={(e) =>
                update("roll", e.target.value)
              }
              placeholder="Enter roll"
              className="input input-bordered input-sm w-full"
            />
          </Field>

          <Field label="Admit Card:">
            <button
              type="button"
              onClick={() => setConfigOpen(true)}
              className="btn btn-sm border-0 bg-slate-600 text-white hover:bg-slate-700"
            >
              <Settings size={15} />
              Design & Config
            </button>
          </Field>

          <Field label="Routine Status:">
            <Select
              value={form.routineStatus}
              onChange={(e) =>
                update(
                  "routineStatus",
                  e.target.value
                )
              }
              options={[
                "Without Routine",
                "With Routine",
              ]}
            />
          </Field>
        </div>

        <div className="mt-5 flex justify-center gap-1">
          <PrintButton />
          <PdfButton />
        </div>
      </Panel>

      <DesignConfigModal
        open={configOpen}
        title="Admit Card"
        onClose={() => setConfigOpen(false)}
      />
    </Page>
  );
}

/* =========================================================
   SEAT PLAN
========================================================= */

function SeatPlanSearchForm({
  form,
  setForm,
  onSearch,
  showSearch = true,
}) {
  const [configOpen, setConfigOpen] = useState(false);

  const update = (key, value) =>
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));

  return (
    <>
      <div className="mx-auto grid max-w-6xl gap-x-8 gap-y-4 lg:grid-cols-2">
        <Field label="Session Year:">
          <Select
            value={form.session}
            onChange={(e) =>
              update("session", e.target.value)
            }
            options={sessions}
          />
        </Field>

        <Field label="Exam:">
          <Select
            value={form.exam}
            onChange={(e) =>
              update("exam", e.target.value)
            }
            options={[
              "PRE MODEL TEST 02 SSC 2027",
              ...demoExams.map((x) => x.examName),
            ]}
            placeholder="Select Exam"
          />
        </Field>

        <Field label="School Shift:">
          <Select
            value={form.shift}
            onChange={(e) =>
              update("shift", e.target.value)
            }
            options={shifts}
            placeholder="Select Shift"
          />
        </Field>

        <Field label="Class :">
          <Select
            value={form.className}
            onChange={(e) =>
              update("className", e.target.value)
            }
            options={classes}
            placeholder="Select class"
          />
        </Field>

        <Field label="Section:">
          <Select
            value={form.section}
            onChange={(e) =>
              update("section", e.target.value)
            }
            options={sections}
            placeholder="Select Section"
          />
        </Field>

        <Field label="Group :">
          <Select
            value={form.group}
            onChange={(e) =>
              update("group", e.target.value)
            }
            options={groups}
            placeholder="Select Group"
          />
        </Field>

        <Field label="Seat Plan:">
          <button
            type="button"
            onClick={() => setConfigOpen(true)}
            className="btn btn-sm border-0 bg-slate-600 text-white"
          >
            <Settings size={15} />
            Design & Config
          </button>
        </Field>
      </div>

      <div className="mt-5 flex justify-center gap-1">
        {showSearch && (
          <CyanButton type="button" onClick={onSearch}>
            <Search size={15} />
            Search
          </CyanButton>
        )}

        <PrintButton />
        <PdfButton />
      </div>

      <DesignConfigModal
        open={configOpen}
        title="Seat Plan"
        onClose={() => setConfigOpen(false)}
      />
    </>
  );
}

const seatStudents = [
  ["2019-02-387", "Fahim Shahariya Labib", "1", "A", "101"],
  ["2026-10-002", "Ayesha Rahman", "2", "A", "101"],
  ["2026-10-003", "Nusrat Jahan", "3", "A", "101"],
  ["2026-10-004", "Samiul Islam", "4", "A", "102"],
  ["2026-10-005", "Fahim Hasan", "5", "A", "102"],
  ["2026-10-006", "Mim Akter", "6", "A", "102"],
];

export function SeatPlanPage() {
  const [form, setForm] = useState({
    session: "2026",
    exam: "",
    shift: "",
    className: "",
    section: "",
    group: "",
  });

  const [searched, setSearched] = useState(false);

  return (
    <Page>
      <Panel title="Exam Seat Plan">
        <SeatPlanSearchForm
          form={form}
          setForm={setForm}
          onSearch={() => setSearched(true)}
        />

        <AnimatePresence>
          {searched && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 overflow-x-auto"
            >
              <table className="table table-zebra table-sm">
                <thead>
                  <tr className="bg-base-200">
                    <th>Student ID</th>
                    <th>Student Name</th>
                    <th>Roll</th>
                    <th>Section</th>
                    <th>Room</th>
                    <th>Seat</th>
                  </tr>
                </thead>

                <tbody>
                  {seatStudents.map(
                    (
                      [id, name, roll, section, room],
                      index
                    ) => (
                      <tr key={id}>
                        <td>{id}</td>
                        <td>{name}</td>
                        <td>{roll}</td>
                        <td>{section}</td>
                        <td>{room}</td>
                        <td>
                          {String(index + 1).padStart(
                            2,
                            "0"
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      </Panel>
    </Page>
  );
}

/* =========================================================
   SEAT PLAN REPORT
========================================================= */

export function SeatPlanReportPage() {
  const [form, setForm] = useState({
    session: "2026",
    exam: "",
    shift: "",
    className: "",
    section: "",
    group: "",
  });

  const [searched, setSearched] = useState(false);

  return (
    <Page>
      <Panel title="Exam Seat Plan Report">
        <SeatPlanSearchForm
          form={form}
          setForm={setForm}
          onSearch={() => setSearched(true)}
        />

        <div className="mt-4 rounded bg-base-200 p-5">
          <div className="min-h-16 rounded bg-base-100 shadow-sm">
            {searched && (
              <div className="overflow-x-auto p-4">
                <div className="mb-4 text-center">
                  <h3 className="text-lg font-black">
                    EXPERT COACHING CENTER
                  </h3>

                  <p className="text-sm">
                    Exam Seat Plan Report
                  </p>

                  <p className="text-xs text-base-content/60">
                    {form.exam || "Selected Exam"} •{" "}
                    {form.className ||
                      "Selected Class"}
                  </p>
                </div>

                <table className="table table-zebra table-sm">
                  <thead>
                    <tr>
                      <th>SL</th>
                      <th>Student ID</th>
                      <th>Name</th>
                      <th>Roll</th>
                      <th>Section</th>
                      <th>Room</th>
                      <th>Seat No.</th>
                    </tr>
                  </thead>

                  <tbody>
                    {seatStudents.map(
                      (
                        [
                          id,
                          name,
                          roll,
                          section,
                          room,
                        ],
                        index
                      ) => (
                        <tr key={id}>
                          <td>{index + 1}</td>
                          <td>{id}</td>
                          <td>{name}</td>
                          <td>{roll}</td>
                          <td>{section}</td>
                          <td>{room}</td>
                          <td>
                            {String(
                              index + 1
                            ).padStart(2, "0")}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </Panel>
    </Page>
  );
}

/* =========================================================
   TEACHER EXAM SUBJECT ASSIGN
========================================================= */

function AssignmentModal({
  open,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState({
    session: "2026",
    exam: "",
    shift: "",
    className: "",
    section: "",
    group: "",
    teacher: "",
    subject: "",
  });

  const submit = (e) => {
    e.preventDefault();

    if (
      !form.exam ||
      !form.className ||
      !form.teacher ||
      !form.subject
    ) {
      alert(
        "Exam, Class, Teacher and Subject are required."
      );
      return;
    }

    onSave(form);
  };

  return (
    <Modal
      open={open}
      title="Create Teacher Exam Subject"
      onClose={onClose}
    >
      <form
        onSubmit={submit}
        className="grid gap-4 p-6 sm:grid-cols-2"
      >
        {[
          [
            "Session",
            "session",
            sessions,
            null,
          ],
          [
            "Exam *",
            "exam",
            [
              "PRE MODEL TEST 02 SSC 2027",
              ...demoExams.map((x) => x.examName),
            ],
            "Select Exam",
          ],
          [
            "School Shift",
            "shift",
            shifts,
            "Select Shift",
          ],
          [
            "Class *",
            "className",
            classes,
            "Select Class",
          ],
          [
            "Section",
            "section",
            sections,
            "Select Section",
          ],
          [
            "Group",
            "group",
            groups,
            "Select Group",
          ],
          [
            "Teacher *",
            "teacher",
            teachers,
            "Select Teacher",
          ],
          [
            "Subject *",
            "subject",
            subjects,
            "Select Subject",
          ],
        ].map(
          ([
            label,
            key,
            options,
            placeholder,
          ]) => (
            <label
              key={key}
              className="form-control"
            >
              <span className="mb-1 text-sm font-bold">
                {label}
              </span>

              <Select
                value={form[key]}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    [key]: e.target.value,
                  }))
                }
                options={options}
                placeholder={placeholder}
              />
            </label>
          )
        )}

        <div className="sm:col-span-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="btn btn-success btn-sm text-white"
          >
            Create Assignment
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function TeacherExamSubjectAssignPage() {
  const [assignments, setAssignments] = useState(() =>
    loadStorage(
      ASSIGNMENT_STORAGE_KEY,
      demoAssignments
    )
  );

  const [filters, setFilters] = useState({
    session: "2026",
    exam: "",
    shift: "",
    className: "",
    section: "",
    group: "",
    teacher: "",
  });

  const [appliedFilters, setAppliedFilters] =
    useState({
      session: "",
      exam: "",
      shift: "",
      className: "",
      section: "",
      group: "",
      teacher: "",
    });

  const [selected, setSelected] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = useMemo(() => {
    return assignments.filter((row) => {
      for (const key of Object.keys(appliedFilters)) {
        if (
          appliedFilters[key] &&
          row[key] !== appliedFilters[key]
        ) {
          return false;
        }
      }

      return true;
    });
  }, [assignments, appliedFilters]);

  const toggleSelected = (id) => {
    setSelected((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  const deleteSelected = () => {
    if (!selected.length) {
      alert("Select at least one item.");
      return;
    }

    if (
      !window.confirm(
        "Delete selected teacher exam subject assignments?"
      )
    )
      return;

    const updated = assignments.filter(
      (row) => !selected.includes(row.id)
    );

    setAssignments(updated);
    saveStorage(
      ASSIGNMENT_STORAGE_KEY,
      updated
    );
    setSelected([]);
  };

  const createAssignment = (form) => {
    const updated = [
      ...assignments,
      {
        ...form,
        id: uid("ASG"),
        createdBy: "Expert Coaching Center",
        createdDate: now(),
      },
    ];

    setAssignments(updated);
    saveStorage(
      ASSIGNMENT_STORAGE_KEY,
      updated
    );
    setModalOpen(false);
  };

  return (
    <Page>
      <Panel title="Teacher Exam Subject Search">
        <div className="space-y-5">
          <RequiredAlert />

          <div className="mx-auto grid max-w-6xl gap-x-8 gap-y-4 lg:grid-cols-2">
            <Field
              label="Session Year:"
              required
            >
              <Select
                value={filters.session}
                onChange={(e) =>
                  setFilters((p) => ({
                    ...p,
                    session: e.target.value,
                  }))
                }
                options={sessions}
              />
            </Field>

            <div />

            <Field label="Exam:" required>
              <Select
                value={filters.exam}
                onChange={(e) =>
                  setFilters((p) => ({
                    ...p,
                    exam: e.target.value,
                  }))
                }
                options={[
                  "PRE MODEL TEST 02 SSC 2027",
                  ...demoExams.map(
                    (x) => x.examName
                  ),
                ]}
                placeholder="Select Exam"
              />
            </Field>

            <Field
              label="School Shift:"
              required
            >
              <Select
                value={filters.shift}
                onChange={(e) =>
                  setFilters((p) => ({
                    ...p,
                    shift: e.target.value,
                  }))
                }
                options={shifts}
                placeholder="Select Shift"
              />
            </Field>

            <Field label="Class:" required>
              <Select
                value={filters.className}
                onChange={(e) =>
                  setFilters((p) => ({
                    ...p,
                    className:
                      e.target.value,
                  }))
                }
                options={classes}
                placeholder="Select class"
              />
            </Field>

            <Field
              label="Section:"
              required
            >
              <Select
                value={filters.section}
                onChange={(e) =>
                  setFilters((p) => ({
                    ...p,
                    section: e.target.value,
                  }))
                }
                options={sections}
                placeholder="Select Section"
              />
            </Field>

            <Field label="Group:" required>
              <Select
                value={filters.group}
                onChange={(e) =>
                  setFilters((p) => ({
                    ...p,
                    group: e.target.value,
                  }))
                }
                options={groups}
                placeholder="Select Group"
              />
            </Field>

            <Field label="By Teacher:">
              <Select
                value={filters.teacher}
                onChange={(e) =>
                  setFilters((p) => ({
                    ...p,
                    teacher: e.target.value,
                  }))
                }
                options={teachers}
                placeholder="Select Teacher"
              />
            </Field>
          </div>

          <div className="mx-auto max-w-6xl pl-0 lg:pl-[170px]">
            <CyanButton
              type="button"
              onClick={() =>
                setAppliedFilters({
                  ...filters,
                })
              }
            >
              <Search size={15} />
              Search
            </CyanButton>
          </div>
        </div>
      </Panel>

      <Panel
        title="Teacher Exam Subject Assign"
        action={
          <CyanButton
            type="button"
            onClick={() => setModalOpen(true)}
          >
            <Plus size={15} />
            Create Teacher exam subject
          </CyanButton>
        }
      >
        <button
          type="button"
          onClick={deleteSelected}
          className="btn btn-error btn-sm mb-4 text-white"
        >
          Delete Selected Items
        </button>

        <div className="overflow-x-auto">
          <table className="table table-zebra table-sm min-w-[1100px]">
            <thead>
              <tr className="bg-base-200">
                <th>
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={
                      filtered.length > 0 &&
                      filtered.every((row) =>
                        selected.includes(row.id)
                      )
                    }
                    onChange={(e) =>
                      setSelected(
                        e.target.checked
                          ? filtered.map(
                              (row) => row.id
                            )
                          : []
                      )
                    }
                  />
                </th>
                <th>#</th>
                <th>Teacher Name</th>
                <th>Exam Name</th>
                <th>Class</th>
                <th>Section</th>
                <th>Subject</th>
                <th>Created By</th>
                <th>Created Date</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((row, index) => (
                <tr key={row.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.includes(
                        row.id
                      )}
                      onChange={() =>
                        toggleSelected(row.id)
                      }
                      className="checkbox checkbox-sm"
                    />
                  </td>

                  <td>{index + 1}</td>
                  <td>{row.teacher}</td>
                  <td>{row.exam}</td>
                  <td>{row.className}</td>
                  <td>{row.section}</td>
                  <td>{row.subject}</td>
                  <td>{row.createdBy}</td>
                  <td>{row.createdDate}</td>

                  <td>
                    <button
                      type="button"
                      onClick={() => {
                        const updated =
                          assignments.filter(
                            (item) =>
                              item.id !== row.id
                          );

                        setAssignments(updated);
                        saveStorage(
                          ASSIGNMENT_STORAGE_KEY,
                          updated
                        );
                      }}
                      className="btn btn-error btn-square btn-sm text-white"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}

              {!filtered.length && (
                <tr>
                  <td
                    colSpan={10}
                    className="py-8 text-center text-base-content/50"
                  >
                    No teacher exam subject
                    assignment found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <AssignmentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={createAssignment}
      />
    </Page>
  );
}
