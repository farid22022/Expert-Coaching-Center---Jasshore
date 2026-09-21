import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Check,
  Edit3,
  Plus,
  Printer,
  Search,
  Trash2,
} from "lucide-react";

/* =========================================================
   CONSTANTS
========================================================= */

const BLUE_HEADER = "bg-[#456db5]";

const sessionOptions = ["2026", "2025", "2024"];

const shiftOptions = [
  "All Shift",
  "9.30AM- 11.30AM Morning",
  "Morning",
  "Day",
  "Evening",
];

const classOptions = [
  "SSC",
  "HSC",
  "Inter 1st year",
  "Inter 2nd year",
  "Class 09",
  "Class 10",
];

const sectionOptions = [
  "Day",
  "Morning",
  "A",
  "B",
  "All",
];

const groupOptions = [
  "Science",
  "Business",
  "Humanities",
  "General",
];

const teacherOptions = [
  "Deen Islam",
  "MD NAIMUR RAHMAN",
  "MD ASHIQ",
  "UZZAL KUMAR",
  "MASUL BILLAH",
];

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/* =========================================================
   DEMO FEES
========================================================= */

const feeCollectionRows = [
  {
    sl: 1,
    studentId: "279032",
    student:
      "MST SURAIYA AFRIN (Class 09-Day,32)",
    fee: "ADMISSION (1000),",
    amount: 0,
    discount: 1000,
    dues: 0,
    date: "2026-06-21",
    invoice: "000251",
    paidBy: "Cash",
    collectedBy: "Expert Coaching Center",
    created: "2026-06-21 16:01:15",
  },
  {
    sl: 2,
    studentId: "261054",
    student:
      "ABU SAYED (Class 10-SSC 2026,54)",
    fee: "Monthly Fees Business December(1500),",
    amount: 1500,
    discount: 0,
    dues: 0,
    date: "2025-12-30",
    invoice: "000250",
    paidBy: "Cash",
    collectedBy: "Expert Coaching Center",
    created: "2025-12-30 15:43:42",
  },
  {
    sl: 3,
    studentId: "279026",
    student:
      "ARJUMAN BANU TULTULI (Class 09-Day,26)",
    fee: "Monthly Fees Business November(1500),",
    amount: 1500,
    discount: 0,
    dues: 0,
    date: "2025-11-25",
    invoice: "000249",
    paidBy: "Cash",
    collectedBy: "Expert Coaching Center",
    created: "2025-11-25 16:58:49",
  },
  {
    sl: 4,
    studentId: "279034",
    student: "JISAN (Class 09-Day,34)",
    fee: "Monthly Fees Humanities November(1500),",
    amount: 1300,
    discount: 200,
    dues: 0,
    date: "2025-11-23",
    invoice: "000248",
    paidBy: "Cash",
    collectedBy: "Expert Coaching Center",
    created: "2025-11-23 16:50:47",
  },
  {
    sl: 5,
    studentId: "279016",
    student:
      "TOHA TABASSUM (Class 09-Day,16)",
    fee: "Monthly Fees November(2000),",
    amount: 1500,
    discount: 500,
    dues: 0,
    date: "2025-11-22",
    invoice: "000247",
    paidBy: "Cash",
    collectedBy: "Expert Coaching Center",
    created: "2025-11-22 17:06:50",
  },
  {
    sl: 6,
    studentId: "279037",
    student:
      "BIPROTEEP VOUMIK (Class 09-Day,37)",
    fee: "Monthly Fees Humanities November(1500),",
    amount: 1500,
    discount: 0,
    dues: 0,
    date: "2025-11-16",
    invoice: "000246",
    paidBy: "Cash",
    collectedBy: "Expert Coaching Center",
    created: "2025-11-16 16:23:09",
  },
  {
    sl: 7,
    studentId: "279011",
    student: "APU (Class 09-Day,11)",
    fee: "Monthly Fees Humanities November(1500),",
    amount: 1500,
    discount: 0,
    dues: 0,
    date: "2025-11-13",
    invoice: "000245",
    paidBy: "Cash",
    collectedBy: "Expert Coaching Center",
    created: "2025-11-13 17:50:04",
  },
  {
    sl: 8,
    studentId: "279003",
    student:
      "SOUROV DHOR (Class 09-Day,3)",
    fee: "Monthly Fees Humanities November(1500),",
    amount: 1500,
    discount: 0,
    dues: 0,
    date: "2025-11-09",
    invoice: "000244",
    paidBy: "Cash",
    collectedBy: "Expert Coaching Center",
    created: "2025-11-09 17:39:37",
  },
  {
    sl: 9,
    studentId: "279001",
    student: "APU (Class 09-Day,1)",
    fee: "Monthly Fees Humanities October(1500),",
    amount: 1500,
    discount: 0,
    dues: 0,
    date: "2025-11-09",
    invoice: "000243",
    paidBy: "Cash",
    collectedBy: "Expert Coaching Center",
    created: "2025-11-09 17:25:17",
  },
  {
    sl: 10,
    studentId: "279019",
    student:
      "SAJID AL FARUK (Class 09-Day,19)",
    fee: "Monthly Fees Humanities November(1500),",
    amount: 1500,
    discount: 0,
    dues: 0,
    date: "2025-11-09",
    invoice: "000242",
    paidBy: "Cash",
    collectedBy: "Expert Coaching Center",
    created: "2025-11-09 16:48:18",
  },
];

/* =========================================================
   NAVIGATION
========================================================= */

function useSiblingNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const go = (slug) => {
    const nextPath =
      location.pathname.replace(
        /\/[^/]+\/?$/,
        `/${slug}`
      );

    navigate(nextPath);
  };

  return { go };
}

/* =========================================================
   SHARED UI
========================================================= */

function PageRoot({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.22,
        ease: "easeOut",
      }}
      className="min-h-[calc(100vh-70px)] bg-base-200/60 p-2 sm:p-4"
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
      className={`overflow-hidden rounded-md border border-base-300 bg-base-100 shadow-sm ${className}`}
    >
      <div
        className={`${BLUE_HEADER} flex min-h-[40px] items-center justify-between gap-3 px-5 py-2 text-white`}
      >
        <h2 className="text-[17px] font-bold sm:text-[19px]">
          {title}
        </h2>

        {action}
      </div>

      {children}
    </section>
  );
}

function RequiredNotice() {
  return (
    <div className="rounded border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-bold text-red-500">
      (*) field required
    </div>
  );
}

function Field({
  label,
  children,
  required = false,
}) {
  return (
    <div className="grid items-center gap-2 sm:grid-cols-[180px_minmax(0,1fr)]">
      <label className="text-sm font-bold">
        {label}
        {required && (
          <span className="text-red-500">*</span>
        )}
      </label>

      {children}
    </div>
  );
}

function SelectBox({
  value,
  onChange,
  children,
  disabled = false,
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="select select-bordered select-sm w-full rounded"
    >
      {children}
    </select>
  );
}

function TextBox({
  value,
  onChange,
  placeholder = "",
  type = "text",
  readOnly = false,
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      className="input input-bordered input-sm w-full rounded"
    />
  );
}

function SearchButton({
  onClick,
  children = "Search",
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      type="button"
      onClick={onClick}
      className="btn btn-info btn-sm min-h-0 text-white"
    >
      <Search size={14} />
      {children}
    </motion.button>
  );
}

function HeaderButton({
  children,
  onClick,
  variant = "cyan",
}) {
  const cls =
    variant === "green"
      ? "btn-success"
      : variant === "purple"
        ? "bg-violet-600 hover:bg-violet-700 border-violet-600"
        : "bg-cyan-500 hover:bg-cyan-600 border-cyan-500";

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      type="button"
      onClick={onClick}
      className={`btn btn-sm min-h-0 text-white ${cls}`}
    >
      {children}
    </motion.button>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
  placeholder,
}) {
  return (
    <SelectBox
      value={value}
      onChange={onChange}
    >
      <option value="">
        {placeholder}
      </option>

      {options.map((option) => (
        <option
          key={option}
          value={option}
        >
          {option}
        </option>
      ))}
    </SelectBox>
  );
}

/* =========================================================
   COMMON FEES FILTER
========================================================= */

function FeesSearchForm({
  advanced = false,
  dueMode = false,
}) {
  const [filters, setFilters] = useState({
    session: "2026",
    shift: "",
    className: "",
    section: "",
    group: "",
    roll: "",
    fromDate: "",
    toDate: "",
    studentId: "",
    invoice: "",
    teacher: "",
    feeName: "",
    month: "September",
  });

  const change = (key) => (event) => {
    setFilters((prev) => ({
      ...prev,
      [key]: event.target.value,
    }));
  };

  return (
    <div className="grid gap-x-8 gap-y-4 lg:grid-cols-2">
      <Field label="Session Year:">
        <FilterSelect
          value={filters.session}
          onChange={change("session")}
          options={sessionOptions}
          placeholder="Select Session"
        />
      </Field>

      <Field label="School Shift:">
        <FilterSelect
          value={filters.shift}
          onChange={change("shift")}
          options={shiftOptions}
          placeholder="Select Shift"
        />
      </Field>

      <Field label="Class:">
        <FilterSelect
          value={filters.className}
          onChange={change("className")}
          options={classOptions}
          placeholder="Select Class"
        />
      </Field>

      <Field label="Section:">
        <FilterSelect
          value={filters.section}
          onChange={change("section")}
          options={sectionOptions}
          placeholder="Select Section"
        />
      </Field>

      <Field label={dueMode ? "Groups:" : "Group:"}>
        <FilterSelect
          value={filters.group}
          onChange={change("group")}
          options={groupOptions}
          placeholder={
            dueMode
              ? "Select Groups"
              : "Select Group"
          }
        />
      </Field>

      <Field label="Roll:">
        <TextBox
          value={filters.roll}
          onChange={change("roll")}
          placeholder="Roll No"
        />
      </Field>

      {dueMode ? (
        <>
          <Field label="Month:">
            <FilterSelect
              value={filters.month}
              onChange={change("month")}
              options={months}
              placeholder="Select Month"
            />
          </Field>

          <Field label="Student ID:">
            <TextBox
              value={filters.studentId}
              onChange={change("studentId")}
              placeholder="Enter Student ID"
            />
          </Field>
        </>
      ) : advanced ? (
        <>
          <Field label="From Date:">
            <TextBox
              value={filters.fromDate}
              onChange={change("fromDate")}
              placeholder="Enter From Date"
            />
          </Field>

          <Field label="To Date:">
            <TextBox
              value={filters.toDate}
              onChange={change("toDate")}
              placeholder="Enter To Date"
            />
          </Field>

          <Field label="Student ID:">
            <TextBox
              value={filters.studentId}
              onChange={change("studentId")}
              placeholder="Student ID"
            />
          </Field>

          <Field label="Invoice:">
            <TextBox
              value={filters.invoice}
              onChange={change("invoice")}
              placeholder="Enter To Invoice"
            />
          </Field>

          <Field label="Teacher Name:">
            <FilterSelect
              value={filters.teacher}
              onChange={change("teacher")}
              options={teacherOptions}
              placeholder="Select Teacher"
            />
          </Field>

          <Field label="Fees Name:">
            <TextBox
              value={filters.feeName}
              onChange={change("feeName")}
              placeholder="Enter Fees Name"
            />
          </Field>
        </>
      ) : (
        <Field label="Student ID:">
          <TextBox
            value={filters.studentId}
            onChange={change("studentId")}
            placeholder="Student ID"
          />
        </Field>
      )}

      <div className="sm:col-start-1 sm:pl-[180px]">
        <div className="flex flex-wrap gap-1">
          <SearchButton />

          {(advanced || dueMode) && (
            <button
              type="button"
              onClick={() => window.print()}
              className={`btn btn-sm min-h-0 text-white ${
                dueMode
                  ? "bg-violet-600 hover:bg-violet-700"
                  : "btn-success"
              }`}
            >
              <Printer size={14} />
              Print
            </button>
          )}

          {dueMode && (
            <>
              <button
                type="button"
                className="btn btn-primary btn-sm min-h-0 text-white"
              >
                PDF
              </button>

              <button
                type="button"
                className="btn btn-primary btn-sm min-h-0 text-white"
              >
                Excel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   1. FEES COLLECTION CREATE
========================================================= */

export function FeesCollectionCreatePage() {
  const { go } = useSiblingNavigation();

  const [advancePayment, setAdvancePayment] =
    useState(false);

  return (
    <PageRoot>
      <Panel
        title="Pay Fees"
        action={
          <HeaderButton
            onClick={() =>
              go("fees-collection-list")
            }
          >
            Back to Student fee List
          </HeaderButton>
        }
      >
        <div className="space-y-5 p-5 sm:p-6">
          <RequiredNotice />

          <div className="mx-auto grid max-w-6xl gap-x-8 gap-y-4 lg:grid-cols-2">
            <Field label="Session Year:">
              <FilterSelect
                value="2026"
                onChange={() => {}}
                options={sessionOptions}
                placeholder="Select Session"
              />
            </Field>

            <Field label="School Shift:">
              <FilterSelect
                value=""
                onChange={() => {}}
                options={shiftOptions}
                placeholder="Select Shift"
              />
            </Field>

            <Field label="Class:">
              <FilterSelect
                value=""
                onChange={() => {}}
                options={classOptions}
                placeholder="Select class"
              />
            </Field>

            <Field label="Section:">
              <FilterSelect
                value=""
                onChange={() => {}}
                options={sectionOptions}
                placeholder="Select Section"
              />
            </Field>

            <Field label="Group:">
              <FilterSelect
                value=""
                onChange={() => {}}
                options={groupOptions}
                placeholder="Select Group"
              />
            </Field>

            <Field label="Roll:">
              <TextBox
                value=""
                onChange={() => {}}
                placeholder="Roll No"
              />
            </Field>

            <Field label="Student ID:">
              <TextBox
                value=""
                onChange={() => {}}
                placeholder="Student ID"
              />
            </Field>

            <Field label="With Advance Payment?:">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={advancePayment}
                  onChange={(event) =>
                    setAdvancePayment(
                      event.target.checked
                    )
                  }
                  className="checkbox checkbox-sm"
                />

                Yes
              </label>
            </Field>

            <div className="sm:col-start-1 sm:pl-[180px]">
              <SearchButton />
            </div>
          </div>

          <div className="mt-8 h-10 overflow-x-auto border-t border-base-200" />
        </div>
      </Panel>
    </PageRoot>
  );
}

/* =========================================================
   2. FEES COLLECTION LIST
========================================================= */

export function FeesCollectionListPage() {
  const { go } = useSiblingNavigation();

  const [rows, setRows] =
    useState(feeCollectionRows);

  const deleteRow = (sl) => {
    if (
      !window.confirm(
        "Delete this fee collection record?"
      )
    ) {
      return;
    }

    setRows((prev) =>
      prev.filter((row) => row.sl !== sl)
    );
  };

  return (
    <PageRoot>
      <div className="space-y-6">
        <Panel title="Student Fees Search">
          <div className="mx-auto max-w-6xl p-5 sm:p-6">
            <FeesSearchForm advanced />
          </div>
        </Panel>

        <Panel
          title="Student Fees Collection List"
          action={
            <HeaderButton
              onClick={() =>
                go("fees-collection-create")
              }
            >
              Create Student fee
            </HeaderButton>
          }
        >
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="table table-zebra table-xs min-w-[1450px] border border-base-300">
                <thead>
                  <tr className="bg-base-200">
                    <th>SL</th>
                    <th>Student ID</th>
                    <th>Student Details</th>
                    <th>Fees Details</th>
                    <th>Amount</th>
                    <th>Discount</th>
                    <th>Dues</th>
                    <th>Fees Date</th>
                    <th>Invoice</th>
                    <th>Paid By</th>
                    <th>Collected By</th>
                    <th>Created Date</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row) => (
                    <tr key={row.sl}>
                      <td>{row.sl}</td>
                      <td>{row.studentId}</td>
                      <td>{row.student}</td>
                      <td>{row.fee}</td>
                      <td>{row.amount}</td>
                      <td>{row.discount}</td>
                      <td>{row.dues}</td>
                      <td>{row.date}</td>
                      <td>{row.invoice}</td>
                      <td>{row.paidBy}</td>
                      <td>{row.collectedBy}</td>
                      <td>{row.created}</td>

                      <td>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            className="btn btn-square btn-xs bg-slate-500 text-white"
                          >
                            <Printer size={13} />
                          </button>

                          <button
                            type="button"
                            className="btn btn-square btn-xs bg-cyan-500 text-white"
                          >
                            <Edit3 size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteRow(row.sl)
                            }
                            className="btn btn-error btn-square btn-xs text-white"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 text-sm font-bold">
              <span>
                Showing 1 to {rows.length} of 218
                results.
              </span>

              <div className="join">
                <button className="btn btn-primary btn-xs join-item">
                  1
                </button>
                <button className="btn btn-xs join-item">
                  2
                </button>
                <button className="btn btn-xs join-item">
                  3
                </button>
                <button className="btn btn-xs join-item">
                  &gt;
                </button>
                <button className="btn btn-xs join-item">
                  Last ›
                </button>
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </PageRoot>
  );
}

/* =========================================================
   3. FEES COLLECTION DUE DETAILS
========================================================= */

export function FeesCollectionDueDetailsPage() {
  const { go } = useSiblingNavigation();

  return (
    <PageRoot>
      <div className="space-y-6">
        <Panel
          title="Student Due Fees Search"
          action={
            <HeaderButton
              onClick={() =>
                go("fees-collection-list")
              }
            >
              Back to Student fee List
            </HeaderButton>
          }
        >
          <div className="mx-auto max-w-6xl p-5 sm:p-6">
            <FeesSearchForm dueMode />
          </div>
        </Panel>

        <Panel title="Student Due Fees Summary">
          <div className="h-14 overflow-x-auto p-2" />
        </Panel>
      </div>
    </PageRoot>
  );
}

/* =========================================================
   4. STUDENT DUE DETAILS
========================================================= */

export function StudentDueDetailsPage() {
  const { go } = useSiblingNavigation();

  return (
    <PageRoot>
      <div className="space-y-6">
        <Panel
          title="Student Due Details Search"
          action={
            <HeaderButton
              onClick={() =>
                go("fees-collection-create")
              }
            >
              Create Student fee
            </HeaderButton>
          }
        >
          <div className="mx-auto max-w-6xl p-5 sm:p-6">
            <FeesSearchForm dueMode />
          </div>
        </Panel>

        <Panel title="Student Due Details">
          <div className="h-14 overflow-x-auto p-2" />
        </Panel>
      </div>
    </PageRoot>
  );
}

/* =========================================================
   5. FEE SETTINGS
========================================================= */

export function FeeSettingsPage() {
  const { go } = useSiblingNavigation();

  const initialCategories = [
    ["SSC", ""],
    ["HSC", ""],
    ["Inter 2nd year", "Group Wise"],
    ["Inter 1st year", "Group Wise"],
    ["Class 10", "Group Wise"],
    ["Class 09", "Group Wise"],
    ["demo", "Group Wise"],
  ];

  const [categorySettings, setCategorySettings] =
    useState(initialCategories);

  const updateCategory = (index, value) => {
    setCategorySettings((prev) =>
      prev.map((row, i) =>
        i === index ? [row[0], value] : row
      )
    );
  };

  return (
    <PageRoot>
      <Panel
        title="Fee Settings Update"
        action={
          <HeaderButton
            onClick={() =>
              go("fees-collection-list")
            }
          >
            Back to Student fee List
          </HeaderButton>
        }
      >
        <div className="space-y-5 p-5 sm:p-6">
          <RequiredNotice />

          <div className="mx-auto max-w-6xl space-y-4">
            <Field
              label="Invoice:"
              required
            >
              <div className="grid grid-cols-2 lg:grid-cols-4">
                {[
                  "1 Layout",
                  "1 Theme",
                  "Landscape Print",
                  "A4",
                ].map((value) => (
                  <select
                    key={value}
                    defaultValue={value}
                    className="select select-bordered select-sm rounded-none first:rounded-l last:rounded-r"
                  >
                    <option>{value}</option>
                  </select>
                ))}
              </div>
            </Field>

            <Field
              label="Due Invoice:"
              required
            >
              <div className="grid grid-cols-2 lg:grid-cols-4">
                {[
                  "1 Layout",
                  "1 Theme",
                  "Portrait Print",
                  "1 Par Page",
                ].map((value) => (
                  <select
                    key={value}
                    defaultValue={value}
                    className="select select-bordered select-sm rounded-none first:rounded-l last:rounded-r"
                  >
                    <option>{value}</option>
                  </select>
                ))}
              </div>
            </Field>

            <Field
              label="Late Payment Day of Month"
              required
            >
              <select
                defaultValue="1"
                className="select select-bordered select-sm w-full"
              >
                {Array.from(
                  { length: 28 },
                  (_, index) => index + 1
                ).map((day) => (
                  <option
                    key={day}
                    value={day}
                  >
                    {day}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Invoice Pattern"
              required
            >
              <div className="space-y-2">
                <div className="flex gap-5">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="invoice-pattern"
                      defaultChecked
                      className="radio radio-primary radio-xs"
                    />
                    Session Wise
                  </label>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="invoice-pattern"
                      className="radio radio-primary radio-xs"
                    />
                    Normal
                  </label>
                </div>

                <div className="grid grid-cols-2">
                  <select
                    defaultValue="2026"
                    className="select select-bordered select-sm rounded-r-none"
                  >
                    <option>2026</option>
                    <option>2025</option>
                  </select>

                  <input
                    disabled
                    className="input input-bordered input-sm rounded-l-none"
                  />
                </div>
              </div>
            </Field>

            <Field
              label="Fees Category Setup"
              required
            >
              <div className="overflow-x-auto border border-base-300">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Class</th>
                      <th>Type</th>
                    </tr>
                  </thead>

                  <tbody>
                    {categorySettings.map(
                      ([name, type], index) => (
                        <tr key={name}>
                          <td>{name}</td>

                          <td>
                            <select
                              value={type}
                              onChange={(event) =>
                                updateCategory(
                                  index,
                                  event.target.value
                                )
                              }
                              className="select select-bordered select-sm w-full"
                            >
                              <option value="">
                                Select Option
                              </option>
                              <option>
                                Group Wise
                              </option>
                              <option>
                                Class Wise
                              </option>
                              <option>
                                Student Wise
                              </option>
                            </select>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </Field>

            <div className="pl-0 sm:pl-[180px]">
              <button
                type="button"
                className="btn btn-success btn-sm text-white"
              >
                <Check size={14} />
                Submit
              </button>
            </div>
          </div>
        </div>
      </Panel>
    </PageRoot>
  );
}

/* =========================================================
   6. SMS SETUP
========================================================= */

function SmsToggle({
  checked,
  onChange,
  label,
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="toggle toggle-primary toggle-sm"
      />
      {label}
    </label>
  );
}

function SmsTemplateRow({
  title,
  value,
  onChange,
  manual,
  setManual,
  auto,
  setAuto,
  keywords,
}) {
  return (
    <div className="grid gap-4 border-b border-base-200 py-4 lg:grid-cols-[330px_minmax(0,1fr)]">
      <div className="text-sm font-bold">
        {title}
      </div>

      <div>
        <div className="flex items-stretch">
          <div className="min-w-[110px] rounded-l border border-base-300 bg-base-200/70 p-2">
            <SmsToggle
              checked={manual}
              onChange={(event) =>
                setManual(event.target.checked)
              }
              label="Manual"
            />

            <div className="mt-2">
              <SmsToggle
                checked={auto}
                onChange={(event) =>
                  setAuto(event.target.checked)
                }
                label="Auto"
              />
            </div>
          </div>

          <textarea
            value={value}
            onChange={onChange}
            className="textarea textarea-bordered min-h-[60px] flex-1 rounded-l-none"
          />
        </div>

        <p className="mt-1 text-[11px] leading-relaxed text-cyan-600">
          {keywords}
        </p>
      </div>
    </div>
  );
}

export function SmsSetupPage() {
  const [templates, setTemplates] =
    useState({
      pre: "",
      approved: "",
      collection:
        "[[student_id]]-[[full_name]] ([[class]]-[[section]], [[roll]]) Amount: [[amount]]tk for [[fees_list]] Paid date: [[payment_date]], Invoice ID: [[invoice_id]]",
      due:
        "আসসালামু আলাইকুম। সম্মানিত অভিভাবক, প্রতি মাসের ৮ তারিখের মধ্যে টিউশন ফি পরিশোধের দিন নির্ধারিত।",
      teacher: "",
      history: "",
    });

  const [toggles, setToggles] =
    useState({
      preManual: false,
      preAuto: false,
      approvedManual: false,
      approvedAuto: false,
      collectionManual: false,
      collectionAuto: true,
      dueManual: true,
      dueAuto: false,
      teacherManual: false,
      teacherAuto: false,
      historyManual: false,
      historyAuto: false,
    });

  const setToggle = (key) => (value) => {
    setToggles((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const changeTemplate = (key) => (event) => {
    setTemplates((prev) => ({
      ...prev,
      [key]: event.target.value,
    }));
  };

  return (
    <PageRoot>
      <Panel title="Sms Settings Create">
        <div className="p-4 sm:p-5">
          <div className="border border-base-300">
            <div className="border-b border-base-300 bg-base-200/50 px-5 py-3 text-sm font-bold">
              Fess Collection SMS
            </div>

            <div className="px-5">
              <SmsTemplateRow
                title="Pre Approved SMS"
                value={templates.pre}
                onChange={changeTemplate("pre")}
                manual={toggles.preManual}
                setManual={(v) =>
                  setToggle("preManual")(v)
                }
                auto={toggles.preAuto}
                setAuto={(v) =>
                  setToggle("preAuto")(v)
                }
                keywords="[[company_name]], [[full_name]], [[student_id]], [[session]], [[shift]], [[class]], [[section]], [[roll]], [[amount]], [[payment_date]], [[invoice_id]], [[sms_time]], [[due]], [[fees_list]]"
              />

              <SmsTemplateRow
                title="Approved SMS"
                value={templates.approved}
                onChange={changeTemplate(
                  "approved"
                )}
                manual={
                  toggles.approvedManual
                }
                setManual={(v) =>
                  setToggle(
                    "approvedManual"
                  )(v)
                }
                auto={toggles.approvedAuto}
                setAuto={(v) =>
                  setToggle(
                    "approvedAuto"
                  )(v)
                }
                keywords="[[company_name]], [[full_name]], [[student_id]], [[approved_by]], [[approved_date]], [[amount]], [[invoice_id]]"
              />

              <SmsTemplateRow
                title="Fees Collections"
                value={templates.collection}
                onChange={changeTemplate(
                  "collection"
                )}
                manual={
                  toggles.collectionManual
                }
                setManual={(v) =>
                  setToggle(
                    "collectionManual"
                  )(v)
                }
                auto={toggles.collectionAuto}
                setAuto={(v) =>
                  setToggle(
                    "collectionAuto"
                  )(v)
                }
                keywords="[[company_name]], [[full_name]], [[student_id]], [[session]], [[shift]], [[class]], [[section]], [[roll]], [[amount]], [[payment_date]], [[invoice_id]], [[sms_time]], [[due]], [[fees_list]]"
              />

              <SmsTemplateRow
                title="Due Fees Collection"
                value={templates.due}
                onChange={changeTemplate("due")}
                manual={toggles.dueManual}
                setManual={(v) =>
                  setToggle("dueManual")(v)
                }
                auto={toggles.dueAuto}
                setAuto={(v) =>
                  setToggle("dueAuto")(v)
                }
                keywords="[[company_name]], [[full_name]], [[session]], [[shift]], [[class]], [[section]], [[roll]], [[amount]], [[late_payment_date]], [[fees_list]]"
              />

              <SmsTemplateRow
                title="Teacher Fees Collection"
                value={templates.teacher}
                onChange={changeTemplate(
                  "teacher"
                )}
                manual={
                  toggles.teacherManual
                }
                setManual={(v) =>
                  setToggle(
                    "teacherManual"
                  )(v)
                }
                auto={toggles.teacherAuto}
                setAuto={(v) =>
                  setToggle(
                    "teacherAuto"
                  )(v)
                }
                keywords="[[company_name]], [[full_name]], [[teacher_id]], [[designation]], [[amount]], [[sms_time]]"
              />

              <DueSmsSchedule />

              <SmsTemplateRow
                title="Payment History"
                value={templates.history}
                onChange={changeTemplate(
                  "history"
                )}
                manual={
                  toggles.historyManual
                }
                setManual={(v) =>
                  setToggle(
                    "historyManual"
                  )(v)
                }
                auto={toggles.historyAuto}
                setAuto={(v) =>
                  setToggle(
                    "historyAuto"
                  )(v)
                }
                keywords="[[company_name]], [[full_name]], [[teacher_id]], [[designation]], [[amount]], [[sms_time]]"
              />
            </div>
          </div>

          <div className="mt-4 pl-0 sm:pl-[360px]">
            <button
              type="button"
              className="btn btn-success btn-sm text-white"
            >
              Submit
            </button>
          </div>
        </div>
      </Panel>
    </PageRoot>
  );
}

function DueSmsSchedule() {
  const [enabled, setEnabled] =
    useState(true);

  const [rows, setRows] = useState([
    {
      id: 1,
      shift: "",
      day: "18",
      time: "17:00",
    },
  ]);

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: Date.now(),
        shift: "",
        day: "18",
        time: "17:00",
      },
    ]);
  };

  const deleteRow = (id) => {
    setRows((prev) =>
      prev.filter((row) => row.id !== id)
    );
  };

  return (
    <div className="grid gap-4 border-b border-base-200 py-4 lg:grid-cols-[330px_minmax(0,1fr)]">
      <div className="text-sm font-bold">
        Due Fees SMS
      </div>

      <div className="rounded border border-base-300 bg-base-200/70">
        <div className="flex items-center justify-between border-b border-base-300 p-3">
          <SmsToggle
            checked={enabled}
            onChange={(event) =>
              setEnabled(
                event.target.checked
              )
            }
            label="Enable"
          />

          <button
            type="button"
            onClick={addRow}
            className="btn btn-success btn-sm min-h-0 text-white"
          >
            Add More
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="table table-sm min-w-[620px]">
            <thead>
              <tr>
                <th>Shift *</th>
                <th>Day *</th>
                <th>Time *</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <select className="select select-bordered select-sm w-full">
                      <option>
                        Nothing selected
                      </option>

                      {shiftOptions.map(
                        (shift) => (
                          <option key={shift}>
                            {shift}
                          </option>
                        )
                      )}
                    </select>
                  </td>

                  <td>
                    <select
                      defaultValue={row.day}
                      className="select select-bordered select-sm w-full"
                    >
                      {Array.from(
                        { length: 28 },
                        (_, i) => i + 1
                      ).map((day) => (
                        <option key={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td>
                    <input
                      type="time"
                      defaultValue={row.time}
                      className="input input-bordered input-sm"
                    />
                  </td>

                  <td>
                    <button
                      type="button"
                      onClick={() =>
                        deleteRow(row.id)
                      }
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
  );
}

/* =========================================================
   7. FEES COLLECTION APPROVE
========================================================= */

export function FeesCollectionApprovePage() {
  const { go } = useSiblingNavigation();

  return (
    <PageRoot>
      <div className="space-y-6">
        <Panel title="Student Fees Search">
          <div className="mx-auto max-w-6xl p-5 sm:p-6">
            <FeesSearchForm advanced />
          </div>
        </Panel>

        <Panel
          title="Student Fees Pending List"
          action={
            <HeaderButton
              onClick={() =>
                go("fees-collection-create")
              }
            >
              Create Student fee
            </HeaderButton>
          }
        >
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="table table-sm min-w-[1200px] border border-base-300">
                <thead>
                  <tr className="bg-base-200">
                    <th>SL</th>
                    <th>Student ID</th>
                    <th>Student Details</th>
                    <th>Fees Details</th>
                    <th>Amount</th>
                    <th>Discount</th>
                    <th>Dues</th>
                    <th>Fees Date</th>
                    <th>Invoice</th>
                    <th>Paid By</th>
                    <th>Collected By</th>
                    <th>Created Date</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody />
              </table>
            </div>

            <div className="mt-6 text-sm font-bold">
              Showing 0 to 0 of 0 results.
            </div>
          </div>
        </Panel>
      </div>
    </PageRoot>
  );
}

/* =========================================================
   8. STUDENT FEE METHOD SETUP
========================================================= */

export function StudentFeeMethodSetupPage() {
  const { go } = useSiblingNavigation();

  const [tab, setTab] =
    useState("student");

  const [rows, setRows] = useState([
    {
      id: 1,
      account: "",
      method: "",
      gateway: "",
    },
  ]);

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: Date.now(),
        account: "",
        method: "",
        gateway: "",
      },
    ]);
  };

  const deleteRow = (id) => {
    setRows((prev) =>
      prev.length === 1
        ? prev
        : prev.filter(
            (row) => row.id !== id
          )
    );
  };

  const updateRow = (
    id,
    key,
    value
  ) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              [key]: value,
            }
          : row
      )
    );
  };

  return (
    <PageRoot>
      <Panel
        title="Student Fee Method Setup"
        action={
          <HeaderButton
            onClick={() =>
              go("fees-collection-list")
            }
          >
            Back to Student fee List
          </HeaderButton>
        }
      >
        <div className="space-y-5 p-5">
          <RequiredNotice />

          <div
            role="tablist"
            className="tabs tabs-bordered"
          >
            <button
              type="button"
              role="tab"
              onClick={() =>
                setTab("student")
              }
              className={`tab ${
                tab === "student"
                  ? "tab-active"
                  : ""
              }`}
            >
              Student
            </button>

            <button
              type="button"
              role="tab"
              onClick={() =>
                setTab("admin")
              }
              className={`tab ${
                tab === "admin"
                  ? "tab-active"
                  : ""
              }`}
            >
              Admin
            </button>
          </div>

          <div className="rounded border border-base-300 shadow-sm">
            <div
              className={`${BLUE_HEADER} flex items-center justify-between px-5 py-2 text-white`}
            >
              <h3 className="text-lg font-bold">
                {tab === "student"
                  ? "Student Setup"
                  : "Admin Setup"}
              </h3>

              <div className="join">
                <div className="flex min-w-[42px] items-center justify-center bg-white px-3 text-sm text-base-content">
                  {rows.length}
                </div>

                <button
                  type="button"
                  onClick={addRow}
                  className="btn btn-info btn-sm join-item min-h-0 text-white"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="overflow-x-auto p-5">
              <table className="table table-sm min-w-[800px] border border-base-300">
                <thead>
                  <tr className="bg-base-100">
                    <th>
                      Account Head{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </th>
                    <th>
                      Payment Method
                    </th>
                    <th>Api Gateway</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <select
                          value={row.account}
                          onChange={(event) =>
                            updateRow(
                              row.id,
                              "account",
                              event.target.value
                            )
                          }
                          className="select select-bordered select-sm w-full"
                        >
                          <option value="">
                            Select account head
                          </option>
                          <option>
                            Student Fees
                          </option>
                          <option>
                            Admission Fees
                          </option>
                          <option>
                            Monthly Fees
                          </option>
                        </select>
                      </td>

                      <td>
                        <select
                          value={row.method}
                          onChange={(event) =>
                            updateRow(
                              row.id,
                              "method",
                              event.target.value
                            )
                          }
                          className="select select-bordered select-sm w-full"
                        >
                          <option value="">
                            Select Method
                          </option>
                          <option>Cash</option>
                          <option>
                            Mobile Banking
                          </option>
                          <option>
                            Bank
                          </option>
                        </select>
                      </td>

                      <td>
                        <select
                          value={row.gateway}
                          onChange={(event) =>
                            updateRow(
                              row.id,
                              "gateway",
                              event.target.value
                            )
                          }
                          className="select select-bordered select-sm w-full"
                        >
                          <option value="">
                            Select Gateway
                          </option>
                          <option>bKash</option>
                          <option>Nagad</option>
                          <option>Rocket</option>
                        </select>
                      </td>

                      <td>
                        <button
                          type="button"
                          onClick={() =>
                            deleteRow(row.id)
                          }
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

          <div className="pl-0 sm:pl-[400px]">
            <button
              type="button"
              className="btn btn-success btn-sm text-white"
            >
              Submit
            </button>
          </div>
        </div>
      </Panel>
    </PageRoot>
  );
}