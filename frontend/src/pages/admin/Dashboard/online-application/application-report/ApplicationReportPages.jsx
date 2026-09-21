import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useOnlineApplicationBase } from "../onlineApplicationShared.jsx";

/* =========================================================
   MENU
========================================================= */

const applicationReportItems = [
  ["Fees Report", "application-report/fees-report"],
  ["Application Report", "application-report/application-report"],
  ["Amount Collected", "application-report/amount-collected"],
];

/* =========================================================
   CONSTANTS
========================================================= */

const sessions = ["2026", "2025", "2024"];

const shifts = [
  "Morning",
  "Day",
  "Evening",
];

const classSummaryRows = [
  { sl: 1, className: "" },
  { sl: 2, className: "" },
  { sl: 3, className: "" },
  { sl: 4, className: "" },
  { sl: 5, className: "" },
  { sl: 6, className: "" },
  { sl: 7, className: "" },
  { sl: 8, className: "" },
  { sl: 9, className: "" },
  { sl: 10, className: "" },
  { sl: 11, className: "HSC" },
  { sl: 12, className: "SSC" },
  { sl: 13, className: "Inter 2nd year" },
  { sl: 14, className: "Inter 1st year" },
  { sl: 15, className: "Class 10" },
  { sl: 16, className: "Class 09" },
  { sl: 17, className: "demo" },
];

/* =========================================================
   HELPERS
========================================================= */

function formatDisplayDate(date) {
  if (!date) return "";

  const [year, month, day] = date.split("-");

  return `${day}-${month}-${year}`;
}

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
      <div className="flex min-h-[40px] items-center justify-between gap-3 bg-[#456db5] px-4 py-2 text-white">
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
  children,
}) {
  return (
    <div className="grid items-center gap-3 sm:grid-cols-[185px_minmax(0,1fr)]">
      <label className="text-sm font-bold text-black">
        {label}
      </label>

      {children}
    </div>
  );
}

function FormGrid({
  children,
  maxWidth = "max-w-[1180px]",
}) {
  return (
    <div
      className={`mx-auto grid ${maxWidth} gap-x-7 gap-y-5 lg:grid-cols-2`}
    >
      {children}
    </div>
  );
}

function ButtonOffset({ children }) {
  return (
    <div className="lg:col-start-1">
      <div className="flex flex-wrap gap-1 sm:ml-[198px]">
        {children}
      </div>
    </div>
  );
}

function SearchButton({
  children = "Search",
  onClick,
}) {
  return (
    <motion.button
      whileTap={{
        scale: 0.96,
      }}
      type="button"
      onClick={onClick}
      className="btn btn-info btn-sm min-h-0 text-white"
    >
      {children}
    </motion.button>
  );
}

function PrintButton() {
  return (
    <button
      type="button"
      onClick={() =>
        window.print()
      }
      className="btn btn-success btn-sm min-h-0 text-white"
    >
      Print
    </button>
  );
}

function PdfButton({
  children = "Download Pdf",
}) {
  return (
    <button
      type="button"
      onClick={() =>
        window.alert(
          "PDF download demo"
        )
      }
      className="btn btn-sm min-h-0 border-violet-700 bg-violet-700 text-white hover:bg-violet-800"
    >
      {children}
    </button>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

export function ApplicationReportDashboard() {
  const base =
    useOnlineApplicationBase();

  return (
    <PageRoot>
      <Panel title="Application Report">
        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
          {applicationReportItems.map(
            ([label, slug]) => (
              <Link
                key={slug}
                to={`${base}/${slug}`}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-500 hover:shadow-md"
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
   1. FEES REPORT
========================================================= */

export function FeesReportPage() {
  const [form, setForm] =
    useState({
      fromDate: "2026-09-01",
      toDate: "2026-09-30",
      teacherId: "",
    });

  const [searchDates, setSearchDates] =
    useState({
      fromDate: "2026-09-01",
      toDate: "2026-09-30",
    });

  const [selected, setSelected] =
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

  const handleSearch = () => {
    setSearchDates({
      fromDate: form.fromDate,
      toDate: form.toDate,
    });
  };

  return (
    <PageRoot>
      <div className="space-y-6">
        {/* SEARCH */}
        <Panel title="Search">
          <div className="px-5 py-5">
            <FormGrid>
              <Field label="From Date:">
                <Input
                  type="date"
                  value={
                    form.fromDate
                  }
                  onChange={(e) =>
                    update(
                      "fromDate",
                      e.target.value
                    )
                  }
                />
              </Field>

              <Field label="To Date:">
                <Input
                  type="date"
                  value={
                    form.toDate
                  }
                  onChange={(e) =>
                    update(
                      "toDate",
                      e.target.value
                    )
                  }
                />
              </Field>

              <Field label="Teacher's ID:">
                <Input
                  value={
                    form.teacherId
                  }
                  onChange={(e) =>
                    update(
                      "teacherId",
                      e.target.value
                    )
                  }
                  placeholder="Enter Teacher ID"
                />
              </Field>

              <div />

              <ButtonOffset>
                <SearchButton
                  onClick={
                    handleSearch
                  }
                />

                <PrintButton />

                <PdfButton>
                  Download Pdf
                </PdfButton>
              </ButtonOffset>
            </FormGrid>

            <div className="min-h-[15px]" />
          </div>
        </Panel>

        {/* REPORT */}
        <Panel
          title={`Fees Report History From ${formatDisplayDate(
            searchDates.fromDate
          )} to ${formatDisplayDate(
            searchDates.toDate
          )}`}
        >
          <div className="p-5">
            <div className="overflow-x-auto">
              <table className="table table-xs min-w-[900px] border border-base-300">
                <thead className="text-black">
                  <tr>
                    <th className="w-[45px] border border-base-300 text-center">
                      <label className="flex items-center justify-center gap-1">
                        <input
                          type="checkbox"
                          checked={
                            selected
                          }
                          onChange={(e) =>
                            setSelected(
                              e.target
                                .checked
                            )
                          }
                          className="checkbox checkbox-xs"
                        />

                        SL
                      </label>
                    </th>

                    <th className="border border-base-300 text-center">
                      Paid To
                    </th>

                    <th className="border border-base-300 text-center">
                      Total ID
                    </th>

                    <th className="border border-base-300 text-center">
                      Collected ID
                    </th>

                    <th className="border border-base-300 text-center">
                      Total
                    </th>

                    <th className="border border-base-300 text-center">
                      Due ID
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td
                      colSpan={2}
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
                  </tr>
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={() =>
                window.alert(
                  "Fees report submitted."
                )
              }
              className="btn btn-primary btn-sm mt-4 min-h-0 bg-[#456db5] text-white"
            >
              submit
            </button>
          </div>
        </Panel>
      </div>
    </PageRoot>
  );
}

/* =========================================================
   2. APPLICATION REPORT
========================================================= */

export function ApplicationReportPage() {
  const [session, setSession] =
    useState("2025");

  const [shift, setShift] =
    useState("");

  const [searched, setSearched] =
    useState(false);

  return (
    <PageRoot>
      <div className="space-y-6">
        {/* SEARCH */}
        <Panel title="Application Summary Report Search">
          <div className="px-5 py-5">
            <FormGrid>
              <Field label="Session Year:">
                <Select
                  value={session}
                  onChange={(e) =>
                    setSession(
                      e.target.value
                    )
                  }
                >
                  {sessions.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </Select>
              </Field>

              <Field label="School Shift:">
                <Select
                  value={shift}
                  onChange={(e) =>
                    setShift(
                      e.target.value
                    )
                  }
                  className="bg-[#f5f5f5] text-slate-400"
                >
                  <option value="">
                    Nothing selected
                  </option>

                  {shifts.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </Select>
              </Field>

              <ButtonOffset>
                <SearchButton
                  onClick={() =>
                    setSearched(true)
                  }
                />

                <PrintButton />

                <PdfButton>
                  Download PDF
                </PdfButton>
              </ButtonOffset>
            </FormGrid>

            <div className="min-h-[20px]" />
          </div>
        </Panel>

        {/* CLASS SUMMARY */}
        <Panel title="Class Wise Application List">
          <div className="overflow-x-auto p-5">
            <table className="table table-xs min-w-[1150px] border border-base-300">
              <thead className="text-black">
                <tr>
                  <th className="w-[70px] border border-base-300">
                    #
                  </th>

                  <th className="border border-base-300 text-center">
                    Class
                  </th>

                  <th className="border border-base-300 text-center">
                    Total Student
                  </th>

                  <th className="border border-base-300 text-center">
                    Male
                  </th>

                  <th className="border border-base-300 text-center">
                    Female
                  </th>

                  <th className="border border-base-300 text-center">
                    Islam
                  </th>

                  <th className="border border-base-300 text-center">
                    Hinduism
                  </th>

                  <th className="border border-base-300 text-center">
                    Buddhism
                  </th>

                  <th className="border border-base-300 text-center">
                    Christian
                  </th>
                </tr>
              </thead>

              <tbody>
                {classSummaryRows.map(
                  (row) => (
                    <tr key={row.sl}>
                      <td className="border border-base-300 text-center">
                        {row.sl}
                      </td>

                      <td className="border border-base-300 text-center">
                        {
                          row.className
                        }
                      </td>

                      <td className="border border-base-300 text-center">
                        0
                      </td>

                      <td className="border border-base-300 text-center">
                        0
                      </td>

                      <td className="border border-base-300 text-center">
                        0
                      </td>

                      <td className="border border-base-300 text-center">
                        0
                      </td>

                      <td className="border border-base-300 text-center">
                        0
                      </td>

                      <td className="border border-base-300 text-center">
                        0
                      </td>

                      <td className="border border-base-300 text-center">
                        0
                      </td>
                    </tr>
                  )
                )}

                <tr className="font-medium">
                  <td className="border border-base-300" />

                  <td className="border border-base-300 text-center">
                    Total
                  </td>

                  <td className="border border-base-300 text-center">
                    0
                  </td>

                  <td className="border border-base-300 text-center">
                    0
                  </td>

                  <td className="border border-base-300 text-center">
                    0
                  </td>

                  <td className="border border-base-300 text-center">
                    0
                  </td>

                  <td className="border border-base-300 text-center">
                    0
                  </td>

                  <td className="border border-base-300 text-center">
                    0
                  </td>

                  <td className="border border-base-300 text-center">
                    0
                  </td>
                </tr>
              </tbody>
            </table>

            {searched && (
              <p className="mt-3 text-xs text-slate-400">
                Report generated for
                session {session}
                {shift
                  ? `, ${shift} shift`
                  : ""}
                .
              </p>
            )}
          </div>
        </Panel>
      </div>
    </PageRoot>
  );
}

/* =========================================================
   3. AMOUNT COLLECTED
========================================================= */

export function AmountCollectedPage() {
  const [form, setForm] =
    useState({
      fromDate: "2026-09-01",
      toDate: "2026-09-30",
    });

  const [searchDates, setSearchDates] =
    useState({
      fromDate: "2026-09-01",
      toDate: "2026-09-30",
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

  const handleSearch = () => {
    setSearchDates({
      fromDate: form.fromDate,
      toDate: form.toDate,
    });
  };

  return (
    <PageRoot>
      <div className="space-y-6">
        {/* SEARCH */}
        <Panel title="Form Fees Collection List Search">
          <div className="px-5 py-5">
            <FormGrid>
              <Field label="From Date:">
                <Input
                  type="date"
                  value={
                    form.fromDate
                  }
                  onChange={(e) =>
                    update(
                      "fromDate",
                      e.target.value
                    )
                  }
                />
              </Field>

              <Field label="To Date:">
                <Input
                  type="date"
                  value={
                    form.toDate
                  }
                  onChange={(e) =>
                    update(
                      "toDate",
                      e.target.value
                    )
                  }
                />
              </Field>

              <ButtonOffset>
                <SearchButton
                  onClick={
                    handleSearch
                  }
                />

                <PrintButton />

                <PdfButton>
                  Download Pdf
                </PdfButton>
              </ButtonOffset>
            </FormGrid>

            <div className="min-h-[15px]" />
          </div>
        </Panel>

        {/* COLLECTION LIST */}
        <Panel
          title={`Form Fees Collection From ${formatDisplayDate(
            searchDates.fromDate
          )} to ${formatDisplayDate(
            searchDates.toDate
          )}`}
        >
          <div className="p-5">
            <div className="overflow-x-auto">
              <table className="table table-xs min-w-[800px] border border-base-300">
                <thead className="text-black">
                  <tr>
                    <th className="w-[110px] border border-base-300 text-center">
                      SL
                    </th>

                    <th className="border border-base-300 text-center">
                      Paid To
                    </th>

                    <th className="border border-base-300 text-center">
                      Collected ID
                    </th>

                    <th className="w-[275px] border border-base-300 text-center">
                      Amount
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td
                      colSpan={2}
                      className="border border-base-300"
                    />

                    <td className="border border-base-300 text-center font-bold">
                      Total Amount
                    </td>

                    <td className="border border-base-300 text-center font-bold">
                      0
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Panel>
      </div>
    </PageRoot>
  );
}