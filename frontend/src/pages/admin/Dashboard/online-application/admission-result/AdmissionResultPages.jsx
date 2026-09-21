import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useOnlineApplicationBase } from "../onlineApplicationShared.jsx";

/* =========================================================
   MENU
========================================================= */

const admissionResultItems = [
  ["Result Process", "admission-result/result-process"],
  ["Tabulation Sheet", "admission-result/tabulation-sheet"],
  ["Promoted List", "admission-result/promoted-list"],
  ["Subject Wise Result", "admission-result/subject-wise-result"],
];

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
      <div className="flex min-h-[42px] items-center justify-between gap-3 bg-[#456db5] px-4 py-2 text-white">
        <h2 className="text-sm font-bold sm:text-lg">
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
      <label className="text-sm font-medium text-black">
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

function SearchButton({
  children = "Search",
  onClick,
  color = "cyan",
}) {
  let buttonClass =
    "border-cyan-600 bg-cyan-600 hover:border-cyan-700 hover:bg-cyan-700";

  if (color === "green") {
    buttonClass =
      "border-green-600 bg-green-600 hover:border-green-700 hover:bg-green-700";
  }

  if (color === "purple") {
    buttonClass =
      "border-violet-700 bg-violet-700 hover:border-violet-800 hover:bg-violet-800";
  }

  return (
    <motion.button
      whileTap={{
        scale: 0.96,
      }}
      type="button"
      onClick={onClick}
      className={`btn btn-sm min-h-0 text-white ${buttonClass}`}
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
  children = "Create PDF",
}) {
  return (
    <button
      type="button"
      className="btn btn-sm min-h-0 border-violet-700 bg-violet-700 text-white hover:bg-violet-800"
    >
      {children}
    </button>
  );
}

function ExcelButton() {
  return (
    <button
      type="button"
      className="btn btn-sm min-h-0 border-violet-700 bg-violet-700 text-white hover:bg-violet-800"
    >
      Download Excel
    </button>
  );
}

function ButtonOffset({
  children,
}) {
  return (
    <div className="lg:col-start-1">
      <div className="flex flex-wrap gap-1 sm:ml-[198px]">
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
  disabled = false,
}) {
  return (
    <Select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={
        disabled
          ? "bg-[#f5f5f5] text-slate-400"
          : ""
      }
    >
      <option value="">
        {disabled
          ? "Nothing selected"
          : "Select Shift"}
      </option>

      {shifts.map(
        (shift) => (
          <option
            key={shift}
            value={shift}
          >
            {shift}
          </option>
        )
      )}
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

function EmptyResultArea() {
  return (
    <div className="min-h-[20px]" />
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

export function AdmissionResultDashboard() {
  const base =
    useOnlineApplicationBase();

  return (
    <PageRoot>
      <Panel title="Admission Result">
        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
          {admissionResultItems.map(
            ([label, slug]) => (
              <Link
                key={slug}
                to={`${base}/${slug}`}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-500 hover:shadow-md"
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
   1. RESULT PROCESS
========================================================= */

export function ResultProcessPage() {
  const [session, setSession] =
    useState("2025");

  const [processed, setProcessed] =
    useState(false);

  const handleSearch = () => {
    setProcessed(true);
  };

  return (
    <PageRoot>
      <Panel title="Exam Result Process">
        <div className="px-5 py-5">
          <div className="mx-auto max-w-[900px]">
            <div className="grid items-center gap-4 sm:grid-cols-[180px_minmax(0,365px)]">
              <label className="text-sm font-medium text-black">
                Session Year:
              </label>

              <SessionSelect
                value={session}
                onChange={(e) =>
                  setSession(
                    e.target.value
                  )
                }
              />
            </div>

            <div className="mt-5 sm:ml-[258px]">
              <SearchButton
                color="green"
                onClick={handleSearch}
              />
            </div>

            {processed && (
              <motion.div
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                className="mt-5 max-w-[545px] rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
              >
                Result process initialized
                for session {session}.
              </motion.div>
            )}

            <div className="min-h-[20px]" />
          </div>
        </div>
      </Panel>
    </PageRoot>
  );
}

/* =========================================================
   2. TABULATION SHEET
========================================================= */

export function TabulationSheetPage() {
  const [form, setForm] =
    useState({
      session: "2025",
      shift: "",
      className: "",
      design:
        "Total, Result, Place",
      order:
        "Place (Ascending)",
      paper: "Legal",
      orientation:
        "Landscape",
      font: "Font Stanc",
      zoom: "100% Zoo",
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
      <div className="space-y-6">
        <Panel title="Search Result">
          <div className="px-5 py-5">
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

              <Field label="Design:">
                <Select
                  value={
                    form.design
                  }
                  onChange={(e) =>
                    update(
                      "design",
                      e.target.value
                    )
                  }
                >
                  <option>
                    Total, Result, Place
                  </option>

                  <option>
                    Total & Result
                  </option>

                  <option>
                    Result Only
                  </option>

                  <option>
                    Place Only
                  </option>
                </Select>
              </Field>

              <Field label="Print Properties:">
                <div className="grid grid-cols-2 md:grid-cols-4">
                  <Select
                    value={
                      form.paper
                    }
                    onChange={(e) =>
                      update(
                        "paper",
                        e.target.value
                      )
                    }
                    className="rounded-r-none"
                  >
                    <option>
                      Legal
                    </option>
                    <option>
                      A4
                    </option>
                    <option>
                      Letter
                    </option>
                  </Select>

                  <Select
                    value={
                      form.orientation
                    }
                    onChange={(e) =>
                      update(
                        "orientation",
                        e.target.value
                      )
                    }
                    className="rounded-none border-l-0"
                  >
                    <option>
                      Landscape
                    </option>

                    <option>
                      Portrait
                    </option>
                  </Select>

                  <Select
                    value={form.font}
                    onChange={(e) =>
                      update(
                        "font",
                        e.target.value
                      )
                    }
                    className="rounded-none border-l-0"
                  >
                    <option>
                      Font Stanc
                    </option>

                    <option>
                      Small
                    </option>

                    <option>
                      Medium
                    </option>

                    <option>
                      Large
                    </option>
                  </Select>

                  <Select
                    value={form.zoom}
                    onChange={(e) =>
                      update(
                        "zoom",
                        e.target.value
                      )
                    }
                    className="rounded-l-none border-l-0"
                  >
                    <option>
                      100% Zoo
                    </option>

                    <option>
                      90%
                    </option>

                    <option>
                      80%
                    </option>
                  </Select>
                </div>
              </Field>

              <Field label="In order of:">
                <Select
                  value={
                    form.order
                  }
                  onChange={(e) =>
                    update(
                      "order",
                      e.target.value
                    )
                  }
                >
                  <option>
                    Place (Ascending)
                  </option>

                  <option>
                    Place (Descending)
                  </option>

                  <option>
                    Roll (Ascending)
                  </option>

                  <option>
                    Name (Ascending)
                  </option>
                </Select>
              </Field>

              <ButtonOffset>
                <SearchButton
                  onClick={() =>
                    setSearched(true)
                  }
                />

                <PrintButton />

                <PdfButton />

                <ExcelButton />
              </ButtonOffset>
            </FormGrid>

            <div className="min-h-[15px]" />
          </div>
        </Panel>

        <Panel title="Students Marks Detail Tabulation Sheet">
          {searched ? (
            <div className="p-5">
              <div className="overflow-x-auto">
                <table className="table table-xs min-w-[900px] border border-base-300">
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
                        Class
                      </th>

                      <th className="border border-base-300">
                        Total
                      </th>

                      <th className="border border-base-300">
                        Result
                      </th>

                      <th className="border border-base-300">
                        Place
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      <td
                        colSpan={7}
                        className="border border-base-300 py-8 text-center text-slate-400"
                      >
                        No tabulation data
                        available.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <EmptyResultArea />
          )}
        </Panel>
      </div>
    </PageRoot>
  );
}

/* =========================================================
   3. PROMOTED LIST
========================================================= */

export function PromotedListPage() {
  const [type, setType] =
    useState("session");

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
      <div className="space-y-6">
        <Panel title="Promoted List Search">
          <div className="px-5 py-6">
            <FormGrid>
              <div className="sm:ml-[185px]">
                <label className="flex cursor-pointer items-center gap-1 text-sm text-black">
                  <input
                    type="radio"
                    name="promoted-list-type"
                    value="session"
                    checked={
                      type ===
                      "session"
                    }
                    onChange={() =>
                      setType(
                        "session"
                      )
                    }
                    className="radio radio-primary radio-xs"
                  />

                  Session Wise Promoted
                  List
                </label>
              </div>

              <div>
                <label className="flex cursor-pointer items-center gap-1 text-sm text-black">
                  <input
                    type="radio"
                    name="promoted-list-type"
                    value="class"
                    checked={
                      type === "class"
                    }
                    onChange={() =>
                      setType("class")
                    }
                    className="radio radio-primary radio-xs"
                  />

                  Class Wise Promoted
                  List
                </label>
              </div>

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
                  disabled={
                    type ===
                    "session"
                  }
                />
              </Field>

              {type === "class" && (
                <>
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

                  <div />
                </>
              )}

              <ButtonOffset>
                <SearchButton
                  onClick={() =>
                    setSearched(true)
                  }
                />

                <PrintButton />

                <PdfButton />

                <ExcelButton />
              </ButtonOffset>
            </FormGrid>

            <div className="min-h-[10px]" />
          </div>
        </Panel>

        <Panel title="Promoted List">
          {searched ? (
            <div className="p-5">
              <div className="overflow-x-auto">
                <table className="table table-xs min-w-[850px] border border-base-300">
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
                        Session
                      </th>

                      <th className="border border-base-300">
                        Class
                      </th>

                      <th className="border border-base-300">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      <td
                        colSpan={6}
                        className="border border-base-300 py-8 text-center text-slate-400"
                      >
                        No promoted
                        students found.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <EmptyResultArea />
          )}
        </Panel>
      </div>
    </PageRoot>
  );
}

/* =========================================================
   4. SUBJECT WISE RESULT
========================================================= */

export function SubjectWiseResultPage() {
  const [form, setForm] =
    useState({
      session: "2025",
      shift: "",
      className: "",
      subject: "",
      order:
        "Roll (Ascending)",
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
      <div className="space-y-6">
        <Panel title="Subject Wise Result Search">
          <div className="px-5 py-6">
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

              <Field label="Subject:">
                <Select
                  value={
                    form.subject
                  }
                  onChange={(e) =>
                    update(
                      "subject",
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Select Subject
                  </option>

                  {subjects.map(
                    (subject) => (
                      <option
                        key={
                          subject
                        }
                        value={
                          subject
                        }
                      >
                        {subject}
                      </option>
                    )
                  )}
                </Select>
              </Field>

              <Field label="In order of:">
                <Select
                  value={
                    form.order
                  }
                  onChange={(e) =>
                    update(
                      "order",
                      e.target.value
                    )
                  }
                >
                  <option>
                    Roll (Ascending)
                  </option>

                  <option>
                    Roll (Descending)
                  </option>

                  <option>
                    Mark (Descending)
                  </option>

                  <option>
                    Name (Ascending)
                  </option>
                </Select>
              </Field>

              <div />

              <ButtonOffset>
                <SearchButton
                  onClick={() =>
                    setSearched(true)
                  }
                />

                <PrintButton />

                <PdfButton />

                <ExcelButton />
              </ButtonOffset>
            </FormGrid>

            <div className="min-h-[10px]" />
          </div>
        </Panel>

        <Panel title="Subject Wise Result">
          {searched ? (
            <div className="p-5">
              <div className="overflow-x-auto">
                <table className="table table-xs min-w-[950px] border border-base-300">
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
                        Subject
                      </th>

                      <th className="border border-base-300">
                        Mark
                      </th>

                      <th className="border border-base-300">
                        Grade
                      </th>

                      <th className="border border-base-300">
                        Result
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      <td
                        colSpan={8}
                        className="border border-base-300 py-8 text-center text-slate-400"
                      >
                        No subject-wise
                        result data found.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <EmptyResultArea />
          )}
        </Panel>
      </div>
    </PageRoot>
  );
}