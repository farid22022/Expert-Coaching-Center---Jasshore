import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Edit3,
  Plus,
  Printer,
  Search,
  Trash2,
} from "lucide-react";

/* =========================================================
   OPTIONS / DEMO DATA
========================================================= */

const sessions = ["2026", "2025", "2024"];

const classes = [
  "Class 09",
  "Class 10",
  "SSC",
  "HSC",
  "Inter 1st year",
  "Inter 2nd year",
];

const groups = [
  "Science",
  "Humanities",
  "Business",
  "General",
];

const studentCategories = [
  "Day Care",
  "Regular",
  "Waiver",
  "Scholarship",
];

const shifts = [
  "Morning",
  "Day",
  "Evening",
  "All Shift",
  "9.30AM- 11.30AM Morning",
];

const sections = ["A", "B", "Day", "Morning", "All"];

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

const fines = [
  "No Fine",
  "1%",
  "2%",
  "5%",
  "10%",
];

const categoryNames = [
  "Admission - 2026",
  "Monthly Fee Business",
  "Monthly Fee Science",
  "Monthly Fee Humanities",
  "Exam Fee",
  "Model Test Fee",
];

/* =========================================================
   DEMO FEES CATEGORY DATA
========================================================= */

const admissionRows = [
  ["Science", "Class 09"],
  ["Humanities", "Class 09"],
  ["Business", "Class 09"],
  ["Science", "Class 10"],
  ["Humanities", "Class 10"],
  ["Business", "Class 10"],
].map(([group, className], index) => ({
  id: `admission-${index + 1}`,
  categoryName: "Admission - 2026",
  studentCategory: "Day Care",
  session: "2026",
  className,
  group,
  month: "Jan, 2026",
  amount: 1000,
  fine: "0%",
  admissionFee: "Yes",
  oneTime: "Yes",
  createdBy: "Expert Coaching Center",
  createdDate:
    index < 3
      ? "2026-06-07 18:38:49"
      : "2026-06-07 18:37:26",
}));

const businessMonthlyRows = months
  .slice()
  .reverse()
  .flatMap((month, monthIndex) =>
    ["Class 09", "Class 10"].map(
      (className, classIndex) => ({
        id: `business-${monthIndex}-${classIndex}`,
        categoryName: "Monthly Fee Business",
        studentCategory: "Day Care",
        session: "2026",
        className,
        group: "Business",
        month: `${month.slice(0, 3)}, 2026`,
        amount: 2000,
        fine: "0%",
        admissionFee: "No",
        oneTime: "No",
        createdBy: "Expert Coaching Center",
        createdDate:
          "2026-01-25 13:38:11",
      })
    )
  );

const scienceMonthlyRows = months
  .slice()
  .reverse()
  .map((month, index) => ({
    id: `science-${index}`,
    categoryName: "Monthly Fee Science",
    studentCategory: "Day Care",
    session: "2026",
    className: index % 2 ? "Class 10" : "Class 09",
    group: "Science",
    month: `${month.slice(0, 3)}, 2026`,
    amount: 2200,
    fine: "0%",
    admissionFee: "No",
    oneTime: "No",
    createdBy: "Expert Coaching Center",
    createdDate: "2026-01-25 13:38:11",
  }));

const initialFeeCategories = [
  ...admissionRows,
  ...businessMonthlyRows,
  ...scienceMonthlyRows,
];

/* =========================================================
   SHARED HELPERS
========================================================= */

function useSiblingNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const go = (slug) => {
    navigate(
      location.pathname.replace(
        /\/[^/]+\/?$/,
        `/${slug}`
      )
    );
  };

  return { go };
}

function PageRoot({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="min-h-[calc(100vh-64px)] bg-base-200/50 p-2 sm:p-4"
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
      <div className="flex min-h-[40px] items-center justify-between gap-3 bg-[#456db5] px-4 py-2 text-white sm:px-5">
        <h2 className="text-[17px] font-bold sm:text-[19px]">
          {title}
        </h2>

        {action}
      </div>

      {children}
    </section>
  );
}

function HeaderButton({ children, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      type="button"
      onClick={onClick}
      className="btn btn-sm min-h-0 border-cyan-500 bg-cyan-500 text-white hover:border-cyan-600 hover:bg-cyan-600"
    >
      {children}
    </motion.button>
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
  required = false,
  children,
}) {
  return (
    <div className="grid items-center gap-2 sm:grid-cols-[190px_minmax(0,1fr)]">
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
  placeholder,
  options = [],
  className = "",
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`select select-bordered select-sm w-full rounded ${className}`}
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
    </select>
  );
}

function InputBox({
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="input input-bordered input-sm w-full rounded"
    />
  );
}

function SearchButton({ onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      type="button"
      onClick={onClick}
      className="btn btn-info btn-sm min-h-0 text-white"
    >
      <Search size={14} />
      Search
    </motion.button>
  );
}

/* =========================================================
   FEES CATEGORY CREATE
========================================================= */

function newFeeEntry() {
  return {
    id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
    categoryName: "",
    studentCategory: "",
    className: "",
    group: "",
    amount: "",
    fine: "",
    oneTime: "Yes",
    month: "January",
    admissionFee: "No",
  };
}

export function FeesCategoryCreatePage() {
  const { go } = useSiblingNavigation();

  const [session, setSession] =
    useState("2026");

  const [rows, setRows] = useState([
    newFeeEntry(),
  ]);

  const addRows = (count = 1) => {
    const safeCount = Math.min(
      Math.max(Number(count) || 1, 1),
      20
    );

    setRows((prev) => [
      ...prev,
      ...Array.from(
        { length: safeCount },
        newFeeEntry
      ),
    ]);
  };

  const updateRow = (id, key, value) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? { ...row, [key]: value }
          : row
      )
    );
  };

  const removeRow = (id) => {
    setRows((prev) => {
      if (prev.length === 1) {
        return [newFeeEntry()];
      }

      return prev.filter(
        (row) => row.id !== id
      );
    });
  };

  const [addCount, setAddCount] =
    useState(1);

  const handleSubmit = () => {
    console.log({
      session,
      feeCategories: rows,
    });

    alert(
      `${rows.length} fee category row(s) prepared successfully.`
    );
  };

  return (
    <PageRoot>
      <Panel
        title="Create Fees Category"
        action={
          <HeaderButton
            onClick={() =>
              go("fees-category-list")
            }
          >
            Back to Fees category List
          </HeaderButton>
        }
      >
        <div className="space-y-5 p-5 sm:p-6">
          <RequiredNotice />

          <div className="max-w-3xl">
            <Field
              label="Session Year:"
              required
            >
              <SelectBox
                value={session}
                onChange={(e) =>
                  setSession(e.target.value)
                }
                placeholder="Select Session"
                options={sessions}
              />
            </Field>
          </div>

          <div className="overflow-hidden rounded border border-[#456db5]">
            <div className="flex items-center justify-between bg-[#456db5] px-4 py-3 text-white">
              <h3 className="font-bold">
                Fees Category Entry
              </h3>

              <div className="join">
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={addCount}
                  onChange={(e) =>
                    setAddCount(
                      e.target.value
                    )
                  }
                  className="input input-sm join-item w-12 text-base-content"
                />

                <button
                  type="button"
                  onClick={() =>
                    addRows(addCount)
                  }
                  className="btn btn-info btn-sm join-item min-h-0 text-white"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="overflow-x-auto p-1">
              <table className="table table-sm min-w-[1450px]">
                <thead>
                  <tr>
                    <th>
                      Fees Category Name
                      <span className="text-red-500">
                        *
                      </span>
                    </th>

                    <th>
                      Student Category
                      <span className="text-red-500">
                        *
                      </span>
                    </th>

                    <th>
                      Class
                      <span className="text-red-500">
                        *
                      </span>
                    </th>

                    <th>
                      Groups
                      <span className="text-red-500">
                        *
                      </span>
                    </th>

                    <th>
                      Amount
                      <span className="text-red-500">
                        *
                      </span>
                    </th>

                    <th>Late Fine(%)</th>

                    <th>Is OneTime?</th>

                    <th>For Month</th>

                    <th>
                      Is Admission Fee?
                    </th>

                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.id}
                      className="bg-base-200/60"
                    >
                      <td>
                        <InputBox
                          value={
                            row.categoryName
                          }
                          onChange={(e) =>
                            updateRow(
                              row.id,
                              "categoryName",
                              e.target.value
                            )
                          }
                          placeholder="Enter Fees Category Name"
                        />
                      </td>

                      <td>
                        <SelectBox
                          value={
                            row.studentCategory
                          }
                          onChange={(e) =>
                            updateRow(
                              row.id,
                              "studentCategory",
                              e.target.value
                            )
                          }
                          placeholder="Nothing selected"
                          options={
                            studentCategories
                          }
                        />
                      </td>

                      <td>
                        <SelectBox
                          value={
                            row.className
                          }
                          onChange={(e) =>
                            updateRow(
                              row.id,
                              "className",
                              e.target.value
                            )
                          }
                          placeholder="Select Class"
                          options={classes}
                        />
                      </td>

                      <td>
                        <SelectBox
                          value={row.group}
                          onChange={(e) =>
                            updateRow(
                              row.id,
                              "group",
                              e.target.value
                            )
                          }
                          placeholder="Select Groups"
                          options={groups}
                        />
                      </td>

                      <td>
                        <InputBox
                          type="number"
                          value={row.amount}
                          onChange={(e) =>
                            updateRow(
                              row.id,
                              "amount",
                              e.target.value
                            )
                          }
                          placeholder="Enter Amount"
                        />
                      </td>

                      <td>
                        <SelectBox
                          value={row.fine}
                          onChange={(e) =>
                            updateRow(
                              row.id,
                              "fine",
                              e.target.value
                            )
                          }
                          placeholder="Select Fine"
                          options={fines}
                        />
                      </td>

                      <td>
                        <select
                          value={row.oneTime}
                          onChange={(e) =>
                            updateRow(
                              row.id,
                              "oneTime",
                              e.target.value
                            )
                          }
                          className="select select-bordered select-sm w-full"
                        >
                          <option>Yes</option>
                          <option>No</option>
                        </select>
                      </td>

                      <td>
                        <select
                          value={row.month}
                          onChange={(e) =>
                            updateRow(
                              row.id,
                              "month",
                              e.target.value
                            )
                          }
                          className="select select-bordered select-sm w-full"
                        >
                          {months.map(
                            (month) => (
                              <option
                                key={month}
                              >
                                {month}
                              </option>
                            )
                          )}
                        </select>
                      </td>

                      <td>
                        <select
                          value={
                            row.admissionFee
                          }
                          onChange={(e) =>
                            updateRow(
                              row.id,
                              "admissionFee",
                              e.target.value
                            )
                          }
                          className="select select-bordered select-sm w-full"
                        >
                          <option>No</option>
                          <option>Yes</option>
                        </select>
                      </td>

                      <td>
                        <button
                          type="button"
                          onClick={() =>
                            removeRow(row.id)
                          }
                          className="btn btn-error btn-square btn-sm text-white"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pl-0 sm:pl-[380px]">
            <button
              type="button"
              onClick={handleSubmit}
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

/* =========================================================
   FEES CATEGORY LIST
========================================================= */

export function FeesCategoryListPage() {
  const { go } = useSiblingNavigation();

  const [rows, setRows] = useState(
    initialFeeCategories
  );

  const [filters, setFilters] =
    useState({
      categoryName: "",
      session: "2026",
      studentCategory: "",
      className: "",
      group: "",
    });

  const [appliedFilters, setAppliedFilters] =
    useState(filters);

  const updateFilter =
    (key) => (event) => {
      setFilters((prev) => ({
        ...prev,
        [key]: event.target.value,
      }));
    };

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (
        appliedFilters.categoryName &&
        row.categoryName !==
          appliedFilters.categoryName
      ) {
        return false;
      }

      if (
        appliedFilters.session &&
        row.session !==
          appliedFilters.session
      ) {
        return false;
      }

      if (
        appliedFilters.studentCategory &&
        row.studentCategory !==
          appliedFilters.studentCategory
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

      if (
        appliedFilters.group &&
        row.group !== appliedFilters.group
      ) {
        return false;
      }

      return true;
    });
  }, [rows, appliedFilters]);

  const visibleRows =
    filteredRows.slice(0, 20);

  const removeRow = (id) => {
    if (
      !window.confirm(
        "Delete this fees category?"
      )
    ) {
      return;
    }

    setRows((prev) =>
      prev.filter(
        (row) => row.id !== id
      )
    );
  };

  return (
    <PageRoot>
      <div className="space-y-5">
        <Panel
          title="Create Fees Category"
          action={
            <HeaderButton
              onClick={() =>
                go("fees-category-list")
              }
            >
              Back to Fees category List
            </HeaderButton>
          }
        >
          <div className="mx-auto max-w-6xl space-y-4 p-5">
            <Field label="Fees Category Name:">
              <SelectBox
                value={
                  filters.categoryName
                }
                onChange={updateFilter(
                  "categoryName"
                )}
                placeholder="Select Category Name"
                options={categoryNames}
              />
            </Field>

            <div className="grid gap-4 lg:grid-cols-2">
              <Field label="Session Year:">
                <SelectBox
                  value={filters.session}
                  onChange={updateFilter(
                    "session"
                  )}
                  placeholder="Select Session"
                  options={sessions}
                />
              </Field>

              <Field label="Student Category:">
                <SelectBox
                  value={
                    filters.studentCategory
                  }
                  onChange={updateFilter(
                    "studentCategory"
                  )}
                  placeholder="Select Student Category"
                  options={
                    studentCategories
                  }
                />
              </Field>

              <Field label="Class:">
                <SelectBox
                  value={
                    filters.className
                  }
                  onChange={updateFilter(
                    "className"
                  )}
                  placeholder="Select Class"
                  options={classes}
                />
              </Field>

              <Field label="Groups:">
                <SelectBox
                  value={filters.group}
                  onChange={updateFilter(
                    "group"
                  )}
                  placeholder="Select Groups"
                  options={groups}
                />
              </Field>
            </div>

            <div className="flex gap-1 sm:pl-[190px]">
              <SearchButton
                onClick={() =>
                  setAppliedFilters(
                    filters
                  )
                }
              />

              <button
                type="button"
                onClick={() =>
                  window.print()
                }
                className="btn btn-sm min-h-0 bg-violet-600 text-white hover:bg-violet-700"
              >
                <Printer size={14} />
                Print
              </button>
            </div>
          </div>
        </Panel>

        <Panel
          title="Fees Category List"
          action={
            <HeaderButton
              onClick={() =>
                go("fees-category-create")
              }
            >
              Create Fees category
            </HeaderButton>
          }
        >
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="table table-zebra table-xs min-w-[1350px] border border-base-300">
                <thead>
                  <tr className="bg-base-200">
                    <th>
                      Fees Category Name
                    </th>
                    <th>
                      Student Category Name
                    </th>
                    <th>Session</th>
                    <th>Class</th>
                    <th>Groups</th>
                    <th>Month</th>
                    <th>Amount</th>
                    <th>Fine (%)</th>
                    <th>
                      Admission Fee
                    </th>
                    <th>
                      Fees One Time
                    </th>
                    <th>
                      Created By & Date
                    </th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {visibleRows.map(
                    (row) => (
                      <tr key={row.id}>
                        <td>
                          {
                            row.categoryName
                          }
                        </td>

                        <td>
                          {
                            row.studentCategory
                          }
                        </td>

                        <td>
                          {row.session}
                        </td>

                        <td>
                          {row.className}
                        </td>

                        <td>{row.group}</td>

                        <td>{row.month}</td>

                        <td>
                          {row.amount}
                        </td>

                        <td>{row.fine}</td>

                        <td>
                          {
                            row.admissionFee
                          }
                        </td>

                        <td>
                          {row.oneTime}
                        </td>

                        <td>
                          <div>
                            {
                              row.createdBy
                            }
                          </div>
                          <div>
                            {
                              row.createdDate
                            }
                          </div>
                        </td>

                        <td>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              className="btn btn-info btn-square btn-xs text-white"
                            >
                              <Edit3
                                size={13}
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                removeRow(
                                  row.id
                                )
                              }
                              className="btn btn-error btn-square btn-xs text-white"
                            >
                              <Trash2
                                size={13}
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm font-bold">
              <span>
                Showing 1 to{" "}
                {visibleRows.length} of{" "}
                {Math.max(
                  filteredRows.length,
                  129
                )}{" "}
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
   STUDENT SEARCH FORM
========================================================= */

function StudentFeeSearch({
  title,
  backSlug = "fees-collection-list",
  backLabel = "Back to Student fee List",
}) {
  const { go } = useSiblingNavigation();

  const [filters, setFilters] =
    useState({
      session: "2026",
      shift: "",
      className: "",
      section: "",
      group: "",
      roll: "",
      studentId: "",
    });

  const change =
    (key) => (event) => {
      setFilters((prev) => ({
        ...prev,
        [key]: event.target.value,
      }));
    };

  const handleSearch = () => {
    console.log(
      `${title} search`,
      filters
    );
  };

  return (
    <PageRoot>
      <Panel
        title={title}
        action={
          <HeaderButton
            onClick={() => go(backSlug)}
          >
            {backLabel}
          </HeaderButton>
        }
      >
        <div className="space-y-5 p-5 sm:p-6">
          <RequiredNotice />

          <div className="mx-auto grid max-w-6xl gap-x-8 gap-y-4 lg:grid-cols-2">
            <Field label="Session Year:">
              <SelectBox
                value={filters.session}
                onChange={change("session")}
                placeholder="Select Session"
                options={sessions}
              />
            </Field>

            <Field label="School Shift:">
              <SelectBox
                value={filters.shift}
                onChange={change("shift")}
                placeholder="Select Shift"
                options={shifts}
              />
            </Field>

            <Field label="Class:">
              <SelectBox
                value={
                  filters.className
                }
                onChange={change(
                  "className"
                )}
                placeholder="Select class"
                options={classes}
              />
            </Field>

            <Field label="Section:">
              <SelectBox
                value={filters.section}
                onChange={change(
                  "section"
                )}
                placeholder="Select Section"
                options={sections}
              />
            </Field>

            <Field label="Group:">
              <SelectBox
                value={filters.group}
                onChange={change("group")}
                placeholder="Select Group"
                options={groups}
              />
            </Field>

            <Field label="Roll:">
              <InputBox
                value={filters.roll}
                onChange={change("roll")}
                placeholder="Roll No"
              />
            </Field>

            <Field label="Student ID:">
              <InputBox
                value={
                  filters.studentId
                }
                onChange={change(
                  "studentId"
                )}
                placeholder="Student ID"
              />
            </Field>

            <div />

            <div className="sm:pl-[190px]">
              <SearchButton
                onClick={handleSearch}
              />
            </div>
          </div>
        </div>
      </Panel>
    </PageRoot>
  );
}

/* =========================================================
   STUDENT WAIVER
========================================================= */

export function StudentWaiverPage() {
  return (
    <StudentFeeSearch title="Student Waiver" />
  );
}

/* =========================================================
   MID YEAR FEES REDUCTION
========================================================= */

export function MidYearFeesReductionPage() {
  return (
    <StudentFeeSearch title="Mid Year Fees Reduction" />
  );
}