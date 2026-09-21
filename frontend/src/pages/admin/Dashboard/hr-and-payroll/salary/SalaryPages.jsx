import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { Pencil, Printer, Trash2 } from "lucide-react";

const BLUE = "#456db5";

const designations = [
  "TEACHER",
  "Assistant Teacher",
  "Co Teacher",
  "Assistant Teacher Quran",
  "Vice Principal",
  "Principal",
  "Lecturer",
  "Office Assistant",
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

const demoSalaryRows = [
  {
    id: 1,
    employeeName: "",
    employeeId: "",
    designation: "TEACHER",
    paidAmount: 10000,
    dues: 0,
    salaryMonth: "Jan, 2024",
    salaryDate: "2025-02-11",
    createdAt: "2025-02-11 10:45:51",
  },
  {
    id: 2,
    employeeName: "",
    employeeId: "",
    designation: "Assistant Teacher",
    paidAmount: 5250,
    dues: 0,
    salaryMonth: "Feb, 2025",
    salaryDate: "2025-02-11",
    createdAt: "2025-02-11 10:31:05",
  },
  {
    id: 3,
    employeeName: "",
    employeeId: "",
    designation: "Assistant Teacher",
    paidAmount: 0,
    dues: 0,
    salaryMonth: "Feb, 2025",
    salaryDate: "2025-02-11",
    createdAt: "2025-02-11 10:31:05",
  },
  {
    id: 4,
    employeeName: "",
    employeeId: "",
    designation: "Assistant Teacher",
    paidAmount: 0,
    dues: 0,
    salaryMonth: "Feb, 2025",
    salaryDate: "2025-02-11",
    createdAt: "2025-02-11 10:31:05",
  },
  {
    id: 5,
    employeeName: "",
    employeeId: "",
    designation: "Assistant Teacher",
    paidAmount: 0,
    dues: 0,
    salaryMonth: "Feb, 2025",
    salaryDate: "2025-02-11",
    createdAt: "2025-02-11 10:31:05",
  },
  {
    id: 6,
    employeeName: "",
    employeeId: "",
    designation: "Co Teacher",
    paidAmount: 0,
    dues: 0,
    salaryMonth: "Feb, 2025",
    salaryDate: "2025-02-11",
    createdAt: "2025-02-11 10:31:05",
  },
  {
    id: 7,
    employeeName: "",
    employeeId: "",
    designation: "Assistant Teacher",
    paidAmount: 10500,
    dues: 0,
    salaryMonth: "Feb, 2025",
    salaryDate: "2025-02-11",
    createdAt: "2025-02-11 10:31:05",
  },
  {
    id: 8,
    employeeName: "",
    employeeId: "",
    designation: "Assistant Teacher",
    paidAmount: 0,
    dues: 0,
    salaryMonth: "Feb, 2025",
    salaryDate: "2025-02-11",
    createdAt: "2025-02-11 10:31:05",
  },
  {
    id: 9,
    employeeName: "",
    employeeId: "",
    designation: "Assistant Teacher",
    paidAmount: 0,
    dues: 0,
    salaryMonth: "Feb, 2025",
    salaryDate: "2025-02-11",
    createdAt: "2025-02-11 10:31:05",
  },
  {
    id: 10,
    employeeName: "",
    employeeId: "",
    designation: "Assistant Teacher",
    paidAmount: 0,
    dues: 0,
    salaryMonth: "Feb, 2025",
    salaryDate: "2025-02-11",
    createdAt: "2025-02-11 10:31:05",
  },
  {
    id: 11,
    employeeName: "",
    employeeId: "",
    designation: "Assistant Teacher",
    paidAmount: 0,
    dues: 0,
    salaryMonth: "Feb, 2025",
    salaryDate: "2025-02-11",
    createdAt: "2025-02-11 10:31:05",
  },
  {
    id: 12,
    employeeName: "",
    employeeId: "",
    designation: "Assistant Teacher",
    paidAmount: 15750,
    dues: 0,
    salaryMonth: "Feb, 2025",
    salaryDate: "2025-02-11",
    createdAt: "2025-02-11 10:31:05",
  },
  {
    id: 13,
    employeeName: "",
    employeeId: "",
    designation: "Assistant Teacher",
    paidAmount: 0,
    dues: 0,
    salaryMonth: "Feb, 2025",
    salaryDate: "2025-02-11",
    createdAt: "2025-02-11 10:31:05",
  },
  {
    id: 14,
    employeeName: "",
    employeeId: "",
    designation: "Assistant Teacher Quran",
    paidAmount: 0,
    dues: 0,
    salaryMonth: "Feb, 2025",
    salaryDate: "2025-02-11",
    createdAt: "2025-02-11 10:31:05",
  },
  {
    id: 15,
    employeeName: "",
    employeeId: "",
    designation: "Vice Principal",
    paidAmount: 7500,
    dues: 0,
    salaryMonth: "Feb, 2025",
    salaryDate: "2025-02-25",
    createdAt: "2025-02-25 12:58:25",
  },
  {
    id: 16,
    employeeName: "",
    employeeId: "",
    designation: "Assistant Teacher",
    paidAmount: 0,
    dues: 0,
    salaryMonth: "Feb, 2025",
    salaryDate: "2025-02-25",
    createdAt: "2025-02-25 12:58:25",
  },
  {
    id: 17,
    employeeName: "",
    employeeId: "",
    designation: "Assistant Teacher",
    paidAmount: 0,
    dues: 0,
    salaryMonth: "Feb, 2025",
    salaryDate: "2025-02-25",
    createdAt: "2025-02-25 12:58:25",
  },
  {
    id: 18,
    employeeName: "",
    employeeId: "",
    designation: "Assistant Teacher",
    paidAmount: 0,
    dues: 0,
    salaryMonth: "Feb, 2025",
    salaryDate: "2025-02-25",
    createdAt: "2025-02-25 12:58:25",
  },
  {
    id: 19,
    employeeName: "",
    employeeId: "",
    designation: "Assistant Teacher",
    paidAmount: 0,
    dues: 0,
    salaryMonth: "Feb, 2025",
    salaryDate: "2025-02-25",
    createdAt: "2025-02-25 12:58:26",
  },
  {
    id: 20,
    employeeName: "",
    employeeId: "",
    designation: "Co Teacher",
    paidAmount: 0,
    dues: 0,
    salaryMonth: "Feb, 2025",
    salaryDate: "2025-02-25",
    createdAt: "2025-02-25 12:58:26",
  },
];

function useSiblingNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const go = (slug) => {
    navigate(location.pathname.replace(/\/[^/]+\/?$/, `/${slug}`));
  };

  return { go };
}

function PageRoot({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="min-h-[calc(100vh-70px)] bg-[#f4f5f6] p-2 sm:p-3"
    >
      {children}
    </motion.div>
  );
}

function Panel({ title, action, children, className = "" }) {
  return (
    <section
      className={`overflow-hidden rounded-[3px] bg-white shadow-sm ${className}`}
    >
      <div
        className="flex min-h-10 items-center justify-between px-4 py-2"
        style={{ backgroundColor: BLUE }}
      >
        <h2 className="text-[15px] font-bold text-white sm:text-[18px]">
          {title}
        </h2>

        {action}
      </div>

      {children}
    </section>
  );
}

function Field({ label, children }) {
  return (
    <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[190px_1fr]">
      <label className="text-[12px] font-medium text-slate-900">{label}</label>
      {children}
    </div>
  );
}

function SelectBox({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="h-[31px] w-full rounded-[3px] border border-slate-300 bg-white px-3 text-[12px] text-slate-700 outline-none transition focus:border-sky-500"
    >
      {children}
    </select>
  );
}

function SearchButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-[3px] bg-[#1ca4b9] px-3 py-[7px] text-[12px] font-medium text-white shadow-sm transition hover:bg-[#168da0]"
    >
      Search
    </button>
  );
}

function PrintButton({ children, type = "green", onClick }) {
  const styles =
    type === "blue"
      ? "bg-[#4668ad] hover:bg-[#385691]"
      : "bg-[#27ae45] hover:bg-[#208f39]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[3px] px-3 py-[7px] text-[12px] font-medium text-white transition ${styles}`}
    >
      {children}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*                               SALARY CREATE                                */
/* -------------------------------------------------------------------------- */

export function SalaryCreatePage() {
  const [designation, setDesignation] = useState("");
  const [month, setMonth] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    setSearched(true);
  };

  return (
    <PageRoot>
      <Panel title="Salary Create">
        <div className="px-4 py-5 sm:px-10 lg:px-40">
          <div className="grid gap-x-8 gap-y-4 lg:grid-cols-2">
            <Field label="Designation:">
              <SelectBox
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
              >
                <option value="">Select Designation</option>
                {designations.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </SelectBox>
            </Field>

            <Field label="Month:">
              <SelectBox
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              >
                <option value="">Select Month</option>
                {months.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </SelectBox>
            </Field>
          </div>

          <div className="mt-4 sm:ml-[190px]">
            <SearchButton onClick={handleSearch} />
          </div>

          {searched && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-5 overflow-hidden"
            >
              <div className="rounded border border-slate-200 bg-slate-50 px-4 py-3 text-[12px] text-slate-600">
                {designation || month
                  ? `Search completed${
                      designation ? ` for ${designation}` : ""
                    }${month ? ` — ${month}` : ""}.`
                  : "Please select a designation or month to search."}
              </div>
            </motion.div>
          )}
        </div>
      </Panel>
    </PageRoot>
  );
}

/* -------------------------------------------------------------------------- */
/*                                SALARY LIST                                 */
/* -------------------------------------------------------------------------- */

export function SalaryListPage() {
  const { go } = useSiblingNavigation();

  const [designation, setDesignation] = useState("");
  const [month, setMonth] = useState("");
  const [activeDesignation, setActiveDesignation] = useState("");
  const [activeMonth, setActiveMonth] = useState("");
  const [rows, setRows] = useState(demoSalaryRows);
  const [page, setPage] = useState(1);

  const perPage = 20;

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const designationMatch =
        !activeDesignation || row.designation === activeDesignation;

      const monthMatch =
        !activeMonth ||
        row.salaryMonth.toLowerCase().startsWith(activeMonth.toLowerCase());

      return designationMatch && monthMatch;
    });
  }, [rows, activeDesignation, activeMonth]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / perPage));

  const visibleRows = filteredRows.slice(
    (page - 1) * perPage,
    page * perPage
  );

  const handleSearch = () => {
    setActiveDesignation(designation);
    setActiveMonth(month);
    setPage(1);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this salary record?")) {
      return;
    }

    setRows((current) => current.filter((row) => row.id !== id));
  };

  const handlePrint = () => {
    window.print();
  };

  const from = filteredRows.length === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, filteredRows.length);

  return (
    <PageRoot>
      <Panel title="Employee Salary Search">
        <div className="px-4 py-4 sm:px-10 lg:px-60">
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Designation:">
              <SelectBox
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
              >
                <option value="">Select Designation</option>
                {designations.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </SelectBox>
            </Field>

            <Field label="Month:">
              <SelectBox
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              >
                <option value="">Select Month</option>
                {months.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </SelectBox>
            </Field>
          </div>

          <div className="mt-4 flex flex-wrap gap-1 sm:ml-[190px]">
            <SearchButton onClick={handleSearch} />

            <PrintButton onClick={handlePrint}>
              Print Pay Slip
            </PrintButton>

            <PrintButton type="blue" onClick={handlePrint}>
              Print Summary
            </PrintButton>
          </div>
        </div>
      </Panel>

      <Panel
        title="Employee Salary List"
        className="mt-6"
        action={
          <button
            type="button"
            onClick={() => go("salary-create")}
            className="rounded-[3px] bg-[#1ca4b9] px-3 py-[6px] text-[11px] font-medium text-white transition hover:bg-[#178da0]"
          >
            Create Salary
          </button>
        }
      >
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse text-[11px] text-slate-900">
              <thead>
                <tr className="bg-[#f1f1f1]">
                  {[
                    "Employee Name",
                    "Employee ID",
                    "Degisnation",
                    "Paid Amount",
                    "Dues",
                    "Salary Month",
                    "Salary Date",
                    "Created By & Date",
                    "Action",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="border border-slate-300 px-2 py-2 text-left font-bold"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {visibleRows.map((row, index) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.01 }}
                    className={
                      index % 2 === 0 ? "bg-[#eeeeee]" : "bg-white"
                    }
                  >
                    <td className="border border-slate-300 px-2 py-2">
                      {row.employeeName}
                    </td>

                    <td className="border border-slate-300 px-2 py-2">
                      {row.employeeId}
                    </td>

                    <td className="border border-slate-300 px-2 py-2">
                      {row.designation}
                    </td>

                    <td className="border border-slate-300 px-2 py-2">
                      {row.paidAmount.toFixed(2)}
                    </td>

                    <td className="border border-slate-300 px-2 py-2">
                      {row.dues.toFixed(2)}
                    </td>

                    <td className="border border-slate-300 px-2 py-2">
                      {row.salaryMonth}
                    </td>

                    <td className="border border-slate-300 px-2 py-2">
                      {row.salaryDate}
                    </td>

                    <td className="border border-slate-300 px-2 py-2">
                      {row.createdAt}
                    </td>

                    <td className="border border-slate-300 px-1 py-1">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          title="Print"
                          onClick={handlePrint}
                          className="flex h-7 w-7 items-center justify-center rounded-[3px] bg-[#65767d] text-white transition hover:bg-[#526168]"
                        >
                          <Printer size={14} />
                        </button>

                        <button
                          type="button"
                          title="Edit Salary"
                          onClick={() =>
                            window.alert(
                              `Edit salary record #${row.id}`
                            )
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-[3px] bg-[#1ca4b9] text-white transition hover:bg-[#168da0]"
                        >
                          <Pencil size={14} />
                        </button>

                        <button
                          type="button"
                          title="Edit Payment"
                          onClick={() =>
                            window.alert(
                              `Edit salary payment #${row.id}`
                            )
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-[3px] bg-[#1ca4b9] text-white transition hover:bg-[#168da0]"
                        >
                          <Pencil size={14} />
                        </button>

                        <button
                          type="button"
                          title="Delete"
                          onClick={() => handleDelete(row.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-[3px] bg-[#e63946] text-white transition hover:bg-[#cb2f3b]"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}

                {visibleRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="border border-slate-300 px-4 py-8 text-center text-sm text-slate-500"
                    >
                      No salary records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] font-bold text-black">
              Showing {from} to {to} of{" "}
              {activeDesignation || activeMonth
                ? filteredRows.length
                : 41}{" "}
              results.
            </p>

            <div className="flex overflow-hidden rounded-[3px] border border-slate-300">
              {Array.from(
                {
                  length:
                    activeDesignation || activeMonth
                      ? totalPages
                      : 3,
                },
                (_, index) => index + 1
              ).map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() =>
                    setPage(
                      Math.min(
                        pageNumber,
                        totalPages
                      )
                    )
                  }
                  className={`h-7 min-w-7 border-r border-slate-300 px-2 text-[11px] ${
                    page === pageNumber
                      ? "bg-[#456db5] font-bold text-white"
                      : "bg-white text-[#456db5] hover:bg-slate-100"
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                type="button"
                onClick={() =>
                  setPage((current) =>
                    Math.min(current + 1, totalPages)
                  )
                }
                className="h-7 min-w-7 bg-white px-2 text-[11px] text-[#456db5] hover:bg-slate-100"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </Panel>
    </PageRoot>
  );
}