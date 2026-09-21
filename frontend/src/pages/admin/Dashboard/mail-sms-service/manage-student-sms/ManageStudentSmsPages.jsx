import { useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";
import { motion } from "framer-motion";

/* =========================================================
   CONSTANTS
========================================================= */

const TODAY = "2026-09-18";

const sessions = [
  "2026",
  "2025",
  "2024",
];

const shifts = [
  "Morning",
  "Day",
  "Evening",
];

const classes = [
  "Class 09",
  "Class 10",
  "HSC",
  "SSC",
];

const sections = [
  "Day",
  "A",
  "B",
  "EXAM BATCH",
];

const groups = [
  "Science",
  "Business",
  "Humanities",
];

const smsCategories = [
  "Admission SMS",
  "Attendance SMS",
  "Absent SMS",
  "Fees Collection SMS",
  "Due Fees SMS",
  "Subject Wise Result SMS",
  "Result SMS",
];

const exams = [
  "PRE MODEL TEST 01 SSC 2027",
  "Half Yearly Examination",
  "Annual Examination",
  "Test Examination",
];

const subjects = [
  "Bangla",
  "English",
  "Mathematics",
  "Information & communication technology",
  "Physics",
  "Chemistry",
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
   ROUTING
========================================================= */

function useStudentSmsNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const goSibling = (slug) => {
    const current =
      location.pathname.replace(
        /\/+$/,
        ""
      );

    const parent =
      current.substring(
        0,
        current.lastIndexOf("/")
      );

    navigate(`${parent}/${slug}`);
  };

  return {
    goStudentSmsList: () =>
      goSibling("student-sms-list"),
  };
}

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
      className="min-h-[calc(100vh-60px)] bg-[#f5f5f5] p-2 sm:p-4"
    >
      {children}
    </motion.div>
  );
}

function Panel({
  title,
  action,
  children,
}) {
  return (
    <section className="overflow-hidden rounded-md border border-base-300 bg-white shadow-sm">
      <div className="flex min-h-[40px] items-center justify-between gap-3 bg-[#456db5] px-4 py-2 text-white sm:px-5">
        <h2 className="text-base font-bold sm:text-lg">
          {title}
        </h2>

        {action}
      </div>

      {children}
    </section>
  );
}

function HeaderButton({
  children,
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

function Input({
  className = "",
  ...props
}) {
  return (
    <input
      {...props}
      className={`input input-bordered input-sm h-8 min-h-8 w-full rounded-[3px] bg-white ${className}`}
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
      className={`select select-bordered select-sm h-8 min-h-8 w-full rounded-[3px] bg-white ${className}`}
    >
      {children}
    </select>
  );
}

function Field({
  label,
  required = false,
  children,
}) {
  return (
    <div className="grid items-center gap-3 sm:grid-cols-[185px_minmax(0,1fr)]">
      <label className="text-sm font-medium text-black">
        {label}

        {required && (
          <span className="text-red-500">
            *
          </span>
        )}
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
  color = "cyan",
  onClick,
}) {
  let style =
    "border-cyan-600 bg-cyan-600 hover:border-cyan-700 hover:bg-cyan-700";

  if (color === "purple") {
    style =
      "border-violet-700 bg-violet-700 hover:border-violet-800 hover:bg-violet-800";
  }

  if (color === "green") {
    style =
      "border-green-600 bg-green-600 hover:border-green-700 hover:bg-green-700";
  }

  return (
    <motion.button
      whileTap={{
        scale: 0.96,
      }}
      type="button"
      onClick={onClick}
      className={`btn btn-sm min-h-0 text-white ${style}`}
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

function RequiredNotice() {
  return (
    <div className="rounded border border-[#f5dda0] bg-[#fff3cd] px-5 py-4 text-sm font-bold text-red-500">
      (*) field required
    </div>
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
}) {
  return (
    <Select
      value={value}
      onChange={onChange}
    >
      <option value="">
        Select Shift
      </option>

      {shifts.map((shift) => (
        <option
          key={shift}
          value={shift}
        >
          {shift}
        </option>
      ))}
    </Select>
  );
}

function ClassSelect({
  value,
  onChange,
  capital = false,
}) {
  return (
    <Select
      value={value}
      onChange={onChange}
    >
      <option value="">
        {capital
          ? "Select Class"
          : "Select class"}
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

function SectionSelect({
  value,
  onChange,
}) {
  return (
    <Select
      value={value}
      onChange={onChange}
    >
      <option value="">
        Select Section
      </option>

      {sections.map(
        (section) => (
          <option
            key={section}
            value={section}
          >
            {section}
          </option>
        )
      )}
    </Select>
  );
}

/* =========================================================
   1. STUDENT SMS LIST
========================================================= */

export function StudentSmsListPage() {
  const {
    goStudentSmsList,
  } = useStudentSmsNavigation();

  const [form, setForm] =
    useState({
      session: "2026",
      shift: "",
      className: "",
      section: "",
      roll: "",
      smsCategory: "",
      fromDate: TODAY,
      toDate: TODAY,
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

  return (
    <PageRoot>
      <div className="rounded bg-[#efefef] p-4 pb-12">
        <Panel
          title="Student SMS Search"
          action={
            <HeaderButton
              onClick={
                goStudentSmsList
              }
            >
              Back to Student sms
              List
            </HeaderButton>
          }
        >
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

              <Field label="Section:">
                <SectionSelect
                  value={
                    form.section
                  }
                  onChange={(e) =>
                    update(
                      "section",
                      e.target.value
                    )
                  }
                />
              </Field>

              <Field label="Roll:">
                <Input
                  value={form.roll}
                  onChange={(e) =>
                    update(
                      "roll",
                      e.target.value
                    )
                  }
                />
              </Field>

              <Field label="Sms Category:">
                <Select
                  value={
                    form.smsCategory
                  }
                  onChange={(e) =>
                    update(
                      "smsCategory",
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Select Sms
                    Category
                  </option>

                  {smsCategories.map(
                    (category) => (
                      <option
                        key={
                          category
                        }
                        value={
                          category
                        }
                      >
                        {category}
                      </option>
                    )
                  )}
                </Select>
              </Field>

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
                  value={form.toDate}
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
                  color="purple"
                  onClick={() =>
                    console.log(
                      form
                    )
                  }
                />

                <PrintButton />
              </ButtonOffset>
            </FormGrid>
          </div>
        </Panel>
      </div>
    </PageRoot>
  );
}

/* =========================================================
   ADMISSION SEARCH SHARED
========================================================= */

function AdmissionStudentSearch({
  title,
}) {
  const [form, setForm] =
    useState({
      session: "2026",
      shift: "",
      className: "",
      section: "",
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

  return (
    <PageRoot>
      <Panel title={title}>
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

            <Field label="Section:">
              <SectionSelect
                value={
                  form.section
                }
                onChange={(e) =>
                  update(
                    "section",
                    e.target.value
                  )
                }
              />
            </Field>

            <ButtonOffset>
              <SearchButton
                onClick={() =>
                  console.log(form)
                }
              />
            </ButtonOffset>
          </FormGrid>

          <div className="min-h-[25px]" />
        </div>
      </Panel>
    </PageRoot>
  );
}

/* =========================================================
   2. STUDENT ADMISSION ONLINE
========================================================= */

export function StudentAdmissionOnlinePage() {
  return (
    <AdmissionStudentSearch title="Online Admission Student Search" />
  );
}

/* =========================================================
   3. STUDENT ADMISSION SOFTWARE
========================================================= */

export function StudentAdmissionSoftwarePage() {
  return (
    <AdmissionStudentSearch title="Software Admission Student Search" />
  );
}

/* =========================================================
   4. STUDENT ATTENDANCE SMS CREATE
========================================================= */

export function StudentAttendanceSmsCreatePage() {
  const [form, setForm] =
    useState({
      session: "2026",
      shift: "",
      className: "",
      section: "",
      roll: "",
      month: "",
      fromDate: TODAY,
      toDate: TODAY,
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

  return (
    <PageRoot>
      <Panel title="Student Attendance">
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

            <Field label="Section:">
              <SectionSelect
                value={
                  form.section
                }
                onChange={(e) =>
                  update(
                    "section",
                    e.target.value
                  )
                }
              />
            </Field>

            <Field label="Roll :">
              <Input
                value={form.roll}
                onChange={(e) =>
                  update(
                    "roll",
                    e.target.value
                  )
                }
                placeholder="Enter Roll"
              />
            </Field>

            <Field label="Month:">
              <Select
                value={form.month}
                onChange={(e) =>
                  update(
                    "month",
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select Month
                </option>

                {months.map(
                  (month) => (
                    <option
                      key={month}
                      value={month}
                    >
                      {month}
                    </option>
                  )
                )}
              </Select>
            </Field>

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
                value={form.toDate}
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
                onClick={() =>
                  console.log(
                    "In search",
                    form
                  )
                }
              >
                In Search
              </SearchButton>

              <SearchButton
                onClick={() =>
                  console.log(
                    "Out search",
                    form
                  )
                }
              >
                Out Search
              </SearchButton>
            </ButtonOffset>
          </FormGrid>

          <div className="min-h-[15px]" />
        </div>
      </Panel>
    </PageRoot>
  );
}

/* =========================================================
   5. STUDENT ABSENT SMS CREATE
========================================================= */

export function StudentAbsentSmsCreatePage() {
  const [form, setForm] =
    useState({
      session: "2026",
      shift: "",
      className: "",
      section: "",
      roll: "",
      fromDate: TODAY,
      toDate: TODAY,
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

  return (
    <PageRoot>
      <Panel title="Student Absent">
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

            <Field label="Section:">
              <SectionSelect
                value={
                  form.section
                }
                onChange={(e) =>
                  update(
                    "section",
                    e.target.value
                  )
                }
              />
            </Field>

            <Field label="Roll :">
              <Input
                value={form.roll}
                onChange={(e) =>
                  update(
                    "roll",
                    e.target.value
                  )
                }
                placeholder="Enter Roll"
              />
            </Field>

            <div />

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
                value={form.toDate}
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
                onClick={() =>
                  console.log(form)
                }
              />
            </ButtonOffset>
          </FormGrid>

          <div className="min-h-[25px]" />
        </div>
      </Panel>
    </PageRoot>
  );
}

/* =========================================================
   6. FEES COLLECTION SMS
========================================================= */

export function StudentFeesCollectionSmsCreatePage() {
  const {
    goStudentSmsList,
  } = useStudentSmsNavigation();

  const [form, setForm] =
    useState({
      session: "2026",
      shift: "",
      className: "",
      section: "",
      roll: "",
      studentId: "",
      fromDate: "",
      toDate: "",
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

  return (
    <PageRoot>
      <Panel
        title="Fees Collection SMS Create"
        action={
          <HeaderButton
            onClick={
              goStudentSmsList
            }
          >
            Back to Student sms
            List
          </HeaderButton>
        }
      >
        <div className="space-y-5 p-5">
          <RequiredNotice />

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

            <Field label="Section:">
              <SectionSelect
                value={
                  form.section
                }
                onChange={(e) =>
                  update(
                    "section",
                    e.target.value
                  )
                }
              />
            </Field>

            <Field label="Roll:">
              <Input
                value={form.roll}
                onChange={(e) =>
                  update(
                    "roll",
                    e.target.value
                  )
                }
                placeholder="Roll No"
              />
            </Field>

            <Field label="Student ID:">
              <Input
                value={
                  form.studentId
                }
                onChange={(e) =>
                  update(
                    "studentId",
                    e.target.value
                  )
                }
                placeholder="Student ID"
              />
            </Field>

            <Field label="Payment Date From:">
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
                placeholder="Enter From Date"
              />
            </Field>

            <Field label="Payment Date To:">
              <Input
                type="date"
                value={form.toDate}
                onChange={(e) =>
                  update(
                    "toDate",
                    e.target.value
                  )
                }
                placeholder="Enter To Date"
              />
            </Field>

            <ButtonOffset>
              <SearchButton
                onClick={() =>
                  console.log(form)
                }
              />
            </ButtonOffset>
          </FormGrid>

          <div className="min-h-[45px]" />
        </div>
      </Panel>
    </PageRoot>
  );
}

/* =========================================================
   7. STUDENT DUE FEES SMS
========================================================= */

export function StudentDueFeesSmsCreatePage() {
  const [form, setForm] =
    useState({
      session: "2026",
      shift: "",
      className: "",
      section: "",
      group: "",
      roll: "",
      billMonth: "September",
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

  return (
    <PageRoot>
      <Panel title="Student Due Fees Search">
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

            <Field label="Section:">
              <SectionSelect
                value={
                  form.section
                }
                onChange={(e) =>
                  update(
                    "section",
                    e.target.value
                  )
                }
              />
            </Field>

            <Field label="Group:">
              <Select
                value={form.group}
                onChange={(e) =>
                  update(
                    "group",
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select Group
                </option>

                {groups.map(
                  (group) => (
                    <option
                      key={group}
                      value={group}
                    >
                      {group}
                    </option>
                  )
                )}
              </Select>
            </Field>

            <Field label="Roll:">
              <Input
                value={form.roll}
                onChange={(e) =>
                  update(
                    "roll",
                    e.target.value
                  )
                }
                placeholder="Roll No"
              />
            </Field>

            <Field label="Bill month :">
              <Select
                value={
                  form.billMonth
                }
                onChange={(e) =>
                  update(
                    "billMonth",
                    e.target.value
                  )
                }
              >
                {months.map(
                  (month) => (
                    <option
                      key={month}
                      value={month}
                    >
                      {month}
                    </option>
                  )
                )}
              </Select>
            </Field>

            <div />

            <ButtonOffset>
              <SearchButton
                onClick={() =>
                  console.log(form)
                }
              />
            </ButtonOffset>
          </FormGrid>

          <div className="min-h-[20px]" />
        </div>
      </Panel>
    </PageRoot>
  );
}

/* =========================================================
   8. SUBJECT WISE RESULT SMS
========================================================= */

export function SubjectWiseResultSmsPage() {
  const [form, setForm] =
    useState({
      session: "2026",
      exam: "",
      shift: "",
      className: "",
      section: "",
      group: "",
      subject: "",
      mobileNumber:
        "Contact Number",
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

  return (
    <PageRoot>
      <div className="space-y-8">
        <Panel title="Subject Wise Merit List">
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

              <Field label="Exam:">
                <Select
                  value={form.exam}
                  onChange={(e) =>
                    update(
                      "exam",
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Select Exam
                  </option>

                  {exams.map(
                    (exam) => (
                      <option
                        key={exam}
                        value={exam}
                      >
                        {exam}
                      </option>
                    )
                  )}
                </Select>
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

              <Field label="Section:">
                <SectionSelect
                  value={
                    form.section
                  }
                  onChange={(e) =>
                    update(
                      "section",
                      e.target.value
                    )
                  }
                />
              </Field>

              <Field label="Group:">
                <Select
                  value={form.group}
                  onChange={(e) =>
                    update(
                      "group",
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Select Group
                  </option>

                  {groups.map(
                    (group) => (
                      <option
                        key={group}
                        value={group}
                      >
                        {group}
                      </option>
                    )
                  )}
                </Select>
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

              <div />

              <Field label="Mobile Number:">
                <Select
                  value={
                    form.mobileNumber
                  }
                  onChange={(e) =>
                    update(
                      "mobileNumber",
                      e.target.value
                    )
                  }
                >
                  <option>
                    Contact Number
                  </option>

                  <option>
                    Father Mobile
                  </option>

                  <option>
                    Mother Mobile
                  </option>
                </Select>
              </Field>

              <div />

              <ButtonOffset>
                <SearchButton
                  color="green"
                  onClick={() =>
                    console.log(form)
                  }
                />
              </ButtonOffset>
            </FormGrid>

            <div className="min-h-[20px]" />
          </div>
        </Panel>

        <div className="min-h-[40px] rounded-md border border-base-300 bg-white shadow-sm" />
      </div>
    </PageRoot>
  );
}

/* =========================================================
   9. RESULT SMS
========================================================= */

export function ResultSmsPage() {
  const [form, setForm] =
    useState({
      session: "2026",
      exam: "",
      shift: "",
      className: "",
      section: "",
      mobileNumber:
        "Contact Number",
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

  return (
    <PageRoot>
      <div className="space-y-6">
        <Panel title="Exam Result">
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

              <Field label="Exam:">
                <Select
                  value={form.exam}
                  onChange={(e) =>
                    update(
                      "exam",
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Select Exam
                  </option>

                  {exams.map(
                    (exam) => (
                      <option
                        key={exam}
                        value={exam}
                      >
                        {exam}
                      </option>
                    )
                  )}
                </Select>
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
                  capital
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

              <Field label="Section:">
                <SectionSelect
                  value={
                    form.section
                  }
                  onChange={(e) =>
                    update(
                      "section",
                      e.target.value
                    )
                  }
                />
              </Field>

              <Field label="Mobile Number:">
                <Select
                  value={
                    form.mobileNumber
                  }
                  onChange={(e) =>
                    update(
                      "mobileNumber",
                      e.target.value
                    )
                  }
                >
                  <option>
                    Contact Number
                  </option>

                  <option>
                    Father Mobile
                  </option>

                  <option>
                    Mother Mobile
                  </option>
                </Select>
              </Field>

              <ButtonOffset>
                <SearchButton
                  onClick={() =>
                    console.log(form)
                  }
                />
              </ButtonOffset>
            </FormGrid>

            <div className="min-h-[15px]" />
          </div>
        </Panel>

        <Panel title="Student List">
          <div className="min-h-[20px]" />
        </Panel>
      </div>
    </PageRoot>
  );
}