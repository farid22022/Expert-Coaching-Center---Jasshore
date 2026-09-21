import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import gsap from "gsap";
import { Search } from "lucide-react";

export const ATTENDANCE_STORAGE_KEY = "expertAttendanceRecords";

export const sessions = ["2026", "2025", "2024"];
export const shifts = ["Morning", "Day", "Evening", "All Shift"];
export const classes = ["SSC", "Inter 1st year", "Inter 2nd year", "Class 09", "Class 10"];
export const sections = ["A", "B", "C", "Day"];
export const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
export const attendanceTypes = ["Present", "Absent", "Leave"];
export const userGroups = ["Teacher", "Employee", "Teacher & Employee"];
export const designations = ["DIRECTOR", "TEACHER", "ACCOUNTANT", "OFFICE ASSISTANT"];

export const attendanceMenuItems = [
  ["Time Attendance", "time-attendance"],
  ["Student Attendance", "student-attendance"],
  ["Student Attendance Report", "student-attendance-report"],
  ["Student Attendance Overview Report", "student-attendance-overview-report"],
  ["Student Details Attendance", "student-details-attendance"],
  ["Student Attendance Summary", "student-attendance-summary"],
  ["Student Absent", "student-absent"],
  ["Teacher & Employee Attendance", "teacher-and-employee-attendance"],
  ["Teacher & Employee Attendance Report", "teacher-and-employee-attendance-report"],
  ["Teacher & Employee Details Attendance", "teacher-and-employee-details-attendance"],
  ["Teacher & Employee Attendance Summary", "teacher-and-employee-attendance-summary"],
  ["Teacher & Employee Absent", "teacher-and-employee-absent"],
  ["Teacher Class Attendance", "teacher-class-attendance"],
];

export const students = [
  { id: "STU-001", name: "Fahim Hasan", session: "2026", shift: "Morning", className: "SSC", section: "A", roll: "1" },
  { id: "STU-002", name: "Ayesha Rahman", session: "2026", shift: "Morning", className: "SSC", section: "A", roll: "2" },
  { id: "STU-003", name: "Nusrat Jahan", session: "2026", shift: "Day", className: "Class 10", section: "Day", roll: "3" },
  { id: "STU-004", name: "Samiul Islam", session: "2026", shift: "Day", className: "Class 09", section: "Day", roll: "4" },
  { id: "STU-005", name: "Tanvir Ahmed", session: "2026", shift: "All Shift", className: "Inter 2nd year", section: "A", roll: "5" },
];

export const staff = [
  { id: "201701", name: "Deen Islam", designation: "DIRECTOR", role: "Teacher" },
  { id: "201702", name: "K M ABDULLAH", designation: "TEACHER", role: "Teacher" },
  { id: "201703", name: "Rasel mahmud", designation: "TEACHER", role: "Teacher" },
  { id: "201704", name: "MD NAIMUR RAHMAN", designation: "TEACHER", role: "Teacher" },
  { id: "201705", name: "MD ASHIQ", designation: "TEACHER", role: "Teacher" },
  { id: "201706", name: "UZZAL KUMAR", designation: "TEACHER", role: "Teacher" },
  { id: "201707", name: "MASUL BILLAH", designation: "TEACHER", role: "Teacher" },
  { id: "201708", name: "MD ALAMIN", designation: "TEACHER", role: "Teacher" },
  { id: "201710", name: "RASEL AHMED", designation: "TEACHER", role: "Teacher" },
  { id: "EMP-001", name: "Office Assistant", designation: "OFFICE ASSISTANT", role: "Employee" },
];

export function todayISO() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function currentTimeLabel() {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date());
}

export function dateLabel(iso) {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function monthLabel(iso) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" })
    .format(new Date(`${iso}T00:00:00`));
}

export function dayLabel(iso) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-US", { weekday: "long" })
    .format(new Date(`${iso}T00:00:00`));
}

const seedDate = todayISO();
const seedRecords = [
  ...staff.slice(0, 9).map((person, index) => ({
    id: `ATT-STAFF-${index + 1}`,
    userId: person.id,
    name: person.name,
    role: person.role,
    designation: person.designation,
    date: seedDate,
    status: "Absent",
    entryTime: "Absent",
    exitTime: "Absent",
  })),
  ...students.map((student, index) => ({
    id: `ATT-STUDENT-${index + 1}`,
    userId: student.id,
    name: student.name,
    role: "Student",
    session: student.session,
    shift: student.shift,
    className: student.className,
    section: student.section,
    roll: student.roll,
    date: seedDate,
    status: index % 3 === 0 ? "Present" : "Absent",
    entryTime: index % 3 === 0 ? "09:00 AM" : "Absent",
    exitTime: index % 3 === 0 ? "11:30 AM" : "Absent",
  })),
];

export function loadAttendanceRecords() {
  try {
    const raw = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : seedRecords;
  } catch {
    return seedRecords;
  }
}

export function saveAttendanceRecords(records) {
  localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(records));
}

export function useAttendanceRecords() {
  const [records, setRecords] = useState(loadAttendanceRecords);
  useEffect(() => saveAttendanceRecords(records), [records]);
  return [records, setRecords];
}

export function inDateRange(date, from, to) {
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

export function useAttendanceBase() {
  const location = useLocation();
  const prefix = location.pathname.startsWith("/admin/dashboard")
    ? "/admin/dashboard"
    : "/dashboard";
  const segment = location.pathname.includes("/4-attendance")
    ? "4-attendance"
    : "attendance";
  return `${prefix}/${segment}`;
}

export function AttendanceNav() {
  const base = useAttendanceBase();

  return (
    <nav
      className="sticky top-[70px] z-20 flex min-h-11 flex-wrap items-center gap-x-5 gap-y-2 border border-slate-200 bg-white px-3 py-2 shadow-sm"
      aria-label="Attendance menu"
    >
      <Link
        to={base}
        className="mr-2 whitespace-nowrap text-sm font-black text-blue-700"
      >
        Attendance
      </Link>

      {attendanceMenuItems.map(([label, slug]) => (
        <Link
          key={slug}
          to={`${base}/${slug}`}
          className="inline-flex min-h-9 items-center whitespace-nowrap rounded-md px-2 text-sm font-black text-slate-950 transition-colors hover:bg-blue-50 hover:text-blue-700"
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function AnimatedAttendancePage({ children }) {
  const rootRef = useRef(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from("[data-attendance-panel]", {
        opacity: 0,
        y: 16,
        duration: 0.45,
        stagger: 0.08,
        ease: "power2.out",
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="space-y-5">
      <AttendanceNav />
      {children}
    </div>
  );
}

export function AttendancePanel({ title, subtitle, action, children }) {
  return (
    <section
      data-attendance-panel
      className="overflow-hidden rounded-lg border border-base-300 bg-base-100 shadow-sm"
    >
      <header className="flex min-h-11 items-center justify-between gap-3 bg-[#476db4] px-5 py-2 text-white">
        <div className="flex flex-wrap items-baseline gap-1">
          <h2 className="text-base font-bold sm:text-lg">{title}</h2>
          {subtitle ? <span className="text-sm font-normal">{subtitle}</span> : null}
        </div>
        {action}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Field({ label, required = false, children }) {
  return (
    <label className="grid gap-2 md:grid-cols-[180px_minmax(0,1fr)] md:items-center">
      <span className="text-sm font-semibold">
        {label}{required ? <span className="text-error">*</span> : null}
      </span>
      {children}
    </label>
  );
}

export function AppSelect({ value, onChange, options, placeholder = "Select", disabled = false }) {
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="select select-bordered select-sm w-full focus:border-success focus:outline-success"
    >
      {placeholder !== null ? <option value="">{placeholder}</option> : null}
      {options.map((option) => (
        <option key={typeof option === "string" ? option : option.value} value={typeof option === "string" ? option : option.value}>
          {typeof option === "string" ? option : option.label}
        </option>
      ))}
    </select>
  );
}

export function SearchButton({ children = "Search", onClick, type = "button" }) {
  return (
    <motion.button
      whileHover={{ scale: 1.025 }}
      whileTap={{ scale: 0.97 }}
      type={type}
      onClick={onClick}
      className="btn btn-sm border-0 bg-cyan-600 text-white hover:bg-cyan-700"
    >
      <Search size={15} />
      {children}
    </motion.button>
  );
}

export function RequiredNotice() {
  return (
    <div className="alert border border-warning/30 bg-warning/15 py-3 text-sm font-bold text-error">
      (*) field required
    </div>
  );
}

export function EmptyRow({ colSpan, text = "No data available." }) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-8 text-center text-base-content/50">{text}</td>
    </tr>
  );
}
