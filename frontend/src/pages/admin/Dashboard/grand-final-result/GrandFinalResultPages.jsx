import { useState } from "react";
import { motion } from "framer-motion";

/* =========================================================
   SHARED OPTIONS
========================================================= */

const sessions = ["2026", "2025", "2024"];

const exams = [
  "Grand Final Exam",
  "Final Exam",
  "Half Yearly Exam",
  "Model Test",
  "Pre Test",
];

const shifts = [
  "EXAM BATCH HSC 2026",
  "EXAM BATCH SSC 2026",
  "All Shift",
  "All shift for HSC",
  "9.30AM- 11.30AM Morning",
];

const classes = [
  "SSC",
  "HSC",
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

const subjects = [
  "Bangla 1st Paper",
  "Bangla 2nd Paper",
  "English 1st Paper",
  "English 2nd Paper",
  "Mathematics",
  "ICT",
  "Physics",
  "Chemistry",
];

const teachers = [
  "Abdul Karim",
  "Md. Rahim",
  "Nusrat Jahan",
  "Shamim Ahmed",
  "Hasan Mahmud",
];

/* =========================================================
   SHARED UI
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

function Panel({ title, children, className = "" }) {
  return (
    <section
      className={`overflow-hidden rounded-[4px] border border-slate-200 bg-white shadow-sm ${className}`}
    >
      <div className="bg-[#456db5] px-3 py-2 text-base font-bold text-white sm:px-4 sm:text-lg">
        {title}
      </div>

      {children}
    </section>
  );
}

function RequiredNotice() {
  return (
    <div className="rounded-[4px] border border-[#f2dd9d] bg-[#fff3cd] px-5 py-3 text-sm font-bold text-red-500">
      (*) field required
    </div>
  );
}

function Label({ children, required = false }) {
  return (
    <label className="text-[13px] font-semibold text-black">
      {children}
      {required && <span className="text-red-500">*</span>}
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

function Field({ label, required = false, children }) {
  return (
    <div className="grid items-center gap-3 sm:grid-cols-[180px_minmax(0,1fr)]">
      <Label required={required}>{label}</Label>
      {children}
    </div>
  );
}

function SearchButton({ onClick, children = "Search" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn btn-info btn-sm h-8 min-h-8 rounded-[3px] px-3 text-white"
    >
      {children}
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

function PdfButton({ children = "Create PDF" }) {
  return (
    <button
      type="button"
      onClick={() => window.alert("PDF generation can be connected to your backend/API.")}
      className="btn btn-sm h-8 min-h-8 rounded-[3px] border-[#6610f2] bg-[#6610f2] px-3 text-white hover:border-[#520dc2] hover:bg-[#520dc2]"
    >
      {children}
    </button>
  );
}

function ExcelButton() {
  return (
    <button
      type="button"
      onClick={() => window.alert("Excel export can be connected to your backend/API.")}
      className="btn btn-sm h-8 min-h-8 rounded-[3px] border-[#6610f2] bg-[#6610f2] px-3 text-white hover:border-[#520dc2] hover:bg-[#520dc2]"
    >
      Download Excel
    </button>
  );
}

function EmptyResultPanel({ title }) {
  return (
    <Panel title={title}>
      <div className="min-h-[36px] bg-white" />
    </Panel>
  );
}

function StandardButtons({
  onSearch,
  pdf = true,
  excel = true,
}) {
  return (
    <div className="flex flex-wrap gap-1">
      <SearchButton onClick={onSearch} />
      <PrintButton />
      {pdf && <PdfButton />}
      {excel && <ExcelButton />}
    </div>
  );
}

function BasicReportFields({
  values,
  setValues,
  withGroup = true,
  withSection = true,
}) {
  const update = (key, value) => {
    setValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="grid gap-x-7 gap-y-4 xl:grid-cols-2">
      <Field label="Session Year:">
        <Select
          value={values.session}
          onChange={(e) => update("session", e.target.value)}
        >
          {sessions.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </Select>
      </Field>

      <Field label="Exam:">
        <Select
          value={values.exam}
          onChange={(e) => update("exam", e.target.value)}
        >
          <option value="">Select Exam</option>
          {exams.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </Select>
      </Field>

      <Field label="School Shift:">
        <Select
          value={values.shift}
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
          value={values.className}
          onChange={(e) => update("className", e.target.value)}
        >
          <option value="">Select Class</option>
          {classes.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </Select>
      </Field>

      {withSection && (
        <Field label="Section:">
          <Select
            value={values.section}
            onChange={(e) => update("section", e.target.value)}
          >
            <option value="">Select Section</option>
            {sections.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </Select>
        </Field>
      )}

      {withGroup && (
        <Field label="Group:">
          <Select
            value={values.group}
            onChange={(e) => update("group", e.target.value)}
          >
            <option value="">Select Group</option>
            {groups.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </Select>
        </Field>
      )}
    </div>
  );
}

function useBasicReportState() {
  return useState({
    session: "2026",
    exam: "",
    shift: "",
    className: "",
    section: "",
    group: "",
  });
}

/* =========================================================
   1. GRAND EXAM CONFIGURE MANAGE
========================================================= */

export function GrandExamConfigureManagePage() {
  const [session, setSession] = useState("2026");
  const [exam, setExam] = useState("");
  const [searched, setSearched] = useState(false);

  return (
    <PageRoot>
      <Panel title="Grand Exam Configure">
        <div className="space-y-4 p-5">
          <RequiredNotice />

          <div className="mx-auto grid max-w-[1310px] gap-x-7 gap-y-4 lg:grid-cols-2">
            <Field label="Session Year:" required>
              <Select value={session} onChange={(e) => setSession(e.target.value)}>
                {sessions.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </Select>
            </Field>

            <Field label="Exam:" required>
              <Select value={exam} onChange={(e) => setExam(e.target.value)}>
                <option value="">Select Exam</option>
                {exams.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </Select>
            </Field>

            <div className="sm:ml-[183px]">
              <button
                type="button"
                onClick={() => setSearched(true)}
                className="btn btn-success btn-sm h-8 min-h-8 rounded-[3px] text-white"
              >
                Search
              </button>
            </div>
          </div>

          {searched && (
            <div className="mx-auto max-w-[1310px] rounded border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
              No grand exam configuration data found.
            </div>
          )}
        </div>
      </Panel>
    </PageRoot>
  );
}

/* =========================================================
   2. GRAND RESULT PROCESS
   Screenshot was not supplied, so this follows the same
   Grand Final search structure used by the other pages.
========================================================= */

export function GrandResultProcessPage() {
  const [values, setValues] = useBasicReportState();
  const [searched, setSearched] = useState(false);

  return (
    <PageRoot>
      <Panel title="Grand Result Process">
        <div className="p-5">
          <div className="mx-auto max-w-[1310px]">
            <BasicReportFields
              values={values}
              setValues={setValues}
              withGroup={false}
              withSection={false}
            />

            <div className="mt-5 sm:ml-[180px]">
              <button
                type="button"
                onClick={() => setSearched(true)}
                className="btn btn-success btn-sm h-8 min-h-8 rounded-[3px] text-white"
              >
                Process Result
              </button>
            </div>
          </div>
        </div>
      </Panel>

      {searched && (
        <div className="mt-5">
          <EmptyResultPanel title="Grand Final Result Process" />
        </div>
      )}
    </PageRoot>
  );
}

/* =========================================================
   3. GRAND MARK SHEET
========================================================= */

export function GrandMarkSheetPage() {
  const [values, setValues] = useState({
    session: "2026",
    exam: "",
    shift: "",
    className: "",
    section: "",
    group: "",
    roll: "",
    id: "",
    markSheetType: "Merit Wise(Descending)",
  });

  const update = (key, value) => {
    setValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <PageRoot>
      <div className="space-y-5">
        <Panel title="Grand Final Marksheet">
          <div className="p-5">
            <div className="mx-auto grid max-w-[1320px] gap-x-7 gap-y-4 xl:grid-cols-2">
              <Field label="Session Year:">
                <Select
                  value={values.session}
                  onChange={(e) => update("session", e.target.value)}
                >
                  {sessions.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </Select>
              </Field>

              <Field label="Exam:">
                <Select
                  value={values.exam}
                  onChange={(e) => update("exam", e.target.value)}
                >
                  <option value="">Select Exam</option>
                  {exams.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </Select>
              </Field>

              <Field label="School Shift:">
                <Select
                  value={values.shift}
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
                  value={values.className}
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
                  value={values.section}
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
                  value={values.group}
                  onChange={(e) => update("group", e.target.value)}
                >
                  <option value="">Select Group</option>
                  {groups.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </Select>
              </Field>

              <Field label="Roll:">
                <Input
                  value={values.roll}
                  placeholder="Enter roll"
                  onChange={(e) => update("roll", e.target.value)}
                />
              </Field>

              <Field label="ID:">
                <Input
                  value={values.id}
                  placeholder="Enter ID"
                  onChange={(e) => update("id", e.target.value)}
                />
              </Field>

              <Field label="Mark Sheet Type:">
                <Select
                  value={values.markSheetType}
                  onChange={(e) => update("markSheetType", e.target.value)}
                >
                  <option>Merit Wise(Descending)</option>
                  <option>Roll Wise(Ascending)</option>
                  <option>ID Wise(Ascending)</option>
                </Select>
              </Field>

              <Field label="Mark Sheet:">
                <button
                  type="button"
                  className="btn btn-sm h-8 min-h-8 w-full rounded-[3px] border-slate-500 bg-gradient-to-b from-slate-500 to-slate-600 text-white"
                >
                  Design &amp; Config
                </button>
              </Field>

              <div className="sm:ml-[180px]">
                <div className="flex flex-wrap gap-1">
                  <SearchButton />
                  <PrintButton />
                  <PdfButton />
                </div>
              </div>
            </div>
          </div>
        </Panel>

        <EmptyResultPanel title="Student Mark Sheet" />
      </div>
    </PageRoot>
  );
}

/* =========================================================
   PRINT PROPERTIES
========================================================= */

function PrintProperties({
  font = "Font Small",
}) {
  return (
    <div className="grid grid-cols-4 overflow-hidden rounded-[3px] border border-slate-300">
      <select className="h-8 border-r border-slate-300 bg-white px-2 text-xs outline-none">
        <option>legal</option>
        <option>A4</option>
        <option>letter</option>
      </select>

      <select className="h-8 border-r border-slate-300 bg-white px-2 text-xs outline-none">
        <option>Landscape</option>
        <option>Portrait</option>
      </select>

      <select className="h-8 border-r border-slate-300 bg-white px-2 text-xs outline-none">
        <option>{font}</option>
        <option>Font Standard</option>
        <option>Font Small</option>
      </select>

      <select className="h-8 bg-white px-2 text-xs outline-none">
        <option>100% Zoom</option>
        <option>90% Zoom</option>
        <option>80% Zoom</option>
      </select>
    </div>
  );
}

/* =========================================================
   4. GRAND TABULATION SHEET
========================================================= */

export function GrandTabulationSheetPage() {
  const [tab, setTab] = useState("shift");
  const [values, setValues] = useBasicReportState();
  const [design, setDesign] = useState(
    "Total, Letter Grade, Grade Point, Failed Subjects, Place"
  );
  const [order, setOrder] = useState("GPA (Descending)");
  const [type, setType] = useState("Normal Tabulation");

  return (
    <PageRoot>
      <div className="space-y-5">
        <Panel title="Grand Final Tabulation Sheet">
          <div className="p-4">
            <div className="mb-3 flex border-b border-slate-200">
              <button
                type="button"
                onClick={() => setTab("shift")}
                className={`border border-b-0 border-slate-200 px-4 py-2 text-xs ${
                  tab === "shift" ? "bg-white" : "bg-slate-100"
                }`}
              >
                Shift Wise
              </button>

              <button
                type="button"
                onClick={() => setTab("class")}
                className={`border border-b-0 border-slate-200 px-4 py-2 text-xs ${
                  tab === "class" ? "bg-white" : "bg-slate-100"
                }`}
              >
                Class Wise
              </button>
            </div>

            <div className="mx-auto max-w-[1320px]">
              <BasicReportFields values={values} setValues={setValues} />

              <div className="mt-4 grid gap-x-7 gap-y-4 xl:grid-cols-2">
                <Field label="Design:">
                  <Select
                    value={design}
                    onChange={(e) => setDesign(e.target.value)}
                  >
                    <option>
                      Total, Letter Grade, Grade Point, Failed Subjects, Place
                    </option>
                    <option>Total, GPA, Grade</option>
                    <option>Total, Result, Place</option>
                  </Select>
                </Field>

                <Field label="Print Properties:">
                  <PrintProperties />
                </Field>

                <Field label="In order of:">
                  <Select
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                  >
                    <option>GPA (Descending)</option>
                    <option>GPA (Ascending)</option>
                    <option>Roll (Ascending)</option>
                    <option>Place (Ascending)</option>
                  </Select>
                </Field>

                <Field label="Tabulation Sheet Type:">
                  <Select value={type} onChange={(e) => setType(e.target.value)}>
                    <option>Normal Tabulation</option>
                    <option>Compact Tabulation</option>
                    <option>Detailed Tabulation</option>
                  </Select>
                </Field>
              </div>

              <div className="mt-5 sm:ml-[180px]">
                <StandardButtons />
              </div>
            </div>
          </div>
        </Panel>

        <EmptyResultPanel title="Students Marks Detail Tabulation Sheet" />
      </div>
    </PageRoot>
  );
}

/* =========================================================
   5. GRAND MERIT LIST
========================================================= */

export function GrandMeritListPage() {
  const [values, setValues] = useBasicReportState();
  const [design, setDesign] = useState(
    "Total, Letter Grade, Grade Point, Failed Subjects, Place, Remark"
  );
  const [order, setOrder] = useState("GPA (Descending)");

  return (
    <PageRoot>
      <div className="space-y-5">
        <Panel title="Search Grand Final Merit List">
          <div className="p-5">
            <div className="mx-auto max-w-[1320px]">
              <BasicReportFields values={values} setValues={setValues} />

              <div className="mt-4 grid gap-x-7 gap-y-4 xl:grid-cols-2">
                <Field label="Design:">
                  <Select
                    value={design}
                    onChange={(e) => setDesign(e.target.value)}
                  >
                    <option>
                      Total, Letter Grade, Grade Point, Failed Subjects, Place,
                      Remark
                    </option>
                    <option>Total, GPA, Grade, Place</option>
                    <option>Total, Result, Place</option>
                  </Select>
                </Field>

                <Field label="Print Properties:">
                  <PrintProperties font="Font Standard" />
                </Field>

                <Field label="In order of:">
                  <Select
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                  >
                    <option>GPA (Descending)</option>
                    <option>GPA (Ascending)</option>
                    <option>Place (Ascending)</option>
                  </Select>
                </Field>

                <div />

                <div className="sm:ml-[180px]">
                  <StandardButtons />
                </div>
              </div>
            </div>
          </div>
        </Panel>

        <EmptyResultPanel title="Students Merit List" />
      </div>
    </PageRoot>
  );
}

/* =========================================================
   GENERIC GRAND REPORT
========================================================= */

function GrandReportPage({
  searchTitle,
  resultTitle,
  subjectMode = false,
}) {
  const [values, setValues] = useBasicReportState();
  const [subject, setSubject] = useState("");

  return (
    <PageRoot>
      <div className="space-y-5">
        <Panel title={searchTitle}>
          <div className="p-5">
            <div className="mx-auto max-w-[1320px]">
              <BasicReportFields
                values={values}
                setValues={setValues}
                withGroup={!subjectMode}
              />

              {subjectMode && (
                <div className="mt-4 grid gap-x-7 gap-y-4 xl:grid-cols-2">
                  <Field label="Subject:">
                    <Select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    >
                      <option value="">Select Subject</option>
                      {subjects.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </Select>
                  </Field>
                </div>
              )}

              <div className="mt-5 sm:ml-[180px]">
                <StandardButtons />
              </div>
            </div>
          </div>
        </Panel>

        <EmptyResultPanel title={resultTitle} />
      </div>
    </PageRoot>
  );
}

/* =========================================================
   6. GRAND GRADE SHEET REPORT
========================================================= */

export function GrandGradeSheetReportPage() {
  return (
    <GrandReportPage
      searchTitle="Grand Final Grade Sheet Search"
      resultTitle="Grand Final Grade Sheet Report"
    />
  );
}

/* =========================================================
   7. GRAND FAIL REPORT
========================================================= */

export function GrandFailReportPage() {
  return (
    <GrandReportPage
      searchTitle="Grand Final Fail Report Search"
      resultTitle="Grand Final Fail Report List"
    />
  );
}

/* =========================================================
   8. GRAND SUBJECT WISE FAIL
========================================================= */

export function GrandSubjectWiseFailPage() {
  const [values, setValues] = useBasicReportState();
  const [subject, setSubject] = useState("");

  return (
    <PageRoot>
      <div className="space-y-5">
        <Panel title="Grand Final Subject Wise Fail">
          <div className="p-5">
            <div className="mx-auto max-w-[1320px]">
              <div className="grid gap-x-7 gap-y-4 xl:grid-cols-2">
                <Field label="Session Year:">
                  <Select
                    value={values.session}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        session: e.target.value,
                      }))
                    }
                  >
                    {sessions.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </Select>
                </Field>

                <Field label="Exam:">
                  <Select
                    value={values.exam}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        exam: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select Exam</option>
                    {exams.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </Select>
                </Field>

                <Field label="School Shift:">
                  <Select
                    value={values.shift}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        shift: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select Shift</option>
                    {shifts.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </Select>
                </Field>

                <Field label="Class:">
                  <Select
                    value={values.className}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        className: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select Class</option>
                    {classes.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </Select>
                </Field>

                <Field label="Section:">
                  <Select
                    value={values.section}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        section: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select Section</option>
                    {sections.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </Select>
                </Field>

                <Field label="Subject:">
                  <Select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </Select>
                </Field>
              </div>

              <div className="mt-5 sm:ml-[180px]">
                <StandardButtons />
              </div>
            </div>
          </div>
        </Panel>

        <EmptyResultPanel title="Subject Wise Fail Report" />
      </div>
    </PageRoot>
  );
}

/* =========================================================
   9. GRAND SUBJECT WISE RESULT
========================================================= */

export function GrandSubjectWiseResultPage() {
  const [values, setValues] = useBasicReportState();
  const [subject, setSubject] = useState("");

  return (
    <PageRoot>
      <div className="space-y-5">
        <Panel title="Grand Final Subject Wise Result">
          <div className="p-5">
            <div className="mx-auto max-w-[1320px]">
              <div className="grid gap-x-7 gap-y-4 xl:grid-cols-2">
                <Field label="Session Year:">
                  <Select
                    value={values.session}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        session: e.target.value,
                      }))
                    }
                  >
                    {sessions.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </Select>
                </Field>

                <Field label="Exam:">
                  <Select
                    value={values.exam}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        exam: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select Exam</option>
                    {exams.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </Select>
                </Field>

                <Field label="School Shift:">
                  <Select
                    value={values.shift}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        shift: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select Shift</option>
                    {shifts.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </Select>
                </Field>

                <Field label="Class:">
                  <Select
                    value={values.className}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        className: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select Class</option>
                    {classes.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </Select>
                </Field>

                <Field label="Section:">
                  <Select
                    value={values.section}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        section: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select Section</option>
                    {sections.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </Select>
                </Field>

                <Field label="Group:">
                  <Select
                    value={values.group}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        group: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select Group</option>
                    {groups.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </Select>
                </Field>

                <Field label="Subject:">
                  <Select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </Select>
                </Field>
              </div>

              <div className="mt-5 sm:ml-[180px]">
                <StandardButtons />
              </div>
            </div>
          </div>
        </Panel>

        <EmptyResultPanel title="Subject Wise Result" />
      </div>
    </PageRoot>
  );
}

/* =========================================================
   10. GRAND TEACHER WISE RESULT
========================================================= */

export function GrandTeacherWiseResultPage() {
  const [session, setSession] = useState("2026");
  const [exam, setExam] = useState("");
  const [teacher, setTeacher] = useState("");

  return (
    <PageRoot>
      <div className="space-y-5">
        <Panel title="Teacher Wise Result Search">
          <div className="p-5">
            <div className="mx-auto max-w-[1320px]">
              <div className="grid gap-x-7 gap-y-4 xl:grid-cols-2">
                <Field label="Session Year:">
                  <Select
                    value={session}
                    onChange={(e) => setSession(e.target.value)}
                  >
                    {sessions.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </Select>
                </Field>

                <Field label="Exam:">
                  <Select value={exam} onChange={(e) => setExam(e.target.value)}>
                    <option value="">Select Exam</option>
                    {exams.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </Select>
                </Field>

                <Field label="Teacher:">
                  <Select
                    value={teacher}
                    onChange={(e) => setTeacher(e.target.value)}
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </Select>
                </Field>
              </div>

              <div className="mt-5 sm:ml-[180px]">
                <StandardButtons />
              </div>
            </div>
          </div>
        </Panel>

        <EmptyResultPanel title="Teacher Wise Result" />
      </div>
    </PageRoot>
  );
}

/* =========================================================
   11. GRAND STUDENT PROMOTION
========================================================= */

export function GrandStudentPromotionPage() {
  const [values, setValues] = useState({
    session: "2026",
    shift: "",
    className: "",
    section: "",
    group: "",
    roll: "",
    promotionBy: "",
  });

  const update = (key, value) => {
    setValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const [searched, setSearched] = useState(false);

  return (
    <PageRoot>
      <Panel title="Student Search">
        <div className="p-5">
          <div className="mx-auto max-w-[1320px]">
            <div className="grid gap-x-7 gap-y-4 xl:grid-cols-2">
              <Field label="Session Year:">
                <Select
                  value={values.session}
                  onChange={(e) => update("session", e.target.value)}
                >
                  {sessions.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </Select>
              </Field>

              <Field label="School Shift:">
                <Select
                  value={values.shift}
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
                  value={values.className}
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
                  value={values.section}
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
                  value={values.group}
                  onChange={(e) => update("group", e.target.value)}
                >
                  <option value="">Select Group</option>
                  {groups.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </Select>
              </Field>

              <Field label="Roll:">
                <Input
                  value={values.roll}
                  placeholder="Enter roll"
                  onChange={(e) => update("roll", e.target.value)}
                />
              </Field>

              <Field label="Promotion By:">
                <Select
                  value={values.promotionBy}
                  onChange={(e) => update("promotionBy", e.target.value)}
                >
                  <option value="">Select Exam</option>
                  {exams.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="mt-5 sm:ml-[180px]">
              <button
                type="button"
                onClick={() => setSearched(true)}
                className="btn btn-sm h-8 min-h-8 rounded-[3px] border-[#6610f2] bg-[#6610f2] px-3 text-white hover:border-[#520dc2] hover:bg-[#520dc2]"
              >
                Search
              </button>
            </div>

            {searched && (
              <div className="mt-5 rounded border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                No students found for the selected promotion criteria.
              </div>
            )}
          </div>
        </div>
      </Panel>
    </PageRoot>
  );
}