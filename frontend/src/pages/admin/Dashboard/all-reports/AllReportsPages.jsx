import { useState } from "react";
import { motion } from "framer-motion";

/* =========================================================
   SHARED DATA
========================================================= */

const sessions = ["2026", "2025", "2024"];

const shifts = [
  "EXAM BATCH HSC 2026",
  "EXAM BATCH SSC 2026",
  "All Shift",
  "All shift for HSC",
  "9.30AM- 11.30AM Morning",
  "demo shift",
];

const classes = [
  "HSC",
  "SSC",
  "Inter 2nd year",
  "Inter 1st year",
  "Class 10",
  "Class 09",
  "demo",
];

const sections = [
  "EXAM BATCH",
  "Day",
  "Morning",
  "All",
  "SSC 2026",
  "demo",
];

const groups = ["Business", "Humanities", "Science"];

const religions = [
  "Islam",
  "Hinduism",
  "Buddhism",
  "Christian",
  "Other",
];

const genders = ["Male", "Female", "Other"];

const bloodGroups = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
];

const categories = ["Day Care"];

/* =========================================================
   SHARED COMPONENTS
========================================================= */

function PageRoot({ children }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="min-h-[calc(100vh-65px)] bg-[#f5f5f5] p-2 sm:p-3"
    >
      {children}
    </motion.main>
  );
}

function Panel({ title, action, children, className = "" }) {
  return (
    <section
      className={`overflow-hidden rounded-[4px] border border-slate-200 bg-white shadow-sm ${className}`}
    >
      <div className="flex min-h-[38px] items-center justify-between bg-[#456db5] px-4 py-2 text-white">
        <h2 className="text-base font-bold sm:text-lg">{title}</h2>

        {action && <div className="shrink-0">{action}</div>}
      </div>

      {children}
    </section>
  );
}

function Label({ children }) {
  return (
    <label className="text-[13px] font-medium text-black">
      {children}
    </label>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`input input-bordered input-sm h-8 min-h-8 w-full rounded-[3px] border-slate-300 bg-white text-[13px] ${className}`}
    />
  );
}

function Select({ children, className = "", ...props }) {
  return (
    <select
      {...props}
      className={`select select-bordered select-sm h-8 min-h-8 w-full rounded-[3px] border-slate-300 bg-white text-[13px] ${className}`}
    >
      {children}
    </select>
  );
}

function Field({ label, children }) {
  return (
    <div className="grid items-center gap-3 sm:grid-cols-[175px_minmax(0,1fr)]">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function SearchButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn btn-info btn-sm h-8 min-h-8 rounded-[3px] px-3 text-white"
    >
      Search
    </button>
  );
}

function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="btn btn-success btn-sm h-8 min-h-8 rounded-[3px] px-3 text-white"
    >
      Print
    </button>
  );
}

function PdfButton() {
  const downloadPdf = () => {
    window.alert("Connect this button to your PDF generation API.");
  };

  return (
    <button
      type="button"
      onClick={downloadPdf}
      className="btn btn-sm h-8 min-h-8 rounded-[3px] border-[#6610f2] bg-[#6610f2] px-3 text-white hover:border-[#520dc2] hover:bg-[#520dc2]"
    >
      Download PDF
    </button>
  );
}

function CreateStudentButton() {
  return (
    <button
      type="button"
      onClick={() => window.alert("Connect this button to Student Create route.")}
      className="btn btn-info btn-sm h-8 min-h-8 rounded-[3px] px-3 font-medium text-white"
    >
      Create Student
    </button>
  );
}

function EmptyStudentPanel() {
  return (
    <Panel title="Student List">
      <div className="overflow-x-auto">
        <div className="min-w-[1000px] py-4" />
      </div>
    </Panel>
  );
}

/* =========================================================
   1. STUDENT REPORT
========================================================= */

export function StudentReportPage() {
  const [filters, setFilters] = useState({
    session: "2026",
    shift: "",
    className: "",
    section: "",
    group: "",
    religion: "",
    gender: "",
    bloodGroup: "",
    category: "Day Care",
  });

  const [searched, setSearched] = useState(false);

  const update = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <PageRoot>
      <div className="space-y-5">
        <Panel title="Student Report Search">
          <div className="p-5 sm:p-6">
            <div className="mx-auto max-w-[1320px]">
              <div className="grid gap-x-7 gap-y-4 lg:grid-cols-2">
                <Field label="Session Year:">
                  <Select
                    value={filters.session}
                    onChange={(e) => update("session", e.target.value)}
                  >
                    {sessions.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </Select>
                </Field>

                <Field label="School Shift:">
                  <Select
                    value={filters.shift}
                    onChange={(e) => update("shift", e.target.value)}
                  >
                    <option value="">Select Shift</option>

                    {shifts.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </Select>
                </Field>

                <Field label="Class:">
                  <Select
                    value={filters.className}
                    onChange={(e) => update("className", e.target.value)}
                  >
                    <option value="">Select class</option>

                    {classes.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </Select>
                </Field>

                <Field label="Section:">
                  <Select
                    value={filters.section}
                    onChange={(e) => update("section", e.target.value)}
                  >
                    <option value="">Select Section</option>

                    {sections.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </Select>
                </Field>

                <Field label="Group:">
                  <Select
                    value={filters.group}
                    onChange={(e) => update("group", e.target.value)}
                  >
                    <option value="">Select Group</option>

                    {groups.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </Select>
                </Field>

                <Field label="Religion:">
                  <Select
                    value={filters.religion}
                    onChange={(e) => update("religion", e.target.value)}
                  >
                    <option value="">Select religion</option>

                    {religions.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </Select>
                </Field>

                <Field label="Gender:">
                  <Select
                    value={filters.gender}
                    onChange={(e) => update("gender", e.target.value)}
                  >
                    <option value="">Select gender</option>

                    {genders.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </Select>
                </Field>

                <Field label="Blood Group:">
                  <Select
                    value={filters.bloodGroup}
                    onChange={(e) => update("bloodGroup", e.target.value)}
                  >
                    <option value="">Select blood group</option>

                    {bloodGroups.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </Select>
                </Field>

                <Field label="Category:">
                  <Select
                    value={filters.category}
                    onChange={(e) => update("category", e.target.value)}
                  >
                    {categories.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </Select>
                </Field>
              </div>

              <div className="mt-5 flex flex-wrap gap-1 sm:ml-[175px]">
                <SearchButton onClick={() => setSearched(true)} />
                <PrintButton />
                <PdfButton />
              </div>

              {searched && (
                <p className="mt-3 text-xs font-medium text-slate-500 sm:ml-[175px]">
                  No student records found for the selected criteria.
                </p>
              )}
            </div>
          </div>
        </Panel>

        <EmptyStudentPanel />
      </div>
    </PageRoot>
  );
}

/* =========================================================
   SHARED DISABLE / RESTORE SEARCH
========================================================= */

function StudentStatusSearch({
  title,
  onSearch,
}) {
  const [form, setForm] = useState({
    session: "2026",
    shift: "",
    className: "",
    section: "",
    studentId: "",
  });

  const update = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Panel title={title} action={<CreateStudentButton />}>
      <div className="p-5 sm:p-6">
        <div className="mx-auto max-w-[1320px]">
          <div className="grid gap-x-7 gap-y-4 lg:grid-cols-2">
            <Field label="Session Year:">
              <Select
                value={form.session}
                onChange={(e) => update("session", e.target.value)}
              >
                {sessions.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </Select>
            </Field>

            <Field label="School Shift:">
              <Select
                value={form.shift}
                onChange={(e) => update("shift", e.target.value)}
              >
                <option value="">Select Shift</option>

                {shifts.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </Select>
            </Field>

            <Field label="Class:">
              <Select
                value={form.className}
                onChange={(e) => update("className", e.target.value)}
              >
                <option value="">Select class</option>

                {classes.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </Select>
            </Field>

            <Field label="Section:">
              <Select
                value={form.section}
                onChange={(e) => update("section", e.target.value)}
              >
                <option value="">Select Section</option>

                {sections.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </Select>
            </Field>

            <Field label="Student ID:">
              <Input
                value={form.studentId}
                placeholder="Student ID"
                onChange={(e) => update("studentId", e.target.value)}
              />
            </Field>
          </div>

          <div className="mt-5 sm:ml-[175px]">
            <SearchButton onClick={() => onSearch(form)} />
          </div>
        </div>
      </div>
    </Panel>
  );
}

/* =========================================================
   2. CREATE INACTIVE STUDENT
   Screenshot title = Student Disable
========================================================= */

export function CreateInactiveStudentPage() {
  const [searched, setSearched] = useState(false);

  return (
    <PageRoot>
      <StudentStatusSearch
        title="Student Disable"
        onSearch={() => setSearched(true)}
      />

      {searched && (
        <div className="mt-5">
          <Panel title="Student List">
            <div className="overflow-x-auto p-4">
              <table className="table table-sm min-w-[1000px] border-collapse">
                <thead>
                  <tr className="bg-[#f2f2f2] text-black">
                    <th className="border border-slate-300">Select</th>
                    <th className="border border-slate-300">Student ID</th>
                    <th className="border border-slate-300">Image</th>
                    <th className="border border-slate-300">Full Name</th>
                    <th className="border border-slate-300">Session</th>
                    <th className="border border-slate-300">Shift</th>
                    <th className="border border-slate-300">Class</th>
                    <th className="border border-slate-300">Section</th>
                    <th className="border border-slate-300">Roll</th>
                  </tr>
                </thead>
              </table>

              <p className="mt-4 text-sm font-semibold text-black">
                Showing 0 to 0 of 0 results.
              </p>
            </div>
          </Panel>
        </div>
      )}
    </PageRoot>
  );
}

/* =========================================================
   3. INACTIVE STUDENT LIST
   Screenshot title = Student Restore
========================================================= */

export function InactiveStudentListPage() {
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState(false);

  const restoreStudents = () => {
    if (!selected) {
      window.alert("Please select at least one student.");
      return;
    }

    window.alert("Selected student(s) restored.");
  };

  return (
    <PageRoot>
      <div className="space-y-10">
        <StudentStatusSearch
          title="Student Restore"
          onSearch={() => setSearched(true)}
        />

        <Panel
          title="Student List"
          action={
            <button
              type="button"
              onClick={restoreStudents}
              className="btn btn-success btn-sm h-8 min-h-8 rounded-[3px] px-3 text-white"
            >
              Update
            </button>
          }
        >
          <div className="overflow-x-auto p-4">
            <table className="table table-sm min-w-[1350px] border-collapse">
              <thead>
                <tr className="bg-[#f2f2f2] text-black">
                  <th className="w-12 border border-slate-300 text-center">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-xs rounded-[2px]"
                      checked={selected}
                      onChange={(e) => setSelected(e.target.checked)}
                    />
                  </th>

                  <th className="border border-slate-300">Student ID</th>
                  <th className="border border-slate-300">Image</th>
                  <th className="border border-slate-300">Full Name</th>
                  <th className="border border-slate-300">Session</th>
                  <th className="border border-slate-300">Shift</th>
                  <th className="border border-slate-300">Class</th>
                  <th className="border border-slate-300">Section</th>
                  <th className="border border-slate-300">Roll</th>
                  <th className="border border-slate-300">Disabled At</th>
                  <th className="border border-slate-300">Remarks</th>
                </tr>
              </thead>
            </table>

            <p className="mt-4 text-sm font-semibold text-black">
              Showing 0 to 0 of 0 results.
            </p>

            {searched && (
              <p className="mt-2 text-xs text-slate-500">
                No inactive students found.
              </p>
            )}
          </div>
        </Panel>
      </div>
    </PageRoot>
  );
}

/* =========================================================
   4. CLASS SUMMARY REPORT
========================================================= */

export function ClassSummaryReportPage() {
  const [form, setForm] = useState({
    session: "2026",
    shift: "",
    searchFor: "Class Summary",
  });

  const [searched, setSearched] = useState(false);

  const update = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <PageRoot>
      <div className="space-y-5">
        <Panel title="Class Summary Report Search">
          <div className="p-5 sm:p-6">
            <div className="mx-auto max-w-[1320px]">
              <div className="grid gap-x-7 gap-y-4 lg:grid-cols-2">
                <Field label="Session Year:">
                  <Select
                    value={form.session}
                    onChange={(e) => update("session", e.target.value)}
                  >
                    {sessions.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </Select>
                </Field>

                <Field label="School Shift:">
                  <Select
                    value={form.shift}
                    onChange={(e) => update("shift", e.target.value)}
                    className={
                      form.shift === ""
                        ? "bg-slate-50 text-slate-400"
                        : ""
                    }
                  >
                    <option value="">Nothing selected</option>

                    {shifts.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </Select>
                </Field>

                <Field label="Search For:">
                  <Select
                    value={form.searchFor}
                    onChange={(e) => update("searchFor", e.target.value)}
                  >
                    <option>Class Summary</option>
                    <option>Section Summary</option>
                    <option>Shift Summary</option>
                  </Select>
                </Field>
              </div>

              <div className="mt-5 flex flex-wrap gap-1 sm:ml-[175px]">
                <SearchButton onClick={() => setSearched(true)} />
                <PrintButton />
                <PdfButton />
              </div>

              {searched && (
                <p className="mt-3 text-xs font-medium text-slate-500 sm:ml-[175px]">
                  No class summary records found.
                </p>
              )}
            </div>
          </div>
        </Panel>

        <EmptyStudentPanel />
      </div>
    </PageRoot>
  );
}