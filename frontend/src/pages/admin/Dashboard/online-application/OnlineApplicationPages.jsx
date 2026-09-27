import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import gsap from "gsap";

import {
  CheckCircle2,
  ClipboardCheck,
  ChevronDown,
  FileSpreadsheet,
  FileDown,
  FileText,
  GraduationCap,
  Printer,
  ReceiptText,
  Search,
  Settings2,
  Trash2,
  UserPlus,
  XCircle,
} from "lucide-react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";


/* =========================================================
   STORAGE
========================================================= */

const APPLICATION_STORAGE =
  "expertOnlineApplications";

const PENDING_STORAGE =
  "expertPendingApplications";

const FORM_SETTINGS_STORAGE =
  "expertAdmissionFormSettings";


/* =========================================================
   ONLINE APPLICATION DASHBOARD MENU
========================================================= */

const onlineApplicationGroups = [
  {
    label: "Application",
    count: 3,
    icon: FileText,
    path: "application",
    color: "bg-emerald-600",
    items: [
      ["Application List", "application/application-list"],
      ["Pending List", "application/pending-list"],
      ["Form Setting", "application/form-setting"],
    ],
  },
  {
    label: "Admission Exam",
    count: 5,
    icon: GraduationCap,
    path: "admission-exam",
    color: "bg-sky-600",
    items: [
      ["Mark Configure", "admission-exam/mark-configure"],
      ["Add Mark", "admission-exam/add-mark"],
      ["Delete Marks", "admission-exam/delete-marks"],
      ["Update Mark", "admission-exam/update-mark"],
      ["Seat Plan", "admission-exam/seat-plan"],
    ],
  },
  {
    label: "Admission Result",
    count: 4,
    icon: ClipboardCheck,
    path: "admission-result",
    color: "bg-violet-600",
    items: [
      ["Result Process", "admission-result/result-process"],
      ["Tabulation Sheet", "admission-result/tabulation-sheet"],
      ["Promoted List", "admission-result/promoted-list"],
      ["Subject Wise Result", "admission-result/subject-wise-result"],
    ],
  },
  {
    label: "Application Report",
    count: 3,
    icon: ReceiptText,
    path: "application-report",
    color: "bg-amber-600",
    items: [
      ["Fees Report", "application-report/fees-report"],
      ["Application Report", "application-report/application-report"],
      ["Amount Collected", "application-report/amount-collected"],
    ],
  },
];

const onlineBaseFromPath = (pathname) => {
  if (pathname.includes("/admin/dashboard/2-online-application")) {
    return "/admin/dashboard/2-online-application";
  }

  if (pathname.includes("/admin/dashboard/online-application")) {
    return "/admin/dashboard/online-application";
  }

  if (pathname.includes("/dashboard/2-online-application")) {
    return "/dashboard/2-online-application";
  }

  return "/dashboard/online-application";
};

const onlinePath = (basePath, childPath = "") =>
  childPath ? `${basePath}/${childPath}` : basePath;


/* =========================================================
   DEMO DATA
========================================================= */

const demoPendingApplications = [
  {
    id: "PENDING-001",
    studentId: "APP-2026-001",
    studentName: "Fahim Hasan",
    photo:
      "https://placehold.co/80x80/e8f2ee/173d33?text=FH",
    gender: "Male",
    className: "Nine",
    session: "2026",
    shift: "Morning",

    contact: "01711000001",

    paymentNumber:
      "01711000001",

    senderNumber:
      "01811000002",

    paymentMethod:
      "bKash",

    transactionId:
      "TRX-852412",

    amount: 1500,

    paidTo:
      "Admission Fee",

    paidBy:
      "Guardian",

    createdDate:
      "2026-09-15",
  },
];


const sessions = [
  "2026",
  "2025",
  "2024",
  "2023",
];

const shifts = [
  "Morning",
  "Day",
  "Evening",
];

const classes = [
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "HSC 1st Year",
  "HSC 2nd Year",
];

const paidToOptions = [
  "Admission Fee",
  "Application Fee",
  "Registration Fee",
];

const paidByOptions = [
  "Student",
  "Guardian",
  "Parent",
  "Others",
];

const paymentMethods = [
  "Cash",
  "bKash",
  "Nagad",
  "Rocket",
  "Bank",
  "Online",
];


/* =========================================================
   HELPERS
========================================================= */

function loadStorage(key, fallback) {
  try {
    const value =
      localStorage.getItem(key);

    return value
      ? JSON.parse(value)
      : fallback;
  } catch {
    return fallback;
  }
}


function saveStorage(
  key,
  value
) {
  localStorage.setItem(
    key,
    JSON.stringify(value)
  );
}


/* =========================================================
   GSAP PAGE WRAPPER
========================================================= */

function AnimatedPage({
  children,
}) {
  const rootRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(
      () => {
        gsap.from(
          "[data-gsap-panel]",
          {
            opacity: 0,
            y: 18,
            duration: 0.5,
            stagger: 0.1,
            ease: "power2.out",
          }
        );
      },
      rootRef
    );

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      className="space-y-6"
    >
      {children}
    </div>
  );
}


/* =========================================================
   PANEL
========================================================= */

function Panel({
  title,
  icon: Icon,
  action,
  children,
}) {
  return (
    <section
      data-gsap-panel
      className="
        overflow-hidden
        rounded-lg
        border
        border-base-300
        bg-base-100
        shadow-sm
      "
    >
      <div
        className="
          flex
          min-h-12
          items-center
          justify-between
          gap-4
          bg-success
          px-5
          py-2.5
          text-success-content
        "
      >
        <div className="flex items-center gap-2">
          {Icon && (
            <Icon size={18} />
          )}

          <h2 className="text-base font-bold sm:text-lg">
            {title}
          </h2>
        </div>

        {action}
      </div>

      <div className="p-4 sm:p-5">
        {children}
      </div>
    </section>
  );
}


/* =========================================================
   ONLINE APPLICATION MOTHER PAGE
========================================================= */

export function OnlineApplicationNav() {
  const [activeGroup, setActiveGroup] = useState(null);
  const location = useLocation();
  const basePath = onlineBaseFromPath(location.pathname);

  return (
    <nav
      className="sticky top-0 z-20 flex min-h-11 flex-wrap items-center gap-2 border border-slate-200 bg-white px-3 shadow-sm"
      aria-label="Online application menu"
    >
      <strong className="mr-2 whitespace-nowrap text-sm font-black text-emerald-700">
        Online Application
      </strong>

      {onlineApplicationGroups.map((group) => (
        <div className="relative" key={group.label}>
          <button
            type="button"
            className="inline-flex min-h-10 items-center gap-1 rounded-md px-2 text-sm font-bold text-slate-900 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
            onClick={() =>
              setActiveGroup((current) =>
                current === group.label ? null : group.label
              )
            }
            aria-expanded={activeGroup === group.label}
          >
            {group.label}
            <ChevronDown
              size={14}
              className={`transition-transform ${
                activeGroup === group.label ? "rotate-180" : ""
              }`}
            />
          </button>

          <div
            className={`absolute left-0 top-full z-30 min-w-60 rounded-lg border border-slate-200 bg-white p-2 shadow-xl ${
              activeGroup === group.label ? "grid" : "hidden"
            }`}
          >
            {group.items.map(([label, path]) => (
              <Link
                className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                key={path}
                to={onlinePath(basePath, path)}
                onClick={() => setActiveGroup(null)}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

export function OnlineApplicationSectionPage({
  title,
  description = "This module is prepared for online admission workflow data, review actions, and reporting tools.",
}) {
  return (
    <div className="space-y-6">
      <OnlineApplicationNav />

      <Panel title={title} icon={FileSpreadsheet}>
        <div className="rounded-lg border border-dashed border-emerald-200 bg-emerald-50/60 p-8 text-center">
          <h2 className="text-2xl font-black text-emerald-950">
            {title}
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold text-slate-600">
            {description}
          </p>
        </div>
      </Panel>
    </div>
  );
}

export default function OnlineApplicationDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = onlineBaseFromPath(location.pathname);

  return (
    <div className="space-y-6">
      <OnlineApplicationNav />

      <div className="text-center">
        <h1 className="text-3xl font-black uppercase text-emerald-950 md:text-4xl">
          Online Application Dashboard
        </h1>
        <p className="mt-2 text-sm font-semibold text-slate-600">
          This section helps you manage online applications, admission exams, results, and reports.
        </p>
      </div>

      <Panel title="Select a Task">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {onlineApplicationGroups.map((task) => {
            const Icon = task.icon;

            return (
              <button
                key={task.label}
                type="button"
                className="overflow-hidden rounded-lg border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                onClick={() => navigate(onlinePath(basePath, task.path))}
              >
                <div
                  className={`flex min-h-20 items-center justify-center gap-3 ${task.color} px-5 text-white`}
                >
                  <Icon size={25} />
                  <strong className="text-3xl font-black">
                    {task.count}
                  </strong>
                </div>

                <div className="bg-emerald-800 px-4 py-3 text-center text-sm font-black text-white">
                  {task.label}
                </div>
              </button>
            );
          })}
        </div>
      </Panel>
    </div>
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
        md:grid-cols-[150px_minmax(0,1fr)]
        md:items-center
      "
    >
      <span className="text-sm font-semibold text-base-content">
        {label}
      </span>

      {children}
    </label>
  );
}


function SelectField({
  value,
  onChange,
  options,
  placeholder = "Select",
  name,
}) {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="
        select
        select-bordered
        select-sm
        w-full
        focus:border-success
        focus:outline-success
      "
    >
      <option value="">
        {placeholder}
      </option>

      {options.map(
        (option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        )
      )}
    </select>
  );
}


/* =========================================================
   SEARCH FORM
========================================================= */

const defaultSearchForm = {
  session: "2026",
  shift: "",
  className: "",
  studentId: "",
  paidTo: "",
  paidBy: "",
};


function useApplicationSearch() {
  const [form, setForm] =
    useState(defaultSearchForm);

  const change = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };

  return {
    form,
    change,
    setForm,
  };
}


/* =========================================================
   CREATE BUTTON
========================================================= */

function CreateAdmissionButton() {
  return (
    <Link
      to="/admission/online"
      className="
        btn
        btn-sm
        border-0
        bg-cyan-500
        text-white
        hover:bg-cyan-600
      "
    >
      <UserPlus size={15} />

      Create Online Admission
    </Link>
  );
}


/* =========================================================
   APPLICATION LIST
========================================================= */

export function ApplicationListPage() {
  const {
    form,
    change,
  } = useApplicationSearch();

  const [
    applications,
    setApplications,
  ] = useState(() =>
    loadStorage(
      APPLICATION_STORAGE,
      []
    )
  );

  const [
    selected,
    setSelected,
  ] = useState([]);

  const [
    searched,
    setSearched,
  ] = useState(false);


  useEffect(() => {
    saveStorage(
      APPLICATION_STORAGE,
      applications
    );
  }, [applications]);


  const results = useMemo(
    () => {
      if (!searched) {
        return applications;
      }

      return applications.filter(
        (application) => {
          if (
            form.session &&
            application.session !==
              form.session
          ) {
            return false;
          }

          if (
            form.shift &&
            application.shift !==
              form.shift
          ) {
            return false;
          }

          if (
            form.className &&
            application.className !==
              form.className
          ) {
            return false;
          }

          if (
            form.studentId &&
            !String(
              application.studentId
            )
              .toLowerCase()
              .includes(
                form.studentId
                  .toLowerCase()
              )
          ) {
            return false;
          }

          if (
            form.paidTo &&
            application.paidTo !==
              form.paidTo
          ) {
            return false;
          }

          if (
            form.paidBy &&
            application.paidBy !==
              form.paidBy
          ) {
            return false;
          }

          return true;
        }
      );
    },
    [
      applications,
      form,
      searched,
    ]
  );


  const toggleOne = (
    id
  ) => {
    setSelected(
      (previous) =>
        previous.includes(id)
          ? previous.filter(
              (item) =>
                item !== id
            )
          : [
              ...previous,
              id,
            ]
    );
  };


  const toggleAll = (
    checked
  ) => {
    setSelected(
      checked
        ? results.map(
            (item) => item.id
          )
        : []
    );
  };


  const deleteSelected =
    () => {
      if (
        selected.length ===
        0
      ) {
        alert(
          "Select at least one application."
        );

        return;
      }

      if (
        !window.confirm(
          "Delete selected applications?"
        )
      ) {
        return;
      }

      setApplications(
        (previous) =>
          previous.filter(
            (item) =>
              !selected.includes(
                item.id
              )
          )
      );

      setSelected([]);
    };


  const transferSelected =
    () => {
      if (
        !selected.length
      ) {
        alert(
          "Select applications to transfer."
        );

        return;
      }

      setApplications(
        (previous) =>
          previous.map(
            (item) =>
              selected.includes(
                item.id
              )
                ? {
                    ...item,
                    transferred:
                      true,
                  }
                : item
          )
      );

      alert(
        `${selected.length} application(s) transferred successfully.`
      );

      setSelected([]);
    };


  return (
    <AnimatedPage>
      <OnlineApplicationNav />

      {/* SEARCH */}

      <Panel
        title="Application Search"
        icon={Search}
      >
        <form
          onSubmit={(
            event
          ) => {
            event.preventDefault();
            setSearched(true);
          }}
          className="space-y-5"
        >
          <div
            className="
              grid
              grid-cols-1
              gap-x-8
              gap-y-4
              xl:grid-cols-2
            "
          >
            <Field label="Session Year:">
              <SelectField
                name="session"
                value={
                  form.session
                }
                onChange={change}
                options={
                  sessions
                }
              />
            </Field>

            <Field label="Shift:">
              <SelectField
                name="shift"
                value={
                  form.shift
                }
                onChange={change}
                options={shifts}
                placeholder="Select Shift"
              />
            </Field>

            <Field label="Class:">
              <SelectField
                name="className"
                value={
                  form.className
                }
                onChange={change}
                options={classes}
                placeholder="Select class"
              />
            </Field>

            <Field label="Student ID:">
              <input
                name="studentId"
                value={
                  form.studentId
                }
                onChange={change}
                placeholder="Student ID"
                className="
                  input
                  input-bordered
                  input-sm
                  w-full
                  focus:border-success
                  focus:outline-success
                "
              />
            </Field>

            <Field label="Paid To:">
              <SelectField
                name="paidTo"
                value={
                  form.paidTo
                }
                onChange={change}
                options={
                  paidToOptions
                }
                placeholder="Select Paid To"
              />
            </Field>

            <Field label="Payment By:">
              <SelectField
                name="paidBy"
                value={
                  form.paidBy
                }
                onChange={change}
                options={
                  paidByOptions
                }
                placeholder="Select Payment By"
              />
            </Field>
          </div>


          <div
            className="
              flex
              flex-wrap
              gap-2
              xl:ml-[166px]
            "
          >
            <motion.button
              whileHover={{
                scale: 1.03,
              }}
              whileTap={{
                scale: 0.97,
              }}
              type="submit"
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
              PDF
            </button>
          </div>
        </form>
      </Panel>


      {/* LIST */}

      <Panel
        title="Online Application List"
        icon={FileText}
        action={
          <CreateAdmissionButton />
        }
      >
        <div className="overflow-x-auto">
          <table className="table table-zebra table-sm min-w-[1100px]">
            <thead>
              <tr className="bg-base-200">
                <th>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-success checkbox-xs"
                      checked={
                        results.length >
                          0 &&
                        selected.length ===
                          results.length
                      }
                      onChange={(
                        event
                      ) =>
                        toggleAll(
                          event
                            .target
                            .checked
                        )
                      }
                    />

                    SL
                  </label>
                </th>

                <th>Photo</th>
                <th>
                  Student Name
                </th>
                <th>
                  Student ID
                </th>
                <th>Gender</th>
                <th>Class</th>
                <th>Session</th>
                <th>Contact</th>
                <th>Paid To</th>
                <th>Paid By</th>
                <th>
                  Created Date
                </th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              <AnimatePresence>
                {results.map(
                  (
                    application,
                    index
                  ) => (
                    <motion.tr
                      key={
                        application.id
                      }
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
                        x: -20,
                      }}
                    >
                      <td>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selected.includes(
                              application.id
                            )}
                            onChange={() =>
                              toggleOne(
                                application.id
                              )
                            }
                            className="checkbox checkbox-success checkbox-xs"
                          />

                          {index +
                            1}
                        </div>
                      </td>

                      <td>
                        <div className="avatar">
                          <div className="h-10 w-10 rounded">
                            <img
                              src={
                                application.photo
                              }
                              alt={
                                application.studentName
                              }
                            />
                          </div>
                        </div>
                      </td>

                      <td>
                        {
                          application.studentName
                        }
                      </td>

                      <td>
                        {
                          application.studentId
                        }
                      </td>

                      <td>
                        {
                          application.gender
                        }
                      </td>

                      <td>
                        {
                          application.className
                        }
                      </td>

                      <td>
                        {
                          application.session
                        }
                      </td>

                      <td>
                        {
                          application.contact
                        }
                      </td>

                      <td>
                        {
                          application.paidTo
                        }
                      </td>

                      <td>
                        {
                          application.paidBy
                        }
                      </td>

                      <td>
                        {
                          application.createdDate
                        }
                      </td>

                      <td>
                        <span
                          className={`badge badge-sm ${
                            application.transferred
                              ? "badge-success"
                              : "badge-ghost"
                          }`}
                        >
                          {application.transferred
                            ? "Transferred"
                            : "Active"}
                        </span>
                      </td>
                    </motion.tr>
                  )
                )}
              </AnimatePresence>


              {results.length ===
                0 && (
                <tr>
                  <td
                    colSpan={12}
                    className="py-8 text-center text-base-content/50"
                  >
                    No online
                    application
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


        <div className="mt-6 flex flex-wrap gap-2 border-t border-base-300 pt-4">
          <button
            type="button"
            onClick={
              transferSelected
            }
            className="btn btn-success btn-sm text-white"
          >
            <ClipboardCheck
              size={15}
            />

            Transfer Selected
            Items
          </button>

          <button
            type="button"
            onClick={
              deleteSelected
            }
            className="btn btn-error btn-sm text-white"
          >
            <Trash2
              size={15}
            />

            Delete Selected
            Items
          </button>
        </div>
      </Panel>

    </AnimatedPage>
  );
}


/* =========================================================
   PENDING LIST
========================================================= */

export function PendingApplicationPage() {
  const {
    form,
    change,
  } = useApplicationSearch();

  const [
    pendingApplications,
    setPendingApplications,
  ] = useState(() =>
    loadStorage(
      PENDING_STORAGE,
      demoPendingApplications
    )
  );

  const [
    selected,
    setSelected,
  ] = useState([]);

  const [
    searched,
    setSearched,
  ] = useState(false);


  useEffect(() => {
    saveStorage(
      PENDING_STORAGE,
      pendingApplications
    );
  }, [
    pendingApplications,
  ]);


  const results = useMemo(
    () => {
      if (!searched) {
        return pendingApplications;
      }

      return pendingApplications.filter(
        (application) => {
          if (
            form.session &&
            application.session !==
              form.session
          ) {
            return false;
          }

          if (
            form.shift &&
            application.shift !==
              form.shift
          ) {
            return false;
          }

          if (
            form.className &&
            application.className !==
              form.className
          ) {
            return false;
          }

          if (
            form.studentId &&
            !application.studentId
              .toLowerCase()
              .includes(
                form.studentId
                  .toLowerCase()
              )
          ) {
            return false;
          }

          if (
            form.paidBy &&
            application.paidBy !==
              form.paidBy
          ) {
            return false;
          }

          return true;
        }
      );
    },
    [
      pendingApplications,
      form,
      searched,
    ]
  );


  const toggle = (
    id
  ) => {
    setSelected(
      (previous) =>
        previous.includes(id)
          ? previous.filter(
              (item) =>
                item !== id
            )
          : [
              ...previous,
              id,
            ]
    );
  };


  const approveSelected =
    () => {
      if (
        !selected.length
      ) {
        alert(
          "Select pending applications to approve."
        );

        return;
      }

      const approved =
        pendingApplications.filter(
          (item) =>
            selected.includes(
              item.id
            )
        );

      const currentApproved =
        loadStorage(
          APPLICATION_STORAGE,
          []
        );

      saveStorage(
        APPLICATION_STORAGE,
        [
          ...currentApproved,
          ...approved.map(
            (item) => ({
              ...item,

              id:
                "APPROVED-" +
                item.id,

              approvedDate:
                new Date()
                  .toISOString()
                  .slice(
                    0,
                    10
                  ),
            })
          ),
        ]
      );

      setPendingApplications(
        (previous) =>
          previous.filter(
            (item) =>
              !selected.includes(
                item.id
              )
          )
      );

      setSelected([]);

      alert(
        `${approved.length} application(s) approved.`
      );
    };


  const deleteSelected =
    () => {
      if (
        !selected.length
      ) {
        alert(
          "Select pending applications first."
        );

        return;
      }

      if (
        !window.confirm(
          "Delete selected pending applications?"
        )
      ) {
        return;
      }

      setPendingApplications(
        (previous) =>
          previous.filter(
            (item) =>
              !selected.includes(
                item.id
              )
          )
      );

      setSelected([]);
    };


  return (
    <AnimatedPage>
      <OnlineApplicationNav />

      {/* SEARCH */}

      <Panel
        title="Application Search"
        icon={Search}
      >
        <form
          onSubmit={(
            event
          ) => {
            event.preventDefault();

            setSearched(true);
          }}
          className="space-y-5"
        >
          <div
            className="
              grid
              grid-cols-1
              gap-x-8
              gap-y-4
              xl:grid-cols-2
            "
          >
            <Field label="Session Year:">
              <SelectField
                name="session"
                value={
                  form.session
                }
                onChange={change}
                options={
                  sessions
                }
              />
            </Field>

            <Field label="Shift:">
              <SelectField
                name="shift"
                value={
                  form.shift
                }
                onChange={change}
                options={shifts}
                placeholder="Select Shift"
              />
            </Field>

            <Field label="Class:">
              <SelectField
                name="className"
                value={
                  form.className
                }
                onChange={change}
                options={classes}
                placeholder="Select class"
              />
            </Field>

            <Field label="Student ID:">
              <input
                name="studentId"
                value={
                  form.studentId
                }
                onChange={change}
                placeholder="Student ID"
                className="input input-bordered input-sm w-full"
              />
            </Field>

            <Field label="Payment By:">
              <SelectField
                name="paidBy"
                value={
                  form.paidBy
                }
                onChange={change}
                options={
                  paidByOptions
                }
                placeholder="Select Payment By"
              />
            </Field>
          </div>


          <div className="xl:ml-[166px]">
            <motion.button
              whileHover={{
                scale: 1.03,
              }}
              whileTap={{
                scale: 0.97,
              }}
              type="submit"
              className="
                btn
                btn-sm
                border-0
                bg-cyan-600
                text-white
                hover:bg-cyan-700
              "
            >
              <Search
                size={15}
              />

              Search List
            </motion.button>
          </div>
        </form>
      </Panel>


      {/* PENDING LIST */}

      <Panel
        title="Application Pending List"
        icon={
          ClipboardCheck
        }
        action={
          <CreateAdmissionButton />
        }
      >
        <div className="overflow-x-auto">
          <table className="table table-zebra table-sm min-w-[1200px]">
            <thead>
              <tr className="bg-base-200">
                <th>
                  <input
                    type="checkbox"
                    className="checkbox checkbox-success checkbox-xs"
                    checked={
                      results.length >
                        0 &&
                      selected.length ===
                        results.length
                    }
                    onChange={(
                      event
                    ) =>
                      setSelected(
                        event.target
                          .checked
                          ? results.map(
                              (
                                item
                              ) =>
                                item.id
                            )
                          : []
                      )
                    }
                  />

                  <span className="ml-2">
                    SL
                  </span>
                </th>

                <th>Photo</th>
                <th>
                  Student Name
                </th>
                <th>
                  Student ID
                </th>
                <th>Class</th>
                <th>Session</th>
                <th>
                  Payment Number
                </th>
                <th>
                  Sender Number
                </th>
                <th>
                  Payment Method
                </th>
                <th>
                  Transaction ID
                </th>
                <th>Amount</th>
                <th>
                  Created Date
                </th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              <AnimatePresence>
                {results.map(
                  (
                    application,
                    index
                  ) => (
                    <motion.tr
                      key={
                        application.id
                      }
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
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selected.includes(
                              application.id
                            )}
                            onChange={() =>
                              toggle(
                                application.id
                              )
                            }
                            className="checkbox checkbox-success checkbox-xs"
                          />

                          {index +
                            1}
                        </div>
                      </td>

                      <td>
                        <div className="avatar">
                          <div className="h-10 w-10 rounded">
                            <img
                              src={
                                application.photo
                              }
                              alt={
                                application.studentName
                              }
                            />
                          </div>
                        </div>
                      </td>

                      <td>
                        {
                          application.studentName
                        }
                      </td>

                      <td>
                        {
                          application.studentId
                        }
                      </td>

                      <td>
                        {
                          application.className
                        }
                      </td>

                      <td>
                        {
                          application.session
                        }
                      </td>

                      <td>
                        {
                          application.paymentNumber
                        }
                      </td>

                      <td>
                        {
                          application.senderNumber
                        }
                      </td>

                      <td>
                        {
                          application.paymentMethod
                        }
                      </td>

                      <td>
                        {
                          application.transactionId
                        }
                      </td>

                      <td>
                        ৳
                        {
                          application.amount
                        }
                      </td>

                      <td>
                        {
                          application.createdDate
                        }
                      </td>

                      <td>
                        <span className="badge badge-warning badge-sm">
                          Pending
                        </span>
                      </td>
                    </motion.tr>
                  )
                )}
              </AnimatePresence>


              {!results.length && (
                <tr>
                  <td
                    colSpan={13}
                    className="py-8 text-center text-base-content/50"
                  >
                    No pending
                    applications.
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


        <div className="mt-6 flex flex-wrap gap-2 border-t border-base-300 pt-4">
          <button
            type="button"
            onClick={
              approveSelected
            }
            className="btn btn-success btn-sm text-white"
          >
            <CheckCircle2
              size={15}
            />

            Approve Selected
            Items
          </button>

          <button
            type="button"
            onClick={
              deleteSelected
            }
            className="btn btn-error btn-sm text-white"
          >
            <Trash2
              size={15}
            />

            Delete Selected
            Items
          </button>
        </div>
      </Panel>

    </AnimatedPage>
  );
}


/* =========================================================
   FORM SETTINGS DEFAULTS
========================================================= */

const defaultFormSettings = {
  onlineAdmissionForm:
    true,

  student: {
    fullNameBn: true,
    bloodGroup: false,
    studentUid: false,
    contactNumber: true,
    email: false,

    dateOfBirth: false,
    birthPlace: false,
    birthCertificate:
      false,
    religion: false,
    gender: false,
    country: false,
    tribal: false,
  },

  parent: {
    fatherNameBn:
      false,
    fatherMobile:
      false,
    fatherNid: false,
    fatherDob: false,

    motherNameBn:
      false,
    motherMobile:
      false,
    motherNid: false,
    motherDob: false,

    guardianName:
      true,
    guardianMobile:
      true,
  },

  address: {
    division: true,
    district: true,
    upazila: true,
    postOffice: false,
    postalCode: false,
    address: true,
  },

  academic: {
    category: true,
    session: true,
    shift: true,
    className: true,
    section: true,
    group: true,
    previousSchool:
      false,
  },
};


/* =========================================================
   FORM SETTING HELPERS
========================================================= */

function SettingSection({
  title,
  children,
}) {
  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="
        overflow-hidden
        rounded-lg
        border
        border-base-300
        bg-base-100
      "
    >
      <div
        className="
          border-b
          border-base-300
          bg-base-200/60
          px-4
          py-3
          text-sm
          font-bold
        "
      >
        {title}
      </div>

      <div className="p-4">
        {children}
      </div>
    </motion.section>
  );
}


function SettingToggle({
  label,
  checked,
  onChange,
  required = false,
}) {
  return (
    <label
      className="
        flex
        cursor-pointer
        items-center
        justify-between
        gap-4
        rounded-lg
        px-3
        py-2
        transition
        hover:bg-base-200/60
      "
    >
      <span className="text-sm font-semibold">
        {label}

        {required && (
          <span className="ml-0.5 text-error">
            *
          </span>
        )}
      </span>

      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="toggle toggle-success toggle-sm"
      />
    </label>
  );
}


/* =========================================================
   FORM SETTING
========================================================= */

export function ApplicationFormSettingPage() {
  const [
    settings,
    setSettings,
  ] = useState(() =>
    loadStorage(
      FORM_SETTINGS_STORAGE,
      defaultFormSettings
    )
  );

  const [
    saved,
    setSaved,
  ] = useState(false);


  const updateRoot = (
    key
  ) => {
    setSettings(
      (previous) => ({
        ...previous,
        [key]:
          !previous[key],
      })
    );

    setSaved(false);
  };


  const updateGroup = (
    group,
    key
  ) => {
    setSettings(
      (previous) => ({
        ...previous,

        [group]: {
          ...previous[
            group
          ],

          [key]:
            !previous[
              group
            ][key],
        },
      })
    );

    setSaved(false);
  };


  const save = () => {
    saveStorage(
      FORM_SETTINGS_STORAGE,
      settings
    );

    setSaved(true);

    setTimeout(
      () =>
        setSaved(
          false
        ),
      3000
    );
  };


  return (
    <AnimatedPage>
      <OnlineApplicationNav />

      <Panel
        title="Form Setting"
        icon={Settings2}
        action={
          <CreateAdmissionButton />
        }
      >
        <div className="space-y-4">

          {saved && (
            <motion.div
              initial={{
                opacity: 0,
                y: -5,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="alert alert-success py-2 text-sm text-white"
            >
              <CheckCircle2
                size={17}
              />

              Form settings saved
              successfully.
            </motion.div>
          )}


          {/* ADMISSION FORM */}

          <SettingSection title="Admission Form">
            <SettingToggle
              label="Online Admission Form"
              checked={
                settings.onlineAdmissionForm
              }
              onChange={() =>
                updateRoot(
                  "onlineAdmissionForm"
                )
              }
            />
          </SettingSection>


          {/* STUDENT */}

          <SettingSection title="Student Information">
            <div className="grid grid-cols-1 gap-x-10 lg:grid-cols-2">
              <div className="space-y-1">
                <SettingToggle
                  label="Full Name (bn)"
                  checked={
                    settings.student
                      .fullNameBn
                  }
                  onChange={() =>
                    updateGroup(
                      "student",
                      "fullNameBn"
                    )
                  }
                />

                <SettingToggle
                  label="Blood Group"
                  checked={
                    settings.student
                      .bloodGroup
                  }
                  onChange={() =>
                    updateGroup(
                      "student",
                      "bloodGroup"
                    )
                  }
                />

                <SettingToggle
                  label="Student UID"
                  checked={
                    settings.student
                      .studentUid
                  }
                  onChange={() =>
                    updateGroup(
                      "student",
                      "studentUid"
                    )
                  }
                />

                <SettingToggle
                  label="Contact Number"
                  checked={
                    settings.student
                      .contactNumber
                  }
                  onChange={() =>
                    updateGroup(
                      "student",
                      "contactNumber"
                    )
                  }
                />

                <SettingToggle
                  label="Student's Email ID"
                  checked={
                    settings.student
                      .email
                  }
                  onChange={() =>
                    updateGroup(
                      "student",
                      "email"
                    )
                  }
                />
              </div>


              <div className="space-y-1">
                <SettingToggle
                  label="Date of Birth"
                  required
                  checked={
                    settings.student
                      .dateOfBirth
                  }
                  onChange={() =>
                    updateGroup(
                      "student",
                      "dateOfBirth"
                    )
                  }
                />

                <SettingToggle
                  label="Birth Place"
                  required
                  checked={
                    settings.student
                      .birthPlace
                  }
                  onChange={() =>
                    updateGroup(
                      "student",
                      "birthPlace"
                    )
                  }
                />

                <SettingToggle
                  label="Birth Certificate No."
                  checked={
                    settings.student
                      .birthCertificate
                  }
                  onChange={() =>
                    updateGroup(
                      "student",
                      "birthCertificate"
                    )
                  }
                />

                <SettingToggle
                  label="Religion"
                  required
                  checked={
                    settings.student
                      .religion
                  }
                  onChange={() =>
                    updateGroup(
                      "student",
                      "religion"
                    )
                  }
                />

                <SettingToggle
                  label="Gender"
                  required
                  checked={
                    settings.student
                      .gender
                  }
                  onChange={() =>
                    updateGroup(
                      "student",
                      "gender"
                    )
                  }
                />

                <SettingToggle
                  label="Country"
                  checked={
                    settings.student
                      .country
                  }
                  onChange={() =>
                    updateGroup(
                      "student",
                      "country"
                    )
                  }
                />

                <SettingToggle
                  label="Is Tribal?"
                  checked={
                    settings.student
                      .tribal
                  }
                  onChange={() =>
                    updateGroup(
                      "student",
                      "tribal"
                    )
                  }
                />
              </div>
            </div>
          </SettingSection>


          {/* PARENTS */}

          <SettingSection title="Parent Information">
            <div className="grid grid-cols-1 gap-x-10 lg:grid-cols-2">
              <div className="space-y-1">
                <SettingToggle
                  label="Father Name (bn)"
                  checked={
                    settings.parent
                      .fatherNameBn
                  }
                  onChange={() =>
                    updateGroup(
                      "parent",
                      "fatherNameBn"
                    )
                  }
                />

                <SettingToggle
                  label="Father's Mobile Number"
                  checked={
                    settings.parent
                      .fatherMobile
                  }
                  onChange={() =>
                    updateGroup(
                      "parent",
                      "fatherMobile"
                    )
                  }
                />

                <SettingToggle
                  label="Father's NID"
                  checked={
                    settings.parent
                      .fatherNid
                  }
                  onChange={() =>
                    updateGroup(
                      "parent",
                      "fatherNid"
                    )
                  }
                />

                <SettingToggle
                  label="Father's DOB"
                  checked={
                    settings.parent
                      .fatherDob
                  }
                  onChange={() =>
                    updateGroup(
                      "parent",
                      "fatherDob"
                    )
                  }
                />

                <SettingToggle
                  label="Guardian Name"
                  checked={
                    settings.parent
                      .guardianName
                  }
                  onChange={() =>
                    updateGroup(
                      "parent",
                      "guardianName"
                    )
                  }
                />
              </div>


              <div className="space-y-1">
                <SettingToggle
                  label="Mother Name (bn)"
                  checked={
                    settings.parent
                      .motherNameBn
                  }
                  onChange={() =>
                    updateGroup(
                      "parent",
                      "motherNameBn"
                    )
                  }
                />

                <SettingToggle
                  label="Mother's Mobile Number"
                  checked={
                    settings.parent
                      .motherMobile
                  }
                  onChange={() =>
                    updateGroup(
                      "parent",
                      "motherMobile"
                    )
                  }
                />

                <SettingToggle
                  label="Mother's NID"
                  checked={
                    settings.parent
                      .motherNid
                  }
                  onChange={() =>
                    updateGroup(
                      "parent",
                      "motherNid"
                    )
                  }
                />

                <SettingToggle
                  label="Mother's DOB"
                  checked={
                    settings.parent
                      .motherDob
                  }
                  onChange={() =>
                    updateGroup(
                      "parent",
                      "motherDob"
                    )
                  }
                />

                <SettingToggle
                  label="Guardian Mobile"
                  checked={
                    settings.parent
                      .guardianMobile
                  }
                  onChange={() =>
                    updateGroup(
                      "parent",
                      "guardianMobile"
                    )
                  }
                />
              </div>
            </div>
          </SettingSection>


          {/* ADDRESS */}

          <SettingSection title="Address Information">
            <div className="grid grid-cols-1 gap-x-10 lg:grid-cols-2">
              {Object.entries(
                {
                  division:
                    "Division",

                  district:
                    "District",

                  upazila:
                    "Upazila",

                  postOffice:
                    "Post Office",

                  postalCode:
                    "Postal Code",

                  address:
                    "Full Address",
                }
              ).map(
                ([
                  key,
                  label,
                ]) => (
                  <SettingToggle
                    key={key}
                    label={label}
                    checked={
                      settings.address[
                        key
                      ]
                    }
                    onChange={() =>
                      updateGroup(
                        "address",
                        key
                      )
                    }
                  />
                )
              )}
            </div>
          </SettingSection>


          {/* ACADEMIC */}

          <SettingSection title="Academic Information">
            <div className="grid grid-cols-1 gap-x-10 lg:grid-cols-2">
              {Object.entries(
                {
                  category:
                    "Student Category",

                  session:
                    "Session",

                  shift:
                    "Shift",

                  className:
                    "Class",

                  section:
                    "Section",

                  group:
                    "Group",

                  previousSchool:
                    "Previous School",
                }
              ).map(
                ([
                  key,
                  label,
                ]) => (
                  <SettingToggle
                    key={key}
                    label={label}
                    checked={
                      settings.academic[
                        key
                      ]
                    }
                    onChange={() =>
                      updateGroup(
                        "academic",
                        key
                      )
                    }
                  />
                )
              )}
            </div>
          </SettingSection>


          {/* SAVE */}

          <div className="flex justify-end pt-3">
            <motion.button
              whileHover={{
                scale: 1.025,
              }}
              whileTap={{
                scale: 0.97,
              }}
              type="button"
              onClick={save}
              className="btn btn-success text-white"
            >
              <Settings2
                size={17}
              />

              Save Form Settings
            </motion.button>
          </div>

        </div>
      </Panel>

    </AnimatedPage>
  );
}
