import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  Download,
  Edit3,
  FileSpreadsheet,
  Plus,
  Search,
  Trash2,
  Upload,
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

const SUBJECT_STORAGE_KEY =
  "expertAcademicSubjects";


/* =========================================================
   DATA
========================================================= */

const sessions = [
  "2026",
  "2025",
  "2024",
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

const groups = [
  "Science",
  "Business",
  "Humanities",
];

const subjectCategories = [
  "Regular",
  "Optional",
  "Additional",
  "Compulsory",
];


const defaultSubjects = [
  {
    id: "SUB-001",
    serial: 1,
    className: "SSC",
    groups: [
      "Business",
      "Humanities",
      "Science",
    ],
    code: "101",
    name: "Bangla 1st Paper",
    category: "Regular",
    session: "2026",
    createdBy:
      "Expert Coaching Center",
    createdAt:
      "2026-01-26 17:02:48",
  },

  {
    id: "SUB-002",
    serial: 2,
    className: "SSC",
    groups: [
      "Business",
      "Humanities",
      "Science",
    ],
    code: "108",
    name: "English 2nd Paper",
    category: "Regular",
    session: "2026",
    createdBy:
      "Expert Coaching Center",
    createdAt:
      "2026-01-26 17:02:48",
  },

  {
    id: "SUB-003",
    serial: 3,
    className: "Inter 1st year",
    groups: [
      "Business",
      "Humanities",
      "Science",
    ],
    code: "102",
    name: "Bangla 2nd Paper",
    category: "Regular",
    session: "2025",
    createdBy:
      "Expert Coaching Center",
    createdAt:
      "2025-04-09 16:32:28",
  },

  {
    id: "SUB-004",
    serial: 4,
    className: "Inter 1st year",
    groups: [
      "Business",
      "Humanities",
      "Science",
    ],
    code: "107",
    name: "English 1st Paper",
    category: "Regular",
    session: "2026",
    createdBy:
      "Expert Coaching Center",
    createdAt:
      "2026-02-21 15:49:44",
  },

  {
    id: "SUB-005",
    serial: 5,
    className: "SSC",
    groups: [
      "Business",
      "Humanities",
      "Science",
    ],
    code: "102",
    name: "Bangla 2nd Paper",
    category: "Regular",
    session: "2026",
    createdBy:
      "Expert Coaching Center",
    createdAt:
      "2026-01-26 17:02:48",
  },

  {
    id: "SUB-006",
    serial: 6,
    className: "SSC",
    groups: [
      "Business",
      "Humanities",
      "Science",
    ],
    code: "154",
    name: "ICT",
    category: "Regular",
    session: "2026",
    createdBy:
      "Expert Coaching Center",
    createdAt:
      "2026-01-26 17:02:48",
  },

  {
    id: "SUB-007",
    serial: 7,
    className: "Inter 1st year",
    groups: [
      "Business",
      "Humanities",
      "Science",
    ],
    code: "102",
    name: "Bangla 2nd Paper",
    category: "Regular",
    session: "2026",
    createdBy:
      "Expert Coaching Center",
    createdAt:
      "2026-02-21 15:49:44",
  },

  {
    id: "SUB-008",
    serial: 8,
    className: "Inter 1st year",
    groups: [
      "Business",
      "Humanities",
      "Science",
    ],
    code: "275",
    name:
      "Information and Communication Technology",
    category: "Regular",
    session: "2026",
    createdBy:
      "Expert Coaching Center",
    createdAt:
      "2026-02-21 15:49:44",
  },

  {
    id: "SUB-009",
    serial: 9,
    className: "SSC",
    groups: [
      "Business",
      "Humanities",
      "Science",
    ],
    code: "107",
    name: "English 1st Paper",
    category: "Regular",
    session: "2026",
    createdBy:
      "Expert Coaching Center",
    createdAt:
      "2026-01-26 17:02:48",
  },

  {
    id: "SUB-010",
    serial: 10,
    className: "SSC",
    groups: [
      "Business",
      "Humanities",
      "Science",
    ],
    code: "109",
    name: "Mathematics",
    category: "Regular",
    session: "2026",
    createdBy:
      "Expert Coaching Center",
    createdAt:
      "2026-01-26 17:02:48",
  },
];


/* =========================================================
   STORAGE HELPERS
========================================================= */

function loadSubjects() {
  try {
    const saved =
      localStorage.getItem(
        SUBJECT_STORAGE_KEY
      );

    return saved
      ? JSON.parse(saved)
      : defaultSubjects;
  } catch {
    return defaultSubjects;
  }
}


function saveSubjects(subjects) {
  localStorage.setItem(
    SUBJECT_STORAGE_KEY,
    JSON.stringify(subjects)
  );
}


/* =========================================================
   GSAP WRAPPER
========================================================= */

function AnimatedPage({
  children,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const context =
      gsap.context(() => {
        gsap.from(
          "[data-academic-panel]",
          {
            opacity: 0,
            y: 20,
            duration: 0.5,
            stagger: 0.1,
            ease: "power2.out",
          }
        );
      }, ref);

    return () =>
      context.revert();
  }, []);

  return (
    <div
      ref={ref}
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
      data-academic-panel
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
   FIELD
========================================================= */

function Field({
  label,
  children,
}) {
  return (
    <label
      className="
        grid
        gap-2
        sm:grid-cols-[180px_minmax(0,1fr)]
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
   CREATE SUBJECT MODAL
========================================================= */

const emptySubject = {
  className: "",
  groups: [],
  code: "",
  name: "",
  category: "Regular",
  session: "2026",
};


function SubjectModal({
  open,
  subject,
  onClose,
  onSave,
}) {
  const [form, setForm] =
    useState(emptySubject);

  useEffect(() => {
    if (!open) return;

    setForm(
      subject
        ? {
            className:
              subject.className,

            groups:
              subject.groups || [],

            code:
              subject.code,

            name:
              subject.name,

            category:
              subject.category,

            session:
              subject.session,
          }
        : emptySubject
    );
  }, [open, subject]);


  const change = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  const toggleGroup = (
    group
  ) => {
    setForm((previous) => ({
      ...previous,

      groups:
        previous.groups.includes(
          group
        )
          ? previous.groups.filter(
              (item) =>
                item !== group
            )
          : [
              ...previous.groups,
              group,
            ],
    }));
  };


  const submit = (
    event
  ) => {
    event.preventDefault();

    if (
      !form.className ||
      !form.code.trim() ||
      !form.name.trim()
    ) {
      alert(
        "Class, subject code and subject name are required."
      );

      return;
    }

    onSave(form);
  };


  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          className="
            fixed
            inset-0
            z-[100]
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
              scale: 0.95,
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
              max-w-2xl
              rounded-xl
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
                px-6
                py-4
              "
            >
              <h3 className="text-lg font-black">
                {subject
                  ? "Update Subject"
                  : "Create Subject"}
              </h3>

              <button
                type="button"
                onClick={onClose}
                className="btn btn-circle btn-ghost btn-sm"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={submit}
              className="space-y-5 p-6"
            >
              <div
                className="
                  grid
                  gap-4
                  sm:grid-cols-2
                "
              >
                <label className="form-control">
                  <span className="label-text mb-2 font-bold">
                    Session
                  </span>

                  <select
                    name="session"
                    value={
                      form.session
                    }
                    onChange={change}
                    className="select select-bordered w-full"
                  >
                    {sessions.map(
                      (item) => (
                        <option
                          key={item}
                        >
                          {item}
                        </option>
                      )
                    )}
                  </select>
                </label>


                <label className="form-control">
                  <span className="label-text mb-2 font-bold">
                    Class *
                  </span>

                  <select
                    name="className"
                    value={
                      form.className
                    }
                    onChange={change}
                    className="select select-bordered w-full"
                  >
                    <option value="">
                      Select Class
                    </option>

                    {classes.map(
                      (item) => (
                        <option
                          key={item}
                        >
                          {item}
                        </option>
                      )
                    )}
                  </select>
                </label>


                <label className="form-control">
                  <span className="label-text mb-2 font-bold">
                    Subject Code *
                  </span>

                  <input
                    name="code"
                    value={form.code}
                    onChange={change}
                    className="input input-bordered w-full"
                    placeholder="e.g. 101"
                  />
                </label>


                <label className="form-control">
                  <span className="label-text mb-2 font-bold">
                    Subject Name *
                  </span>

                  <input
                    name="name"
                    value={form.name}
                    onChange={change}
                    className="input input-bordered w-full"
                    placeholder="Subject name"
                  />
                </label>


                <label className="form-control">
                  <span className="label-text mb-2 font-bold">
                    Category
                  </span>

                  <select
                    name="category"
                    value={
                      form.category
                    }
                    onChange={change}
                    className="select select-bordered w-full"
                  >
                    {subjectCategories.map(
                      (item) => (
                        <option
                          key={item}
                        >
                          {item}
                        </option>
                      )
                    )}
                  </select>
                </label>
              </div>


              <div>
                <span className="mb-2 block text-sm font-bold">
                  Groups
                </span>

                <div className="flex flex-wrap gap-4">
                  {groups.map(
                    (group) => (
                      <label
                        key={group}
                        className="flex cursor-pointer items-center gap-2"
                      >
                        <input
                          type="checkbox"
                          className="checkbox checkbox-success checkbox-sm"
                          checked={
                            form.groups.includes(
                              group
                            )
                          }
                          onChange={() =>
                            toggleGroup(
                              group
                            )
                          }
                        />

                        <span>
                          {group}
                        </span>
                      </label>
                    )
                  )}
                </div>
              </div>


              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-success text-white"
                >
                  {subject
                    ? "Update Subject"
                    : "Create Subject"}
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
   SUBJECT TRANSFER
========================================================= */

export function SubjectTransfer() {
  const [session, setSession] =
    useState("2026");

  const [
    selectedClasses,
    setSelectedClasses,
  ] = useState([]);

  const [open, setOpen] =
    useState(false);

  const [searched, setSearched] =
    useState(false);


  const toggleClass = (
    className
  ) => {
    setSelectedClasses(
      (previous) =>
        previous.includes(
          className
        )
          ? previous.filter(
              (item) =>
                item !==
                className
            )
          : [
              ...previous,
              className,
            ]
    );
  };


  return (
    <AnimatedPage>
      <Panel
        title="Subject Transfer"
        action={
          <Link
            to="/dashboard/academic/subject/subject"
            className="
              btn
              btn-sm
              border-0
              bg-cyan-500
              text-white
              hover:bg-cyan-600
            "
          >
            Back to Subject List
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
          <Field label="Session:">
            <select
              value={session}
              onChange={(event) =>
                setSession(
                  event.target.value
                )
              }
              className="
                select
                select-bordered
                select-sm
                w-full
              "
            >
              {sessions.map(
                (item) => (
                  <option
                    key={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>
          </Field>


          <Field label="Class:">
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpen(
                    (value) =>
                      !value
                  )
                }
                className="
                  select
                  select-bordered
                  select-sm
                  flex
                  w-full
                  items-center
                  text-left
                  font-normal
                "
              >
                {selectedClasses.length
                  ? selectedClasses.join(
                      ", "
                    )
                  : "Nothing selected"}
              </button>

              {open && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -5,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="
                    absolute
                    left-0
                    right-0
                    top-full
                    z-20
                    mt-1
                    max-h-64
                    overflow-y-auto
                    rounded-lg
                    border
                    border-base-300
                    bg-base-100
                    p-2
                    shadow-xl
                  "
                >
                  {classes.map(
                    (className) => (
                      <label
                        key={
                          className
                        }
                        className="
                          flex
                          cursor-pointer
                          items-center
                          gap-2
                          rounded-md
                          px-3
                          py-2
                          hover:bg-base-200
                        "
                      >
                        <input
                          type="checkbox"
                          className="checkbox checkbox-success checkbox-xs"
                          checked={selectedClasses.includes(
                            className
                          )}
                          onChange={() =>
                            toggleClass(
                              className
                            )
                          }
                        />

                        {className}
                      </label>
                    )
                  )}
                </motion.div>
              )}
            </div>
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


        {searched && (
          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mt-6 alert"
          >
            <span>
              Searching session{" "}
              <strong>
                {session}
              </strong>

              {selectedClasses.length
                ? ` for ${selectedClasses.join(
                    ", "
                  )}`
                : ". Select at least one class to transfer subjects."}
            </span>
          </motion.div>
        )}
      </Panel>
    </AnimatedPage>
  );
}


/* =========================================================
   SUBJECT EXCEL ENTRY
========================================================= */

export function SubjectExcelEntry() {
  const [
    selectedFile,
    setSelectedFile,
  ] = useState(null);


  const downloadTemplate =
    () => {
      const csv = [
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
          "Science|Business|Humanities",
          "101",
          "Bangla 1st Paper",
          "Regular",
        ],
      ]
        .map((row) =>
          row.join(",")
        )
        .join("\n");


      const blob =
        new Blob(
          [csv],
          {
            type: "text/csv;charset=utf-8",
          }
        );

      const url =
        URL.createObjectURL(
          blob
        );

      const anchor =
        document.createElement(
          "a"
        );

      anchor.href = url;

      anchor.download =
        "subject-excel-format.csv";

      anchor.click();

      URL.revokeObjectURL(
        url
      );
    };


  const handleUpload =
    () => {
      if (!selectedFile) {
        alert(
          "Choose a file first."
        );

        return;
      }

      alert(
        `Selected file: ${selectedFile.name}`
      );
    };


  return (
    <AnimatedPage>
      <Panel
        title="Subject Quick Excel Entry"
        action={
          <Link
            to="/dashboard/academic/subject/subject"
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

            Create Subject
          </Link>
        }
      >
        <div
          className="
            mx-auto
            grid
            max-w-5xl
            gap-7
            py-12
            md:grid-cols-2
          "
        >
          <div>
            <label
              className="
                btn
                w-full
                border-0
                bg-slate-600
                text-white
                hover:bg-slate-700
              "
            >
              <Upload size={17} />

              {selectedFile
                ? selectedFile.name
                : "Upload Excel Format"}

              <input
                type="file"
                hidden
                accept=".csv,.xlsx,.xls"
                onChange={(
                  event
                ) =>
                  setSelectedFile(
                    event.target
                      .files?.[0] ||
                      null
                  )
                }
              />
            </label>

            <button
              type="button"
              onClick={
                handleUpload
              }
              disabled={
                !selectedFile
              }
              className="btn btn-success btn-sm mt-3 w-full text-white"
            >
              Upload Selected File
            </button>
          </div>


          <div>
            <motion.button
              whileHover={{
                scale: 1.01,
              }}
              whileTap={{
                scale: 0.98,
              }}
              type="button"
              onClick={
                downloadTemplate
              }
              className="
                btn
                w-full
                border-0
                bg-violet-600
                text-white
                hover:bg-violet-700
              "
            >
              <Download
                size={17}
              />

              Download Excel
              Format
            </motion.button>
          </div>
        </div>
      </Panel>
    </AnimatedPage>
  );
}


/* =========================================================
   SUBJECT LIST
========================================================= */

export function SubjectList() {
  const [subjects, setSubjects] =
    useState(loadSubjects);

  const [
    session,
    setSession,
  ] = useState("2026");

  const [
    className,
    setClassName,
  ] = useState("");

  const [
    searched,
    setSearched,
  ] = useState(false);

  const [page, setPage] =
    useState(1);

  const pageSize = 10;

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [
    editingSubject,
    setEditingSubject,
  ] = useState(null);


  useEffect(() => {
    saveSubjects(subjects);
  }, [subjects]);


  const filtered =
    useMemo(() => {
      if (!searched) {
        return subjects;
      }

      return subjects.filter(
        (subject) => {
          if (
            session &&
            subject.session !==
              session
          ) {
            return false;
          }

          if (
            className &&
            subject.className !==
              className
          ) {
            return false;
          }

          return true;
        }
      );
    }, [
      subjects,
      searched,
      session,
      className,
    ]);


  const pageCount =
    Math.max(
      1,
      Math.ceil(
        filtered.length /
          pageSize
      )
    );


  const displayedSubjects =
    filtered.slice(
      (page - 1) *
        pageSize,

      page * pageSize
    );


  const openCreate =
    () => {
      setEditingSubject(
        null
      );

      setModalOpen(true);
    };


  const openEdit = (
    subject
  ) => {
    setEditingSubject(
      subject
    );

    setModalOpen(true);
  };


  const saveSubject = (
    form
  ) => {
    if (editingSubject) {
      setSubjects(
        (previous) =>
          previous.map(
            (subject) =>
              subject.id ===
              editingSubject.id
                ? {
                    ...subject,
                    ...form,
                  }
                : subject
          )
      );
    } else {
      setSubjects(
        (previous) => [
          ...previous,

          {
            ...form,

            id: `SUB-${Date.now()}`,

            serial:
              previous.length +
              1,

            createdBy:
              "Expert Coaching Center",

            createdAt:
              new Date()
                .toISOString()
                .replace(
                  "T",
                  " "
                )
                .slice(
                  0,
                  19
                ),
          },
        ]
      );
    }

    setModalOpen(false);

    setEditingSubject(
      null
    );
  };


  const removeSubject = (
    id
  ) => {
    if (
      !window.confirm(
        "Delete this subject?"
      )
    ) {
      return;
    }

    setSubjects(
      (previous) =>
        previous.filter(
          (subject) =>
            subject.id !== id
        )
    );
  };


  const updateSerial =
    () => {
      setSubjects(
        (previous) =>
          previous.map(
            (
              subject,
              index
            ) => ({
              ...subject,

              serial:
                index + 1,
            })
          )
      );

      alert(
        "Subject serial updated."
      );
    };


  return (
    <AnimatedPage>

      {/* SEARCH */}

      <Panel
        title="Subject List"
        action={
          <button
            type="button"
            onClick={
              openCreate
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
            <Plus size={15} />

            Create Subject
          </button>
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
          <Field label="Session:">
            <select
              value={session}
              onChange={(
                event
              ) =>
                setSession(
                  event.target
                    .value
                )
              }
              className="select select-bordered select-sm w-full"
            >
              {sessions.map(
                (item) => (
                  <option
                    key={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>
          </Field>


          <Field label="Class:">
            <select
              value={
                className
              }
              onChange={(
                event
              ) =>
                setClassName(
                  event.target
                    .value
                )
              }
              className="select select-bordered select-sm w-full"
            >
              <option value="">
                Select Class
              </option>

              {classes.map(
                (item) => (
                  <option
                    key={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>
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
            onClick={() => {
              setPage(1);
              setSearched(true);
            }}
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


      {/* TABLE */}

      <Panel
        title="Subject List"
        action={
          <button
            type="button"
            onClick={
              updateSerial
            }
            className="btn btn-success btn-sm text-white"
          >
            Update Subject Serial
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="table table-zebra table-sm min-w-[1200px]">
            <thead>
              <tr className="bg-base-200">
                <th>
                  Serial No
                </th>

                <th>
                  Class Name
                </th>

                <th>Groups</th>

                <th>
                  Subject Code
                </th>

                <th>
                  Subject Name
                </th>

                <th>
                  Subject Category
                </th>

                <th>Session</th>

                <th>
                  Created By
                </th>

                <th>Action</th>
              </tr>
            </thead>


            <tbody>
              <AnimatePresence>
                {displayedSubjects.map(
                  (subject) => (
                    <motion.tr
                      key={
                        subject.id
                      }
                      initial={{
                        opacity: 0,
                        y: 6,
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
                        {
                          subject.serial
                        }
                      </td>

                      <td>
                        {
                          subject.className
                        }
                      </td>

                      <td>
                        {subject.groups.join(
                          ", "
                        )}
                      </td>

                      <td>
                        {
                          subject.code
                        }
                      </td>

                      <td className="font-medium">
                        {
                          subject.name
                        }
                      </td>

                      <td>
                        <span className="badge badge-success badge-outline badge-sm">
                          {
                            subject.category
                          }
                        </span>
                      </td>

                      <td>
                        {
                          subject.session
                        }
                      </td>

                      <td>
                        <div>
                          <div>
                            {
                              subject.createdBy
                            }
                          </div>

                          <div className="text-xs text-base-content/50">
                            {
                              subject.createdAt
                            }
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              openEdit(
                                subject
                              )
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
                            title="Edit"
                          >
                            <Edit3
                              size={15}
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              removeSubject(
                                subject.id
                              )
                            }
                            className="btn btn-error btn-square btn-sm text-white"
                            title="Delete"
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


              {!displayedSubjects.length && (
                <tr>
                  <td
                    colSpan={9}
                    className="py-10 text-center text-base-content/50"
                  >
                    No subjects found.
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
            {filtered.length
              ? (page - 1) *
                  pageSize +
                1
              : 0}{" "}
            to{" "}
            {Math.min(
              page *
                pageSize,
              filtered.length
            )}{" "}
            of{" "}
            {
              filtered.length
            }{" "}
            results.
          </strong>


          <div className="join">
            <button
              type="button"
              disabled={
                page === 1
              }
              onClick={() =>
                setPage(
                  (current) =>
                    current - 1
                )
              }
              className="join-item btn btn-sm"
            >
              &lt;
            </button>


            {Array.from(
              {
                length:
                  pageCount,
              },
              (_, index) =>
                index + 1
            )
              .slice(0, 5)
              .map(
                (pageNumber) => (
                  <button
                    key={
                      pageNumber
                    }
                    type="button"
                    onClick={() =>
                      setPage(
                        pageNumber
                      )
                    }
                    className={`join-item btn btn-sm ${
                      page ===
                      pageNumber
                        ? "btn-primary"
                        : ""
                    }`}
                  >
                    {
                      pageNumber
                    }
                  </button>
                )
              )}


            <button
              type="button"
              disabled={
                page ===
                pageCount
              }
              onClick={() =>
                setPage(
                  (current) =>
                    current + 1
                )
              }
              className="join-item btn btn-sm"
            >
              &gt;
            </button>
          </div>
        </div>
      </Panel>


      <SubjectModal
        open={modalOpen}
        subject={
          editingSubject
        }
        onClose={() => {
          setModalOpen(false);

          setEditingSubject(
            null
          );
        }}
        onSave={
          saveSubject
        }
      />
    </AnimatedPage>
  );
}