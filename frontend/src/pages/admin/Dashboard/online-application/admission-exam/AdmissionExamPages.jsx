import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  useOnlineApplicationBase,
} from "../onlineApplicationShared.jsx";

/* =========================================================
   DATA
========================================================= */

const admissionExamItems = [
  ["Mark Configure", "admission-exam/mark-configure"],
  ["Add Mark", "admission-exam/add-mark"],
  ["Delete Marks", "admission-exam/delete-marks"],
  ["Update Mark", "admission-exam/update-mark"],
  ["Seat Plan", "admission-exam/seat-plan"],
];

const sessions = ["2026", "2025", "2024"];

const shifts = [
  "Morning",
  "Day",
  "Evening",
];

const classes = [
  "Class 09",
  "Class 10",
  "SSC",
  "HSC",
  "Inter 1st year",
  "Inter 2nd year",
];

const subjects = [
  "Bangla",
  "English",
  "Mathematics",
  "ICT",
  "Physics",
  "Chemistry",
  "Biology",
  "Accounting",
];

const initialMarkConfigurations = [];

/* =========================================================
   SHARED UI
========================================================= */

function PageRoot({ children }) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 5,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.18,
      }}
      className="min-h-[calc(100vh-60px)] bg-[#f5f5f5] p-2 sm:p-3"
    >
      {children}
    </motion.div>
  );
}

function Panel({
  title,
  action,
  children,
  className = "",
}) {
  return (
    <section
      className={`overflow-hidden rounded-md border border-base-300 bg-white shadow-sm ${className}`}
    >
      <div className="flex min-h-[40px] items-center justify-between gap-3 bg-[#456db5] px-4 py-2 text-white sm:px-5">
        <h2 className="text-base font-bold sm:text-lg">
          {title}
        </h2>

        {action}
      </div>

      {children}
    </section>
  );
}

function Input({
  className = "",
  ...props
}) {
  return (
    <input
      {...props}
      className={`input input-bordered input-sm h-8 min-h-8 w-full rounded-[3px] border-slate-300 bg-white ${className}`}
    />
  );
}

function Select({
  className = "",
  children,
  ...props
}) {
  return (
    <select
      {...props}
      className={`select select-bordered select-sm h-8 min-h-8 w-full rounded-[3px] border-slate-300 bg-white ${className}`}
    >
      {children}
    </select>
  );
}

function Field({
  label,
  required = false,
  children,
}) {
  return (
    <div className="grid items-center gap-3 sm:grid-cols-[185px_minmax(0,1fr)]">
      <label className="text-sm font-bold text-black">
        {label}

        {required && (
          <span className="text-red-500">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}

function FormGrid({ children }) {
  return (
    <div className="mx-auto grid max-w-[1180px] gap-x-7 gap-y-5 lg:grid-cols-2">
      {children}
    </div>
  );
}

function RequiredNotice() {
  return (
    <div className="rounded border border-[#f5dda0] bg-[#fff3cd] px-5 py-4 text-sm font-bold text-red-500">
      (*) field required
    </div>
  );
}

function CyanButton({
  children = "Search",
  onClick,
  type = "button",
}) {
  return (
    <motion.button
      whileTap={{
        scale: 0.96,
      }}
      type={type}
      onClick={onClick}
      className="btn btn-info btn-sm min-h-0 text-white"
    >
      {children}
    </motion.button>
  );
}

function HeaderButton({
  children,
  to,
}) {
  return (
    <Link
      to={to}
      className="btn btn-info btn-sm min-h-0 text-white"
    >
      {children}
    </Link>
  );
}

function SearchOffset({ children }) {
  return (
    <div className="lg:col-start-1">
      <div className="sm:ml-[198px]">
        {children}
      </div>
    </div>
  );
}

function SessionSelect({
  value,
  onChange,
}) {
  return (
    <Select
      value={value}
      onChange={onChange}
    >
      {sessions.map(
        (session) => (
          <option
            key={session}
            value={session}
          >
            {session}
          </option>
        )
      )}
    </Select>
  );
}

function ShiftSelect({
  value,
  onChange,
}) {
  return (
    <Select
      value={value}
      onChange={onChange}
    >
      <option value="">
        Select Shift
      </option>

      {shifts.map((shift) => (
        <option
          key={shift}
          value={shift}
        >
          {shift}
        </option>
      ))}
    </Select>
  );
}

function ClassSelect({
  value,
  onChange,
}) {
  return (
    <Select
      value={value}
      onChange={onChange}
    >
      <option value="">
        Select class
      </option>

      {classes.map(
        (className) => (
          <option
            key={className}
            value={className}
          >
            {className}
          </option>
        )
      )}
    </Select>
  );
}

function SubjectSelect({
  value,
  onChange,
}) {
  return (
    <Select
      value={value}
      onChange={onChange}
    >
      <option value="">
        Select Subject
      </option>

      {subjects.map(
        (subject) => (
          <option
            key={subject}
            value={subject}
          >
            {subject}
          </option>
        )
      )}
    </Select>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

export function AdmissionExamDashboard() {
  const base =
    useOnlineApplicationBase();

  return (
    <PageRoot>
      <Panel title="Admission Exam">
        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
          {admissionExamItems.map(
            ([label, slug]) => (
              <Link
                key={slug}
                to={`${base}/${slug}`}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-500 hover:shadow-md"
              >
                <p className="text-sm font-black text-slate-950">
                  {label}
                </p>

                <p className="mt-2 text-xs font-semibold text-slate-500">
                  Open {label} workflow
                </p>
              </Link>
            )
          )}
        </div>
      </Panel>
    </PageRoot>
  );
}

/* =========================================================
   1. MARK CONFIGURE
========================================================= */

export function MarkConfigurePage() {
  const base =
    useOnlineApplicationBase();

  const [filters, setFilters] =
    useState({
      session: "2025",
      shift: "",
      className: "",
    });

  const [rows, setRows] =
    useState(
      initialMarkConfigurations
    );

  const [showCreate, setShowCreate] =
    useState(false);

  const [newConfig, setNewConfig] =
    useState({
      session: "2025",
      className: "",
      subject: "",
      passMark: "",
      totalMark: "",
    });

  const filteredRows =
    useMemo(() => {
      return rows.filter(
        (row) => {
          const sessionMatch =
            !filters.session ||
            row.session ===
              filters.session;

          const classMatch =
            !filters.className ||
            row.className ===
              filters.className;

          return (
            sessionMatch &&
            classMatch
          );
        }
      );
    }, [rows, filters]);

  const createConfiguration = () => {
    if (
      !newConfig.className ||
      !newConfig.subject ||
      !newConfig.passMark ||
      !newConfig.totalMark
    ) {
      window.alert(
        "Please complete all mark configuration fields."
      );
      return;
    }

    setRows((prev) => [
      ...prev,
      {
        id:
          globalThis.crypto
            ?.randomUUID?.() ??
          `${Date.now()}`,
        ...newConfig,
        createdBy: "Admin",
        createdDate:
          new Date().toLocaleDateString(),
      },
    ]);

    setNewConfig({
      session: "2025",
      className: "",
      subject: "",
      passMark: "",
      totalMark: "",
    });

    setShowCreate(false);
  };

  return (
    <PageRoot>
      <div className="space-y-6">
        <Panel title="Mark Configure Search">
          <div className="px-5 py-5">
            <FormGrid>
              <Field label="Session Year:">
                <SessionSelect
                  value={
                    filters.session
                  }
                  onChange={(e) =>
                    setFilters(
                      (prev) => ({
                        ...prev,
                        session:
                          e.target
                            .value,
                      })
                    )
                  }
                />
              </Field>

              <Field label="School Shift:">
                <ShiftSelect
                  value={filters.shift}
                  onChange={(e) =>
                    setFilters(
                      (prev) => ({
                        ...prev,
                        shift:
                          e.target
                            .value,
                      })
                    )
                  }
                />
              </Field>

              <Field label="Class:">
                <ClassSelect
                  value={
                    filters.className
                  }
                  onChange={(e) =>
                    setFilters(
                      (prev) => ({
                        ...prev,
                        className:
                          e.target
                            .value,
                      })
                    )
                  }
                />
              </Field>

              <div />

              <SearchOffset>
                <CyanButton
                  onClick={() =>
                    console.log(
                      "Mark configure search",
                      filters
                    )
                  }
                />
              </SearchOffset>
            </FormGrid>

            <div className="min-h-[20px]" />
          </div>
        </Panel>

        <Panel
          title="Mark Configure List"
          action={
            <button
              type="button"
              onClick={() =>
                setShowCreate(
                  (prev) => !prev
                )
              }
              className="btn btn-info btn-sm min-h-0 text-white"
            >
              Admission Mark Type Create
            </button>
          }
        >
          {showCreate && (
            <div className="border-b border-base-300 bg-[#fafafa] p-5">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <SessionSelect
                  value={
                    newConfig.session
                  }
                  onChange={(e) =>
                    setNewConfig(
                      (prev) => ({
                        ...prev,
                        session:
                          e.target
                            .value,
                      })
                    )
                  }
                />

                <ClassSelect
                  value={
                    newConfig.className
                  }
                  onChange={(e) =>
                    setNewConfig(
                      (prev) => ({
                        ...prev,
                        className:
                          e.target
                            .value,
                      })
                    )
                  }
                />

                <SubjectSelect
                  value={
                    newConfig.subject
                  }
                  onChange={(e) =>
                    setNewConfig(
                      (prev) => ({
                        ...prev,
                        subject:
                          e.target
                            .value,
                      })
                    )
                  }
                />

                <Input
                  type="number"
                  value={
                    newConfig.passMark
                  }
                  onChange={(e) =>
                    setNewConfig(
                      (prev) => ({
                        ...prev,
                        passMark:
                          e.target
                            .value,
                      })
                    )
                  }
                  placeholder="Pass Mark"
                />

                <div className="flex gap-1">
                  <Input
                    type="number"
                    value={
                      newConfig.totalMark
                    }
                    onChange={(e) =>
                      setNewConfig(
                        (prev) => ({
                          ...prev,
                          totalMark:
                            e.target
                              .value,
                        })
                      )
                    }
                    placeholder="Total Mark"
                  />

                  <button
                    type="button"
                    onClick={
                      createConfiguration
                    }
                    className="btn btn-success btn-sm text-white"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="p-5">
            <div className="overflow-x-auto">
              <table className="table table-xs min-w-[1050px] border border-base-300">
                <thead className="bg-white text-black">
                  <tr>
                    <th className="border border-base-300">
                      #
                    </th>

                    <th className="border border-base-300">
                      Session
                    </th>

                    <th className="border border-base-300">
                      Class
                    </th>

                    <th className="border border-base-300">
                      Subject
                    </th>

                    <th className="border border-base-300">
                      Pass Mark
                    </th>

                    <th className="border border-base-300">
                      Total Mark
                    </th>

                    <th className="border border-base-300">
                      Created By
                    </th>

                    <th className="border border-base-300">
                      Created Date
                    </th>

                    <th className="border border-base-300">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRows.map(
                    (row, index) => (
                      <tr
                        key={row.id}
                      >
                        <td className="border border-base-300">
                          {index + 1}
                        </td>

                        <td className="border border-base-300">
                          {
                            row.session
                          }
                        </td>

                        <td className="border border-base-300">
                          {
                            row.className
                          }
                        </td>

                        <td className="border border-base-300">
                          {
                            row.subject
                          }
                        </td>

                        <td className="border border-base-300">
                          {
                            row.passMark
                          }
                        </td>

                        <td className="border border-base-300">
                          {
                            row.totalMark
                          }
                        </td>

                        <td className="border border-base-300">
                          {
                            row.createdBy
                          }
                        </td>

                        <td className="border border-base-300">
                          {
                            row.createdDate
                          }
                        </td>

                        <td className="border border-base-300">
                          <button
                            type="button"
                            onClick={() =>
                              setRows(
                                (
                                  prev
                                ) =>
                                  prev.filter(
                                    (
                                      item
                                    ) =>
                                      item.id !==
                                      row.id
                                  )
                              )
                            }
                            className="btn btn-error btn-xs text-white"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            <p className="mt-5 text-sm font-bold">
              Showing{" "}
              {filteredRows.length
                ? 1
                : 0}{" "}
              to{" "}
              {
                filteredRows.length
              }{" "}
              of{" "}
              {
                filteredRows.length
              }{" "}
              results.
            </p>
          </div>
        </Panel>
      </div>
    </PageRoot>
  );
}

/* =========================================================
   SHARED MARK SEARCH
========================================================= */

function ExamMarksSearchPage({
  title,
  backLabel,
  backPath,
  mode,
}) {
  const base =
    useOnlineApplicationBase();

  const [form, setForm] =
    useState({
      session: "2025",
      shift: "",
      className: "",
      subject: "",
    });

  const [searched, setSearched] =
    useState(false);

  const students = [
    {
      id: "279001",
      name: "FARJANA AKTER JUTHY",
      roll: "1",
      mark: "",
    },
    {
      id: "279002",
      name: "NAFISA ANJUM",
      roll: "2",
      mark: "",
    },
    {
      id: "279003",
      name: "SOUROV DHOR",
      roll: "3",
      mark: "",
    },
  ];

  const [studentRows, setStudentRows] =
    useState(students);

  const update = (
    key,
    value
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateMark = (
    id,
    value
  ) => {
    setStudentRows((prev) =>
      prev.map((student) =>
        student.id === id
          ? {
              ...student,
              mark: value,
            }
          : student
      )
    );
  };

  return (
    <PageRoot>
      <div className="space-y-6">
        <Panel
          title={title}
          action={
            <HeaderButton
              to={`${base}/${backPath}`}
            >
              {backLabel}
            </HeaderButton>
          }
        >
          <div className="space-y-5 p-5">
            <RequiredNotice />

            <FormGrid>
              <Field
                label="Session Year:"
                required
              >
                <SessionSelect
                  value={
                    form.session
                  }
                  onChange={(e) =>
                    update(
                      "session",
                      e.target.value
                    )
                  }
                />
              </Field>

              <Field
                label="School Shift:"
                required
              >
                <ShiftSelect
                  value={form.shift}
                  onChange={(e) =>
                    update(
                      "shift",
                      e.target.value
                    )
                  }
                />
              </Field>

              <Field
                label="Class:"
                required
              >
                <ClassSelect
                  value={
                    form.className
                  }
                  onChange={(e) =>
                    update(
                      "className",
                      e.target.value
                    )
                  }
                />
              </Field>

              <Field
                label="Subject:"
                required
              >
                <SubjectSelect
                  value={
                    form.subject
                  }
                  onChange={(e) =>
                    update(
                      "subject",
                      e.target.value
                    )
                  }
                />
              </Field>

              <SearchOffset>
                <CyanButton
                  onClick={() =>
                    setSearched(true)
                  }
                />
              </SearchOffset>
            </FormGrid>

            <div className="min-h-[5px]" />
          </div>
        </Panel>

        {searched && (
          <Panel
            title={
              mode === "delete"
                ? "Exam Marks List"
                : mode ===
                    "update"
                  ? "Update Marks List"
                  : "Student Mark Entry"
            }
          >
            <div className="p-5">
              <div className="overflow-x-auto">
                <table className="table table-sm min-w-[800px] border border-base-300">
                  <thead className="bg-[#f2f2f2] text-black">
                    <tr>
                      <th className="border border-base-300">
                        SL
                      </th>

                      <th className="border border-base-300">
                        Student ID
                      </th>

                      <th className="border border-base-300">
                        Student Name
                      </th>

                      <th className="border border-base-300">
                        Roll
                      </th>

                      <th className="border border-base-300">
                        Mark
                      </th>

                      {mode ===
                        "delete" && (
                        <th className="border border-base-300">
                          Select
                        </th>
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {studentRows.map(
                      (
                        student,
                        index
                      ) => (
                        <tr
                          key={
                            student.id
                          }
                        >
                          <td className="border border-base-300">
                            {index +
                              1}
                          </td>

                          <td className="border border-base-300">
                            {
                              student.id
                            }
                          </td>

                          <td className="border border-base-300">
                            {
                              student.name
                            }
                          </td>

                          <td className="border border-base-300">
                            {
                              student.roll
                            }
                          </td>

                          <td className="border border-base-300">
                            <Input
                              type="number"
                              value={
                                student.mark
                              }
                              onChange={(
                                e
                              ) =>
                                updateMark(
                                  student.id,
                                  e
                                    .target
                                    .value
                                )
                              }
                              placeholder="Mark"
                              disabled={
                                mode ===
                                "delete"
                              }
                            />
                          </td>

                          {mode ===
                            "delete" && (
                            <td className="border border-base-300 text-center">
                              <input
                                type="checkbox"
                                className="checkbox checkbox-error checkbox-sm"
                              />
                            </td>
                          )}
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-4">
                {mode ===
                "delete" ? (
                  <button
                    type="button"
                    onClick={() =>
                      window.alert(
                        "Selected marks deleted."
                      )
                    }
                    className="btn btn-error btn-sm text-white"
                  >
                    Delete Selected
                    Marks
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      window.alert(
                        mode ===
                          "update"
                          ? "Marks updated successfully."
                          : "Marks saved successfully."
                      )
                    }
                    className="btn btn-success btn-sm text-white"
                  >
                    {mode ===
                    "update"
                      ? "Update Marks"
                      : "Submit Marks"}
                  </button>
                )}
              </div>
            </div>
          </Panel>
        )}
      </div>
    </PageRoot>
  );
}

/* =========================================================
   2. ADD MARK
========================================================= */

export function AddMarkPage() {
  return (
    <ExamMarksSearchPage
      title="Create Exam Marks"
      backLabel="Back to Admission exam List"
      backPath="admission-exam"
      mode="add"
    />
  );
}

/* =========================================================
   3. DELETE MARKS
========================================================= */

export function DeleteMarksPage() {
  return (
    <ExamMarksSearchPage
      title="Delete Exam Marks"
      backLabel="Back to Delete Marks List"
      backPath="admission-exam/delete-marks"
      mode="delete"
    />
  );
}

/* =========================================================
   4. UPDATE MARK
========================================================= */

export function UpdateMarkPage() {
  return (
    <ExamMarksSearchPage
      title="Update Exam Marks"
      backLabel="Back to Admission exam List"
      backPath="admission-exam"
      mode="update"
    />
  );
}

/* =========================================================
   5. SEAT PLAN
========================================================= */

export function SeatPlanPage() {
  const [form, setForm] =
    useState({
      session: "2025",
      shift: "",
      className: "",
    });

  const [searched, setSearched] =
    useState(false);

  const update = (
    key,
    value
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <PageRoot>
      <Panel title="Exam Seat Plan">
        <div className="p-5">
          <FormGrid>
            <Field label="Session Year:">
              <SessionSelect
                value={
                  form.session
                }
                onChange={(e) =>
                  update(
                    "session",
                    e.target.value
                  )
                }
              />
            </Field>

            <Field label="School Shift:">
              <ShiftSelect
                value={form.shift}
                onChange={(e) =>
                  update(
                    "shift",
                    e.target.value
                  )
                }
              />
            </Field>

            <Field label="Class :">
              <ClassSelect
                value={
                  form.className
                }
                onChange={(e) =>
                  update(
                    "className",
                    e.target.value
                  )
                }
              />
            </Field>

            <Field label="Seat Plan:">
              <button
                type="button"
                onClick={() =>
                  window.alert(
                    "Seat plan Design & Config"
                  )
                }
                className="btn btn-sm h-8 min-h-8 w-full border-slate-600 bg-gradient-to-b from-slate-500 to-slate-600 text-white hover:bg-slate-700"
              >
                Design & Config
              </button>
            </Field>

            <div className="lg:col-start-1">
              <div className="flex flex-wrap gap-1 sm:ml-[198px]">
                <CyanButton
                  onClick={() =>
                    setSearched(true)
                  }
                >
                  Search
                </CyanButton>

                <button
                  type="button"
                  onClick={() =>
                    window.print()
                  }
                  className="btn btn-success btn-sm min-h-0 text-white"
                >
                  Print
                </button>

                <button
                  type="button"
                  className="btn btn-sm min-h-0 border-violet-700 bg-violet-700 text-white hover:bg-violet-800"
                >
                  Download Pdf
                </button>
              </div>
            </div>
          </FormGrid>

          <div className="mt-4 bg-[#f8f9fa] p-6">
            <div className="min-h-[42px] rounded bg-white shadow-sm">
              {searched && (
                <div className="p-3 text-center text-sm font-semibold text-slate-500">
                  Seat plan result
                  will appear here.
                </div>
              )}
            </div>
          </div>
        </div>
      </Panel>
    </PageRoot>
  );
}