import { useState } from "react";
import { motion } from "framer-motion";

/* =========================================================
   SHARED DATA
========================================================= */

const sessions = ["2026", "2025", "2024"];

const exams = [
  "SSC 2026 MODEL 2",
  "HSC 2026 MODEL 01",
  "HSC 2026 MODEL 02",
  "HSC 2026 Final Model",
  "MODEL 01 SSC 2027",
];

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

const subjects = [
  "Bangla 1st Paper",
  "Bangla 2nd Paper",
  "English 1st Paper",
  "English 2nd Paper",
  "Mathematics",
  "ICT",
];

const publishRows = [
  "SSC 2026 MODEL 2",
  "HSC 2026 MODEL 01",
  "97326 WK MATH",
  "HSC 2026 MODEL 02",
  "918426 WK ENGLISH",
  "1018426 WK PHY ACC GEO",
  "250426 4th WK E 1",
  "300426 4th WK E 2",
  "HSC 2026 Final Model",
  "MODEL 01 SSC 2027",
];

/* =========================================================
   SHARED UI
========================================================= */

function PageRoot({ children }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="min-h-[calc(100vh-64px)] bg-[#f5f5f5] p-2 sm:p-3"
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
      <div className="flex min-h-[38px] items-center justify-between bg-[#456db5] px-3 py-2 text-white">
        <h2 className="text-[14px] font-bold sm:text-[16px]">{title}</h2>
        {action && <div>{action}</div>}
      </div>

      {children}
    </section>
  );
}

function Select({ children, className = "", ...props }) {
  return (
    <select
      {...props}
      className={`select select-bordered select-sm h-8 min-h-8 w-full rounded-[3px] border-slate-300 bg-white text-[13px] font-normal ${className}`}
    >
      {children}
    </select>
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

function Field({ label, children, bold = false }) {
  return (
    <div className="grid min-w-0 items-center gap-3 sm:grid-cols-[175px_minmax(0,1fr)]">
      <label
        className={`text-[13px] text-black ${
          bold ? "font-bold" : "font-medium"
        }`}
      >
        {label}
      </label>

      <div className="min-w-0">{children}</div>
    </div>
  );
}

function TwoColumnForm({ children }) {
  return (
    <div className="grid gap-x-7 gap-y-4 lg:grid-cols-2">
      {children}
    </div>
  );
}

function FormBody({ children, wide = false }) {
  return (
    <div className="px-4 py-5 sm:px-6">
      <div
        className={
          wide
            ? "mx-auto w-full max-w-[1420px]"
            : "mx-auto w-full max-w-[1320px]"
        }
      >
        {children}
      </div>
    </div>
  );
}

function Button({
  children,
  color = "cyan",
  onClick,
  className = "",
  type = "button",
}) {
  const colors = {
    cyan:
      "border-[#159fb6] bg-[#1aa4ba] hover:border-[#11899d] hover:bg-[#118fa4]",
    green:
      "border-[#27a844] bg-[#28a745] hover:border-[#218838] hover:bg-[#218838]",
    purple:
      "border-[#6610f2] bg-[#6610f2] hover:border-[#520dc2] hover:bg-[#520dc2]",
    blue:
      "border-[#456db5] bg-[#456db5] hover:border-[#385c9c] hover:bg-[#385c9c]",
    gray:
      "border-[#6c757d] bg-[#747d83] hover:border-[#596167] hover:bg-[#60696f]",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`btn btn-sm h-8 min-h-8 rounded-[3px] px-3 text-[13px] font-medium text-white ${
        colors[color]
      } ${className}`}
    >
      {children}
    </button>
  );
}

function ActionButtons({
  searchOnly = false,
  noExcel = false,
  onSearch,
  searchColor = "cyan",
}) {
  const fakeDownload = (type) => {
    window.alert(`Connect this button with your ${type} export API.`);
  };

  return (
    <div className="flex flex-wrap gap-1">
      <Button color={searchColor} onClick={onSearch}>
        Search
      </Button>

      {!searchOnly && (
        <>
          <Button color="green" onClick={() => window.print()}>
            Print
          </Button>

          <Button color="purple" onClick={() => fakeDownload("PDF")}>
            Create PDF
          </Button>

          {!noExcel && (
            <Button color="purple" onClick={() => fakeDownload("Excel")}>
              Download Excel
            </Button>
          )}
        </>
      )}
    </div>
  );
}

function SessionSelect({ value = "2026", onChange }) {
  return (
    <Select value={value} onChange={onChange}>
      {sessions.map((item) => (
        <option key={item}>{item}</option>
      ))}
    </Select>
  );
}

function ExamSelect({ value = "", onChange }) {
  return (
    <Select value={value} onChange={onChange}>
      <option value="">Select Exam</option>

      {exams.map((item) => (
        <option key={item}>{item}</option>
      ))}
    </Select>
  );
}

function ShiftSelect({ value = "", onChange }) {
  return (
    <Select value={value} onChange={onChange}>
      <option value="">Select Shift</option>

      {shifts.map((item) => (
        <option key={item}>{item}</option>
      ))}
    </Select>
  );
}

function ClassSelect({ value = "", onChange, capital = false }) {
  return (
    <Select value={value} onChange={onChange}>
      <option value="">{capital ? "Select Class" : "Select class"}</option>

      {classes.map((item) => (
        <option key={item}>{item}</option>
      ))}
    </Select>
  );
}

function SectionSelect({ value = "", onChange }) {
  return (
    <Select value={value} onChange={onChange}>
      <option value="">Select Section</option>

      {sections.map((item) => (
        <option key={item}>{item}</option>
      ))}
    </Select>
  );
}

function GroupSelect({ value = "", onChange }) {
  return (
    <Select value={value} onChange={onChange}>
      <option value="">Select Group</option>

      {groups.map((item) => (
        <option key={item}>{item}</option>
      ))}
    </Select>
  );
}

function SubjectSelect({ value = "", onChange }) {
  return (
    <Select value={value} onChange={onChange}>
      <option value="">Select Subject</option>

      {subjects.map((item) => (
        <option key={item}>{item}</option>
      ))}
    </Select>
  );
}

function EmptyResultPanel({ title, action }) {
  return (
    <Panel title={title} action={action}>
      <div className="min-h-[36px]" />
    </Panel>
  );
}

function useCommonResultForm() {
  const [form, setForm] = useState({
    session: "2026",
    exam: "",
    shift: "",
    className: "",
    section: "",
    group: "",
    subject: "",
    roll: "",
    studentId: "",
  });

  const update = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return { form, update };
}

/* =========================================================
   PRINT PROPERTY INPUTS
========================================================= */

function PrintProperties({ smallFont = false }) {
  return (
    <div className="grid grid-cols-4">
      <Select defaultValue="legal" className="rounded-r-none">
        <option value="legal">legal</option>
        <option>A4</option>
        <option>Letter</option>
      </Select>

      <Select defaultValue="Landscape" className="rounded-none border-l-0">
        <option>Landscape</option>
        <option>Portrait</option>
      </Select>

      <Select
        defaultValue={smallFont ? "Font Small" : "Font Standard"}
        className="rounded-none border-l-0"
      >
        <option>Font Small</option>
        <option>Font Standard</option>
        <option>Font Large</option>
      </Select>

      <Select defaultValue="100% Zoom" className="rounded-l-none border-l-0">
        <option>100% Zoom</option>
        <option>90% Zoom</option>
        <option>80% Zoom</option>
      </Select>
    </div>
  );
}

/* =========================================================
   COMMON STANDARD RESULT SEARCH
========================================================= */

function StandardResultSearch({
  title,
  resultTitle,
  subject = false,
  searchColor = "cyan",
  actionButtons = true,
  noExcel = false,
}) {
  const { form, update } = useCommonResultForm();
  const [searched, setSearched] = useState(false);

  return (
    <PageRoot>
      <div className="space-y-10">
        <Panel title={title}>
          <FormBody>
            <TwoColumnForm>
              <Field label="Session Year:">
                <SessionSelect
                  value={form.session}
                  onChange={(e) => update("session", e.target.value)}
                />
              </Field>

              <Field label="Exam:">
                <ExamSelect
                  value={form.exam}
                  onChange={(e) => update("exam", e.target.value)}
                />
              </Field>

              <Field label="School Shift:">
                <ShiftSelect
                  value={form.shift}
                  onChange={(e) => update("shift", e.target.value)}
                />
              </Field>

              <Field label="Class:">
                <ClassSelect
                  capital
                  value={form.className}
                  onChange={(e) => update("className", e.target.value)}
                />
              </Field>

              <Field label="Section:">
                <SectionSelect
                  value={form.section}
                  onChange={(e) => update("section", e.target.value)}
                />
              </Field>

              {subject ? (
                <Field label="Subject:">
                  <SubjectSelect
                    value={form.subject}
                    onChange={(e) => update("subject", e.target.value)}
                  />
                </Field>
              ) : (
                <Field label="Group:">
                  <GroupSelect
                    value={form.group}
                    onChange={(e) => update("group", e.target.value)}
                  />
                </Field>
              )}
            </TwoColumnForm>

            <div className="mt-5 sm:ml-[175px]">
              {actionButtons ? (
                <ActionButtons
                  searchColor={searchColor}
                  noExcel={noExcel}
                  onSearch={() => setSearched(true)}
                />
              ) : (
                <ActionButtons
                  searchOnly
                  searchColor={searchColor}
                  onSearch={() => setSearched(true)}
                />
              )}
            </div>

            {searched && (
              <p className="mt-3 text-xs text-slate-400 sm:ml-[175px]">
                Search completed. Connect your API to display result data.
              </p>
            )}
          </FormBody>
        </Panel>

        {resultTitle && <EmptyResultPanel title={resultTitle} />}
      </div>
    </PageRoot>
  );
}

/* =========================================================
   1. RESULT POSITION SETUP
========================================================= */

export function ResultPositionSetupPage() {
  const [session, setSession] = useState("2026");
  const [exam, setExam] = useState("");

  return (
    <PageRoot>
      <Panel title="Result Position Setup">
        <FormBody>
          <TwoColumnForm>
            <Field label="Session Year:">
              <SessionSelect
                value={session}
                onChange={(e) => setSession(e.target.value)}
              />
            </Field>

            <Field label="Exam:">
              <ExamSelect
                value={exam}
                onChange={(e) => setExam(e.target.value)}
              />
            </Field>
          </TwoColumnForm>

          <div className="mt-5 sm:ml-[175px]">
            <ActionButtons
              searchOnly
              onSearch={() =>
                window.alert(
                  `Searching position setup for ${session}${
                    exam ? ` / ${exam}` : ""
                  }`
                )
              }
            />
          </div>
        </FormBody>
      </Panel>
    </PageRoot>
  );
}

/* =========================================================
   2. RESULT PROCESS
========================================================= */

export function ResultProcessPage() {
  const [session, setSession] = useState("2026");
  const [exam, setExam] = useState("");

  return (
    <PageRoot>
      <Panel title="Exam Result Process">
        <FormBody>
          <TwoColumnForm>
            <Field label="Session Year:">
              <SessionSelect
                value={session}
                onChange={(e) => setSession(e.target.value)}
              />
            </Field>

            <Field label="Exam:">
              <ExamSelect
                value={exam}
                onChange={(e) => setExam(e.target.value)}
              />
            </Field>
          </TwoColumnForm>

          <div className="mt-5 sm:ml-[175px]">
            <ActionButtons
              searchOnly
              searchColor="green"
              onSearch={() =>
                window.alert(
                  `Searching result process for ${session}${
                    exam ? ` / ${exam}` : ""
                  }`
                )
              }
            />
          </div>
        </FormBody>
      </Panel>
    </PageRoot>
  );
}

/* =========================================================
   3. MARK SHEET
========================================================= */

export function MarkSheetPage() {
  const { form, update } = useCommonResultForm();

  return (
    <PageRoot>
      <div className="space-y-7">
        <Panel title="Exam Result">
          <FormBody>
            <TwoColumnForm>
              <Field label="Session Year:">
                <SessionSelect
                  value={form.session}
                  onChange={(e) => update("session", e.target.value)}
                />
              </Field>

              <Field label="Exam:">
                <ExamSelect
                  value={form.exam}
                  onChange={(e) => update("exam", e.target.value)}
                />
              </Field>

              <Field label="School Shift:">
                <ShiftSelect
                  value={form.shift}
                  onChange={(e) => update("shift", e.target.value)}
                />
              </Field>

              <Field label="Class:">
                <ClassSelect
                  value={form.className}
                  onChange={(e) => update("className", e.target.value)}
                />
              </Field>

              <Field label="Section:">
                <SectionSelect
                  value={form.section}
                  onChange={(e) => update("section", e.target.value)}
                />
              </Field>

              <Field label="Group:">
                <GroupSelect
                  value={form.group}
                  onChange={(e) => update("group", e.target.value)}
                />
              </Field>

              <Field label="Roll:">
                <Input
                  placeholder="Enter roll"
                  value={form.roll}
                  onChange={(e) => update("roll", e.target.value)}
                />
              </Field>

              <Field label="ID:">
                <Input
                  placeholder="Enter ID"
                  value={form.studentId}
                  onChange={(e) => update("studentId", e.target.value)}
                />
              </Field>

              <Field label="Mark Sheet Type:">
                <Select defaultValue="Merit Wise(Descending)">
                  <option>Merit Wise(Descending)</option>
                  <option>Roll Wise(Ascending)</option>
                  <option>Name Wise(Ascending)</option>
                </Select>
              </Field>

              <Field label="Mark Sheet:">
                <Button
                  color="gray"
                  className="w-full"
                  onClick={() =>
                    window.alert("Open Mark Sheet Design & Config.")
                  }
                >
                  Design & Config
                </Button>
              </Field>
            </TwoColumnForm>

            <div className="mt-5 sm:ml-[175px]">
              <ActionButtons noExcel onSearch={() => {}} />
            </div>
          </FormBody>
        </Panel>

        <EmptyResultPanel title="Student Mark Sheet" />
      </div>
    </PageRoot>
  );
}

/* =========================================================
   4. TABULATION SHEET
========================================================= */

export function TabulationSheetPage() {
  const { form, update } = useCommonResultForm();
  const [tab, setTab] = useState("shift");

  return (
    <PageRoot>
      <div className="space-y-5">
        <Panel title="Search Result">
          <div className="px-4 pt-4 sm:px-5">
            <div className="flex border-b border-slate-200">
              <button
                type="button"
                onClick={() => setTab("shift")}
                className={`border border-b-0 px-4 py-2 text-[12px] ${
                  tab === "shift"
                    ? "bg-white text-slate-800"
                    : "bg-slate-100 text-slate-900"
                }`}
              >
                Shift Wise
              </button>

              <button
                type="button"
                onClick={() => setTab("class")}
                className={`border border-b-0 border-l-0 px-4 py-2 text-[12px] ${
                  tab === "class"
                    ? "bg-white text-slate-800"
                    : "bg-slate-100 text-slate-900"
                }`}
              >
                Class Wise
              </button>
            </div>
          </div>

          <FormBody>
            <TwoColumnForm>
              <Field label="Session Year:" bold>
                <SessionSelect
                  value={form.session}
                  onChange={(e) => update("session", e.target.value)}
                />
              </Field>

              <Field label="Exam:" bold>
                <ExamSelect
                  value={form.exam}
                  onChange={(e) => update("exam", e.target.value)}
                />
              </Field>

              <Field label="School Shift:" bold>
                <ShiftSelect
                  value={form.shift}
                  onChange={(e) => update("shift", e.target.value)}
                />
              </Field>

              <Field label="Class:" bold>
                <ClassSelect
                  value={form.className}
                  onChange={(e) => update("className", e.target.value)}
                />
              </Field>

              <Field label="Section:" bold>
                <SectionSelect
                  value={form.section}
                  onChange={(e) => update("section", e.target.value)}
                />
              </Field>

              <Field label="Group:" bold>
                <GroupSelect
                  value={form.group}
                  onChange={(e) => update("group", e.target.value)}
                />
              </Field>

              <Field label="Design:" bold>
                <Select defaultValue="Total, Letter Grade, Grade Point, Failed Subjects, Place">
                  <option>
                    Total, Letter Grade, Grade Point, Failed Subjects, Place
                  </option>
                  <option>
                    Total, Letter Grade, Grade Point, Failed Subjects
                  </option>
                </Select>
              </Field>

              <Field label="Print Properties:" bold>
                <PrintProperties smallFont />
              </Field>

              <Field label="In order of:" bold>
                <Select defaultValue="GPA (Descending)">
                  <option>GPA (Descending)</option>
                  <option>GPA (Ascending)</option>
                  <option>Roll (Ascending)</option>
                  <option>Name (Ascending)</option>
                </Select>
              </Field>

              <Field label="Tabulation Sheet Type:" bold>
                <Select defaultValue="Normal Tabulation">
                  <option>Normal Tabulation</option>
                  <option>Detailed Tabulation</option>
                </Select>
              </Field>
            </TwoColumnForm>

            <div className="mt-6 sm:ml-[175px]">
              <ActionButtons onSearch={() => {}} />
            </div>
          </FormBody>
        </Panel>

        <EmptyResultPanel title="Students Marks Detail Tabulation Sheet" />
      </div>
    </PageRoot>
  );
}

/* =========================================================
   5. GRADE SHEET REPORT
========================================================= */

export function GradeSheetReportPage() {
  return (
    <StandardResultSearch
      title="Grade Sheet Report"
      resultTitle="Section Wise Exam Result"
    />
  );
}

/* =========================================================
   MERIT SEARCH SHARED
========================================================= */

function MeritSearchPage({
  updateMode = false,
  title = "Search Merit List",
  resultTitle = "Students Merit List",
}) {
  const { form, update } = useCommonResultForm();

  return (
    <PageRoot>
      <div className="space-y-5">
        <Panel title={title}>
          <FormBody>
            <TwoColumnForm>
              <Field label="Session Year:" bold>
                <SessionSelect
                  value={form.session}
                  onChange={(e) => update("session", e.target.value)}
                />
              </Field>

              <Field label="Exam:" bold>
                <ExamSelect
                  value={form.exam}
                  onChange={(e) => update("exam", e.target.value)}
                />
              </Field>

              <Field label="School Shift:" bold>
                <ShiftSelect
                  value={form.shift}
                  onChange={(e) => update("shift", e.target.value)}
                />
              </Field>

              <Field label="Class:" bold>
                <ClassSelect
                  value={form.className}
                  onChange={(e) => update("className", e.target.value)}
                />
              </Field>

              <Field label="Section:" bold>
                <SectionSelect
                  value={form.section}
                  onChange={(e) => update("section", e.target.value)}
                />
              </Field>

              <Field label="Group:" bold>
                <GroupSelect
                  value={form.group}
                  onChange={(e) => update("group", e.target.value)}
                />
              </Field>

              <Field label="Design:" bold>
                <Select defaultValue="Total, Letter Grade, Grade Point, Failed Subjects, Place, Remark">
                  <option>
                    Total, Letter Grade, Grade Point, Failed Subjects, Place,
                    Remark
                  </option>
                  <option>
                    Total, Letter Grade, Grade Point, Failed Subjects, Place
                  </option>
                </Select>
              </Field>

              <Field label="Print Properties:" bold>
                <PrintProperties />
              </Field>

              <Field label="In order of:" bold>
                <Select defaultValue="GPA (Descending)">
                  <option>GPA (Descending)</option>
                  <option>GPA (Ascending)</option>
                  <option>Roll (Ascending)</option>
                  <option>Name (Ascending)</option>
                </Select>
              </Field>
            </TwoColumnForm>

            <div className="mt-6 sm:ml-[175px]">
              {updateMode ? (
                <ActionButtons searchOnly onSearch={() => {}} />
              ) : (
                <ActionButtons onSearch={() => {}} />
              )}
            </div>
          </FormBody>
        </Panel>

        <EmptyResultPanel
          title={resultTitle}
          action={
            updateMode ? (
              <Button
                color="green"
                onClick={() =>
                  window.alert("Connect Update with roll update API.")
                }
              >
                Update
              </Button>
            ) : null
          }
        />
      </div>
    </PageRoot>
  );
}

/* =========================================================
   6. MERIT LIST
========================================================= */

export function MeritListPage() {
  return <MeritSearchPage />;
}

/* =========================================================
   7. FAIL REPORT
========================================================= */

export function FailReportPage() {
  return (
    <StandardResultSearch
      title="Fail Report"
      resultTitle="Fail Report List"
    />
  );
}

/* =========================================================
   8. SUBJECT WISE RESULT
========================================================= */

export function SubjectWiseResultPage() {
  return (
    <StandardResultSearch
      title="Exam Result"
      resultTitle="Subject Wise Result"
      subject
    />
  );
}

/* =========================================================
   9. SUBJECT WISE FAIL REPORT
========================================================= */

export function SubjectWiseFailReportPage() {
  return (
    <StandardResultSearch
      title="Exam Result"
      resultTitle="Subject Wise Fail Report"
      subject
    />
  );
}

/* =========================================================
   10. EXAM WISE ROLL UPDATE
========================================================= */

export function ExamWiseRollUpdatePage() {
  return <MeritSearchPage updateMode />;
}

/* =========================================================
   11. PROMOTION
========================================================= */

export function PromotionPage() {
  const [tab, setTab] = useState("general");

  const [form, setForm] = useState({
    session: "2026",
    shift: "",
    className: "",
    section: "",
    group: "",
    roll: "",
    promotionBy: "",
  });

  const update = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <PageRoot>
      <Panel
        title="Student Search for Promotion"
        action={
          <Button
            onClick={() =>
              window.alert("Connect this button to Student Create route.")
            }
          >
            Create Student
          </Button>
        }
      >
        <div className="px-4 pt-4 sm:px-5">
          <div className="flex border-b border-slate-200">
            <button
              type="button"
              onClick={() => setTab("result")}
              className={`border border-b-0 px-4 py-2 text-[12px] ${
                tab === "result" ? "bg-white" : "bg-slate-50"
              }`}
            >
              Result Wise
            </button>

            <button
              type="button"
              onClick={() => setTab("general")}
              className={`border border-b-0 border-l-0 px-4 py-2 text-[12px] ${
                tab === "general" ? "bg-slate-100 font-medium" : "bg-white"
              }`}
            >
              general
            </button>
          </div>
        </div>

        <FormBody>
          <TwoColumnForm>
            <Field label="Session Year:">
              <SessionSelect
                value={form.session}
                onChange={(e) => update("session", e.target.value)}
              />
            </Field>

            <Field label="School Shift:">
              <ShiftSelect
                value={form.shift}
                onChange={(e) => update("shift", e.target.value)}
              />
            </Field>

            <Field label="Class:">
              <ClassSelect
                value={form.className}
                onChange={(e) => update("className", e.target.value)}
              />
            </Field>

            <Field label="Section:">
              <SectionSelect
                value={form.section}
                onChange={(e) => update("section", e.target.value)}
              />
            </Field>

            <Field label="Group:">
              <GroupSelect
                value={form.group}
                onChange={(e) => update("group", e.target.value)}
              />
            </Field>

            <Field label="Roll:">
              <Input
                placeholder="Enter roll"
                value={form.roll}
                onChange={(e) => update("roll", e.target.value)}
              />
            </Field>

            <Field label="Promotion By:">
              <ExamSelect
                value={form.promotionBy}
                onChange={(e) => update("promotionBy", e.target.value)}
              />
            </Field>
          </TwoColumnForm>

          <div className="mt-5 sm:ml-[175px]">
            <ActionButtons
              searchOnly
              searchColor="purple"
              onSearch={() => {}}
            />
          </div>
        </FormBody>
      </Panel>
    </PageRoot>
  );
}

/* =========================================================
   12. RESULT PUBLISH
========================================================= */

export function ResultPublishPage() {
  const [session, setSession] = useState("2026");
  const [exam, setExam] = useState("");

  const [rows, setRows] = useState(() =>
    publishRows.map((name, index) => ({
      id: index + 1,
      name,
      date: "",
      published: false,
    }))
  );

  const updateDate = (id, date) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              date,
            }
          : row
      )
    );
  };

  const togglePublished = (id) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              published: !row.published,
            }
          : row
      )
    );
  };

  const submitDate = (row) => {
    if (!row.date) {
      window.alert("Please select publish date first.");
      return;
    }

    window.alert(`Publish date saved for ${row.name}.`);
  };

  return (
    <PageRoot>
      <div className="space-y-10">
        <Panel title="Result Publish Search">
          <FormBody>
            <TwoColumnForm>
              <Field label="Session Year:">
                <SessionSelect
                  value={session}
                  onChange={(e) => setSession(e.target.value)}
                />
              </Field>

              <Field label="Exam:">
                <ExamSelect
                  value={exam}
                  onChange={(e) => setExam(e.target.value)}
                />
              </Field>
            </TwoColumnForm>

            <div className="mt-5 sm:ml-[175px]">
              <ActionButtons searchOnly onSearch={() => {}} />
            </div>
          </FormBody>
        </Panel>

        <Panel title="Result Publish List">
          <div className="overflow-x-auto p-4">
            <table className="table table-sm min-w-[1050px] border-collapse">
              <thead>
                <tr className="bg-white text-black">
                  <th className="w-14 border border-slate-300">#</th>
                  <th className="border border-slate-300">Exam Name</th>
                  <th className="w-[48%] border border-slate-300">
                    Publish Date
                  </th>
                  <th className="w-[130px] border border-slate-300">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="odd:bg-[#eeeeee] even:bg-white"
                  >
                    <td className="border border-slate-300">{row.id}</td>

                    <td className="border border-slate-300">
                      {row.name}
                    </td>

                    <td className="border border-slate-300 p-1">
                      <div className="flex min-w-[520px]">
                        <input
                          type="date"
                          value={row.date}
                          onChange={(e) =>
                            updateDate(row.id, e.target.value)
                          }
                          className="input input-bordered input-sm h-8 min-h-8 flex-1 rounded-r-none border-slate-300 bg-slate-100 text-[13px]"
                        />

                        <Button
                          color="green"
                          className="rounded-l-none"
                          onClick={() => submitDate(row)}
                        >
                          Submit
                        </Button>
                      </div>
                    </td>

                    <td className="border border-slate-300">
                      <input
                        type="checkbox"
                        className="toggle toggle-sm"
                        checked={row.published}
                        onChange={() => togglePublished(row.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </PageRoot>
  );
}

/* =========================================================
   13. EXAM RESULT SUMMARY
========================================================= */

export function ExamResultSummaryPage() {
  const [session, setSession] = useState("2026");
  const [exam, setExam] = useState("");

  return (
    <PageRoot>
      <div className="space-y-7">
        <Panel title="Exam Result Summary Search">
          <FormBody>
            <TwoColumnForm>
              <Field label="Session Year:">
                <SessionSelect
                  value={session}
                  onChange={(e) => setSession(e.target.value)}
                />
              </Field>

              <Field label="Exam:">
                <ExamSelect
                  value={exam}
                  onChange={(e) => setExam(e.target.value)}
                />
              </Field>
            </TwoColumnForm>

            <div className="mt-5 sm:ml-[175px]">
              <ActionButtons noExcel onSearch={() => {}} />
            </div>
          </FormBody>
        </Panel>

        <EmptyResultPanel title="Exam Result Summary" />
      </div>
    </PageRoot>
  );
}

/* =========================================================
   14. STUDENT RESULT SUMMARY
   Separate screenshot was not included, so this follows
   the same existing Result UI and student search pattern.
========================================================= */

export function StudentResultSummaryPage() {
  const { form, update } = useCommonResultForm();

  return (
    <PageRoot>
      <div className="space-y-7">
        <Panel title="Student Result Summary Search">
          <FormBody>
            <TwoColumnForm>
              <Field label="Session Year:">
                <SessionSelect
                  value={form.session}
                  onChange={(e) => update("session", e.target.value)}
                />
              </Field>

              <Field label="Exam:">
                <ExamSelect
                  value={form.exam}
                  onChange={(e) => update("exam", e.target.value)}
                />
              </Field>

              <Field label="School Shift:">
                <ShiftSelect
                  value={form.shift}
                  onChange={(e) => update("shift", e.target.value)}
                />
              </Field>

              <Field label="Class:">
                <ClassSelect
                  value={form.className}
                  onChange={(e) => update("className", e.target.value)}
                />
              </Field>

              <Field label="Section:">
                <SectionSelect
                  value={form.section}
                  onChange={(e) => update("section", e.target.value)}
                />
              </Field>

              <Field label="Group:">
                <GroupSelect
                  value={form.group}
                  onChange={(e) => update("group", e.target.value)}
                />
              </Field>

              <Field label="Roll:">
                <Input
                  placeholder="Enter roll"
                  value={form.roll}
                  onChange={(e) => update("roll", e.target.value)}
                />
              </Field>

              <Field label="Student ID:">
                <Input
                  placeholder="Enter Student ID"
                  value={form.studentId}
                  onChange={(e) =>
                    update("studentId", e.target.value)
                  }
                />
              </Field>
            </TwoColumnForm>

            <div className="mt-5 sm:ml-[175px]">
              <ActionButtons noExcel onSearch={() => {}} />
            </div>
          </FormBody>
        </Panel>

        <EmptyResultPanel title="Student Result Summary" />
      </div>
    </PageRoot>
  );
}