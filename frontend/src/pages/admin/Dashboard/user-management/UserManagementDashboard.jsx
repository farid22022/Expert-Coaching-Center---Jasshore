import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  GraduationCap,
  BriefcaseBusiness,
  UserCog,
  IdCard,
  Radio,
  ShieldOff,
  UserRound,
  Users,
} from "lucide-react";

import "../styles/studentManagement.css";

export const userManagementGroups = [
  {
    label: "Student",
    count: 7,
    icon: GraduationCap,
    path: "/dashboard/user-management/student",
    color: "blue",
    items: [
      ["Student Create", "/dashboard/user-management/student/student-create"],
      ["Waiver Student", "/dashboard/user-management/student/waiver-student"],
      ["Student List", "/dashboard/user-management/student/student-list"],
      ["Student Quick Entry", "/dashboard/user-management/student/student-quick-entry"],
      ["Student Quick Excell Entry", "/dashboard/user-management/student/student-quick-excell-entry"],
      ["Student Quick Update", "/dashboard/user-management/student/student-quick-update"],
      ["Student Admission Update", "/dashboard/user-management/student/student-admission-update"],
      ["Student Subject Assign", "/dashboard/user-management/student/student-subject-assign"],
      ["Student Transfer", "/dashboard/user-management/student/student-transfer"],
      ["Student RFID", "/dashboard/user-management/student/student-rfid"],
      ["Student Info Excel Update", "/dashboard/user-management/student/student-info-excel-update"],
      ["Student Details Excel Entry", "/dashboard/user-management/student/student-details-excel-entry"],
    ],
  },
  {
    label: "Teacher",
    count: 1,
    icon: UserRound,
    path: "/dashboard/user-management/teacher",
    color: "sky",
    items: [
      ["Teacher", "/dashboard/user-management/teacher"],
      ["Teacher Quick Entry", "/dashboard/user-management/teacher/teacher-quick-entry"],
      ["Teacher Quick Update", "/dashboard/user-management/teacher/teacher-quick-update"],
      ["Teacher Disable", "/dashboard/user-management/teacher/teacher-disable"],
      ["Teacher Restore", "/dashboard/user-management/teacher/teacher-restore"],
      ["Teacher Id Card", "/dashboard/user-management/teacher/teacher-id-card"],
      ["Teacher Settings", "/dashboard/user-management/teacher/teacher-settings"],
    ],
  },
  {
    label: "Employee",
    count: 1,
    icon: BriefcaseBusiness,
    path: "/dashboard/user-management/employee",
    color: "blue",
    items: [
      ["Employee", "/dashboard/user-management/employee"],
      ["Employee Quick Entry", "/dashboard/user-management/employee/employee-quick-entry"],
      ["Employee Disable", "/dashboard/user-management/employee/employee-disable"],
      ["Employee Quick Update", "/dashboard/user-management/employee/employee-quick-update"],
      ["Employee Restore", "/dashboard/user-management/employee/employee-restore"],
      ["Employee Id Card", "/dashboard/user-management/employee/employee-id-card"],
      ["Employee Settings", "/dashboard/user-management/employee/employee-settings"],
    ],
  },
  {
    label: "Account Settings",
    count: 18,
    icon: Users,
    path: "/dashboard/user-management/users",
    color: "red",
    items: [["Users", "/dashboard/user-management/users"]],
  },
  {
    label: "Management",
    count: 0,
    icon: UserCog,
    path: "/dashboard/user-management/management",
    color: "dark",
    items: [
      ["Management", "/dashboard/user-management/management"],
      ["Management Disable", "/dashboard/user-management/management-disable"],
      ["Management Restore", "/dashboard/user-management/management-restore"],
    ],
  },
  {
    label: "Student Id Card",
    count: 0,
    icon: IdCard,
    path: "/dashboard/user-management/student-id-card",
    color: "dark",
    items: [["Student Id Card", "/dashboard/user-management/student-id-card"]],
  },
  {
    label: "Teacher Employee RFID",
    count: 0,
    icon: Radio,
    path: "/dashboard/user-management/teacher-employee-rfid",
    color: "dark",
    items: [["Teacher Employee RFID", "/dashboard/user-management/teacher-employee-rfid"]],
  },
  {
    label: "Other Users RFID",
    count: 0,
    icon: ShieldOff,
    path: "/dashboard/user-management/other-users-rfid",
    color: "light",
    items: [["Other Users RFID", "/dashboard/user-management/other-users-rfid"]],
  },
];

export function UserManagementNav() {
  const [activeGroup, setActiveGroup] = useState(null);

  return (
    <nav
      className="um-dropdown-nav sticky top-[70px] z-20 flex min-h-11 flex-wrap items-center gap-2 border border-slate-200 bg-white px-3 shadow-sm"
      aria-label="User management menu"
    >
      <strong className="mr-2 whitespace-nowrap text-sm font-black text-blue-700">
        User Management
      </strong>

      {userManagementGroups.map((group) => (
        <div className="um-dropdown-group relative" key={group.label}>
          <button
            type="button"
            className="inline-flex min-h-10 items-center gap-1 rounded-md px-2 text-sm font-bold text-slate-900 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
            onClick={() =>
              setActiveGroup((current) =>
                current === group.label ? null : group.label
              )
            }
            aria-expanded={activeGroup === group.label}
          >
            {group.label}
            <ChevronDown
              size={14}
              className={`transition-transform ${
                activeGroup === group.label ? "rotate-180" : ""
              }`}
            />
          </button>

          <div
            className={`um-dropdown-menu absolute left-0 top-full z-30 min-w-60 rounded-lg border border-slate-200 bg-white p-2 shadow-xl ${
              activeGroup === group.label ? "grid" : "hidden"
            }`}
          >
            {group.items.map(([label, path]) => (
              <Link
                className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
                key={path}
                to={path}
                onClick={() => setActiveGroup(null)}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

export function UserManagementSectionPage({
  title,
  description = "This module is prepared for administrative records, search tools, and connected backend data.",
}) {
  return (
    <div className="student-admin-page">
      <UserManagementNav />

      <section className="student-panel">
        <div className="student-panel-title">
          <span>{title}</span>
        </div>

        <div className="student-panel-body">
          <div className="um-section-placeholder">
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function UserManagementDashboard() {
  const navigate = useNavigate();

  return (
    <div className="student-admin-page">
      <UserManagementNav />

      <div className="um-page-heading">
        <h1>User Management Dashboard</h1>

        <p>
          This section helps you to manage User Management
        </p>
      </div>

      <section className="student-panel">
        <div className="student-panel-title centered">
          Select a Task
        </div>

        <div className="um-task-grid">
          {userManagementGroups.map((task) => {
            const Icon = task.icon;

            return (
              <button
                key={task.label}
                type="button"
                className={`um-task-card ${task.color}`}
                onClick={() =>
                  navigate(task.path)
                }
              >
                <div className="um-task-main">
                  <Icon size={25} />

                  <strong>
                    {task.count}
                  </strong>
                </div>

                <div className="um-task-label">
                  {task.label}
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
