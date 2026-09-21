import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

/* =========================================================
   HELPERS
========================================================= */

function getToday() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const today = getToday();

const designations = [
  "Teacher",
  "Senior Teacher",
  "Assistant Teacher",
  "Lecturer",
  "Accountant",
  "Office Assistant",
  "Employee",
];

const employees = [
  "Deen Islam",
  "K M ABDULLAH",
  "MD NAIMUR RAHMAN",
  "Rasel Ahmed",
  "Uzzal Kumar",
];

const smsCategories = [
  "Joining SMS",
  "Attendance SMS",
  "Absent SMS",
  "Salary SMS",
  "General SMS",
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
   SHARED UI
========================================================= */

function PageRoot({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
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
}) {
  return (
    <section className="overflow-hidden rounded-md border border-base-300 bg-white shadow-sm">
      <div className="flex min-h-[40px] items-center justify-between gap-3 bg-[#456db5] px-3 py-2 text-white sm:px-5">
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
      className={`input input-bordered input-sm h-8 min-h-8 w-full rounded-[3px] bg-white ${className}`}
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

function FormField({
  label,
  required = false,
  children,
}) {
  return (
    <div className="grid items-center gap-3 sm:grid-cols-[165px_minmax(0,1fr)]">
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

function SearchButton({
  children = "Search",
  color = "cyan",
  onClick,
}) {
  const styles =
    color === "purple"
      ? "border-violet-700 bg-violet-700 hover:border-violet-800 hover:bg-violet-800"
      : "border-cyan-600 bg-cyan-600 hover:border-cyan-700 hover:bg-cyan-700";

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      type="button"
      onClick={onClick}
      className={`btn btn-sm min-h-0 text-white ${styles}`}
    >
      {children}
    </motion.button>
  );
}

function PrintButton() {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      type="button"
      onClick={() => window.print()}
      className="btn btn-success btn-sm min-h-0 text-white"
    >
      Print
    </motion.button>
  );
}

/* =========================================================
   1. TEACHER / EMPLOYEE SMS LIST
========================================================= */

export function TeacherEmployeeSmsListPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    teacherEmployee: "",
    smsCategory: "",
    fromDate: today,
    toDate: today,
  });

  const change = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSearch = () => {
    console.log(
      "Teacher/Employee SMS search:",
      form
    );
  };

  return (
    <PageRoot>
      <Panel
        title="Teacher & Employee SMS Search"
        action={
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-info btn-sm min-h-0 text-white"
          >
            Back to Hr sms List
          </button>
        }
      >
        <div className="px-5 py-5 sm:px-8">
          <div className="mx-auto grid max-w-6xl gap-x-7 gap-y-5 lg:grid-cols-2">
            <FormField label="Teacher & Employee">
              <Select
                value={form.teacherEmployee}
                onChange={(e) =>
                  change(
                    "teacherEmployee",
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select Teacher
                </option>

                {employees.map((employee) => (
                  <option
                    key={employee}
                    value={employee}
                  >
                    {employee}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Sms Category:">
              <Select
                value={form.smsCategory}
                onChange={(e) =>
                  change(
                    "smsCategory",
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select Sms Category
                </option>

                {smsCategories.map(
                  (category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  )
                )}
              </Select>
            </FormField>

            <FormField label="From Date:">
              <Input
                type="date"
                value={form.fromDate}
                onChange={(e) =>
                  change(
                    "fromDate",
                    e.target.value
                  )
                }
              />
            </FormField>

            <FormField label="To Date:">
              <Input
                type="date"
                value={form.toDate}
                onChange={(e) =>
                  change(
                    "toDate",
                    e.target.value
                  )
                }
              />
            </FormField>

            <div className="lg:col-start-1">
              <div className="flex gap-1 sm:ml-[178px]">
                <SearchButton
                  color="purple"
                  onClick={handleSearch}
                />

                <PrintButton />
              </div>
            </div>
          </div>

          <div className="min-h-[5px]" />
        </div>
      </Panel>
    </PageRoot>
  );
}

/* =========================================================
   2. TEACHER / EMPLOYEE JOINING SMS CREATE
========================================================= */

export function TeacherEmployeeJoiningSmsCreatePage() {
  const [form, setForm] = useState({
    designation: "",
    employee: "",
  });

  const change = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <PageRoot>
      <Panel title="Software Joining Teacher/Employee Search">
        <div className="px-5 py-5 sm:px-6">
          <div className="grid gap-x-7 gap-y-5 lg:grid-cols-2">
            <FormField label="Designation:">
              <Select
                value={form.designation}
                onChange={(e) =>
                  change(
                    "designation",
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select Designation
                </option>

                {designations.map(
                  (designation) => (
                    <option
                      key={designation}
                      value={designation}
                    >
                      {designation}
                    </option>
                  )
                )}
              </Select>
            </FormField>

            <FormField label="Employee:">
              <Select
                value={form.employee}
                onChange={(e) =>
                  change(
                    "employee",
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select Employee
                </option>

                {employees.map((employee) => (
                  <option
                    key={employee}
                    value={employee}
                  >
                    {employee}
                  </option>
                ))}
              </Select>
            </FormField>

            <div className="lg:col-start-1">
              <div className="sm:ml-[178px]">
                <SearchButton
                  onClick={() =>
                    console.log(
                      "Joining SMS search:",
                      form
                    )
                  }
                />
              </div>
            </div>
          </div>

          <div className="min-h-[30px]" />
        </div>
      </Panel>
    </PageRoot>
  );
}

/* =========================================================
   3. TEACHER / EMPLOYEE ATTENDANCE SMS CREATE
========================================================= */

export function TeacherEmployeeAttendanceSmsCreatePage() {
  const [form, setForm] = useState({
    designation: "",
    month: "",
    fromDate: today,
    toDate: today,
  });

  const change = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSearch = (type) => {
    console.log(
      `Attendance ${type} Search`,
      form
    );
  };

  return (
    <PageRoot>
      <Panel title="Teacher/Employee Attendance">
        <div className="px-5 py-5 sm:px-8">
          <div className="mx-auto grid max-w-6xl gap-x-7 gap-y-5 lg:grid-cols-2">
            <FormField
              label="Designation:"
              required
            >
              <Select
                value={form.designation}
                onChange={(e) =>
                  change(
                    "designation",
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select Designation
                </option>

                {designations.map(
                  (designation) => (
                    <option
                      key={designation}
                      value={designation}
                    >
                      {designation}
                    </option>
                  )
                )}
              </Select>
            </FormField>

            <FormField label="Month:">
              <Select
                value={form.month}
                onChange={(e) =>
                  change(
                    "month",
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select Month
                </option>

                {months.map((month) => (
                  <option
                    key={month}
                    value={month}
                  >
                    {month}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="From Date:">
              <Input
                type="date"
                value={form.fromDate}
                onChange={(e) =>
                  change(
                    "fromDate",
                    e.target.value
                  )
                }
              />
            </FormField>

            <FormField label="To Date:">
              <Input
                type="date"
                value={form.toDate}
                onChange={(e) =>
                  change(
                    "toDate",
                    e.target.value
                  )
                }
              />
            </FormField>

            <div className="lg:col-start-1">
              <div className="flex gap-1 sm:ml-[178px]">
                <SearchButton
                  onClick={() =>
                    handleSearch("In")
                  }
                >
                  In Search
                </SearchButton>

                <SearchButton
                  onClick={() =>
                    handleSearch("Out")
                  }
                >
                  Out Search
                </SearchButton>
              </div>
            </div>
          </div>

          <div className="min-h-[10px]" />
        </div>
      </Panel>
    </PageRoot>
  );
}

/* =========================================================
   4. TEACHER / EMPLOYEE ABSENT SMS CREATE
========================================================= */

export function TeacherEmployeeAbsentSmsCreatePage() {
  const [form, setForm] = useState({
    designation: "",
    employee: "",
    fromDate: today,
    toDate: today,
  });

  const change = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <PageRoot>
      <Panel title="Teacher/Employee Absent List">
        <div className="px-5 py-5 sm:px-8">
          <div className="mx-auto grid max-w-6xl gap-x-7 gap-y-5 lg:grid-cols-2">
            <FormField label="Designation:">
              <Select
                value={form.designation}
                onChange={(e) =>
                  change(
                    "designation",
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select Designation
                </option>

                {designations.map(
                  (designation) => (
                    <option
                      key={designation}
                      value={designation}
                    >
                      {designation}
                    </option>
                  )
                )}
              </Select>
            </FormField>

            <FormField label="Employee:">
              <Select
                value={form.employee}
                onChange={(e) =>
                  change(
                    "employee",
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select Employee
                </option>

                {employees.map((employee) => (
                  <option
                    key={employee}
                    value={employee}
                  >
                    {employee}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="From Date:">
              <Input
                type="date"
                value={form.fromDate}
                onChange={(e) =>
                  change(
                    "fromDate",
                    e.target.value
                  )
                }
              />
            </FormField>

            <FormField label="To Date:">
              <Input
                type="date"
                value={form.toDate}
                onChange={(e) =>
                  change(
                    "toDate",
                    e.target.value
                  )
                }
              />
            </FormField>

            <div className="lg:col-start-1">
              <div className="sm:ml-[178px]">
                <SearchButton
                  onClick={() =>
                    console.log(
                      "Absent SMS search:",
                      form
                    )
                  }
                />
              </div>
            </div>
          </div>

          <div className="min-h-[25px]" />
        </div>
      </Panel>
    </PageRoot>
  );
}

/* =========================================================
   5. TEACHER / EMPLOYEE SALARY SMS CREATE
========================================================= */

export function TeacherEmployeeSalarySmsCreatePage() {
  const currentYear =
    new Date().getFullYear();

  const currentMonth =
    months[new Date().getMonth()];

  const [form, setForm] = useState({
    designation: "",
    employee: "",
    year: String(currentYear),
    month: currentMonth,
  });

  const change = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <PageRoot>
      <Panel title="Teacher/Employee Salary Search">
        <div className="px-5 py-5 sm:px-6">
          <div className="grid gap-x-7 gap-y-5 lg:grid-cols-2">
            <FormField label="Designation:">
              <Select
                value={form.designation}
                onChange={(e) =>
                  change(
                    "designation",
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select Designation
                </option>

                {designations.map(
                  (designation) => (
                    <option
                      key={designation}
                      value={designation}
                    >
                      {designation}
                    </option>
                  )
                )}
              </Select>
            </FormField>

            <FormField label="Employee:">
              <Select
                value={form.employee}
                onChange={(e) =>
                  change(
                    "employee",
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select Employee
                </option>

                {employees.map((employee) => (
                  <option
                    key={employee}
                    value={employee}
                  >
                    {employee}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Salary Month:">
              <div className="grid grid-cols-2">
                <Select
                  value={form.year}
                  onChange={(e) =>
                    change(
                      "year",
                      e.target.value
                    )
                  }
                  className="rounded-r-none"
                >
                  {[
                    currentYear,
                    currentYear - 1,
                    currentYear - 2,
                  ].map((year) => (
                    <option
                      key={year}
                      value={year}
                    >
                      {year}
                    </option>
                  ))}
                </Select>

                <Select
                  value={form.month}
                  onChange={(e) =>
                    change(
                      "month",
                      e.target.value
                    )
                  }
                  className="rounded-l-none border-l-0"
                >
                  {months.map((month) => (
                    <option
                      key={month}
                      value={month}
                    >
                      {month}
                    </option>
                  ))}
                </Select>
              </div>
            </FormField>

            <div />

            <div className="lg:col-start-1">
              <div className="sm:ml-[178px]">
                <SearchButton
                  onClick={() =>
                    console.log(
                      "Salary SMS search:",
                      form
                    )
                  }
                />
              </div>
            </div>
          </div>

          <div className="min-h-[25px]" />
        </div>
      </Panel>
    </PageRoot>
  );
}