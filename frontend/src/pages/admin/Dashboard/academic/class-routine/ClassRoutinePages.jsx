import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Trash2,
} from "lucide-react";
import { useAcademicBase } from "../academicShared.jsx";

/* =========================================================
   DATA
========================================================= */

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
  "demo",
];

const sections = [
  "Day",
  "Morning",
  "Exam Batch",
  "Section A",
  "Section B",
];

const subjects = [
  "Bangla 1st Paper",
  "Bangla 2nd Paper",
  "English 1st Paper",
  "English 2nd Paper",
  "Mathematics",
  "ICT",
  "Physics",
  "Chemistry",
  "Biology",
];

const teachers = [
  "Teacher 01",
  "Teacher 02",
  "Teacher 03",
  "Teacher 04",
];

const weekdays = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
];

const schedules = [
  "07:00 AM - 09:00 PM",
  "12:00 PM - 12:45 PM",
  "01:00 PM - 01:45 PM",
  "02:00 PM - 02:45 PM",
  "02:30 PM - 04:30 PM",
];

const buildings = [
  "Main Building",
  "Building A",
  "Building B",
];

const floors = [
  "Ground Floor",
  "1st Floor",
  "2nd Floor",
  "3rd Floor",
];

const rooms = [
  "Room 101",
  "Room 102",
  "Room 201",
  "Room 202",
];

/* =========================================================
   SHARED UI
========================================================= */

function PageRoot({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
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
      <div className="flex min-h-[40px] flex-wrap items-center justify-between gap-2 bg-[#456db5] px-4 py-2 text-white">
        <h2 className="text-base font-bold sm:text-lg">
          {title}
        </h2>

        {action}
      </div>

      {children}
    </section>
  );
}

function Select({
  children,
  className = "",
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
    <div className="grid items-center gap-3 sm:grid-cols-[120px_minmax(0,1fr)]">
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

function RequiredNotice() {
  return (
    <div className="rounded border border-[#f1daa0] bg-[#fff3cd] px-5 py-4 text-sm font-bold text-red-500">
      (*) field required
    </div>
  );
}

function CyanLink({
  to,
  children,
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

function GreenLink({
  to,
  children,
}) {
  return (
    <Link
      to={to}
      className="btn btn-success btn-sm min-h-0 text-white"
    >
      {children}
    </Link>
  );
}

function SearchButton({
  children = "Search",
  onClick,
  purple = false,
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      type="button"
      onClick={onClick}
      className={
        purple
          ? "btn btn-sm min-h-0 border-violet-700 bg-violet-700 text-white hover:bg-violet-800"
          : "btn btn-info btn-sm min-h-0 text-white"
      }
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
      className="btn btn-success btn-sm min-h-0 text-white"
    >
      Print
    </button>
  );
}

function PdfButton({
  children = "Create PDF",
}) {
  return (
    <button
      type="button"
      onClick={() =>
        window.alert("PDF generation demo")
      }
      className="btn btn-sm min-h-0 border-violet-700 bg-violet-700 text-white hover:bg-violet-800"
    >
      {children}
    </button>
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
      {sessions.map((session) => (
        <option
          key={session}
          value={session}
        >
          {session}
        </option>
      ))}
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

      {classes.map((className) => (
        <option
          key={className}
          value={className}
        >
          {className}
        </option>
      ))}
    </Select>
  );
}

function SectionSelect({
  value,
  onChange,
}) {
  return (
    <Select
      value={value}
      onChange={onChange}
    >
      <option value="">
        Select Section
      </option>

      {sections.map((section) => (
        <option
          key={section}
          value={section}
        >
          {section}
        </option>
      ))}
    </Select>
  );
}

function TeacherSelect({
  value,
  onChange,
}) {
  return (
    <Select
      value={value}
      onChange={onChange}
    >
      <option value="">
        Select Teacher
      </option>

      {teachers.map((teacher) => (
        <option
          key={teacher}
          value={teacher}
        >
          {teacher}
        </option>
      ))}
    </Select>
  );
}

function newEntry() {
  return {
    id:
      globalThis.crypto?.randomUUID?.() ??
      `routine-${Date.now()}-${Math.random()}`,
    subject: "",
    weekday: "",
    schedule: "",
    teacher: "",
  };
}

/* =========================================================
   1. CREATE CLASS ROUTINE
========================================================= */

export function ClassRoutineCreatePage() {
  const base = useAcademicBase();

  const [form, setForm] = useState({
    shift: "",
    className: "",
    section: "",
    building: "",
    floor: "",
    room: "",
  });

  const [entries, setEntries] = useState([]);

  const updateForm = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const addEntry = () => {
    setEntries((prev) => [
      ...prev,
      newEntry(),
    ]);
  };

  const updateEntry = (
    id,
    key,
    value
  ) => {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === id
          ? {
              ...entry,
              [key]: value,
            }
          : entry
      )
    );
  };

  const removeEntry = (id) => {
    setEntries((prev) =>
      prev.filter(
        (entry) =>
          entry.id !== id
      )
    );
  };

  const handleSubmit = () => {
    if (
      !form.shift ||
      !form.className ||
      !form.section ||
      !form.building ||
      !form.floor ||
      !form.room
    ) {
      window.alert(
        "Please complete all required class routine fields."
      );
      return;
    }

    window.alert(
      "Class routine submitted successfully."
    );
  };

  return (
    <PageRoot>
      <Panel
        title="Create Class Routine"
        action={
          <CyanLink
            to={`${base}/class-routine/class-routine`}
          >
            Back to Class routine List
          </CyanLink>
        }
      >
        <div className="space-y-4 p-5">
          <RequiredNotice />

          {/* TOP FIELDS */}
          <div className="grid gap-5 lg:grid-cols-3">
            <Field
              label="Shift:"
              required
            >
              <ShiftSelect
                value={form.shift}
                onChange={(e) =>
                  updateForm(
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
                value={form.className}
                onChange={(e) =>
                  updateForm(
                    "className",
                    e.target.value
                  )
                }
              />
            </Field>

            <Field
              label="Section:"
              required
            >
              <SectionSelect
                value={form.section}
                onChange={(e) =>
                  updateForm(
                    "section",
                    e.target.value
                  )
                }
              />
            </Field>
          </div>

          {/* SUBJECT & TEACHER ENTRY */}
          <section className="overflow-hidden rounded border border-[#456db5] bg-white">
            <div className="bg-[#456db5] px-4 py-2 text-lg font-bold text-white">
              Subject & Teacher Entry
            </div>

            <div className="overflow-x-auto">
              <table className="table table-xs min-w-[1000px]">
                <thead className="bg-white text-black">
                  <tr>
                    <th className="w-[55px] border-b border-base-300">
                      <button
                        type="button"
                        onClick={addEntry}
                        title="Add row"
                        className="btn btn-xs h-8 min-h-8 w-8 border-orange-400 bg-orange-300 p-0 text-orange-700 hover:bg-orange-400"
                      >
                        <CalendarDays
                          size={15}
                        />
                      </button>
                    </th>

                    <th className="border-b border-base-300 text-center">
                      Subject
                      <span className="text-red-500">
                        *
                      </span>
                    </th>

                    <th className="border-b border-base-300 text-center">
                      Weekday
                      <span className="text-red-500">
                        *
                      </span>
                    </th>

                    <th className="border-b border-base-300 text-center">
                      Schedule
                      <span className="text-red-500">
                        *
                      </span>
                    </th>

                    <th className="border-b border-base-300 text-center">
                      Teacher
                      <span className="text-red-500">
                        *
                      </span>
                    </th>

                    <th className="border-b border-base-300 text-center">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {entries.map(
                    (entry) => (
                      <tr
                        key={
                          entry.id
                        }
                      >
                        <td />

                        <td>
                          <Select
                            value={
                              entry.subject
                            }
                            onChange={(
                              e
                            ) =>
                              updateEntry(
                                entry.id,
                                "subject",
                                e
                                  .target
                                  .value
                              )
                            }
                          >
                            <option value="">
                              Select
                              Subject
                            </option>

                            {subjects.map(
                              (
                                subject
                              ) => (
                                <option
                                  key={
                                    subject
                                  }
                                >
                                  {
                                    subject
                                  }
                                </option>
                              )
                            )}
                          </Select>
                        </td>

                        <td>
                          <Select
                            value={
                              entry.weekday
                            }
                            onChange={(
                              e
                            ) =>
                              updateEntry(
                                entry.id,
                                "weekday",
                                e
                                  .target
                                  .value
                              )
                            }
                          >
                            <option value="">
                              Select
                              Weekday
                            </option>

                            {weekdays.map(
                              (day) => (
                                <option
                                  key={
                                    day
                                  }
                                >
                                  {
                                    day
                                  }
                                </option>
                              )
                            )}
                          </Select>
                        </td>

                        <td>
                          <Select
                            value={
                              entry.schedule
                            }
                            onChange={(
                              e
                            ) =>
                              updateEntry(
                                entry.id,
                                "schedule",
                                e
                                  .target
                                  .value
                              )
                            }
                          >
                            <option value="">
                              Select
                              Schedule
                            </option>

                            {schedules.map(
                              (
                                schedule
                              ) => (
                                <option
                                  key={
                                    schedule
                                  }
                                >
                                  {
                                    schedule
                                  }
                                </option>
                              )
                            )}
                          </Select>
                        </td>

                        <td>
                          <TeacherSelect
                            value={
                              entry.teacher
                            }
                            onChange={(
                              e
                            ) =>
                              updateEntry(
                                entry.id,
                                "teacher",
                                e
                                  .target
                                  .value
                              )
                            }
                          />
                        </td>

                        <td className="text-center">
                          <button
                            type="button"
                            onClick={() =>
                              removeEntry(
                                entry.id
                              )
                            }
                            className="btn btn-error btn-xs text-white"
                          >
                            <Trash2
                              size={14}
                            />
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>

              {entries.length ===
                0 && (
                <div className="h-[48px]" />
              )}
            </div>
          </section>

          {/* LOCATION */}
          <div className="grid gap-5 lg:grid-cols-3">
            <Field
              label="Building:"
              required
            >
              <Select
                value={
                  form.building
                }
                onChange={(e) =>
                  updateForm(
                    "building",
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select Building
                </option>

                {buildings.map(
                  (building) => (
                    <option
                      key={building}
                    >
                      {building}
                    </option>
                  )
                )}
              </Select>
            </Field>

            <Field
              label="Floor:"
              required
            >
              <Select
                value={form.floor}
                onChange={(e) =>
                  updateForm(
                    "floor",
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select Floor
                </option>

                {floors.map(
                  (floor) => (
                    <option
                      key={floor}
                    >
                      {floor}
                    </option>
                  )
                )}
              </Select>
            </Field>

            <Field
              label="Room:"
              required
            >
              <Select
                value={form.room}
                onChange={(e) =>
                  updateForm(
                    "room",
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select class room
                </option>

                {rooms.map(
                  (room) => (
                    <option key={room}>
                      {room}
                    </option>
                  )
                )}
              </Select>
            </Field>
          </div>

          <div className="sm:ml-[268px]">
            <button
              type="button"
              onClick={handleSubmit}
              className="btn btn-success btn-sm min-h-0 text-white"
            >
              Submit
            </button>
          </div>
        </div>
      </Panel>
    </PageRoot>
  );
}

/* =========================================================
   2. CLASS ROUTINE LIST
========================================================= */

export function ClassRoutinePage() {
  const base = useAcademicBase();

  const [form, setForm] = useState({
    session: "2026",
    shift: "",
    className: "",
    section: "",
    teacher: "",
    atAGlance: false,
  });

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
      <Panel
        title="Class Routine List"
        action={
          <div className="flex flex-wrap gap-1">
            <CyanLink
              to={`${base}/class-routine/class-routine-create`}
            >
              Create Class routine
            </CyanLink>

            <GreenLink
              to={`${base}/class-routine/class-routine-quick-edit`}
            >
              Class Routine Quick Edit
            </GreenLink>
          </div>
        }
      >
        <div className="p-5">
          <div className="grid max-w-[1320px] gap-x-7 gap-y-4 lg:grid-cols-2">
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

            <Field label="Shift:">
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

            <Field label="Class:">
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

            <Field label="Section:">
              <SectionSelect
                value={
                  form.section
                }
                onChange={(e) =>
                  update(
                    "section",
                    e.target.value
                  )
                }
              />
            </Field>

            <Field label="Teacher:">
              <TeacherSelect
                value={
                  form.teacher
                }
                onChange={(e) =>
                  update(
                    "teacher",
                    e.target.value
                  )
                }
              />
            </Field>

            <div />

            <Field label="All Class Routine:">
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={
                    form.atAGlance
                  }
                  onChange={(e) =>
                    update(
                      "atAGlance",
                      e.target.checked
                    )
                  }
                  className="checkbox checkbox-xs"
                />

                At a glance?
              </label>
            </Field>

            <div />

            <div className="lg:col-start-1">
              <div className="flex flex-wrap gap-1 sm:ml-[133px]">
                <SearchButton>
                  Search List
                </SearchButton>

                <PrintButton />

                <PdfButton />
              </div>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="table table-xs min-w-[1200px] border border-base-300">
              <thead className="bg-[#f2f2f2] text-black">
                <tr>
                  <th className="border border-base-300">
                    Session Year
                  </th>

                  <th className="border border-base-300">
                    Working Days
                  </th>

                  <th className="border border-base-300">
                    Class/Section
                  </th>

                  <th className="border border-base-300">
                    Subject
                  </th>

                  <th className="border border-base-300">
                    Teacher
                  </th>

                  <th className="border border-base-300">
                    Building
                    <br />
                    (Floor/Room)
                  </th>

                  <th className="border border-base-300">
                    Schedules
                    <br />
                    (Start-End)
                  </th>

                  <th className="border border-base-300">
                    Action
                  </th>
                </tr>
              </thead>
            </table>
          </div>

          <p className="mt-5 text-sm font-bold text-black">
            Showing 0 to 0 of 0 results.
          </p>
        </div>
      </Panel>
    </PageRoot>
  );
}

/* =========================================================
   3. CLASS ROUTINE QUICK EDIT
========================================================= */

export function ClassRoutineQuickEditPage() {
  const base = useAcademicBase();

  const [form, setForm] = useState({
    session: "2026",
    shift: "",
    className: "",
    section: "",
    teacher: "",
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
      <Panel
        title="Class Routine Quick Update"
        action={
          <CyanLink
            to={`${base}/class-routine/class-routine-create`}
          >
            Create Class routine
          </CyanLink>
        }
      >
        <div className="px-5 py-5">
          <div className="mx-auto grid max-w-[1300px] gap-x-7 gap-y-5 lg:grid-cols-2">
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

            <Field label="Class:">
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

            <Field label="Section:">
              <SectionSelect
                value={
                  form.section
                }
                onChange={(e) =>
                  update(
                    "section",
                    e.target.value
                  )
                }
              />
            </Field>

            <Field label="Teacher:">
              <TeacherSelect
                value={
                  form.teacher
                }
                onChange={(e) =>
                  update(
                    "teacher",
                    e.target.value
                  )
                }
              />
            </Field>

            <div />

            <div className="lg:col-start-1">
              <div className="sm:ml-[198px]">
                <SearchButton
                  purple
                  onClick={() =>
                    setSearched(true)
                  }
                />
              </div>
            </div>
          </div>

          {searched && (
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              className="mx-auto mt-5 max-w-[1300px] rounded border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-400"
            >
              No class routine found
              for quick update.
            </motion.div>
          )}

          <div className="min-h-[5px]" />
        </div>
      </Panel>
    </PageRoot>
  );
}

/* =========================================================
   4. CLASS ROUTINE AT A GLANCE
========================================================= */

export function ClassRoutineAtAGlancePage() {
  const base = useAcademicBase();

  const [session, setSession] =
    useState("2026");

  const periods = [
    {
      title: "1st Period",
      time: "07:00 AM - 09:00 PM",
    },
    {
      title: "2nd Period",
      time: "12:00 PM - 12:45 PM",
    },
    {
      title: "3rd Period",
      time: "01:00 PM - 01:45 PM",
    },
    {
      title: "4th Period",
      time: "02:00 PM - 02:45 PM",
    },
    {
      title: "5th Period",
      time: "02:30 PM - 04:30 PM",
    },
  ];

  return (
    <PageRoot>
      <div className="space-y-4">
        {/* SEARCH */}
        <Panel
          title="Class Routine At A Glance"
          action={
            <div className="flex flex-wrap gap-1">
              <CyanLink
                to={`${base}/class-routine/class-routine-create`}
              >
                Create Class routine
              </CyanLink>

              <GreenLink
                to={`${base}/class-routine/class-routine-quick-edit`}
              >
                Class Routine Quick Edit
              </GreenLink>
            </div>
          }
        >
          <div className="px-5 py-5">
            <div className="max-w-[650px]">
              <Field label="Session Year:">
                <SessionSelect
                  value={session}
                  onChange={(e) =>
                    setSession(
                      e.target.value
                    )
                  }
                />
              </Field>

              <div className="mt-4 flex flex-wrap gap-1 sm:ml-[133px]">
                <SearchButton />

                <PrintButton />

                <PdfButton />
              </div>
            </div>

            <div className="min-h-[5px]" />
          </div>
        </Panel>

        {/* ROUTINE */}
        <Panel title="Class Routine">
          <div className="overflow-x-auto p-5">
            <table className="table min-w-[1100px] border-separate border-spacing-0">
              <thead>
                <tr className="text-white">
                  <th className="w-[160px] border-r border-white bg-[#2194bd] px-3 py-4 text-left">
                    Teacher's Name
                  </th>

                  {periods.map(
                    (period) => (
                      <th
                        key={
                          period.title
                        }
                        className="min-w-[220px] border-r border-white bg-[#2194bd] px-3 py-3 text-left"
                      >
                        <div className="text-base font-bold">
                          {
                            period.title
                          }
                        </div>

                        <div className="mt-1 text-[10px] font-bold">
                          {
                            period.time
                          }
                        </div>
                      </th>
                    )
                  )}
                </tr>
              </thead>
            </table>
          </div>
        </Panel>
      </div>
    </PageRoot>
  );
}