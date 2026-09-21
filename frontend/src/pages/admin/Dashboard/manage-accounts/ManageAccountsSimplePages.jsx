import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Pencil,
  Trash2,
  Printer,
} from "lucide-react";

/* =========================================================
   SHARED UI
========================================================= */

const BLUE = "bg-[#456db5]";

function PageContainer({ children }) {
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
      <div
        className={`${BLUE} flex min-h-[40px] items-center justify-between gap-3 px-5 py-2 text-white`}
      >
        <h2 className="text-lg font-bold">
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
      className={`input input-bordered input-sm h-8 w-full rounded-[3px] bg-white ${className}`}
    />
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
      className={`select select-bordered select-sm h-8 min-h-8 w-full rounded-[3px] bg-white ${className}`}
    >
      {children}
    </select>
  );
}

function RequiredAlert() {
  return (
    <div className="rounded border border-[#f2d990] bg-[#fff3cd] px-5 py-4 text-sm font-bold text-red-500">
      (*) field required
    </div>
  );
}

function SearchButton({
  children = "Search",
  ...props
}) {
  return (
    <button
      type="button"
      {...props}
      className="btn btn-info btn-sm min-h-0 text-white"
    >
      {children}
    </button>
  );
}

function PrintButton({
  children = "Print",
  ...props
}) {
  return (
    <button
      type="button"
      {...props}
      className="btn btn-success btn-sm min-h-0 text-white"
    >
      {children}
    </button>
  );
}

function PdfButton({
  children = "Download Pdf",
  ...props
}) {
  return (
    <button
      type="button"
      {...props}
      className="btn btn-primary btn-sm min-h-0 bg-violet-700 text-white hover:bg-violet-800"
    >
      {children}
    </button>
  );
}

function FormRow({
  label,
  children,
}) {
  return (
    <div className="grid items-center gap-3 md:grid-cols-[190px_minmax(0,1fr)]">
      <label className="text-sm font-bold">
        {label}
      </label>

      {children}
    </div>
  );
}

/* =========================================================
   1. GENERAL LEDGER
========================================================= */

export function GeneralLedgerPage() {
  const [filters, setFilters] =
    useState({
      accountHead: "",
      fromDate: "2026-09-01",
      toDate: "2026-09-30",
    });

  const ledgerRows = [];

  return (
    <PageContainer>
      <div className="space-y-6">
        <Panel title="General Ledger Search">
          <div className="px-8 py-6">
            <div className="mx-auto grid max-w-6xl gap-x-10 gap-y-4 lg:grid-cols-2">
              <FormRow label="Account Head:">
                <Select
                  value={
                    filters.accountHead
                  }
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      accountHead:
                        e.target.value,
                    }))
                  }
                >
                  <option value="">
                    Select Account Head
                  </option>
                  <option>Cash</option>
                  <option>
                    Student Fees
                  </option>
                  <option>Income</option>
                  <option>Expense</option>
                </Select>
              </FormRow>

              <div />

              <FormRow label="From Date:">
                <Input
                  type="date"
                  value={filters.fromDate}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      fromDate:
                        e.target.value,
                    }))
                  }
                />
              </FormRow>

              <FormRow label="To Date:">
                <Input
                  type="date"
                  value={filters.toDate}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      toDate:
                        e.target.value,
                    }))
                  }
                />
              </FormRow>

              <div className="md:col-start-2 lg:col-start-1">
                <div className="flex gap-1 md:ml-[203px]">
                  <SearchButton />
                  <PrintButton />
                  <PdfButton />
                </div>
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="General Ledger">
          <div className="p-5">
            <div className="overflow-x-auto">
              <table className="table table-xs min-w-[900px] border border-base-300">
                <thead>
                  <tr>
                    {[
                      "#",
                      "Date",
                      "Account Head",
                      "Description",
                      "Debit",
                      "Credit",
                      "Balance",
                      "Created By",
                    ].map((title) => (
                      <th
                        key={title}
                        className="border border-base-300"
                      >
                        {title}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {ledgerRows.length ===
                  0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="border border-base-300 py-8 text-center font-semibold"
                      >
                        No ledger data
                        available.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </Panel>
      </div>
    </PageContainer>
  );
}

/* =========================================================
   2. PAYMENT HISTORY
========================================================= */

export function PaymentHistoryPage() {
  const [filters, setFilters] =
    useState({
      session: "2026",
      teacherId: "",
      fromDate: "2026-09-01",
      toDate: "2026-09-30",
    });

  return (
    <PageContainer>
      <div className="space-y-6">
        <Panel title="Search">
          <div className="px-8 py-6">
            <div className="mx-auto grid max-w-6xl gap-x-8 gap-y-4 lg:grid-cols-2">
              <FormRow label="Session:">
                <Select
                  value={
                    filters.session
                  }
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      session:
                        e.target.value,
                    }))
                  }
                >
                  <option>2026</option>
                  <option>2025</option>
                </Select>
              </FormRow>

              <FormRow label="Teacher's ID:">
                <Input
                  value={
                    filters.teacherId
                  }
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      teacherId:
                        e.target.value,
                    }))
                  }
                  placeholder="Enter Teacher ID"
                />
              </FormRow>

              <FormRow label="From Date:">
                <Input
                  type="date"
                  value={
                    filters.fromDate
                  }
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      fromDate:
                        e.target.value,
                    }))
                  }
                />
              </FormRow>

              <FormRow label="To Date:">
                <Input
                  type="date"
                  value={filters.toDate}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      toDate:
                        e.target.value,
                    }))
                  }
                />
              </FormRow>

              <div className="lg:col-start-1">
                <div className="flex gap-1 md:ml-[203px]">
                  <SearchButton />
                  <PrintButton />
                  <PdfButton>
                    Download Pdf
                  </PdfButton>
                </div>
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="Payment History From 01-09-2026 to 30-09-2026">
          <div className="p-5">
            <div className="overflow-x-auto">
              <table className="table table-xs min-w-[950px] border border-base-300">
                <thead>
                  <tr>
                    <th className="w-10 border border-base-300">
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-xs"
                        />
                        SL
                      </label>
                    </th>
                    <th className="border border-base-300 text-center">
                      Teacher ID
                    </th>
                    <th className="border border-base-300 text-center">
                      Teacher Name
                    </th>
                    <th className="border border-base-300 text-center">
                      Total Invoice
                    </th>
                    <th className="border border-base-300 text-center">
                      Invoice ID
                    </th>
                    <th className="border border-base-300 text-center">
                      Collected Amount
                    </th>
                    <th className="border border-base-300 text-center">
                      Due
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td
                      colSpan={3}
                      className="border border-base-300"
                    />

                    <td className="border border-base-300 text-center font-bold">
                      0
                    </td>

                    <td className="border border-base-300 text-center font-bold">
                      Total
                    </td>

                    <td className="border border-base-300 text-center font-bold">
                      0
                    </td>

                    <td className="border border-base-300 text-center font-bold">
                      0
                    </td>
                  </tr>

                  <tr>
                    <td
                      colSpan={4}
                      className="border border-base-300"
                    />

                    <td className="border border-base-300 text-center font-bold">
                      Total Amount
                    </td>

                    <td className="border border-base-300 text-center font-bold">
                      0
                    </td>

                    <td className="border border-base-300" />
                  </tr>
                </tbody>
              </table>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-sm mt-4 min-h-0 bg-[#456db5] text-white"
            >
              submit
            </button>
          </div>
        </Panel>
      </div>
    </PageContainer>
  );
}

/* =========================================================
   3. BALANCE SHEET DATA
========================================================= */

const initialBalanceRows = [
  {
    id: 1,
    accountHeadName: "Cash",
    accountHeadType: "Asset",
    openingBalance: "0",
    balance: "364000",
    accountHeadDate:
      "17-03-2025",
    createdBy: "Admin",
    createdDate:
      "17-03-2025 16:27:24",
  },
];

export function BalanceSheetDataPage() {
  const [rows, setRows] = useState(
    initialBalanceRows
  );

  const removeRow = (id) => {
    if (
      window.confirm(
        "Delete this account head?"
      )
    ) {
      setRows((prev) =>
        prev.filter(
          (row) => row.id !== id
        )
      );
    }
  };

  return (
    <PageContainer>
      <Panel
        title="Balance Sheet Data"
        action={
          <div className="flex gap-1">
            <button
              type="button"
              className="btn btn-info btn-sm min-h-0 text-white"
            >
              Create Account head
            </button>

            <PrintButton />
          </div>
        }
      >
        <div className="p-5">
          <div className="overflow-x-auto">
            <table className="table table-xs min-w-[1000px] border border-base-300">
              <thead>
                <tr>
                  {[
                    "Account Head Name",
                    "Account Head Type",
                    "Opening Balance",
                    "Balance",
                    "Account Head Date",
                    "Created By",
                    "Created Date",
                    "Action",
                  ].map((header) => (
                    <th
                      key={header}
                      className="border border-base-300"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="bg-[#f1f1f1]"
                  >
                    <td className="border border-base-300">
                      {
                        row.accountHeadName
                      }
                    </td>

                    <td className="border border-base-300">
                      {
                        row.accountHeadType
                      }
                    </td>

                    <td className="border border-base-300">
                      {
                        row.openingBalance
                      }
                    </td>

                    <td className="border border-base-300">
                      {row.balance}
                    </td>

                    <td className="border border-base-300">
                      {
                        row.accountHeadDate
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
                      <div className="flex gap-1">
                        <button
                          type="button"
                          className="btn btn-info btn-square btn-sm h-8 min-h-8 w-8 text-white"
                        >
                          <Pencil
                            size={15}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            removeRow(
                              row.id
                            )
                          }
                          className="btn btn-error btn-square btn-sm h-8 min-h-8 w-8 text-white"
                        >
                          <Trash2
                            size={15}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="border border-base-300 py-8 text-center"
                    >
                      No account head data
                      available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Panel>
    </PageContainer>
  );
}

/* =========================================================
   4. ALL ACCOUNT REPORTS
========================================================= */

const accountReports = [
  "Fees Report",
  "Due Fees Report",
  "Transaction Report",
  "Accounts Report",
  "Balance Sheet",
  "Income Statement",
  "Trail Balance",
  "Fees Collected List",
  "Fees Category Report",
  "Student Payment Details",
];

export function AllAccountReportsPage() {
  const handleReportClick = (
    report
  ) => {
    console.log(
      "Account report selected:",
      report
    );
  };

  return (
    <PageContainer>
      <Panel title="All Account Report">
        <div className="p-5">
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
            {accountReports.map(
              (report, index) => (
                <motion.button
                  key={report}
                  type="button"
                  initial={{
                    opacity: 0,
                    y: 8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay:
                      index * 0.025,
                  }}
                  whileHover={{
                    y: -3,
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                  onClick={() =>
                    handleReportClick(
                      report
                    )
                  }
                  className="flex min-h-[162px] flex-col items-center justify-center gap-3 bg-white px-4 py-6 shadow-[0_8px_18px_rgba(0,0,0,0.12)] transition"
                >
                  <div className="relative">
                    <BarChart3
                      size={52}
                      strokeWidth={1.9}
                      className="text-black"
                    />

                    <div className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-400" />
                    <div className="absolute bottom-1 left-2 h-3 w-1.5 bg-lime-400" />
                    <div className="absolute bottom-1 left-5 h-5 w-1.5 bg-yellow-400" />
                    <div className="absolute bottom-1 left-8 h-4 w-1.5 bg-cyan-400" />
                  </div>

                  <span className="text-center text-sm font-bold">
                    {report}
                  </span>
                </motion.button>
              )
            )}
          </div>
        </div>
      </Panel>
    </PageContainer>
  );
}

/* =========================================================
   5. ACCOUNT SETTINGS
========================================================= */

const teacherOptions = [
  "Select Teacher & Employee",
  "Deen Islam",
  "K M ABDULLAH",
  "Rasel mahmud",
  "MD NAIMUR RAHMAN",
];

function Toggle({
  checked,
  onChange,
}) {
  return (
    <input
      type="checkbox"
      className="toggle toggle-primary toggle-sm"
      checked={checked}
      onChange={onChange}
    />
  );
}

function SettingsPersonRow({
  label,
  value,
  onValueChange,
  selectValue,
  onSelectChange,
  placeholder,
}) {
  return (
    <div className="grid min-h-[68px] items-center gap-3 border-t border-base-300 px-5 py-3 md:grid-cols-[165px_minmax(0,1fr)]">
      <div className="text-sm">
        {label}
      </div>

      <div className="join w-full">
        <Input
          value={value}
          onChange={(e) =>
            onValueChange(
              e.target.value
            )
          }
          placeholder={placeholder}
          className="join-item rounded-r-none"
        />

        <select
          value={selectValue}
          onChange={(e) =>
            onSelectChange(
              e.target.value
            )
          }
          className="select select-bordered select-sm join-item h-8 min-h-8 min-w-[195px] rounded-l-none bg-white"
        >
          {teacherOptions.map(
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
      </div>
    </div>
  );
}

function SettingsBlock({
  title,
  toggleLabel,
  toggleChecked,
  onToggle,
  rows,
  setRows,
}) {
  return (
    <div className="overflow-hidden rounded border border-base-300 bg-white">
      <div
        className={`${BLUE} px-5 py-3 font-bold`}
      >
        {title}
      </div>

      {toggleLabel && (
        <div className="flex min-h-[65px] items-center justify-between px-5 py-3">
          <span className="text-sm">
            {toggleLabel}
          </span>

          <Toggle
            checked={toggleChecked}
            onChange={onToggle}
          />
        </div>
      )}

      {rows.map((row, index) => (
        <SettingsPersonRow
          key={row.id}
          label={`Person ${
            index + 1
          }`}
          value={row.value}
          selectValue={
            row.teacher
          }
          placeholder={
            row.placeholder || ""
          }
          onValueChange={(
            value
          ) =>
            setRows((prev) =>
              prev.map((item) =>
                item.id === row.id
                  ? {
                      ...item,
                      value,
                    }
                  : item
              )
            )
          }
          onSelectChange={(
            teacher
          ) =>
            setRows((prev) =>
              prev.map((item) =>
                item.id === row.id
                  ? {
                      ...item,
                      teacher,
                    }
                  : item
              )
            )
          }
        />
      ))}
    </div>
  );
}

export function AccountSettingsPage() {
  const [incomeAuto, setIncomeAuto] =
    useState(false);

  const [expenseAuto, setExpenseAuto] =
    useState(true);

  const [incomeRows, setIncomeRows] =
    useState([
      {
        id: 1,
        value: "01",
        teacher:
          "Select Teacher & Employee",
      },
      {
        id: 2,
        value: "2",
        teacher:
          "Select Teacher & Employee",
      },
      {
        id: 3,
        value: "3",
        teacher:
          "Select Teacher & Employee",
      },
      {
        id: 4,
        value: "4",
        teacher:
          "Select Teacher & Employee",
      },
    ]);

  const [expenseRows, setExpenseRows] =
    useState([
      {
        id: 1,
        value: "",
        teacher:
          "Select Teacher & Employee",
      },
      {
        id: 2,
        value: "",
        teacher:
          "Select Teacher & Employee",
      },
      {
        id: 3,
        value: "",
        teacher:
          "Select Teacher & Employee",
      },
      {
        id: 4,
        value: "",
        teacher:
          "Select Teacher & Employee",
      },
    ]);

  const [salaryRows, setSalaryRows] =
    useState([
      {
        id: 1,
        value: "Prepared by:",
        teacher:
          "Select Teacher & Employee",
      },
      {
        id: 2,
        value: "Checked by:",
        teacher:
          "Select Teacher & Employee",
      },
      {
        id: 3,
        value: "Approved by:",
        teacher:
          "Select Teacher & Employee",
      },
      {
        id: 4,
        value: "",
        teacher:
          "Select Teacher & Employee",
      },
    ]);

  const submitSettings = () => {
    console.log({
      incomeAuto,
      expenseAuto,
      incomeRows,
      expenseRows,
      salaryRows,
    });
  };

  return (
    <PageContainer>
      <Panel title="Account Settings Update">
        <div className="space-y-4 p-5">
          <RequiredAlert />

          <div className="grid items-start gap-7 xl:grid-cols-2">
            <div className="space-y-4">
              <SettingsBlock
                title="Income"
                toggleLabel="Auto Income Invoice ID:"
                toggleChecked={
                  incomeAuto
                }
                onToggle={() =>
                  setIncomeAuto(
                    (prev) => !prev
                  )
                }
                rows={incomeRows}
                setRows={
                  setIncomeRows
                }
              />

              <SettingsBlock
                title="Salary"
                rows={salaryRows}
                setRows={
                  setSalaryRows
                }
              />
            </div>

            <SettingsBlock
              title="Expense"
              toggleLabel="Auto Expense Invoice ID:"
              toggleChecked={
                expenseAuto
              }
              onToggle={() =>
                setExpenseAuto(
                  (prev) => !prev
                )
              }
              rows={expenseRows}
              setRows={
                setExpenseRows
              }
            />
          </div>

          <div className="pt-3 text-center">
            <button
              type="button"
              onClick={
                submitSettings
              }
              className="btn btn-success btn-sm min-h-0 text-white"
            >
              Submit
            </button>
          </div>
        </div>
      </Panel>
    </PageContainer>
  );
}