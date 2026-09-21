import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AdminPanelPageShell,
  useAdminPanelBase,
  RequiredNotice,
  Field,
  FormGrid,
  EmptyTable,
  ButtonRow,
  inputClass,
  selectClass,
  textareaClass,
} from "./adminPanelShared.jsx";

/* =========================================================
   DEMO OPTIONS
========================================================= */

const academicYears = ["2026", "2025", "2024"];
const roles = ["Super Admin", "Admin", "Accountant", "Teacher", "Operator"];

const demoAdmins = [
  {
    id: 1,
    name: "Administrator",
    email: "admin@example.com",
    phone: "01700000000",
    role: "Super Admin",
    status: "Active",
  },
  {
    id: 2,
    name: "Account Officer",
    email: "accounts@example.com",
    phone: "01800000000",
    role: "Accountant",
    status: "Active",
  },
];

const demoLoginHistory = [
  {
    id: 1,
    user: "Administrator",
    email: "admin@example.com",
    ip: "127.0.0.1",
    device: "Chrome / Windows",
    login: "2026-09-18 09:10:22",
    logout: "2026-09-18 11:42:05",
    status: "Success",
  },
];

/* =========================================================
   PAY BILL
========================================================= */

export function PayBillPage() {
  const [form, setForm] = useState({
    billType: "",
    amount: "",
    paidBy: "Cash",
    reference: "",
    date: "2026-09-18",
    note: "",
  });

  const change = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  return (
    <AdminPanelPageShell title="Pay Bill">
      <div className="space-y-5">
        <RequiredNotice />

        <FormGrid>
          <Field label="Bill Type:" required>
            <select
              className={selectClass}
              value={form.billType}
              onChange={change("billType")}
            >
              <option value="">Select Bill Type</option>
              <option>Software Bill</option>
              <option>SMS Bill</option>
              <option>Hosting Bill</option>
              <option>Maintenance Bill</option>
              <option>Other</option>
            </select>
          </Field>

          <Field label="Amount:" required>
            <input
              type="number"
              className={inputClass}
              value={form.amount}
              onChange={change("amount")}
              placeholder="Enter Amount"
            />
          </Field>

          <Field label="Paid By:" required>
            <select
              className={selectClass}
              value={form.paidBy}
              onChange={change("paidBy")}
            >
              <option>Cash</option>
              <option>Bank</option>
              <option>bKash</option>
              <option>Nagad</option>
            </select>
          </Field>

          <Field label="Reference:">
            <input
              className={inputClass}
              value={form.reference}
              onChange={change("reference")}
              placeholder="Transaction / Reference ID"
            />
          </Field>

          <Field label="Bill Date:" required>
            <input
              type="date"
              className={inputClass}
              value={form.date}
              onChange={change("date")}
            />
          </Field>

          <Field label="Note:">
            <textarea
              className={textareaClass}
              value={form.note}
              onChange={change("note")}
              placeholder="N/A"
            />
          </Field>

          <div className="md:col-start-2">
            <button
              type="button"
              onClick={() => alert("Demo bill submitted.")}
              className="btn btn-success btn-sm text-white"
            >
              Submit
            </button>
          </div>
        </FormGrid>
      </div>
    </AdminPanelPageShell>
  );
}

/* =========================================================
   ACADEMIC YEAR
========================================================= */

export function AcademicYearPage() {
  const [yearName, setYearName] = useState("");
  const [rows, setRows] = useState(
    academicYears.map((year, index) => ({
      id: index + 1,
      year,
      startDate: `${year}-01-01`,
      endDate: `${year}-12-31`,
      status: index === 0 ? "Active" : "Inactive",
    }))
  );

  const addYear = () => {
    const clean = yearName.trim();
    if (!clean) return;

    if (rows.some((row) => row.year === clean)) {
      alert("Academic year already exists.");
      return;
    }

    setRows((prev) => [
      ...prev,
      {
        id: Date.now(),
        year: clean,
        startDate: `${clean}-01-01`,
        endDate: `${clean}-12-31`,
        status: "Inactive",
      },
    ]);
    setYearName("");
  };

  return (
    <div className="space-y-5">
      <AdminPanelPageShell title="Academic Year Create">
        <FormGrid>
          <Field label="Academic Year:" required>
            <input
              className={inputClass}
              value={yearName}
              onChange={(event) => setYearName(event.target.value)}
              placeholder="2027"
            />
          </Field>
          <div />
          <div className="md:col-start-2">
            <button
              type="button"
              onClick={addYear}
              className="btn btn-success btn-sm text-white"
            >
              Submit
            </button>
          </div>
        </FormGrid>
      </AdminPanelPageShell>

      <AdminPanelPageShell title="Academic Year List">
        <div className="overflow-x-auto">
          <table className="table table-sm min-w-[850px] border border-base-300">
            <thead className="bg-base-200">
              <tr>
                <th>#</th>
                <th>Academic Year</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id}>
                  <td>{index + 1}</td>
                  <td>{row.year}</td>
                  <td>{row.startDate}</td>
                  <td>{row.endDate}</td>
                  <td>
                    <span
                      className={[
                        "badge badge-sm",
                        row.status === "Active"
                          ? "badge-success text-white"
                          : "badge-ghost",
                      ].join(" ")}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-error btn-xs text-white"
                      onClick={() =>
                        setRows((prev) =>
                          prev.filter((item) => item.id !== row.id)
                        )
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminPanelPageShell>
    </div>
  );
}

/* =========================================================
   ADMIN LIST
========================================================= */

export function AdminListPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return demoAdmins;

    return demoAdmins.filter((admin) =>
      `${admin.name} ${admin.email} ${admin.phone} ${admin.role}`
        .toLowerCase()
        .includes(q)
    );
  }, [query]);

  return (
    <div className="space-y-5">
      <AdminPanelPageShell title="Admin Search">
        <FormGrid>
          <Field label="Search:">
            <input
              className={inputClass}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name, email, phone or role"
            />
          </Field>

          <Field label="Role:">
            <select className={selectClass} defaultValue="">
              <option value="">All Roles</option>
              {roles.map((role) => (
                <option key={role}>{role}</option>
              ))}
            </select>
          </Field>

          <div className="md:col-start-2">
            <button className="btn btn-info btn-sm text-white">Search</button>
          </div>
        </FormGrid>
      </AdminPanelPageShell>

      <AdminPanelPageShell title="Admin List">
        <div className="overflow-x-auto">
          <table className="table table-sm min-w-[950px] border border-base-300">
            <thead className="bg-base-200">
              <tr>
                <th>SL</th>
                <th>Admin Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((admin, index) => (
                <tr key={admin.id}>
                  <td>{index + 1}</td>
                  <td>{admin.name}</td>
                  <td>{admin.email}</td>
                  <td>{admin.phone}</td>
                  <td>{admin.role}</td>
                  <td>{admin.status}</td>
                  <td>
                    <div className="flex gap-1">
                      <button className="btn btn-info btn-xs text-white">Edit</button>
                      <button className="btn btn-error btn-xs text-white">Disable</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminPanelPageShell>
    </div>
  );
}

/* =========================================================
   RESET PASSWORD
========================================================= */

export function ResetPasswordPage() {
  return (
    <AdminPanelPageShell title="Reset Password">
      <div className="space-y-5">
        <RequiredNotice />

        <FormGrid>
          <Field label="Admin/User:" required>
            <select className={selectClass} defaultValue="">
              <option value="">Select Admin/User</option>
              {demoAdmins.map((admin) => (
                <option key={admin.id} value={admin.id}>
                  {admin.name} - {admin.email}
                </option>
              ))}
            </select>
          </Field>

          <Field label="New Password:" required>
            <input
              type="password"
              className={inputClass}
              placeholder="Enter New Password"
            />
          </Field>

          <Field label="Confirm Password:" required>
            <input
              type="password"
              className={inputClass}
              placeholder="Confirm New Password"
            />
          </Field>

          <div />

          <div className="md:col-start-2">
            <button
              type="button"
              onClick={() => alert("Demo password reset completed.")}
              className="btn btn-success btn-sm text-white"
            >
              Reset Password
            </button>
          </div>
        </FormGrid>
      </div>
    </AdminPanelPageShell>
  );
}

/* =========================================================
   ROLE
========================================================= */

export function RolePage() {
  const [roleName, setRoleName] = useState("");
  const [roleRows, setRoleRows] = useState(
    roles.map((role, index) => ({
      id: index + 1,
      name: role,
      users: index === 0 ? 1 : 0,
      status: "Active",
    }))
  );

  const addRole = () => {
    const clean = roleName.trim();
    if (!clean) return;

    if (roleRows.some((row) => row.name.toLowerCase() === clean.toLowerCase())) {
      alert("Role already exists.");
      return;
    }

    setRoleRows((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: clean,
        users: 0,
        status: "Active",
      },
    ]);
    setRoleName("");
  };

  return (
    <div className="space-y-5">
      <AdminPanelPageShell title="Role Create">
        <FormGrid>
          <Field label="Role Name:" required>
            <input
              className={inputClass}
              value={roleName}
              onChange={(event) => setRoleName(event.target.value)}
              placeholder="Enter Role Name"
            />
          </Field>

          <div />

          <div className="md:col-start-2">
            <button
              type="button"
              onClick={addRole}
              className="btn btn-success btn-sm text-white"
            >
              Submit
            </button>
          </div>
        </FormGrid>
      </AdminPanelPageShell>

      <AdminPanelPageShell title="Role List">
        <div className="overflow-x-auto">
          <table className="table table-sm min-w-[800px] border border-base-300">
            <thead className="bg-base-200">
              <tr>
                <th>SL</th>
                <th>Role Name</th>
                <th>Assigned Users</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {roleRows.map((role, index) => (
                <tr key={role.id}>
                  <td>{index + 1}</td>
                  <td>{role.name}</td>
                  <td>{role.users}</td>
                  <td>{role.status}</td>
                  <td>
                    <div className="flex gap-1">
                      <button className="btn btn-info btn-xs text-white">Permissions</button>
                      <button className="btn btn-error btn-xs text-white">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminPanelPageShell>
    </div>
  );
}

/* =========================================================
   USER LOGIN HISTORY
========================================================= */

export function UserLoginHistoryPage() {
  return (
    <div className="space-y-5">
      <AdminPanelPageShell title="User Login History Search">
        <FormGrid>
          <Field label="User:">
            <select className={selectClass} defaultValue="">
              <option value="">All Users</option>
              {demoAdmins.map((admin) => (
                <option key={admin.id}>{admin.name}</option>
              ))}
            </select>
          </Field>

          <Field label="From Date:">
            <input type="date" className={inputClass} />
          </Field>

          <Field label="To Date:">
            <input type="date" className={inputClass} />
          </Field>

          <Field label="Status:">
            <select className={selectClass} defaultValue="">
              <option value="">All Status</option>
              <option>Success</option>
              <option>Failed</option>
            </select>
          </Field>

          <div className="md:col-start-2">
            <ButtonRow>
              <button className="btn btn-info btn-sm text-white">Search</button>
              <button className="btn btn-success btn-sm text-white">Print</button>
            </ButtonRow>
          </div>
        </FormGrid>
      </AdminPanelPageShell>

      <AdminPanelPageShell title="User Login History">
        <div className="overflow-x-auto">
          <table className="table table-sm min-w-[1100px] border border-base-300">
            <thead className="bg-base-200">
              <tr>
                <th>SL</th>
                <th>User</th>
                <th>Email</th>
                <th>IP Address</th>
                <th>Device</th>
                <th>Login Time</th>
                <th>Logout Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {demoLoginHistory.map((row, index) => (
                <tr key={row.id}>
                  <td>{index + 1}</td>
                  <td>{row.user}</td>
                  <td>{row.email}</td>
                  <td>{row.ip}</td>
                  <td>{row.device}</td>
                  <td>{row.login}</td>
                  <td>{row.logout}</td>
                  <td>{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminPanelPageShell>
    </div>
  );
}

/* =========================================================
   ADMIN DISABLE
========================================================= */

export function AdminDisablePage() {
  const activeAdmins = demoAdmins.filter((admin) => admin.status === "Active");

  return (
    <AdminPanelPageShell title="Admin Disable">
      <div className="space-y-5">
        <FormGrid>
          <Field label="Admin:">
            <select className={selectClass} defaultValue="">
              <option value="">Select Admin</option>
              {activeAdmins.map((admin) => (
                <option key={admin.id}>{admin.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Reason:">
            <textarea
              className={textareaClass}
              placeholder="Enter disable reason"
            />
          </Field>

          <div className="md:col-start-2">
            <button
              type="button"
              onClick={() => alert("Demo admin disabled.")}
              className="btn btn-error btn-sm text-white"
            >
              Disable Admin
            </button>
          </div>
        </FormGrid>

        <EmptyTable
          columns={["SL", "Admin Name", "Email", "Role", "Disabled Date", "Reason", "Action"]}
          message="No disabled admins."
        />
      </div>
    </AdminPanelPageShell>
  );
}

/* =========================================================
   ADMIN RESTORE
========================================================= */

export function AdminRestorePage() {
  const base = useAdminPanelBase();

  return (
    <AdminPanelPageShell
      title="Admin Restore"
      action={
        <Link
          to={`${base}/admin-disable`}
          className="btn btn-info btn-sm text-white"
        >
          Admin Disable
        </Link>
      }
    >
      <EmptyTable
        columns={["SL", "Admin Name", "Email", "Role", "Disabled Date", "Reason", "Action"]}
        message="No disabled admins available to restore."
      />
    </AdminPanelPageShell>
  );
}
