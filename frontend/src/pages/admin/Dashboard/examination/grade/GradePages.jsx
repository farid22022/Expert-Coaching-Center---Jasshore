import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRightLeft,
  Edit3,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { ExaminationNav } from "../examinationShared.jsx";

/* =========================================================
   STORAGE
========================================================= */

const GRADE_STORAGE_KEY = "expertExaminationGrades";

/* =========================================================
   OPTIONS
========================================================= */

const sessions = [ "2026", "2025", "2024"];

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
  "Assessment Test Aug Sep",
  "PRE MODEL TEST 01 SSC 2027",
  "MODEL 01 SSC 2027",
  "Half Yearly Examination",
  "Annual Examination",
  "Test Examination",
];

/* =========================================================
   DEFAULT GRADE SETS
========================================================= */

const standardGradeSet = [
  {
    gradeName: "A+",
    gradePointLower: 5,
    gradePointUpper: 5,
    lowerMark: 80,
    upperMark: 100,
    comments: "EXCELLENT",
  },
  {
    gradeName: "A",
    gradePointLower: 4,
    gradePointUpper: 4.99,
    lowerMark: 70,
    upperMark: 79,
    comments: "VERY GOOD",
  },
  {
    gradeName: "A-",
    gradePointLower: 3.5,
    gradePointUpper: 3.99,
    lowerMark: 60,
    upperMark: 69,
    comments: "GOOD",
  },
  {
    gradeName: "B",
    gradePointLower: 3,
    gradePointUpper: 3.49,
    lowerMark: 50,
    upperMark: 59,
    comments: "MEDIUM",
  },
  {
    gradeName: "C",
    gradePointLower: 2,
    gradePointUpper: 2.99,
    lowerMark: 40,
    upperMark: 49,
    comments: "POOR",
  },
  {
    gradeName: "D",
    gradePointLower: 1,
    gradePointUpper: 1.99,
    lowerMark: 33,
    upperMark: 39,
    comments: "VERY POOR",
  },
  {
    gradeName: "F",
    gradePointLower: 0,
    gradePointUpper: 0.99,
    lowerMark: 0,
    upperMark: 32,
    comments: "FAIL",
  },
];

function createGradeSet(session, className, exam, offset = 0) {
  return standardGradeSet.map((grade, index) => ({
    id: `${session}-${className}-${exam}-${index}-${offset}`,
    session,
    className,
    exam,
    ...grade,
    createdDate: "2025-05-24 17:57:06",
    fullName: "Expert Coaching Center",
  }));
}

const demoGrades = [
  ...createGradeSet(
    "2026",
    "Class 09",
    "Assessment Test Aug Sep",
    1
  ),
  ...createGradeSet(
    "2026",
    "Class 10",
    "PRE MODEL TEST 01 SSC 2027",
    2
  ),
  ...createGradeSet(
    "2026",
    "Class 10",
    "MODEL 01 SSC 2027",
    3
  ),
  ...createGradeSet(
    "2026",
    "Class 10",
    "Half Yearly Examination",
    4
  ),
  ...createGradeSet(
    "2025",
    "Class 09",
    "Annual Examination",
    5
  ),
];

/* =========================================================
   HELPERS
========================================================= */

function loadGrades() {
  try {
    const saved = localStorage.getItem(GRADE_STORAGE_KEY);

    return saved ? JSON.parse(saved) : demoGrades;
  } catch {
    return demoGrades;
  }
}

function saveGrades(grades) {
  localStorage.setItem(
    GRADE_STORAGE_KEY,
    JSON.stringify(grades)
  );
}

function generateId() {
  if (
    typeof crypto !== "undefined" &&
    crypto.randomUUID
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()}`;
}

/* =========================================================
   PAGE WRAPPER
========================================================= */

function Page({ children }) {
  return (
    <div className="space-y-5">
      <ExaminationNav />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-8"
      >
        {children}
      </motion.div>
    </div>
  );
}

/* =========================================================
   BLUE PANEL
========================================================= */

function Panel({
  title,
  action,
  children,
  className = "",
}) {
  return (
    <section
      className={`
        overflow-hidden
        rounded-md
        border
        border-base-300
        bg-base-100
        shadow-sm
        ${className}
      `}
    >
      <div
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
      </div>

      <div className="p-5">{children}</div>
    </section>
  );
}

/* =========================================================
   FIELD
========================================================= */

function Field({ label, children }) {
  return (
    <label
      className="
        grid
        gap-2
        sm:grid-cols-[140px_minmax(0,1fr)]
        sm:items-center
      "
    >
      <span className="text-sm font-medium">
        {label}
      </span>

      {children}
    </label>
  );
}

/* =========================================================
   SELECT
========================================================= */

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
      className="select select-bordered select-sm w-full"
    >
      {placeholder && (
        <option value="">
          {placeholder}
        </option>
      )}

      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

/* =========================================================
   GRADE MODAL
========================================================= */

const emptyGrade = {
  session: "2026",
  className: "",
  exam: "",
  gradeName: "",
  gradePointLower: "",
  gradePointUpper: "",
  lowerMark: "",
  upperMark: "",
  comments: "",
};

function GradeModal({
  open,
  editing,
  onClose,
  onSave,
}) {
  const initialValue = editing
    ? { ...editing }
    : { ...emptyGrade };

  const [form, setForm] =
    useState(initialValue);

  /*
    Because this modal is conditionally mounted,
    state initializes again whenever opened.
  */

  const change = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submit = (e) => {
    e.preventDefault();

    if (
      !form.className ||
      !form.exam ||
      !form.gradeName
    ) {
      alert(
        "Class, Exam and Grade Name are required."
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
            z-[200]
            grid
            place-items-center
            overflow-y-auto
            bg-black/50
            p-4
            backdrop-blur-sm
          "
        >
          <motion.div
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
              rounded-lg
              bg-base-100
              shadow-2xl
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-base-300
                bg-[#456db5]
                px-5
                py-3
                text-white
              "
            >
              <h3 className="text-lg font-bold">
                {editing
                  ? "Update Grade"
                  : "Create Grade"}
              </h3>

              <button
                type="button"
                onClick={onClose}
                className="btn btn-circle btn-ghost btn-sm text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={submit}
              className="space-y-4 p-6"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="form-control">
                  <span className="mb-1 text-sm font-bold">
                    Session
                  </span>

                  <Select
                    value={form.session}
                    onChange={(e) =>
                      change(
                        "session",
                        e.target.value
                      )
                    }
                    options={sessions}
                  />
                </label>

                <label className="form-control">
                  <span className="mb-1 text-sm font-bold">
                    Class *
                  </span>

                  <Select
                    value={form.className}
                    onChange={(e) =>
                      change(
                        "className",
                        e.target.value
                      )
                    }
                    options={classes}
                    placeholder="Select Class"
                  />
                </label>

                <label className="form-control">
                  <span className="mb-1 text-sm font-bold">
                    Exam *
                  </span>

                  <Select
                    value={form.exam}
                    onChange={(e) =>
                      change(
                        "exam",
                        e.target.value
                      )
                    }
                    options={exams}
                    placeholder="Select Exam"
                  />
                </label>

                <label className="form-control">
                  <span className="mb-1 text-sm font-bold">
                    Grade Name *
                  </span>

                  <input
                    value={form.gradeName}
                    onChange={(e) =>
                      change(
                        "gradeName",
                        e.target.value
                      )
                    }
                    className="input input-bordered input-sm"
                    placeholder="A+"
                  />
                </label>

                <label className="form-control">
                  <span className="mb-1 text-sm font-bold">
                    Grade Point Lower
                  </span>

                  <input
                    type="number"
                    step="0.01"
                    value={
                      form.gradePointLower
                    }
                    onChange={(e) =>
                      change(
                        "gradePointLower",
                        e.target.value
                      )
                    }
                    className="input input-bordered input-sm"
                  />
                </label>

                <label className="form-control">
                  <span className="mb-1 text-sm font-bold">
                    Grade Point Upper
                  </span>

                  <input
                    type="number"
                    step="0.01"
                    value={
                      form.gradePointUpper
                    }
                    onChange={(e) =>
                      change(
                        "gradePointUpper",
                        e.target.value
                      )
                    }
                    className="input input-bordered input-sm"
                  />
                </label>

                <label className="form-control">
                  <span className="mb-1 text-sm font-bold">
                    Lower Mark
                  </span>

                  <input
                    type="number"
                    value={form.lowerMark}
                    onChange={(e) =>
                      change(
                        "lowerMark",
                        e.target.value
                      )
                    }
                    className="input input-bordered input-sm"
                  />
                </label>

                <label className="form-control">
                  <span className="mb-1 text-sm font-bold">
                    Upper Mark
                  </span>

                  <input
                    type="number"
                    value={form.upperMark}
                    onChange={(e) =>
                      change(
                        "upperMark",
                        e.target.value
                      )
                    }
                    className="input input-bordered input-sm"
                  />
                </label>

                <label className="form-control sm:col-span-2">
                  <span className="mb-1 text-sm font-bold">
                    Comments
                  </span>

                  <input
                    value={form.comments}
                    onChange={(e) =>
                      change(
                        "comments",
                        e.target.value
                      )
                    }
                    className="input input-bordered input-sm"
                    placeholder="EXCELLENT"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
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
                    ? "Update Grade"
                    : "Create Grade"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* =========================================================
   GRADE PAGE
========================================================= */

export function GradePage() {
  const [grades, setGrades] =
    useState(loadGrades);

  const [filters, setFilters] =
    useState({
      session: "2026",
      className: "",
      exam: "",
    });

  const [appliedFilters, setAppliedFilters] =
    useState({
      session: "",
      className: "",
      exam: "",
    });

  const [page, setPage] = useState(1);

  const pageSize = 20;

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editingGrade, setEditingGrade] =
    useState(null);

  const filteredGrades = useMemo(() => {
    return grades.filter((grade) => {
      if (
        appliedFilters.session &&
        grade.session !==
          appliedFilters.session
      ) {
        return false;
      }

      if (
        appliedFilters.className &&
        grade.className !==
          appliedFilters.className
      ) {
        return false;
      }

      if (
        appliedFilters.exam &&
        grade.exam !==
          appliedFilters.exam
      ) {
        return false;
      }

      return true;
    });
  }, [grades, appliedFilters]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredGrades.length / pageSize
    )
  );

  const displayedGrades =
    filteredGrades.slice(
      (page - 1) * pageSize,
      page * pageSize
    );

  const applySearch = () => {
    setAppliedFilters({
      ...filters,
    });

    setPage(1);
  };

  const createGrade = () => {
    setEditingGrade(null);
    setModalOpen(true);
  };

  const editGrade = (grade) => {
    setEditingGrade(grade);
    setModalOpen(true);
  };

  const saveGrade = (form) => {
    let updated;

    if (editingGrade) {
      updated = grades.map((grade) =>
        grade.id === editingGrade.id
          ? {
              ...grade,
              ...form,
            }
          : grade
      );
    } else {
      updated = [
        ...grades,
        {
          ...form,
          id: generateId(),
          createdDate: new Date()
            .toISOString()
            .replace("T", " ")
            .slice(0, 19),
          fullName:
            "Expert Coaching Center",
        },
      ];
    }

    setGrades(updated);
    saveGrades(updated);

    setModalOpen(false);
    setEditingGrade(null);
  };

  const deleteGrade = (id) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this grade?"
      );

    if (!confirmed) return;

    const updated = grades.filter(
      (grade) => grade.id !== id
    );

    setGrades(updated);
    saveGrades(updated);
  };

  return (
    <Page>
      {/* =====================================================
          SEARCH
      ===================================================== */}

      <Panel
        title="Grade Search"
        action={
          <button
            type="button"
            onClick={createGrade}
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
            Create Grade
          </button>
        }
      >
        <div
          className="
            mx-auto
            grid
            max-w-5xl
            gap-x-8
            gap-y-3
            lg:grid-cols-2
          "
        >
          <Field label="Session:">
            <Select
              value={filters.session}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  session:
                    e.target.value,
                }))
              }
              options={sessions}
            />
          </Field>

          <Field label="Class:">
            <Select
              value={
                filters.className
              }
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  className:
                    e.target.value,
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
                setFilters((prev) => ({
                  ...prev,
                  exam: e.target.value,
                }))
              }
              options={exams}
              placeholder="Select Exam"
            />
          </Field>
        </div>

        <div className="mt-5 flex justify-center">
          <motion.button
            whileHover={{
              scale: 1.04,
            }}
            whileTap={{
              scale: 0.96,
            }}
            type="button"
            onClick={applySearch}
            className="
              btn
              btn-sm
              border-0
              bg-cyan-600
              text-white
              hover:bg-cyan-700
            "
          >
            <Search size={15} />
            Search
          </motion.button>
        </div>
      </Panel>

      {/* =====================================================
          LIST
      ===================================================== */}

      <Panel title="Grade List">
        <div className="overflow-x-auto">
          <table
            className="
              table
              table-zebra
              table-sm
              min-w-[1450px]
            "
          >
            <thead>
              <tr className="bg-base-200 text-base-content">
                <th>Session</th>
                <th>Class</th>
                <th>Exam</th>
                <th>Grade Name</th>
                <th>
                  Grade Point Lower
                </th>
                <th>
                  Grade Point Upper
                </th>
                <th>Lower Mark</th>
                <th>Upper Mark</th>
                <th>Comments</th>
                <th>Created Date</th>
                <th>Full Name</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              <AnimatePresence>
                {displayedGrades.map(
                  (grade) => (
                    <motion.tr
                      key={grade.id}
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
                        {grade.session}
                      </td>

                      <td>
                        {grade.className}
                      </td>

                      <td>{grade.exam}</td>

                      <td className="font-medium">
                        {grade.gradeName}
                      </td>

                      <td>
                        {
                          grade.gradePointLower
                        }
                      </td>

                      <td>
                        {
                          grade.gradePointUpper
                        }
                      </td>

                      <td>
                        {grade.lowerMark}
                      </td>

                      <td>
                        {grade.upperMark}
                      </td>

                      <td>
                        {grade.comments}
                      </td>

                      <td>
                        {grade.createdDate}
                      </td>

                      <td>
                        {grade.fullName}
                      </td>

                      <td>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              editGrade(
                                grade
                              )
                            }
                            title="Edit"
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
                              deleteGrade(
                                grade.id
                              )
                            }
                            title="Delete"
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

              {!displayedGrades.length && (
                <tr>
                  <td
                    colSpan={12}
                    className="py-10 text-center text-base-content/50"
                  >
                    No grade data
                    found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}

        <div
          className="
            mt-5
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <strong className="text-sm">
            Showing{" "}
            {filteredGrades.length
              ? (page - 1) *
                  pageSize +
                1
              : 0}{" "}
            to{" "}
            {Math.min(
              page * pageSize,
              filteredGrades.length
            )}{" "}
            of{" "}
            {filteredGrades.length}{" "}
            results.
          </strong>

          <div className="join">
            <button
              type="button"
              disabled={page === 1}
              onClick={() =>
                setPage((p) => p - 1)
              }
              className="btn btn-sm join-item"
            >
              &lt;
            </button>

            {Array.from(
              {
                length: Math.min(
                  totalPages,
                  3
                ),
              },
              (_, index) =>
                index + 1
            ).map((number) => (
              <button
                key={number}
                type="button"
                onClick={() =>
                  setPage(number)
                }
                className={`
                  btn
                  btn-sm
                  join-item
                  ${
                    page === number
                      ? "bg-[#456db5] text-white"
                      : ""
                  }
                `}
              >
                {number}
              </button>
            ))}

            <button
              type="button"
              disabled={
                page >= totalPages
              }
              onClick={() =>
                setPage((p) => p + 1)
              }
              className="btn btn-sm join-item"
            >
              &gt;
            </button>

            <button
              type="button"
              onClick={() =>
                setPage(totalPages)
              }
              className="btn btn-sm join-item"
            >
              Last
            </button>
          </div>
        </div>
      </Panel>

      {modalOpen && (
        <GradeModal
          key={
            editingGrade?.id ||
            "create"
          }
          open={modalOpen}
          editing={editingGrade}
          onClose={() => {
            setModalOpen(false);
            setEditingGrade(null);
          }}
          onSave={saveGrade}
        />
      )}
    </Page>
  );
}

/* =========================================================
   GRADE TRANSFER
========================================================= */

export function GradeTransferPage() {
  const [grades, setGrades] =
    useState(loadGrades);

  const [source, setSource] =
    useState({
      session: "2026",
      className: "",
      exam: "",
    });

  const [target, setTarget] =
    useState({
      session: "2026",
      className: "",
      exam: "",
    });

  const [searched, setSearched] =
    useState(false);

  const sourceGrades = useMemo(() => {
    if (!searched) return [];

    return grades.filter(
      (grade) =>
        grade.session ===
          source.session &&
        (!source.className ||
          grade.className ===
            source.className) &&
        (!source.exam ||
          grade.exam ===
            source.exam)
    );
  }, [grades, searched, source]);

  const transferGrades = () => {
    if (
      !target.session ||
      !target.className ||
      !target.exam
    ) {
      alert(
        "Select target Session, Class and Exam."
      );

      return;
    }

    if (!sourceGrades.length) {
      alert(
        "No source grade data found."
      );

      return;
    }

    const existingKeys =
      new Set(
        grades.map(
          (grade) =>
            `${grade.session}|${grade.className}|${grade.exam}|${grade.gradeName}`
        )
      );

    const transferred =
      sourceGrades
        .filter(
          (grade) =>
            !existingKeys.has(
              `${target.session}|${target.className}|${target.exam}|${grade.gradeName}`
            )
        )
        .map((grade) => ({
          ...grade,
          id: generateId(),
          session:
            target.session,
          className:
            target.className,
          exam: target.exam,
          createdDate: new Date()
            .toISOString()
            .replace("T", " ")
            .slice(0, 19),
        }));

    if (!transferred.length) {
      alert(
        "The target already contains this grade configuration."
      );

      return;
    }

    const updated = [
      ...grades,
      ...transferred,
    ];

    setGrades(updated);
    saveGrades(updated);

    alert(
      `${transferred.length} grade rows transferred successfully.`
    );
  };

  return (
    <Page>
      {/* =====================================================
          SOURCE SEARCH
      ===================================================== */}

      <Panel
        title="Grade Transfer"
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
            Back to Grade List
          </button>
        }
      >
        <div
          className="
            mx-auto
            grid
            max-w-5xl
            gap-x-8
            gap-y-4
            lg:grid-cols-2
          "
        >
          <Field label="Session:">
            <Select
              value={source.session}
              onChange={(e) =>
                setSource((prev) => ({
                  ...prev,
                  session:
                    e.target.value,
                }))
              }
              options={sessions}
            />
          </Field>

          <Field label="Class:">
            <Select
              value={
                source.className
              }
              onChange={(e) =>
                setSource((prev) => ({
                  ...prev,
                  className:
                    e.target.value,
                }))
              }
              options={classes}
              placeholder="Select Class"
            />
          </Field>

          <Field label="Exam:">
            <Select
              value={source.exam}
              onChange={(e) =>
                setSource((prev) => ({
                  ...prev,
                  exam: e.target.value,
                }))
              }
              options={exams}
              placeholder="Select Exam"
            />
          </Field>
        </div>

        <div className="mt-5 flex justify-center">
          <motion.button
            whileHover={{
              scale: 1.04,
            }}
            whileTap={{
              scale: 0.96,
            }}
            type="button"
            onClick={() =>
              setSearched(true)
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
            <Search size={15} />
            Search
          </motion.button>
        </div>
      </Panel>

      {/* =====================================================
          SEARCH RESULT + TARGET
      ===================================================== */}

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
            exit={{
              opacity: 0,
            }}
          >
            <Panel title="Grade Transfer Result">
              {!sourceGrades.length ? (
                <div className="alert">
                  No grade configuration
                  found for the selected
                  Session, Class and Exam.
                </div>
              ) : (
                <div className="space-y-6">
                  {/* SOURCE PREVIEW */}

                  <div>
                    <h3 className="mb-3 font-bold">
                      Source Grade
                      Configuration
                    </h3>

                    <div className="overflow-x-auto">
                      <table className="table table-zebra table-sm">
                        <thead>
                          <tr className="bg-base-200">
                            <th>
                              Grade
                            </th>
                            <th>
                              GPA Lower
                            </th>
                            <th>
                              GPA Upper
                            </th>
                            <th>
                              Lower Mark
                            </th>
                            <th>
                              Upper Mark
                            </th>
                            <th>
                              Comment
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {sourceGrades.map(
                            (grade) => (
                              <tr
                                key={
                                  grade.id
                                }
                              >
                                <td className="font-bold">
                                  {
                                    grade.gradeName
                                  }
                                </td>

                                <td>
                                  {
                                    grade.gradePointLower
                                  }
                                </td>

                                <td>
                                  {
                                    grade.gradePointUpper
                                  }
                                </td>

                                <td>
                                  {
                                    grade.lowerMark
                                  }
                                </td>

                                <td>
                                  {
                                    grade.upperMark
                                  }
                                </td>

                                <td>
                                  {
                                    grade.comments
                                  }
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="divider">
                    TRANSFER TO
                  </div>

                  {/* TARGET */}

                  <div
                    className="
                      grid
                      gap-4
                      lg:grid-cols-3
                    "
                  >
                    <label className="form-control">
                      <span className="mb-1 text-sm font-bold">
                        Target Session
                      </span>

                      <Select
                        value={
                          target.session
                        }
                        onChange={(e) =>
                          setTarget(
                            (prev) => ({
                              ...prev,
                              session:
                                e
                                  .target
                                  .value,
                            })
                          )
                        }
                        options={
                          sessions
                        }
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
                        onChange={(e) =>
                          setTarget(
                            (prev) => ({
                              ...prev,
                              className:
                                e
                                  .target
                                  .value,
                            })
                          )
                        }
                        options={
                          classes
                        }
                        placeholder="Select Class"
                      />
                    </label>

                    <label className="form-control">
                      <span className="mb-1 text-sm font-bold">
                        Target Exam
                      </span>

                      <Select
                        value={
                          target.exam
                        }
                        onChange={(e) =>
                          setTarget(
                            (prev) => ({
                              ...prev,
                              exam:
                                e
                                  .target
                                  .value,
                            })
                          )
                        }
                        options={exams}
                        placeholder="Select Exam"
                      />
                    </label>
                  </div>

                  <div className="flex justify-center">
                    <motion.button
                      whileHover={{
                        scale: 1.02,
                      }}
                      whileTap={{
                        scale: 0.97,
                      }}
                      type="button"
                      onClick={
                        transferGrades
                      }
                      className="btn btn-success text-white"
                    >
                      <ArrowRightLeft
                        size={17}
                      />

                      Transfer Grade
                    </motion.button>
                  </div>
                </div>
              )}
            </Panel>
          </motion.div>
        )}
      </AnimatePresence>
    </Page>
  );
}
