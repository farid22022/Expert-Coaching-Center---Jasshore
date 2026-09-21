import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Copy,
  Download,
  Edit3,
  FileSpreadsheet,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { ExaminationNav } from "../examinationShared.jsx";

/* =========================================================
   STORAGE
========================================================= */

const STORAGE_KEY = "expertExaminationMarkConfigure";

/* =========================================================
   OPTIONS
========================================================= */

const sessions = ["2026", "2025", "2024"];

const shifts = [
  "Morning",
  "Day",
  "Evening",
  "All Shift",
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

const exams = [
  "PRE MODEL TEST 02 SSC 2027",
  "PRE MODEL TEST 01 SSC 2027",
  "MODEL 01 SSC 2027",
  "Assessment Test Aug Sep",
  "Half Yearly Examination",
  "Annual Examination",
];

const subjects = [
  "Bangla 1st paper",
  "Bangla 2nd paper",
  "English 1st paper",
  "English 2nd paper",
  "Mathematics",
  "ICT",
  "Physics",
  "Chemistry",
  "Biology",
  "Science",
  "Economics",
  "Business studies",
  "History",
  "BGS",
  "Accounting",
  "Finance & Banking",
];

/* =========================================================
   DEMO DATA
========================================================= */

const demoSubjects = [
  ["Bangla 2nd paper", "MCQ,WR", "10,10", 60],
  ["ICT", "MCQ", "20", 60],
  ["English 2nd paper", "WR", "20", 60],
  ["English 1st paper", "WR", "20", 60],
  ["Economics", "CQ,MCQ", "10,10", 60],
  ["Chemistry", "CQ,MCQ", "10,10", 60],
  ["Physics", "CQ,MCQ", "10,10", 60],
  ["Science", "CQ,MCQ", "10,10", 60],
  ["Business studies", "CQ,MCQ", "10,10", 60],
  ["History", "CQ,MCQ", "10,10", 60],
  ["BGS", "CQ,MCQ", "10,10", 60],
];

const initialRows = demoSubjects.map(
  ([subject, shortCode, passMark, totalMark], index) => ({
    id: `MARK-${index + 1}`,
    session: "2026",
    shift: "All Shift",
    exam: "PRE MODEL TEST 02 SSC 2027",
    className: "Class 10",
    subject,
    shortCode,
    passMark,
    totalMark,
    globalPassMark: 0,
    createdBy: "Expert Coaching Center",
    createdDate:
      index === 0
        ? "2026-09-03 12:35:50"
        : index === 1
          ? "2026-09-03 12:35:12"
          : "2026-09-03 12:34:12",
  })
);

/* =========================================================
   HELPERS
========================================================= */

function generateId() {
  if (
    typeof crypto !== "undefined" &&
    crypto.randomUUID
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()}`;
}

function loadRows() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    return stored ? JSON.parse(stored) : initialRows;
  } catch {
    return initialRows;
  }
}

function saveRows(rows) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

function getCurrentDateTime() {
  return new Date()
    .toISOString()
    .replace("T", " ")
    .slice(0, 19);
}

/* =========================================================
   SHARED LAYOUT
========================================================= */

function AnimatedPage({ children }) {
  return (
    <div className="space-y-5">
      <ExaminationNav />

      <motion.div
        initial={{
          opacity: 0,
          y: 12,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.35,
        }}
        className="space-y-7"
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
    <section
      className="
        overflow-hidden
        rounded-md
        border
        border-base-300
        bg-base-100
        shadow-sm
      "
    >
      <header
        className="
          flex
          min-h-10
          items-center
          justify-between
          gap-3
          bg-[#456db5]
          px-5
          py-2
          text-white
        "
      >
        <h2 className="text-base font-bold sm:text-lg">
          {title}
        </h2>

        {action}
      </header>

      <div className={bodyClassName}>
        {children}
      </div>
    </section>
  );
}

function RequiredAlert() {
  return (
    <div
      className="
        rounded-md
        border
        border-warning/30
        bg-warning/15
        px-5
        py-4
        text-sm
        font-bold
        text-error
      "
    >
      (*) field required
    </div>
  );
}

function Field({
  label,
  required = false,
  children,
}) {
  return (
    <label
      className="
        grid
        gap-2
        md:grid-cols-[160px_minmax(0,1fr)]
        md:items-center
      "
    >
      <span className="text-sm font-semibold">
        {label}

        {required && (
          <span className="text-error">*</span>
        )}
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
      className="
        select
        select-bordered
        select-sm
        w-full
        bg-base-100
      "
    >
      {placeholder && (
        <option value="">
          {placeholder}
        </option>
      )}

      {options.map((option) => (
        <option
          key={option}
          value={option}
        >
          {option}
        </option>
      ))}
    </select>
  );
}

function SearchButton({
  onClick,
  color = "cyan",
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.035 }}
      whileTap={{ scale: 0.97 }}
      type="button"
      onClick={onClick}
      className={
        color === "green"
          ? "btn btn-success btn-sm text-white"
          : "btn btn-sm border-0 bg-cyan-600 text-white hover:bg-cyan-700"
      }
    >
      <Search size={15} />
      Search
    </motion.button>
  );
}

/* =========================================================
   EXCEL HELPERS
========================================================= */

function downloadExcelTemplate({
  session,
  exam,
  className,
  subject,
}) {
  const rows = [
    [
      "Session",
      "Exam",
      "Class",
      "Subject",
      "Short Code",
      "Pass Mark",
      "Total Mark",
      "Global Pass Mark",
    ],
    [
      session || "2026",
      exam || "Select Exam",
      className || "Select Class",
      subject || "Select Subject",
      "CQ,MCQ",
      "10,10",
      "100",
      "0",
    ],
  ];

  /*
    Tab-separated .xls-style file.
    Excel can open it without needing an extra npm library.
  */
  const content = rows
    .map((row) => row.join("\t"))
    .join("\n");

  const blob = new Blob([content], {
    type: "application/vnd.ms-excel;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download =
    "mark-configure-template.xls";

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

/* =========================================================
   1. MARKS DISTRIBUTION EXCEL ENTRY
========================================================= */

export function MarksDistributionExcelEntry() {
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    session: "2026",
    exam: "",
    className: "",
    subject: "",
  });

  const [uploadedFile, setUploadedFile] =
    useState(null);

  const [success, setSuccess] =
    useState("");

  const change = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));

    setSuccess("");
  };

  const handleUpload = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !form.session ||
      !form.exam ||
      !form.className ||
      !form.subject
    ) {
      alert(
        "Select Session Year, Exam, Class and Subject before uploading."
      );

      event.target.value = "";
      return;
    }

    setUploadedFile(file);

    setSuccess(
      `${file.name} selected successfully for ${form.subject}.`
    );
  };

  return (
    <AnimatedPage>
      <Panel
        title="Mark Configure Excel Entry"
        action={
          <button
            type="button"
            onClick={() =>
              window.history.back()
            }
            className="
              btn
              btn-sm
              border-0
              bg-cyan-500
              text-white
              hover:bg-cyan-600
            "
          >
            Back to Mark type List
          </button>
        }
      >
        <div className="space-y-8">
          <RequiredAlert />

          <div
            className="
              mx-auto
              grid
              max-w-6xl
              gap-x-8
              gap-y-5
              lg:grid-cols-2
            "
          >
            <Field
              label="Session Year:"
              required
            >
              <Select
                value={form.session}
                onChange={(event) =>
                  change(
                    "session",
                    event.target.value
                  )
                }
                options={sessions}
              />
            </Field>

            <Field
              label="Exam:"
              required
            >
              <Select
                value={form.exam}
                onChange={(event) =>
                  change(
                    "exam",
                    event.target.value
                  )
                }
                options={exams}
                placeholder="Select Exam"
              />
            </Field>

            <Field
              label="Class:"
              required
            >
              <Select
                value={form.className}
                onChange={(event) =>
                  change(
                    "className",
                    event.target.value
                  )
                }
                options={classes}
                placeholder="Select Class"
              />
            </Field>

            <Field
              label="Subject:"
              required
            >
              <Select
                value={form.subject}
                onChange={(event) =>
                  change(
                    "subject",
                    event.target.value
                  )
                }
                options={subjects}
                placeholder="Select Subject"
              />
            </Field>

            {/* UPLOAD */}

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleUpload}
                className="hidden"
              />

              <motion.button
                whileHover={{
                  scale: 1.01,
                }}
                whileTap={{
                  scale: 0.99,
                }}
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="
                  btn
                  btn-sm
                  w-full
                  border-0
                  bg-slate-600
                  text-white
                  hover:bg-slate-700
                "
              >
                <Upload size={15} />

                Upload Excel Format
              </motion.button>

              <div className="h-4 rounded-b bg-base-200" />

              {uploadedFile && (
                <div className="mt-2 text-xs text-base-content/60">
                  Selected:{" "}
                  <strong>
                    {uploadedFile.name}
                  </strong>
                </div>
              )}
            </div>

            {/* DOWNLOAD */}

            <motion.button
              whileHover={{
                scale: 1.01,
              }}
              whileTap={{
                scale: 0.99,
              }}
              type="button"
              onClick={() =>
                downloadExcelTemplate(
                  form
                )
              }
              className="
                btn
                btn-sm
                border-0
                bg-violet-600
                text-white
                hover:bg-violet-700
              "
            >
              <Download size={15} />

              Download Excel Format
            </motion.button>
          </div>

          <AnimatePresence>
            {success && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -5,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                }}
                className="
                  mx-auto
                  flex
                  max-w-6xl
                  items-center
                  gap-2
                  rounded-md
                  bg-success/10
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  text-success
                "
              >
                <CheckCircle2 size={17} />

                {success}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Panel>
    </AnimatedPage>
  );
}

/* =========================================================
   2. MANAGE MARKS DISTRIBUTION
========================================================= */

export function ManageMarksDistribution() {
  const [rows, setRows] =
    useState(loadRows);

  const [filters, setFilters] =
    useState({
      session: "2026",
      exam: "",
      className: "",
    });

  const [searched, setSearched] =
    useState(false);

  const changeFilter = (
    key,
    value
  ) => {
    setFilters((previous) => ({
      ...previous,
      [key]: value,
    }));

    setSearched(false);
  };

  const results = useMemo(() => {
    if (!searched) {
      return [];
    }

    return rows.filter((row) => {
      if (
        filters.session &&
        row.session !==
          filters.session
      ) {
        return false;
      }

      if (
        filters.exam &&
        row.exam !== filters.exam
      ) {
        return false;
      }

      if (
        filters.className &&
        row.className !==
          filters.className
      ) {
        return false;
      }

      return true;
    });
  }, [rows, filters, searched]);

  const updateRow = (
    id,
    field,
    value
  ) => {
    setRows((previous) =>
      previous.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]: value,
            }
          : row
      )
    );
  };

  const save = () => {
    saveRows(rows);

    alert(
      "Mark configuration updated successfully."
    );
  };

  return (
    <AnimatedPage>
      <Panel
        title="Manage Mark Configure"
        action={
          <button
            type="button"
            onClick={() =>
              window.history.back()
            }
            className="
              btn
              btn-sm
              border-0
              bg-cyan-500
              text-white
              hover:bg-cyan-600
            "
          >
            Back to Mark type List
          </button>
        }
      >
        <div className="space-y-8">
          <RequiredAlert />

          <div
            className="
              mx-auto
              grid
              max-w-6xl
              gap-x-8
              gap-y-5
              lg:grid-cols-2
            "
          >
            <Field
              label="Session Year:"
              required
            >
              <Select
                value={filters.session}
                onChange={(event) =>
                  changeFilter(
                    "session",
                    event.target.value
                  )
                }
                options={sessions}
              />
            </Field>

            <Field
              label="Exam:"
              required
            >
              <Select
                value={filters.exam}
                onChange={(event) =>
                  changeFilter(
                    "exam",
                    event.target.value
                  )
                }
                options={exams}
                placeholder="Select Exam"
              />
            </Field>

            <Field
              label="Class:"
              required
            >
              <Select
                value={
                  filters.className
                }
                onChange={(event) =>
                  changeFilter(
                    "className",
                    event.target.value
                  )
                }
                options={classes}
                placeholder="Select Class"
              />
            </Field>
          </div>

          <div className="flex justify-center">
            <SearchButton
              color="green"
              onClick={() => {
                if (
                  !filters.exam ||
                  !filters.className
                ) {
                  alert(
                    "Please select Exam and Class."
                  );

                  return;
                }

                setSearched(true);
              }}
            />
          </div>

          {/* RESULTS */}

          <AnimatePresence>
            {searched && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="space-y-4"
              >
                <div className="overflow-x-auto">
                  <table className="table table-zebra table-sm min-w-[1050px]">
                    <thead>
                      <tr className="bg-base-200">
                        <th>Subject</th>
                        <th>
                          Short Code
                        </th>
                        <th>
                          Pass Mark
                        </th>
                        <th>
                          Total Mark
                        </th>
                        <th>
                          Global Pass Mark
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {results.map(
                        (row) => (
                          <tr key={row.id}>
                            <td className="font-medium">
                              {
                                row.subject
                              }
                            </td>

                            <td>
                              <input
                                value={
                                  row.shortCode
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateRow(
                                    row.id,
                                    "shortCode",
                                    event
                                      .target
                                      .value
                                  )
                                }
                                className="input input-bordered input-sm min-w-32"
                              />
                            </td>

                            <td>
                              <input
                                value={
                                  row.passMark
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateRow(
                                    row.id,
                                    "passMark",
                                    event
                                      .target
                                      .value
                                  )
                                }
                                className="input input-bordered input-sm min-w-28"
                              />
                            </td>

                            <td>
                              <input
                                type="number"
                                value={
                                  row.totalMark
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateRow(
                                    row.id,
                                    "totalMark",
                                    event
                                      .target
                                      .value
                                  )
                                }
                                className="input input-bordered input-sm w-28"
                              />
                            </td>

                            <td>
                              <input
                                type="number"
                                value={
                                  row.globalPassMark
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateRow(
                                    row.id,
                                    "globalPassMark",
                                    event
                                      .target
                                      .value
                                  )
                                }
                                className="input input-bordered input-sm w-28"
                              />
                            </td>
                          </tr>
                        )
                      )}

                      {!results.length && (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-8 text-center text-base-content/50"
                          >
                            No mark
                            configuration
                            found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {!!results.length && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={save}
                      className="btn btn-success btn-sm text-white"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Panel>
    </AnimatedPage>
  );
}

/* =========================================================
   CREATE / EDIT MODAL
========================================================= */

const emptyMark = {
  session: "2026",
  shift: "All Shift",
  exam: "",
  className: "",
  subject: "",
  shortCode: "",
  passMark: "",
  totalMark: 100,
  globalPassMark: 0,
};

function MarkModal({
  open,
  editing,
  onClose,
  onSave,
}) {
  const [form, setForm] =
    useState(
      editing
        ? { ...editing }
        : { ...emptyMark }
    );

  const change = (
    key,
    value
  ) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const submit = (event) => {
    event.preventDefault();

    if (
      !form.exam ||
      !form.className ||
      !form.subject ||
      !form.shortCode
    ) {
      alert(
        "Exam, Class, Subject and Short Code are required."
      );

      return;
    }

    onSave(form);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="
            fixed
            inset-0
            z-[300]
            grid
            place-items-center
            overflow-y-auto
            bg-black/50
            p-4
            backdrop-blur-sm
          "
        >
          <motion.form
            onSubmit={submit}
            initial={{
              opacity: 0,
              scale: 0.96,
              y: 20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.96,
            }}
            className="
              w-full
              max-w-3xl
              overflow-hidden
              rounded-lg
              bg-base-100
              shadow-2xl
            "
          >
            <header
              className="
                flex
                items-center
                justify-between
                bg-[#456db5]
                px-5
                py-3
                text-white
              "
            >
              <h3 className="text-lg font-bold">
                {editing
                  ? "Update Mark Configure"
                  : "Create Mark type"}
              </h3>

              <button
                type="button"
                onClick={onClose}
                className="btn btn-circle btn-ghost btn-sm text-white"
              >
                <X size={18} />
              </button>
            </header>

            <div className="grid gap-4 p-6 sm:grid-cols-2">
              <label className="form-control">
                <span className="mb-1 text-sm font-bold">
                  Session
                </span>

                <Select
                  value={form.session}
                  onChange={(event) =>
                    change(
                      "session",
                      event.target.value
                    )
                  }
                  options={sessions}
                />
              </label>

              <label className="form-control">
                <span className="mb-1 text-sm font-bold">
                  Shift
                </span>

                <Select
                  value={form.shift}
                  onChange={(event) =>
                    change(
                      "shift",
                      event.target.value
                    )
                  }
                  options={shifts}
                />
              </label>

              <label className="form-control">
                <span className="mb-1 text-sm font-bold">
                  Exam *
                </span>

                <Select
                  value={form.exam}
                  onChange={(event) =>
                    change(
                      "exam",
                      event.target.value
                    )
                  }
                  options={exams}
                  placeholder="Select Exam"
                />
              </label>

              <label className="form-control">
                <span className="mb-1 text-sm font-bold">
                  Class *
                </span>

                <Select
                  value={
                    form.className
                  }
                  onChange={(event) =>
                    change(
                      "className",
                      event.target.value
                    )
                  }
                  options={classes}
                  placeholder="Select Class"
                />
              </label>

              <label className="form-control">
                <span className="mb-1 text-sm font-bold">
                  Subject *
                </span>

                <Select
                  value={form.subject}
                  onChange={(event) =>
                    change(
                      "subject",
                      event.target.value
                    )
                  }
                  options={subjects}
                  placeholder="Select Subject"
                />
              </label>

              <label className="form-control">
                <span className="mb-1 text-sm font-bold">
                  Short Code *
                </span>

                <input
                  value={
                    form.shortCode
                  }
                  onChange={(event) =>
                    change(
                      "shortCode",
                      event.target.value
                    )
                  }
                  placeholder="CQ,MCQ"
                  className="input input-bordered input-sm"
                />
              </label>

              <label className="form-control">
                <span className="mb-1 text-sm font-bold">
                  Pass Mark
                </span>

                <input
                  value={
                    form.passMark
                  }
                  onChange={(event) =>
                    change(
                      "passMark",
                      event.target.value
                    )
                  }
                  placeholder="10,10"
                  className="input input-bordered input-sm"
                />
              </label>

              <label className="form-control">
                <span className="mb-1 text-sm font-bold">
                  Total Mark
                </span>

                <input
                  type="number"
                  value={
                    form.totalMark
                  }
                  onChange={(event) =>
                    change(
                      "totalMark",
                      event.target.value
                    )
                  }
                  className="input input-bordered input-sm"
                />
              </label>

              <label className="form-control">
                <span className="mb-1 text-sm font-bold">
                  Global Pass Mark
                </span>

                <input
                  type="number"
                  value={
                    form.globalPassMark
                  }
                  onChange={(event) =>
                    change(
                      "globalPassMark",
                      event.target.value
                    )
                  }
                  className="input input-bordered input-sm"
                />
              </label>
            </div>

            <footer
              className="
                flex
                justify-end
                gap-2
                border-t
                border-base-300
                px-6
                py-4
              "
            >
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
                {editing
                  ? "Update"
                  : "Create"}
              </button>
            </footer>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* =========================================================
   COPY MODAL
========================================================= */

function CopyModal({
  open,
  sourceRows,
  onClose,
  onCopy,
}) {
  const [target, setTarget] =
    useState({
      session: "2026",
      exam: "",
      className: "",
    });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="
            fixed
            inset-0
            z-[300]
            grid
            place-items-center
            bg-black/50
            p-4
            backdrop-blur-sm
          "
        >
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="
              w-full
              max-w-xl
              overflow-hidden
              rounded-lg
              bg-base-100
              shadow-2xl
            "
          >
            <header
              className="
                flex
                items-center
                justify-between
                bg-[#456db5]
                px-5
                py-3
                text-white
              "
            >
              <h3 className="font-bold">
                Mark Distribution Copy
              </h3>

              <button
                type="button"
                onClick={onClose}
                className="btn btn-circle btn-ghost btn-sm text-white"
              >
                <X size={18} />
              </button>
            </header>

            <div className="space-y-4 p-6">
              <div className="alert">
                <Copy size={18} />

                <span>
                  {sourceRows.length}{" "}
                  configuration row(s)
                  will be copied.
                </span>
              </div>

              <label className="form-control">
                <span className="mb-1 text-sm font-bold">
                  Target Session
                </span>

                <Select
                  value={target.session}
                  onChange={(event) =>
                    setTarget(
                      (previous) => ({
                        ...previous,
                        session:
                          event.target
                            .value,
                      })
                    )
                  }
                  options={sessions}
                />
              </label>

              <label className="form-control">
                <span className="mb-1 text-sm font-bold">
                  Target Exam
                </span>

                <Select
                  value={target.exam}
                  onChange={(event) =>
                    setTarget(
                      (previous) => ({
                        ...previous,
                        exam:
                          event.target
                            .value,
                      })
                    )
                  }
                  options={exams}
                  placeholder="Select Exam"
                />
              </label>

              <label className="form-control">
                <span className="mb-1 text-sm font-bold">
                  Target Class
                </span>

                <Select
                  value={
                    target.className
                  }
                  onChange={(event) =>
                    setTarget(
                      (previous) => ({
                        ...previous,
                        className:
                          event.target
                            .value,
                      })
                    )
                  }
                  options={classes}
                  placeholder="Select Class"
                />
              </label>
            </div>

            <footer
              className="
                flex
                justify-end
                gap-2
                border-t
                border-base-300
                p-4
              "
            >
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost btn-sm"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() =>
                  onCopy(target)
                }
                className="btn btn-success btn-sm text-white"
              >
                <Copy size={15} />

                Copy Distribution
              </button>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* =========================================================
   3. MARKS DISTRIBUTION LIST
========================================================= */

export function MarksDistribution() {
  const [rows, setRows] =
    useState(loadRows);

  const [filters, setFilters] =
    useState({
      session: "2026",
      shift: "",
      exam: "",
      className: "",
    });

  const [
    appliedFilters,
    setAppliedFilters,
  ] = useState({
    session: "",
    shift: "",
    exam: "",
    className: "",
  });

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [
    editingRow,
    setEditingRow,
  ] = useState(null);

  const [
    copyOpen,
    setCopyOpen,
  ] = useState(false);

  const filteredRows =
    useMemo(() => {
      return rows.filter((row) => {
        if (
          appliedFilters.session &&
          row.session !==
            appliedFilters.session
        ) {
          return false;
        }

        if (
          appliedFilters.shift &&
          row.shift !==
            appliedFilters.shift
        ) {
          return false;
        }

        if (
          appliedFilters.exam &&
          row.exam !==
            appliedFilters.exam
        ) {
          return false;
        }

        if (
          appliedFilters.className &&
          row.className !==
            appliedFilters.className
        ) {
          return false;
        }

        return true;
      });
    }, [rows, appliedFilters]);

  const changeFilter = (
    key,
    value
  ) => {
    setFilters((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const openCreate = () => {
    setEditingRow(null);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingRow(row);
    setModalOpen(true);
  };

  const saveMark = (form) => {
    let updated;

    if (editingRow) {
      updated = rows.map((row) =>
        row.id === editingRow.id
          ? {
              ...row,
              ...form,
            }
          : row
      );
    } else {
      updated = [
        ...rows,
        {
          ...form,
          id: generateId(),
          createdBy:
            "Expert Coaching Center",
          createdDate:
            getCurrentDateTime(),
        },
      ];
    }

    setRows(updated);
    saveRows(updated);

    setModalOpen(false);
    setEditingRow(null);
  };

  const deleteRow = (id) => {
    if (
      !window.confirm(
        "Delete this mark configuration?"
      )
    ) {
      return;
    }

    const updated =
      rows.filter(
        (row) => row.id !== id
      );

    setRows(updated);
    saveRows(updated);
  };

  const copyDistribution = (
    target
  ) => {
    if (
      !target.exam ||
      !target.className
    ) {
      alert(
        "Select target Exam and Class."
      );

      return;
    }

    if (!filteredRows.length) {
      alert(
        "No source rows available to copy."
      );

      return;
    }

    const existing =
      new Set(
        rows.map(
          (row) =>
            `${row.session}|${row.exam}|${row.className}|${row.subject}`
        )
      );

    const copied =
      filteredRows
        .filter(
          (row) =>
            !existing.has(
              `${target.session}|${target.exam}|${target.className}|${row.subject}`
            )
        )
        .map((row) => ({
          ...row,
          id: generateId(),
          session:
            target.session,
          exam: target.exam,
          className:
            target.className,
          createdDate:
            getCurrentDateTime(),
        }));

    if (!copied.length) {
      alert(
        "The selected target already contains these subjects."
      );

      return;
    }

    const updated = [
      ...rows,
      ...copied,
    ];

    setRows(updated);
    saveRows(updated);

    setCopyOpen(false);

    alert(
      `${copied.length} mark configuration row(s) copied successfully.`
    );
  };

  return (
    <AnimatedPage>
      {/* SEARCH */}

      <Panel title="Mark Configure Search">
        <div
          className="
            mx-auto
            grid
            max-w-6xl
            gap-x-8
            gap-y-4
            lg:grid-cols-2
          "
        >
          <Field label="Session Year:">
            <Select
              value={filters.session}
              onChange={(event) =>
                changeFilter(
                  "session",
                  event.target.value
                )
              }
              options={sessions}
            />
          </Field>

          <Field label="Exam:">
            <Select
              value={filters.exam}
              onChange={(event) =>
                changeFilter(
                  "exam",
                  event.target.value
                )
              }
              options={exams}
              placeholder="Select Exam"
            />
          </Field>

          <Field label="School Shift:">
            <Select
              value={filters.shift}
              onChange={(event) =>
                changeFilter(
                  "shift",
                  event.target.value
                )
              }
              options={shifts}
              placeholder="Select Shift"
            />
          </Field>

          <Field label="Class:">
            <Select
              value={
                filters.className
              }
              onChange={(event) =>
                changeFilter(
                  "className",
                  event.target.value
                )
              }
              options={classes}
              placeholder="Select class"
            />
          </Field>
        </div>

        <div className="mt-5 flex justify-center lg:justify-start lg:pl-[290px]">
          <SearchButton
            onClick={() =>
              setAppliedFilters({
                ...filters,
              })
            }
          />
        </div>
      </Panel>

      {/* LIST */}

      <Panel
        title="Mark Configure List"
        action={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                setCopyOpen(true)
              }
              className="btn btn-success btn-sm text-white"
            >
              <Copy size={15} />

              Mark Distribution Copy
            </button>

            <button
              type="button"
              onClick={openCreate}
              className="
                btn
                btn-sm
                border-0
                bg-cyan-500
                text-white
                hover:bg-cyan-600
              "
            >
              <Plus size={15} />

              Create Mark type
            </button>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="table table-zebra table-sm min-w-[1400px]">
            <thead>
              <tr className="bg-base-200">
                <th>#</th>
                <th>Session</th>
                <th>Exam</th>
                <th>Class</th>
                <th>Subject</th>
                <th>
                  Short Code
                </th>
                <th>
                  Pass Mark
                </th>
                <th>
                  Total Mark
                </th>
                <th>
                  Global Pass Mark
                </th>
                <th>
                  Created By
                </th>
                <th>
                  Created Date
                </th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              <AnimatePresence>
                {filteredRows.map(
                  (row, index) => (
                    <motion.tr
                      key={row.id}
                      initial={{
                        opacity: 0,
                        y: 5,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        x: -10,
                      }}
                    >
                      <td>
                        {index + 1}
                      </td>

                      <td>
                        {row.session}
                      </td>

                      <td className="whitespace-nowrap">
                        {row.exam}
                      </td>

                      <td>
                        {row.className}
                      </td>

                      <td>
                        {row.subject}
                      </td>

                      <td>
                        {row.shortCode}
                      </td>

                      <td>
                        {row.passMark}
                      </td>

                      <td>
                        {row.totalMark}
                      </td>

                      <td>
                        {
                          row.globalPassMark
                        }
                      </td>

                      <td>
                        {row.createdBy}
                      </td>

                      <td className="whitespace-nowrap">
                        {
                          row.createdDate
                        }
                      </td>

                      <td>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              openEdit(row)
                            }
                            className="
                              btn
                              btn-square
                              btn-sm
                              border-0
                              bg-cyan-500
                              text-white
                              hover:bg-cyan-600
                            "
                          >
                            <Edit3
                              size={15}
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteRow(
                                row.id
                              )
                            }
                            className="btn btn-error btn-square btn-sm text-white"
                          >
                            <Trash2
                              size={15}
                            />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                )}
              </AnimatePresence>

              {!filteredRows.length && (
                <tr>
                  <td
                    colSpan={12}
                    className="py-10 text-center text-base-content/50"
                  >
                    No mark
                    configuration
                    found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-5 text-sm font-bold">
          Showing{" "}
          {filteredRows.length
            ? 1
            : 0}{" "}
          to {filteredRows.length} of{" "}
          {filteredRows.length} results.
        </div>
      </Panel>

      {/* CREATE / EDIT */}

      {modalOpen && (
        <MarkModal
          key={
            editingRow?.id ||
            "create-mark"
          }
          open={modalOpen}
          editing={editingRow}
          onClose={() => {
            setModalOpen(false);
            setEditingRow(null);
          }}
          onSave={saveMark}
        />
      )}

      {/* COPY */}

      {copyOpen && (
        <CopyModal
          open={copyOpen}
          sourceRows={
            filteredRows
          }
          onClose={() =>
            setCopyOpen(false)
          }
          onCopy={
            copyDistribution
          }
        />
      )}
    </AnimatedPage>
  );
}
