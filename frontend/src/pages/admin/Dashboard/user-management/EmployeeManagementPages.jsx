import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  BadgeCheck,
  Download,
  Edit3,
  Eye,
  FileSpreadsheet,
  IdCard,
  KeyRound,
  Plus,
  Printer,
  RotateCcw,
  Search,
  Trash2,
  Upload,
  UserPlus,
} from "lucide-react";

import {
  demoEmployees,
  employeeDesignations,
  employeeGenders,
  employeePayrollTypes,
  employeeReligions,
  employeeShifts,
} from "./../data/employeeAdminData.js";
import { UserManagementNav } from "./UserManagementDashboard.jsx";

import "./../styles/studentManagement.css";


/* =========================================================
   STORAGE
========================================================= */

const STORAGE_KEY = "expertDemoEmployees";

function getEmployees() {
  try {
    const saved =
      localStorage.getItem(STORAGE_KEY);

    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error(error);
  }

  return demoEmployees;
}

function saveEmployees(employees) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(employees)
  );
}


/* =========================================================
   COMMON UI
========================================================= */

function Panel({
  title,
  action,
  children,
}) {
  return (
    <section className="student-panel">
      <div className="student-panel-title">
        <span>{title}</span>

        {action && (
          <div className="student-panel-action">
            {action}
          </div>
        )}
      </div>

      <div className="student-panel-body">
        {children}
      </div>
    </section>
  );
}


function EmployeeButton() {
  return (
    <Link
      to="../employee-quick-entry"
      className="student-btn student-btn-secondary"
    >
      <UserPlus size={15} />
      Create Employee
    </Link>
  );
}


function Field({
  label,
  children,
  required = false,
}) {
  return (
    <div className="student-field">
      <label>
        {label}

        {required && (
          <span className="required-star">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}


function Select({
  value,
  onChange,
  options,
  placeholder = "Select",
  name,
}) {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="student-input"
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


/* =========================================================
   EMPLOYEE LIST
========================================================= */

export function EmployeeList() {
  const [employees, setEmployees] =
    useState(getEmployees);

  const [search, setSearch] =
    useState("");

  const [pageSize, setPageSize] =
    useState(50);

  useEffect(() => {
    saveEmployees(employees);
  }, [employees]);

  const activeEmployees = useMemo(
    () =>
      employees.filter(
        (employee) =>
          !employee.disabled &&
          [
            employee.employeeId,
            employee.name,
            employee.mobile,
            employee.email,
            employee.designation,
          ]
            .join(" ")
            .toLowerCase()
            .includes(
              search.toLowerCase()
            )
      ),
    [employees, search]
  );

  const removeEmployee = (id) => {
    if (
      !window.confirm(
        "Delete this employee?"
      )
    ) {
      return;
    }

    setEmployees((previous) =>
      previous.filter(
        (employee) =>
          employee.id !== id
      )
    );
  };

  return (
    <div className="student-admin-page">
      <UserManagementNav />
      <Panel
        title="Employee List"
        action={
          <div className="student-action-row employee-header-actions">
            <button
              type="button"
              className="student-btn student-btn-success"
              onClick={() => window.print()}
            >
              <IdCard size={14} />
              CV Print
            </button>

            <EmployeeButton />

            <button
              type="button"
              className="student-btn student-btn-secondary"
            >
              <Download size={14} />
              Pdf Download
            </button>

            <button
              type="button"
              className="student-btn student-btn-secondary"
            >
              <FileSpreadsheet
                size={14}
              />
              Excel
            </button>
          </div>
        }
      >
        <div className="employee-table-controls">
          <label>
            <select
              value={pageSize}
              onChange={(event) =>
                setPageSize(
                  Number(
                    event.target.value
                  )
                )
              }
              className="student-input employee-page-size"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>
                100
              </option>
            </select>

            <span>
              entries per page
            </span>
          </label>

          <label>
            <span>Search:</span>

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              className="student-input employee-search-input"
            />
          </label>
        </div>

        <div className="employee-table-wrap">
          <table className="employee-table">
            <thead>
              <tr>
                <th>SL No.</th>
                <th>Employee ID</th>
                <th>Image</th>
                <th>Signature</th>
                <th>Full Name</th>
                <th>Designation</th>
                <th>Shift</th>
                <th>Join Date</th>
                <th>Mobile</th>
                <th>Email</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {activeEmployees.length ===
              0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="employee-empty-cell"
                  >
                    No data available
                    in table
                  </td>
                </tr>
              ) : (
                activeEmployees
                  .slice(0, pageSize)
                  .map(
                    (
                      employee,
                      index
                    ) => (
                      <tr
                        key={
                          employee.id
                        }
                      >
                        <td>
                          {index + 1}
                        </td>

                        <td>
                          {
                            employee.employeeId
                          }
                        </td>

                        <td>
                          <img
                            src={
                              employee.image
                            }
                            alt={
                              employee.name
                            }
                            className="employee-avatar"
                          />
                        </td>

                        <td>
                          <div className="employee-signature-box">
                            {employee.signature
                              ? "Signature"
                              : ""}
                          </div>
                        </td>

                        <td>
                          {
                            employee.name
                          }
                        </td>

                        <td>
                          {
                            employee.designation
                          }
                        </td>

                        <td>
                          {
                            employee.shift
                          }
                        </td>

                        <td>
                          {
                            employee.joinDate
                          }
                        </td>

                        <td>
                          {
                            employee.mobile
                          }
                        </td>

                        <td>
                          {
                            employee.email
                          }
                        </td>

                        <td>
                          <div className="employee-actions">
                            <button
                              title="ID Card"
                              className="employee-action green"
                            >
                              <IdCard
                                size={
                                  14
                                }
                              />
                            </button>

                            <button
                              title="Password"
                              className="employee-action yellow"
                            >
                              <KeyRound
                                size={
                                  14
                                }
                              />
                            </button>

                            <button
                              title="Edit"
                              className="employee-action cyan"
                            >
                              <Edit3
                                size={
                                  14
                                }
                              />
                            </button>

                            <button
                              title="Delete"
                              className="employee-action red"
                              onClick={() =>
                                removeEmployee(
                                  employee.id
                                )
                              }
                            >
                              <Trash2
                                size={
                                  14
                                }
                              />
                            </button>

                            <button
                              title="View"
                              className="employee-action blue"
                            >
                              <Eye
                                size={
                                  14
                                }
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )
              )}
            </tbody>
          </table>
        </div>

        <div className="employee-table-footer">
          Showing{" "}
          {activeEmployees.length
            ? 1
            : 0}{" "}
          to{" "}
          {Math.min(
            pageSize,
            activeEmployees.length
          )}{" "}
          of {activeEmployees.length}{" "}
          entries
        </div>
      </Panel>
    </div>
  );
}


/* =========================================================
   EMPLOYEE QUICK ENTRY
========================================================= */

const emptyEmployee = {
  employeeId: "",
  name: "",
  dateOfBirth: "",
  joinDate: "",
  gender: "",
  religion: "",
  mobile: "",
  payroll: "",
  designation: "",
  shift: "",
  email: "",
};


export function EmployeeQuickEntry() {
  const [rowCount, setRowCount] =
    useState(1);

  const [rows, setRows] =
    useState([{ ...emptyEmployee }]);

  const addRows = () => {
    const amount =
      Math.max(1, Number(rowCount));

    setRows((previous) => [
      ...previous,
      ...Array.from(
        { length: amount },
        () => ({
          ...emptyEmployee,
        })
      ),
    ]);
  };

  const updateRow = (
    index,
    field,
    value
  ) => {
    setRows((previous) =>
      previous.map(
        (row, rowIndex) =>
          rowIndex === index
            ? {
                ...row,
                [field]: value,
              }
            : row
      )
    );
  };

  const submit = () => {
    const validRows =
      rows.filter(
        (row) =>
          row.name ||
          row.employeeId ||
          row.mobile
      );

    if (!validRows.length) {
      alert(
        "Please enter at least one employee."
      );
      return;
    }

    const existing =
      getEmployees();

    const created =
      validRows.map(
        (row, index) => ({
          ...row,

          id: `EMP-${Date.now()}-${index}`,

          employeeId:
            row.employeeId ||
            String(
              202700 +
                existing.length +
                index +
                1
            ),

          image:
            "https://placehold.co/80x90/e8f2ee/173d33?text=EMP",

          signature: "",

          disabled: false,

          disabledAt: "",

          remarks: "",
        })
      );

    saveEmployees([
      ...existing,
      ...created,
    ]);

    alert(
      `${created.length} employee(s) created.`
    );

    setRows([
      { ...emptyEmployee },
    ]);
  };

  return (
    <div className="student-admin-page">
      <UserManagementNav />
      <Panel
        title="Employee Quick Create"
        action={
          <div className="employee-inline-add">
            <input
              type="number"
              min="1"
              value={rowCount}
              onChange={(event) =>
                setRowCount(
                  event.target.value
                )
              }
              className="student-input"
            />

            <button
              type="button"
              onClick={addRows}
              className="student-btn student-btn-secondary"
            >
              Add
            </button>
          </div>
        }
      >
        <div className="excel-tools-grid">
          <label className="excel-upload-button">
            <Upload size={15} />

            Upload Excel Format

            <input
              type="file"
              hidden
              accept=".xlsx,.xls,.csv"
            />
          </label>

          <button
            type="button"
            className="student-btn student-btn-purple student-wide-button"
          >
            <Download size={15} />

            Employee Quick Excel
            Format
          </button>
        </div>

        <p className="student-help-text">
          ***Download Employee Excel
          Format. Fill it with employee
          information and upload the
          file for quick data entry.
        </p>
      </Panel>


      <Panel title="Employee Create">
        <div className="employee-info-alert info">
          Employee password will be
          considered as employee mobile
          number. Password can be
          changed later.
        </div>

        <div className="employee-info-alert secondary">
          If you enter an already used
          unique ID, a new unique ID
          will be generated
          automatically.
        </div>

        <div className="student-alert">
          (*) field required
        </div>

        <div className="employee-table-wrap">
          <table className="employee-table employee-entry-table">
            <thead>
              <tr>
                <th>
                  Employee ID
                </th>
                <th>Name</th>
                <th>
                  Date Of Birth
                </th>
                <th>Join Date</th>
                <th>Gender</th>
                <th>Religion</th>
                <th>Mobile</th>
                <th>Payroll</th>
                <th>
                  Designation
                </th>
                <th>Shift</th>
                <th>Email</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {rows.map(
                (row, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        className="student-input"
                        value={
                          row.employeeId
                        }
                        onChange={(
                          event
                        ) =>
                          updateRow(
                            index,
                            "employeeId",
                            event
                              .target
                              .value
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        className="student-input"
                        value={
                          row.name
                        }
                        onChange={(
                          event
                        ) =>
                          updateRow(
                            index,
                            "name",
                            event
                              .target
                              .value
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="date"
                        className="student-input"
                        value={
                          row.dateOfBirth
                        }
                        onChange={(
                          event
                        ) =>
                          updateRow(
                            index,
                            "dateOfBirth",
                            event
                              .target
                              .value
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="date"
                        className="student-input"
                        value={
                          row.joinDate
                        }
                        onChange={(
                          event
                        ) =>
                          updateRow(
                            index,
                            "joinDate",
                            event
                              .target
                              .value
                          )
                        }
                      />
                    </td>

                    <td>
                      <Select
                        value={
                          row.gender
                        }
                        onChange={(
                          event
                        ) =>
                          updateRow(
                            index,
                            "gender",
                            event
                              .target
                              .value
                          )
                        }
                        options={
                          employeeGenders
                        }
                      />
                    </td>

                    <td>
                      <Select
                        value={
                          row.religion
                        }
                        onChange={(
                          event
                        ) =>
                          updateRow(
                            index,
                            "religion",
                            event
                              .target
                              .value
                          )
                        }
                        options={
                          employeeReligions
                        }
                      />
                    </td>

                    <td>
                      <input
                        className="student-input"
                        value={
                          row.mobile
                        }
                        onChange={(
                          event
                        ) =>
                          updateRow(
                            index,
                            "mobile",
                            event
                              .target
                              .value
                          )
                        }
                      />
                    </td>

                    <td>
                      <Select
                        value={
                          row.payroll
                        }
                        onChange={(
                          event
                        ) =>
                          updateRow(
                            index,
                            "payroll",
                            event
                              .target
                              .value
                          )
                        }
                        options={
                          employeePayrollTypes
                        }
                      />
                    </td>

                    <td>
                      <Select
                        value={
                          row.designation
                        }
                        onChange={(
                          event
                        ) =>
                          updateRow(
                            index,
                            "designation",
                            event
                              .target
                              .value
                          )
                        }
                        options={
                          employeeDesignations
                        }
                      />
                    </td>

                    <td>
                      <Select
                        value={
                          row.shift
                        }
                        onChange={(
                          event
                        ) =>
                          updateRow(
                            index,
                            "shift",
                            event
                              .target
                              .value
                          )
                        }
                        options={
                          employeeShifts
                        }
                        placeholder="Select Shift"
                      />
                    </td>

                    <td>
                      <input
                        type="email"
                        className="student-input"
                        value={
                          row.email
                        }
                        onChange={(
                          event
                        ) =>
                          updateRow(
                            index,
                            "email",
                            event
                              .target
                              .value
                          )
                        }
                      />
                    </td>

                    <td>
                      <button
                        type="button"
                        className="employee-action red"
                        onClick={() =>
                          setRows(
                            (
                              previous
                            ) =>
                              previous.filter(
                                (
                                  _,
                                  rowIndex
                                ) =>
                                  rowIndex !==
                                  index
                              )
                          )
                        }
                      >
                        <Trash2
                          size={14}
                        />
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        <div className="student-form-footer">
          <button
            type="button"
            onClick={submit}
            className="student-btn student-btn-success"
          >
            Submit
          </button>
        </div>
      </Panel>
    </div>
  );
}


/* =========================================================
   EMPLOYEE DISABLE
========================================================= */

export function EmployeeDisable() {
  const [employees, setEmployees] =
    useState(getEmployees);

  const [selected, setSelected] =
    useState([]);

  const active =
    employees.filter(
      (employee) =>
        !employee.disabled
    );

  const toggle = (id) => {
    setSelected((previous) =>
      previous.includes(id)
        ? previous.filter(
            (item) => item !== id
          )
        : [...previous, id]
    );
  };

  const disable = () => {
    const now =
      new Date().toISOString();

    const updated =
      employees.map((employee) =>
        selected.includes(employee.id)
          ? {
              ...employee,
              disabled: true,
              disabledAt: now,
              remarks:
                "Disabled from employee management",
            }
          : employee
      );

    setEmployees(updated);
    saveEmployees(updated);
    setSelected([]);
  };

  return (
    <div className="student-admin-page">
      <UserManagementNav />
      <Panel
        title="Employee Disable List"
        action={
          <button
            type="button"
            className="student-btn student-btn-success"
            onClick={disable}
          >
            Update
          </button>
        }
      >
        <div className="employee-table-wrap">
          <table className="employee-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={
                      active.length >
                        0 &&
                      selected.length ===
                        active.length
                    }
                    onChange={(
                      event
                    ) =>
                      setSelected(
                        event.target
                          .checked
                          ? active.map(
                              (
                                item
                              ) =>
                                item.id
                            )
                          : []
                      )
                    }
                  />
                </th>

                <th>
                  Employee ID
                </th>

                <th>Full Name</th>

                <th>
                  Designation
                </th>
              </tr>
            </thead>

            <tbody>
              {active.length ? (
                active.map(
                  (employee) => (
                    <tr
                      key={
                        employee.id
                      }
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={selected.includes(
                            employee.id
                          )}
                          onChange={() =>
                            toggle(
                              employee.id
                            )
                          }
                        />
                      </td>

                      <td>
                        {
                          employee.employeeId
                        }
                      </td>

                      <td>
                        {
                          employee.name
                        }
                      </td>

                      <td>
                        {
                          employee.designation
                        }
                      </td>
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="employee-empty-cell"
                  >
                    No active
                    employees.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}


/* =========================================================
   QUICK UPDATE
========================================================= */

export function EmployeeQuickUpdate() {
  const [employees, setEmployees] =
    useState(getEmployees);

  const updateField = (
    id,
    key,
    value
  ) => {
    setEmployees((previous) =>
      previous.map((employee) =>
        employee.id === id
          ? {
              ...employee,
              [key]: value,
            }
          : employee
      )
    );
  };

  const submit = () => {
    saveEmployees(employees);

    alert(
      "Employee information updated."
    );
  };

  const active =
    employees.filter(
      (employee) =>
        !employee.disabled
    );

  return (
    <div className="student-admin-page">
      <UserManagementNav />
      <Panel
        title="Employee List"
        action={
          <button
            type="button"
            className="student-btn student-btn-success"
            onClick={submit}
          >
            Submit
          </button>
        }
      >
        <div className="student-alert">
          (*) field required
        </div>

        <div className="employee-table-wrap">
          <table className="employee-table employee-update-table">
            <thead>
              <tr>
                <th>
                  Employee Name
                </th>
                <th>
                  Date Of Birth
                </th>
                <th>Image</th>
                <th>
                  Signature Image
                </th>
                <th>Gender</th>
                <th>Religion</th>
                <th>Mobile</th>
                <th>
                  Designation
                </th>
                <th>Shift</th>
                <th>Payroll</th>
                <th>Email</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {active.map(
                (employee) => (
                  <tr
                    key={
                      employee.id
                    }
                  >
                    <td>
                      <input
                        className="student-input"
                        value={
                          employee.name
                        }
                        onChange={(
                          event
                        ) =>
                          updateField(
                            employee.id,
                            "name",
                            event
                              .target
                              .value
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="date"
                        className="student-input"
                        value={
                          employee.dateOfBirth
                        }
                        onChange={(
                          event
                        ) =>
                          updateField(
                            employee.id,
                            "dateOfBirth",
                            event
                              .target
                              .value
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="file"
                        className="student-input"
                      />
                    </td>

                    <td>
                      <input
                        type="file"
                        className="student-input"
                      />
                    </td>

                    <td>
                      <Select
                        value={
                          employee.gender
                        }
                        onChange={(
                          event
                        ) =>
                          updateField(
                            employee.id,
                            "gender",
                            event
                              .target
                              .value
                          )
                        }
                        options={
                          employeeGenders
                        }
                      />
                    </td>

                    <td>
                      <Select
                        value={
                          employee.religion
                        }
                        onChange={(
                          event
                        ) =>
                          updateField(
                            employee.id,
                            "religion",
                            event
                              .target
                              .value
                          )
                        }
                        options={
                          employeeReligions
                        }
                      />
                    </td>

                    <td>
                      <input
                        className="student-input"
                        value={
                          employee.mobile
                        }
                        onChange={(
                          event
                        ) =>
                          updateField(
                            employee.id,
                            "mobile",
                            event
                              .target
                              .value
                          )
                        }
                      />
                    </td>

                    <td>
                      <Select
                        value={
                          employee.designation
                        }
                        onChange={(
                          event
                        ) =>
                          updateField(
                            employee.id,
                            "designation",
                            event
                              .target
                              .value
                          )
                        }
                        options={
                          employeeDesignations
                        }
                      />
                    </td>

                    <td>
                      <Select
                        value={
                          employee.shift
                        }
                        onChange={(
                          event
                        ) =>
                          updateField(
                            employee.id,
                            "shift",
                            event
                              .target
                              .value
                          )
                        }
                        options={
                          employeeShifts
                        }
                      />
                    </td>

                    <td>
                      <Select
                        value={
                          employee.payroll
                        }
                        onChange={(
                          event
                        ) =>
                          updateField(
                            employee.id,
                            "payroll",
                            event
                              .target
                              .value
                          )
                        }
                        options={
                          employeePayrollTypes
                        }
                      />
                    </td>

                    <td>
                      <input
                        className="student-input"
                        value={
                          employee.email
                        }
                        onChange={(
                          event
                        ) =>
                          updateField(
                            employee.id,
                            "email",
                            event
                              .target
                              .value
                          )
                        }
                      />
                    </td>

                    <td>
                      <BadgeCheck
                        size={18}
                      />
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        <div className="student-action-row">
          <button
            type="button"
            className="student-btn student-btn-success"
            onClick={submit}
          >
            Submit
          </button>
        </div>
      </Panel>
    </div>
  );
}


/* =========================================================
   RESTORE
========================================================= */

export function EmployeeRestore() {
  const [employees, setEmployees] =
    useState(getEmployees);

  const [selected, setSelected] =
    useState([]);

  const disabled =
    employees.filter(
      (employee) =>
        employee.disabled
    );

  const restore = () => {
    const updated =
      employees.map((employee) =>
        selected.includes(employee.id)
          ? {
              ...employee,
              disabled: false,
              disabledAt: "",
              remarks: "",
            }
          : employee
      );

    setEmployees(updated);
    saveEmployees(updated);
    setSelected([]);
  };

  return (
    <div className="student-admin-page">
      <UserManagementNav />
      <Panel
        title="Employee Restore List"
        action={
          <button
            type="button"
            onClick={restore}
            className="student-btn student-btn-success"
          >
            <RotateCcw size={14} />
            Update
          </button>
        }
      >
        <div className="employee-table-wrap">
          <table className="employee-table">
            <thead>
              <tr>
                <th />
                <th>
                  Employee ID
                </th>
                <th>Full Name</th>
                <th>
                  Designation
                </th>
                <th>Disabled At</th>
                <th>Remarks</th>
              </tr>
            </thead>

            <tbody>
              {disabled.length ? (
                disabled.map(
                  (employee) => (
                    <tr
                      key={
                        employee.id
                      }
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={selected.includes(
                            employee.id
                          )}
                          onChange={() =>
                            setSelected(
                              (
                                previous
                              ) =>
                                previous.includes(
                                  employee.id
                                )
                                  ? previous.filter(
                                      (
                                        id
                                      ) =>
                                        id !==
                                        employee.id
                                    )
                                  : [
                                      ...previous,
                                      employee.id,
                                    ]
                            )
                          }
                        />
                      </td>

                      <td>
                        {
                          employee.employeeId
                        }
                      </td>

                      <td>
                        {
                          employee.name
                        }
                      </td>

                      <td>
                        {
                          employee.designation
                        }
                      </td>

                      <td>
                        {
                          employee.disabledAt
                        }
                      </td>

                      <td>
                        {
                          employee.remarks
                        }
                      </td>
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="employee-empty-cell"
                  >
                    No disabled
                    employees.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}


/* =========================================================
   ID CARD
========================================================= */

export function EmployeeIdCard() {
  const [form, setForm] =
    useState({
      designation: "",
      template: "Vertical 1",
      side: "Both Side",
      layout: "Portrait",
      issueDate: "2026-01-01",
      expireDate: "2026-12-31",
    });

  const change = (event) => {
    const { name, value } =
      event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  return (
    <div className="student-admin-page">
      <UserManagementNav />
      <Panel
        title="Employee ID Card"
        action={<EmployeeButton />}
      >
        <div className="student-search-grid">
          <Field label="Designation">
            <Select
              name="designation"
              value={
                form.designation
              }
              onChange={change}
              options={
                employeeDesignations
              }
              placeholder="Select Employee"
            />
          </Field>

          <Field label="Template">
            <Select
              name="template"
              value={form.template}
              onChange={change}
              options={[
                "Vertical 1",
                "Vertical 2",
                "Horizontal 1",
              ]}
            />
          </Field>

          <Field label="Template Side">
            <Select
              name="side"
              value={form.side}
              onChange={change}
              options={[
                "Both Side",
                "Front Side",
                "Back Side",
              ]}
            />
          </Field>

          <Field label="Layout">
            <Select
              name="layout"
              value={form.layout}
              onChange={change}
              options={[
                "Portrait",
                "Landscape",
              ]}
            />
          </Field>

          <Field label="Issue Date">
            <input
              type="date"
              name="issueDate"
              value={form.issueDate}
              onChange={change}
              className="student-input"
            />
          </Field>

          <Field label="Expire Date">
            <input
              type="date"
              name="expireDate"
              value={form.expireDate}
              onChange={change}
              className="student-input"
            />
          </Field>
        </div>

        <div className="student-action-row">
          <button className="student-btn student-btn-secondary">
            <Search size={14} />
            Search
          </button>

          <button
            className="student-btn student-btn-success"
            onClick={() =>
              window.print()
            }
          >
            <Printer size={14} />
            Print
          </button>

          <button className="student-btn student-btn-blue">
            PDF
          </button>

          <button className="student-btn student-btn-muted">
            Design & Config
          </button>
        </div>
      </Panel>
    </div>
  );
}


/* =========================================================
   SETTINGS
========================================================= */

export function EmployeeSettings() {
  const [approval, setApproval] =
    useState("Active");

  const [cvTitle, setCvTitle] =
    useState("CV");

  const submit = (
    event
  ) => {
    event.preventDefault();

    localStorage.setItem(
      "expertEmployeeSettings",
      JSON.stringify({
        admissionApproval:
          approval,
        cvTitle,
      })
    );

    alert(
      "Employee settings saved."
    );
  };

  return (
    <div className="student-admin-page">
      <UserManagementNav />
      <Panel
        title="Online Admission Update"
        action={
          <Link
            to="../employee"
            className="student-btn student-btn-secondary"
          >
            Back to Employee List
          </Link>
        }
      >
        <div className="student-alert">
          (*) field required
        </div>

        <form
          onSubmit={submit}
          className="employee-settings-form"
        >
          <Field
            label="Admission Approval:"
            required
          >
            <select
              value={approval}
              onChange={(event) =>
                setApproval(
                  event.target.value
                )
              }
              className="student-input"
            >
              <option>
                Active
              </option>

              <option>
                Inactive
              </option>
            </select>
          </Field>

          <Field
            label="CV Title:"
            required
          >
            <input
              value={cvTitle}
              onChange={(event) =>
                setCvTitle(
                  event.target.value
                )
              }
              className="student-input"
            />
          </Field>

          <div className="employee-settings-submit">
            <button
              type="submit"
              className="student-btn student-btn-success"
            >
              Submit
            </button>
          </div>
        </form>
      </Panel>
    </div>
  );
}
