import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Link,
  useLocation,
} from "react-router-dom";

import {
  CalendarDays,
  Edit3,
  FileDown,
  Plus,
  Printer,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import gsap from "gsap";

import {
  AcademicNav,
} from "./AcademicDashboard.jsx";


/* =========================================================
   STORAGE
========================================================= */

const ROUTINE_STORAGE_KEY =
  "expertAcademicClassRoutines";

const SUBJECT_STORAGE_KEY =
  "expertAcademicSubjects";


/* =========================================================
   OPTIONS
========================================================= */

const sessions = [
  "2026",
  "2025",
  "2024",
];

const shifts = [
  "Morning",
  "Day",
  "Evening",
];

const classes = [
  "SSC",
  "Inter 1st year",
  "Inter 2nd year",
  "Class Six",
  "Class Seven",
  "Class Eight",
  "Class Nine",
  "Class Ten",
];

const sections = [
  "A",
  "B",
  "C",
];

const weekdays = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
];

const buildings = [
  "Main Building",
  "Academic Building",
  "Coaching Building",
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
  "Room 301",
  "Lab",
];

const teachers = [
  "Deen Islam",
  "MD NAIMUR RAHMAN",
  "MD ASHIQ",
  "RASEL AHMED",
  "K M ABDULLAH",
  "UZZAL KUMAR",
  "MASUL BILLAH",
  "MD ALAMIN",
];

const fallbackSubjects = [
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


const scheduleOptions = [
  {
    period: "1st Period",
    start: "07:00 AM",
    end: "09:00 AM",
  },
  {
    period: "2nd Period",
    start: "12:00 PM",
    end: "12:45 PM",
  },
  {
    period: "3rd Period",
    start: "01:00 PM",
    end: "01:45 PM",
  },
  {
    period: "4th Period",
    start: "02:00 PM",
    end: "02:45 PM",
  },
  {
    period: "5th Period",
    start: "02:30 PM",
    end: "04:30 PM",
  },
];


/* =========================================================
   DEMO ROUTINE
========================================================= */

const demoRoutines = [
  {
    id: "ROUTINE-001",
    session: "2026",
    shift: "Morning",
    className: "SSC",
    section: "A",

    subject: "Bangla 1st Paper",
    weekday: "Sunday",

    period: "1st Period",
    start: "07:00 AM",
    end: "09:00 AM",

    teacher: "MASUL BILLAH",

    building: "Main Building",
    floor: "1st Floor",
    room: "Room 101",
  },

  {
    id: "ROUTINE-002",
    session: "2026",
    shift: "Morning",
    className: "SSC",
    section: "A",

    subject: "English 1st Paper",
    weekday: "Sunday",

    period: "2nd Period",
    start: "12:00 PM",
    end: "12:45 PM",

    teacher: "MD ASHIQ",

    building: "Main Building",
    floor: "1st Floor",
    room: "Room 101",
  },

  {
    id: "ROUTINE-003",
    session: "2026",
    shift: "Morning",
    className: "SSC",
    section: "A",

    subject: "Mathematics",
    weekday: "Monday",

    period: "3rd Period",
    start: "01:00 PM",
    end: "01:45 PM",

    teacher: "MD NAIMUR RAHMAN",

    building: "Academic Building",
    floor: "2nd Floor",
    room: "Room 202",
  },
];


/* =========================================================
   STORAGE
========================================================= */

function loadRoutines() {
  try {
    const saved =
      localStorage.getItem(
        ROUTINE_STORAGE_KEY
      );

    return saved
      ? JSON.parse(saved)
      : demoRoutines;
  } catch {
    return demoRoutines;
  }
}


function saveRoutines(data) {
  localStorage.setItem(
    ROUTINE_STORAGE_KEY,
    JSON.stringify(data)
  );
}


function loadSubjects() {
  try {
    const saved =
      localStorage.getItem(
        SUBJECT_STORAGE_KEY
      );

    if (!saved) {
      return fallbackSubjects;
    }

    const parsed =
      JSON.parse(saved);

    const names =
      parsed
        .map(
          (subject) =>
            subject.name
        )
        .filter(Boolean);

    return names.length
      ? [...new Set(names)]
      : fallbackSubjects;
  } catch {
    return fallbackSubjects;
  }
}


/* =========================================================
   ROUTE BASE
========================================================= */

function useAcademicBase() {
  const location =
    useLocation();

  const admin =
    location.pathname.startsWith(
      "/admin/dashboard"
    );

  const prefix =
    admin
      ? "/admin/dashboard"
      : "/dashboard";

  const academicSegment =
    location.pathname.includes(
      "/3-academic"
    )
      ? "3-academic"
      : "academic";

  return `${prefix}/${academicSegment}`;
}


/* =========================================================
   GSAP PAGE
========================================================= */

function AnimatedPage({
  children,
}) {
  const containerRef =
    useRef(null);

  useEffect(() => {
    const context =
      gsap.context(() => {
        gsap.from(
          "[data-routine-panel]",
          {
            opacity: 0,
            y: 18,
            duration: 0.45,
            stagger: 0.08,
            ease: "power2.out",
          }
        );
      }, containerRef);

    return () =>
      context.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="space-y-5"
    >
      <AcademicNav />

      {children}
    </div>
  );
}


/* =========================================================
   PANEL
========================================================= */

function Panel({
  title,
  action,
  children,
}) {
  return (
    <section
      data-routine-panel
      className="
        overflow-hidden
        rounded-lg
        border
        border-base-300
        bg-base-100
        shadow-sm
      "
    >
      <header
        className="
          flex
          min-h-11
          items-center
          justify-between
          gap-3
          bg-primary
          px-5
          py-2
          text-primary-content
        "
      >
        <h2 className="text-base font-bold sm:text-lg">
          {title}
        </h2>

        {action}
      </header>

      <div className="p-5">
        {children}
      </div>
    </section>
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
  required = false,
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      required={required}
      className="
        select
        select-bordered
        select-sm
        w-full
        focus:border-success
        focus:outline-success
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


/* =========================================================
   LABELED FIELD
========================================================= */

function Field({
  label,
  required,
  children,
}) {
  return (
    <label
      className="
        grid
        gap-2
        md:grid-cols-[120px_minmax(0,1fr)]
        md:items-center
      "
    >
      <span className="text-sm font-semibold">
        {label}

        {required && (
          <span className="text-error">
            *
          </span>
        )}
      </span>

      {children}
    </label>
  );
}


/* =========================================================
   CREATE ROW
========================================================= */

function createEmptyRow() {
  return {
    id: crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`,

    subject: "",
    weekday: "",
    schedule: "",
    teacher: "",
  };
}


/* =========================================================
   CLASS ROUTINE CREATE
========================================================= */

export function ClassRoutineCreate() {
  const academicBase =
    useAcademicBase();

  const subjects =
    useMemo(
      () =>
        loadSubjects(),
      []
    );

  const [form, setForm] =
    useState({
      session: "2026",
      shift: "",
      className: "",
      section: "",

      building: "",
      floor: "",
      room: "",
    });

  const [rows, setRows] =
    useState([
      createEmptyRow(),
    ]);


  const updateForm = (
    key,
    value
  ) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };


  const addRow = () => {
    setRows((previous) => [
      ...previous,
      createEmptyRow(),
    ]);
  };


  const removeRow = (
    rowId
  ) => {
    if (rows.length === 1) {
      return;
    }

    setRows((previous) =>
      previous.filter(
        (row) =>
          row.id !== rowId
      )
    );
  };


  const updateRow = (
    rowId,
    key,
    value
  ) => {
    setRows((previous) =>
      previous.map((row) =>
        row.id === rowId
          ? {
              ...row,
              [key]: value,
            }
          : row
      )
    );
  };


  const submit = (
    event
  ) => {
    event.preventDefault();

    if (
      !form.shift ||
      !form.className ||
      !form.section ||
      !form.building ||
      !form.floor ||
      !form.room
    ) {
      alert(
        "Please complete all required routine information."
      );

      return;
    }


    const invalidRow =
      rows.some(
        (row) =>
          !row.subject ||
          !row.weekday ||
          !row.schedule ||
          !row.teacher
      );

    if (invalidRow) {
      alert(
        "Complete Subject, Weekday, Schedule and Teacher for every row."
      );

      return;
    }


    const current =
      loadRoutines();


    const created =
      rows.map((row) => {
        const schedule =
          scheduleOptions.find(
            (item) =>
              item.period ===
              row.schedule
          );

        return {
          id:
            crypto.randomUUID
              ? crypto.randomUUID()
              : `${Date.now()}-${Math.random()}`,

          ...form,

          subject:
            row.subject,

          weekday:
            row.weekday,

          period:
            schedule?.period ||
            row.schedule,

          start:
            schedule?.start ||
            "",

          end:
            schedule?.end ||
            "",

          teacher:
            row.teacher,

          createdAt:
            new Date()
              .toISOString(),
        };
      });


    saveRoutines([
      ...current,
      ...created,
    ]);


    alert(
      `${created.length} routine entr${
        created.length === 1
          ? "y"
          : "ies"
      } created successfully.`
    );


    setRows([
      createEmptyRow(),
    ]);
  };


  return (
    <AnimatedPage>
      <Panel
        title="Create Class Routine"
        action={
          <Link
            to={`${academicBase}/class-routine/class-routine`}
            className="
              btn
              btn-sm
              border-0
              bg-cyan-500
              text-white
              hover:bg-cyan-600
            "
          >
            Back to Class Routine List
          </Link>
        }
      >
        <form
          onSubmit={submit}
          className="space-y-5"
        >
          {/* REQUIRED */}

          <div
            className="
              alert
              border
              border-warning/30
              bg-warning/15
              py-3
              text-sm
              font-bold
              text-error
            "
          >
            (*) field required
          </div>


          {/* BASIC */}

          <div
            className="
              grid
              gap-5
              xl:grid-cols-3
            "
          >
            <Field
              label="Shift:"
              required
            >
              <Select
                value={
                  form.shift
                }
                onChange={(
                  event
                ) =>
                  updateForm(
                    "shift",
                    event.target
                      .value
                  )
                }
                options={shifts}
                placeholder="Select Shift"
              />
            </Field>


            <Field
              label="Class:"
              required
            >
              <Select
                value={
                  form.className
                }
                onChange={(
                  event
                ) =>
                  updateForm(
                    "className",
                    event.target
                      .value
                  )
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
                value={
                  form.section
                }
                onChange={(
                  event
                ) =>
                  updateForm(
                    "section",
                    event.target
                      .value
                  )
                }
                options={sections}
                placeholder="Select Section"
              />
            </Field>
          </div>


          {/* SUBJECT ENTRY */}

          <div
            className="
              overflow-hidden
              rounded-md
              border
              border-primary/50
            "
          >
            <div
              className="
                bg-primary
                px-5
                py-2
                font-bold
                text-primary-content
              "
            >
              Subject & Teacher Entry
            </div>


            <div className="overflow-x-auto">
              <table className="table table-sm min-w-[900px]">
                <thead>
                  <tr>
                    <th className="w-16">
                      <button
                        type="button"
                        onClick={addRow}
                        className="
                          btn
                          btn-square
                          btn-sm
                          border-0
                          bg-orange-400
                          text-white
                          hover:bg-orange-500
                        "
                      >
                        <CalendarDays
                          size={16}
                        />
                      </button>
                    </th>

                    <th>
                      Subject
                      <span className="text-error">
                        *
                      </span>
                    </th>

                    <th>
                      Weekday
                      <span className="text-error">
                        *
                      </span>
                    </th>

                    <th>
                      Schedule
                      <span className="text-error">
                        *
                      </span>
                    </th>

                    <th>
                      Teacher
                      <span className="text-error">
                        *
                      </span>
                    </th>

                    <th className="w-20">
                      Action
                    </th>
                  </tr>
                </thead>


                <tbody>
                  <AnimatePresence>
                    {rows.map(
                      (row) => (
                        <motion.tr
                          key={row.id}
                          initial={{
                            opacity: 0,
                            y: 8,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          exit={{
                            opacity: 0,
                            x: -15,
                          }}
                        >
                          <td>
                            <span className="badge badge-ghost">
                              {
                                rows.indexOf(
                                  row
                                ) +
                                1
                              }
                            </span>
                          </td>


                          <td>
                            <Select
                              value={
                                row.subject
                              }
                              onChange={(
                                event
                              ) =>
                                updateRow(
                                  row.id,
                                  "subject",
                                  event
                                    .target
                                    .value
                                )
                              }
                              options={
                                subjects
                              }
                              placeholder="Select Subject"
                            />
                          </td>


                          <td>
                            <Select
                              value={
                                row.weekday
                              }
                              onChange={(
                                event
                              ) =>
                                updateRow(
                                  row.id,
                                  "weekday",
                                  event
                                    .target
                                    .value
                                )
                              }
                              options={
                                weekdays
                              }
                              placeholder="Select Weekday"
                            />
                          </td>


                          <td>
                            <Select
                              value={
                                row.schedule
                              }
                              onChange={(
                                event
                              ) =>
                                updateRow(
                                  row.id,
                                  "schedule",
                                  event
                                    .target
                                    .value
                                )
                              }
                              options={scheduleOptions.map(
                                (
                                  schedule
                                ) =>
                                  schedule.period
                              )}
                              placeholder="Select Schedule"
                            />
                          </td>


                          <td>
                            <Select
                              value={
                                row.teacher
                              }
                              onChange={(
                                event
                              ) =>
                                updateRow(
                                  row.id,
                                  "teacher",
                                  event
                                    .target
                                    .value
                                )
                              }
                              options={
                                teachers
                              }
                              placeholder="Select Teacher"
                            />
                          </td>


                          <td>
                            <button
                              type="button"
                              disabled={
                                rows.length ===
                                1
                              }
                              onClick={() =>
                                removeRow(
                                  row.id
                                )
                              }
                              className="btn btn-error btn-square btn-sm text-white"
                            >
                              <Trash2
                                size={15}
                              />
                            </button>
                          </td>
                        </motion.tr>
                      )
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>


          {/* LOCATION */}

          <div
            className="
              grid
              gap-5
              xl:grid-cols-3
            "
          >
            <Field
              label="Building:"
              required
            >
              <Select
                value={
                  form.building
                }
                onChange={(
                  event
                ) =>
                  updateForm(
                    "building",
                    event.target
                      .value
                  )
                }
                options={
                  buildings
                }
                placeholder="Select Building"
              />
            </Field>


            <Field
              label="Floor:"
              required
            >
              <Select
                value={
                  form.floor
                }
                onChange={(
                  event
                ) =>
                  updateForm(
                    "floor",
                    event.target
                      .value
                  )
                }
                options={floors}
                placeholder="Select Floor"
              />
            </Field>


            <Field
              label="Room:"
              required
            >
              <Select
                value={
                  form.room
                }
                onChange={(
                  event
                ) =>
                  updateForm(
                    "room",
                    event.target
                      .value
                  )
                }
                options={rooms}
                placeholder="Select class room"
              />
            </Field>
          </div>


          <div className="flex justify-center">
            <motion.button
              whileHover={{
                scale: 1.03,
              }}
              whileTap={{
                scale: 0.97,
              }}
              type="submit"
              className="btn btn-success btn-sm text-white"
            >
              <Save size={15} />

              Submit
            </motion.button>
          </div>
        </form>
      </Panel>
    </AnimatedPage>
  );
}


/* =========================================================
   CLASS ROUTINE LIST
========================================================= */

export function ClassRoutineList() {
  const academicBase =
    useAcademicBase();

  const [
    routines,
    setRoutines,
  ] = useState(loadRoutines);

  const [filters, setFilters] =
    useState({
      session: "2026",
      shift: "",
      className: "",
      section: "",
      teacher: "",
    });

  const [
    searchFilters,
    setSearchFilters,
  ] = useState({
    ...filters,
  });

  const [atGlance, setAtGlance] =
    useState(false);


  useEffect(() => {
    saveRoutines(routines);
  }, [routines]);


  const changeFilter = (
    key,
    value
  ) => {
    setFilters((previous) => ({
      ...previous,
      [key]: value,
    }));
  };


  const results =
    useMemo(() => {
      return routines.filter(
        (routine) => {
          if (
            searchFilters.session &&
            routine.session !==
              searchFilters.session
          ) {
            return false;
          }

          if (
            searchFilters.shift &&
            routine.shift !==
              searchFilters.shift
          ) {
            return false;
          }

          if (
            searchFilters.className &&
            routine.className !==
              searchFilters.className
          ) {
            return false;
          }

          if (
            searchFilters.section &&
            routine.section !==
              searchFilters.section
          ) {
            return false;
          }

          if (
            searchFilters.teacher &&
            routine.teacher !==
              searchFilters.teacher
          ) {
            return false;
          }

          return true;
        }
      );
    }, [
      routines,
      searchFilters,
    ]);


  const removeRoutine = (
    id
  ) => {
    if (
      !window.confirm(
        "Delete this class routine entry?"
      )
    ) {
      return;
    }

    setRoutines((previous) =>
      previous.filter(
        (routine) =>
          routine.id !== id
      )
    );
  };


  return (
    <AnimatedPage>
      <Panel
        title="Class Routine List"
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              to={`${academicBase}/class-routine/class-routine-create`}
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

              Create Class routine
            </Link>

            <Link
              to={`${academicBase}/class-routine/class-routine-quick-edit`}
              className="btn btn-success btn-sm text-white"
            >
              <Edit3 size={15} />

              Class Routine Quick Edit
            </Link>
          </div>
        }
      >
        {/* FILTER */}

        <div
          className="
            grid
            gap-x-8
            gap-y-5
            xl:grid-cols-2
          "
        >
          <Field label="Session Year:">
            <Select
              value={
                filters.session
              }
              onChange={(
                event
              ) =>
                changeFilter(
                  "session",
                  event.target
                    .value
                )
              }
              options={sessions}
            />
          </Field>


          <Field label="Shift:">
            <Select
              value={
                filters.shift
              }
              onChange={(
                event
              ) =>
                changeFilter(
                  "shift",
                  event.target
                    .value
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
              onChange={(
                event
              ) =>
                changeFilter(
                  "className",
                  event.target
                    .value
                )
              }
              options={classes}
              placeholder="Select class"
            />
          </Field>


          <Field label="Section:">
            <Select
              value={
                filters.section
              }
              onChange={(
                event
              ) =>
                changeFilter(
                  "section",
                  event.target
                    .value
                )
              }
              options={sections}
              placeholder="Select Section"
            />
          </Field>


          <Field label="Teacher:">
            <Select
              value={
                filters.teacher
              }
              onChange={(
                event
              ) =>
                changeFilter(
                  "teacher",
                  event.target
                    .value
                )
              }
              options={teachers}
              placeholder="Select Teacher"
            />
          </Field>


          <Field label="All Class Routine:">
            <label
              className="
                flex
                cursor-pointer
                items-center
                gap-2
              "
            >
              <input
                type="checkbox"
                checked={
                  atGlance
                }
                onChange={(
                  event
                ) =>
                  setAtGlance(
                    event.target
                      .checked
                  )
                }
                className="checkbox checkbox-success checkbox-sm"
              />

              <span className="text-sm">
                At a glance?
              </span>
            </label>
          </Field>
        </div>


        {/* BUTTONS */}

        <div
          className="
            mt-5
            flex
            flex-wrap
            gap-2
            xl:ml-[128px]
          "
        >
          <motion.button
            whileHover={{
              scale: 1.03,
            }}
            whileTap={{
              scale: 0.97,
            }}
            type="button"
            onClick={() => {
              setSearchFilters({
                ...filters,
              });
            }}
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

            Search List
          </motion.button>


          <button
            type="button"
            onClick={() =>
              window.print()
            }
            className="btn btn-success btn-sm text-white"
          >
            <Printer size={15} />

            Print
          </button>


          <button
            type="button"
            onClick={() =>
              window.print()
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
            <FileDown
              size={15}
            />

            Create PDF
          </button>
        </div>


        {/* TABLE */}

        {!atGlance && (
          <>
            <div className="mt-5 overflow-x-auto">
              <table className="table table-zebra table-sm min-w-[1100px]">
                <thead>
                  <tr className="bg-base-200">
                    <th>
                      Session Year
                    </th>

                    <th>
                      Working Days
                    </th>

                    <th>
                      Class/Section
                    </th>

                    <th>
                      Subject
                    </th>

                    <th>
                      Teacher
                    </th>

                    <th>
                      Building
                      <br />
                      (Floor/Room)
                    </th>

                    <th>
                      Schedules
                      <br />
                      (Start-End)
                    </th>

                    <th>
                      Action
                    </th>
                  </tr>
                </thead>


                <tbody>
                  <AnimatePresence>
                    {results.map(
                      (routine) => (
                        <motion.tr
                          key={
                            routine.id
                          }
                          initial={{
                            opacity: 0,
                            y: 7,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          exit={{
                            opacity: 0,
                            x: -12,
                          }}
                        >
                          <td>
                            {
                              routine.session
                            }
                          </td>

                          <td>
                            {
                              routine.weekday
                            }
                          </td>

                          <td>
                            {
                              routine.className
                            }
                            /
                            {
                              routine.section
                            }
                          </td>

                          <td>
                            {
                              routine.subject
                            }
                          </td>

                          <td>
                            {
                              routine.teacher
                            }
                          </td>

                          <td>
                            {
                              routine.building
                            }

                            <div className="text-xs text-base-content/50">
                              {
                                routine.floor
                              }
                              {" / "}
                              {
                                routine.room
                              }
                            </div>
                          </td>

                          <td>
                            <strong>
                              {
                                routine.period
                              }
                            </strong>

                            <div className="text-xs text-base-content/50">
                              {
                                routine.start
                              }
                              {" - "}
                              {
                                routine.end
                              }
                            </div>
                          </td>

                          <td>
                            <button
                              type="button"
                              onClick={() =>
                                removeRoutine(
                                  routine.id
                                )
                              }
                              className="btn btn-error btn-square btn-sm text-white"
                            >
                              <Trash2
                                size={15}
                              />
                            </button>
                          </td>
                        </motion.tr>
                      )
                    )}
                  </AnimatePresence>


                  {!results.length && (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-8 text-center text-base-content/50"
                      >
                        No class routine
                        found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>


            <div className="mt-5 text-sm font-semibold">
              Showing{" "}
              {
                results.length
              }{" "}
              result
              {results.length ===
              1
                ? ""
                : "s"}
              .
            </div>
          </>
        )}


        {atGlance && (
          <RoutineGlanceTable
            routines={
              results
            }
          />
        )}
      </Panel>
    </AnimatedPage>
  );
}


/* =========================================================
   QUICK EDIT
========================================================= */

export function ClassRoutineQuickEdit() {
  const academicBase =
    useAcademicBase();

  const subjects =
    useMemo(
      () =>
        loadSubjects(),
      []
    );

  const [
    routines,
    setRoutines,
  ] = useState(loadRoutines);

  const [filters, setFilters] =
    useState({
      session: "2026",
      shift: "",
      className: "",
      section: "",
      teacher: "",
    });

  const [searched, setSearched] =
    useState(false);

  const [
    selectedIds,
    setSelectedIds,
  ] = useState([]);


  const searchResults =
    useMemo(() => {
      if (!searched) {
        return [];
      }

      return routines.filter(
        (routine) => {
          if (
            filters.session &&
            routine.session !==
              filters.session
          ) {
            return false;
          }

          if (
            filters.shift &&
            routine.shift !==
              filters.shift
          ) {
            return false;
          }

          if (
            filters.className &&
            routine.className !==
              filters.className
          ) {
            return false;
          }

          if (
            filters.section &&
            routine.section !==
              filters.section
          ) {
            return false;
          }

          if (
            filters.teacher &&
            routine.teacher !==
              filters.teacher
          ) {
            return false;
          }

          return true;
        }
      );
    }, [
      searched,
      routines,
      filters,
    ]);


  const changeFilter = (
    key,
    value
  ) => {
    setFilters((previous) => ({
      ...previous,
      [key]: value,
    }));
  };


  const updateRoutine = (
    id,
    key,
    value
  ) => {
    setRoutines((previous) =>
      previous.map((routine) => {
        if (
          routine.id !== id
        ) {
          return routine;
        }

        if (
          key === "period"
        ) {
          const schedule =
            scheduleOptions.find(
              (item) =>
                item.period ===
                value
            );

          return {
            ...routine,
            period:
              value,

            start:
              schedule?.start ||
              routine.start,

            end:
              schedule?.end ||
              routine.end,
          };
        }

        return {
          ...routine,
          [key]: value,
        };
      })
    );
  };


  const save = () => {
    saveRoutines(routines);

    alert(
      "Class routine updated successfully."
    );
  };


  return (
    <AnimatedPage>
      <Panel
        title="Class Routine Quick Update"
        action={
          <Link
            to={`${academicBase}/class-routine/class-routine-create`}
            className="
              btn
              btn-sm
              border-0
              bg-cyan-500
              text-white
              hover:bg-cyan-600
            "
          >
            Create Class routine
          </Link>
        }
      >
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
          <Field label="Session Year:">
            <Select
              value={
                filters.session
              }
              onChange={(
                event
              ) =>
                changeFilter(
                  "session",
                  event.target
                    .value
                )
              }
              options={sessions}
            />
          </Field>


          <Field label="School Shift:">
            <Select
              value={
                filters.shift
              }
              onChange={(
                event
              ) =>
                changeFilter(
                  "shift",
                  event.target
                    .value
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
              onChange={(
                event
              ) =>
                changeFilter(
                  "className",
                  event.target
                    .value
                )
              }
              options={classes}
              placeholder="Select class"
            />
          </Field>


          <Field label="Section:">
            <Select
              value={
                filters.section
              }
              onChange={(
                event
              ) =>
                changeFilter(
                  "section",
                  event.target
                    .value
                )
              }
              options={sections}
              placeholder="Select Section"
            />
          </Field>


          <Field label="Teacher:">
            <Select
              value={
                filters.teacher
              }
              onChange={(
                event
              ) =>
                changeFilter(
                  "teacher",
                  event.target
                    .value
                )
              }
              options={teachers}
              placeholder="Select Teacher"
            />
          </Field>
        </div>


        <div className="mt-5 flex justify-center">
          <motion.button
            whileHover={{
              scale: 1.03,
            }}
            whileTap={{
              scale: 0.97,
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


        {searched && (
          <motion.div
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mt-6"
          >
            <div className="overflow-x-auto">
              <table className="table table-zebra table-sm min-w-[1300px]">
                <thead>
                  <tr className="bg-base-200">
                    <th>
                      Subject
                    </th>

                    <th>
                      Weekday
                    </th>

                    <th>
                      Schedule
                    </th>

                    <th>
                      Teacher
                    </th>

                    <th>
                      Building
                    </th>

                    <th>
                      Floor
                    </th>

                    <th>
                      Room
                    </th>
                  </tr>
                </thead>


                <tbody>
                  {searchResults.map(
                    (routine) => (
                      <tr
                        key={
                          routine.id
                        }
                      >
                        <td>
                          <Select
                            value={
                              routine.subject
                            }
                            onChange={(
                              event
                            ) =>
                              updateRoutine(
                                routine.id,
                                "subject",
                                event
                                  .target
                                  .value
                              )
                            }
                            options={
                              subjects
                            }
                          />
                        </td>

                        <td>
                          <Select
                            value={
                              routine.weekday
                            }
                            onChange={(
                              event
                            ) =>
                              updateRoutine(
                                routine.id,
                                "weekday",
                                event
                                  .target
                                  .value
                              )
                            }
                            options={
                              weekdays
                            }
                          />
                        </td>

                        <td>
                          <Select
                            value={
                              routine.period
                            }
                            onChange={(
                              event
                            ) =>
                              updateRoutine(
                                routine.id,
                                "period",
                                event
                                  .target
                                  .value
                              )
                            }
                            options={scheduleOptions.map(
                              (
                                item
                              ) =>
                                item.period
                            )}
                          />
                        </td>

                        <td>
                          <Select
                            value={
                              routine.teacher
                            }
                            onChange={(
                              event
                            ) =>
                              updateRoutine(
                                routine.id,
                                "teacher",
                                event
                                  .target
                                  .value
                              )
                            }
                            options={
                              teachers
                            }
                          />
                        </td>

                        <td>
                          <Select
                            value={
                              routine.building
                            }
                            onChange={(
                              event
                            ) =>
                              updateRoutine(
                                routine.id,
                                "building",
                                event
                                  .target
                                  .value
                              )
                            }
                            options={
                              buildings
                            }
                          />
                        </td>

                        <td>
                          <Select
                            value={
                              routine.floor
                            }
                            onChange={(
                              event
                            ) =>
                              updateRoutine(
                                routine.id,
                                "floor",
                                event
                                  .target
                                  .value
                              )
                            }
                            options={
                              floors
                            }
                          />
                        </td>

                        <td>
                          <Select
                            value={
                              routine.room
                            }
                            onChange={(
                              event
                            ) =>
                              updateRoutine(
                                routine.id,
                                "room",
                                event
                                  .target
                                  .value
                              )
                            }
                            options={
                              rooms
                            }
                          />
                        </td>
                      </tr>
                    )
                  )}


                  {!searchResults.length && (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-8 text-center text-base-content/50"
                      >
                        No matching routine
                        found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>


            {!!searchResults.length && (
              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={save}
                  className="btn btn-success text-white"
                >
                  <Save size={17} />

                  Save Changes
                </button>
              </div>
            )}
          </motion.div>
        )}
      </Panel>
    </AnimatedPage>
  );
}


/* =========================================================
   GLANCE TABLE
========================================================= */

function RoutineGlanceTable({
  routines,
}) {
  const teacherNames =
    useMemo(
      () =>
        [
          ...new Set(
            routines.map(
              (routine) =>
                routine.teacher
            )
          ),
        ],
      [routines]
    );


  return (
    <div className="mt-5 overflow-x-auto">
      <table className="table min-w-[1100px] border border-base-300">
        <thead>
          <tr
            className="
              bg-info
              text-info-content
            "
          >
            <th className="min-w-44">
              Teacher's Name
            </th>

            {scheduleOptions.map(
              (schedule) => (
                <th
                  key={
                    schedule.period
                  }
                  className="min-w-52"
                >
                  <div className="font-black">
                    {
                      schedule.period
                    }
                  </div>

                  <div className="mt-1 text-[10px] font-medium opacity-80">
                    {
                      schedule.start
                    }
                    {" - "}
                    {
                      schedule.end
                    }
                  </div>
                </th>
              )
            )}
          </tr>
        </thead>


        <tbody>
          {teacherNames.map(
            (teacher) => (
              <tr key={teacher}>
                <th>
                  {teacher}
                </th>

                {scheduleOptions.map(
                  (schedule) => {
                    const entries =
                      routines.filter(
                        (
                          routine
                        ) =>
                          routine.teacher ===
                            teacher &&
                          routine.period ===
                            schedule.period
                      );

                    return (
                      <td
                        key={
                          schedule.period
                        }
                        className="align-top"
                      >
                        {entries.length
                          ? entries.map(
                              (
                                entry
                              ) => (
                                <div
                                  key={
                                    entry.id
                                  }
                                  className="
                                    mb-2
                                    rounded-lg
                                    border
                                    border-success/20
                                    bg-success/5
                                    p-2
                                    text-xs
                                  "
                                >
                                  <strong>
                                    {
                                      entry.subject
                                    }
                                  </strong>

                                  <div>
                                    {
                                      entry.className
                                    }
                                    /
                                    {
                                      entry.section
                                    }
                                  </div>

                                  <div className="text-base-content/60">
                                    {
                                      entry.weekday
                                    }
                                  </div>

                                  <div className="text-base-content/60">
                                    {
                                      entry.room
                                    }
                                  </div>
                                </div>
                              )
                            )
                          : (
                            <span className="text-base-content/30">
                              —
                            </span>
                          )}
                      </td>
                    );
                  }
                )}
              </tr>
            )
          )}


          {!teacherNames.length && (
            <tr>
              <td
                colSpan={
                  scheduleOptions.length +
                  1
                }
                className="py-10 text-center text-base-content/50"
              >
                No routine data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}


/* =========================================================
   CLASS ROUTINE AT A GLANCE
========================================================= */

export function ClassRoutineAtAGlance() {
  const academicBase =
    useAcademicBase();

  const [
    session,
    setSession,
  ] = useState("2026");

  const [
    searchedSession,
    setSearchedSession,
  ] = useState("2026");

  const [routines] =
    useState(loadRoutines);


  const results =
    useMemo(
      () =>
        routines.filter(
          (routine) =>
            !searchedSession ||
            routine.session ===
              searchedSession
        ),
      [
        routines,
        searchedSession,
      ]
    );


  return (
    <AnimatedPage>

      {/* FILTER */}

      <Panel
        title="Class Routine At A Glance"
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              to={`${academicBase}/class-routine/class-routine-create`}
              className="
                btn
                btn-sm
                border-0
                bg-cyan-500
                text-white
                hover:bg-cyan-600
              "
            >
              Create Class routine
            </Link>

            <Link
              to={`${academicBase}/class-routine/class-routine-quick-edit`}
              className="btn btn-success btn-sm text-white"
            >
              Class Routine Quick Edit
            </Link>
          </div>
        }
      >
        <div className="max-w-xl">
          <Field label="Session Year:">
            <Select
              value={session}
              onChange={(
                event
              ) =>
                setSession(
                  event.target
                    .value
                )
              }
              options={sessions}
            />
          </Field>
        </div>


        <div
          className="
            mt-5
            flex
            flex-wrap
            gap-2
            md:ml-[128px]
          "
        >
          <button
            type="button"
            onClick={() =>
              setSearchedSession(
                session
              )
            }
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
          </button>


          <button
            type="button"
            onClick={() =>
              window.print()
            }
            className="btn btn-success btn-sm text-white"
          >
            <Printer size={15} />

            Print
          </button>


          <button
            type="button"
            onClick={() =>
              window.print()
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
            <FileDown size={15} />

            Create PDF
          </button>
        </div>
      </Panel>


      {/* ROUTINE */}

      <Panel title="Class Routine">
        <RoutineGlanceTable
          routines={results}
        />
      </Panel>

    </AnimatedPage>
  );
}