import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  ClipboardList,
  Clock3,
  FileBarChart,
  UserCheck,
  UserRoundCheck,
  Users,
} from "lucide-react";
import {
  AttendanceNav,
  attendanceMenuItems,
  useAttendanceBase,
} from "./attendanceShared.jsx";

import TimeAttendance from "./TimeAttendance.jsx";
import StudentAttendance from "./StudentAttendance.jsx";
import StudentAttendanceReport from "./StudentAttendanceReport.jsx";
import StudentAttendanceOverviewReport from "./StudentAttendanceOverviewReport.jsx";
import StudentDetailsAttendance from "./StudentDetailsAttendance.jsx";
import StudentAttendanceSummary from "./StudentAttendanceSummary.jsx";
import StudentAbsent from "./StudentAbsent.jsx";
import TeacherEmployeeAttendance from "./TeacherEmployeeAttendance.jsx";
import TeacherEmployeeAttendanceReport from "./TeacherEmployeeAttendanceReport.jsx";
import TeacherEmployeeDetailsAttendance from "./TeacherEmployeeDetailsAttendance.jsx";
import TeacherEmployeeAttendanceSummary from "./TeacherEmployeeAttendanceSummary.jsx";
import TeacherEmployeeAbsent from "./TeacherEmployeeAbsent.jsx";
import TeacherClassAttendance from "./TeacherClassAttendance.jsx";

export {
  TimeAttendance,
  StudentAttendance,
  StudentAttendanceReport,
  StudentAttendanceOverviewReport,
  StudentDetailsAttendance,
  StudentAttendanceSummary,
  StudentAbsent,
  TeacherEmployeeAttendance,
  TeacherEmployeeAttendanceReport,
  TeacherEmployeeDetailsAttendance,
  TeacherEmployeeAttendanceSummary,
  TeacherEmployeeAbsent,
  TeacherClassAttendance,
};

const iconBySlug = {
  "time-attendance": Clock3,
  "student-attendance": UserCheck,
  "student-attendance-report": ClipboardList,
  "student-attendance-overview-report": FileBarChart,
  "student-details-attendance": Users,
  "student-attendance-summary": FileBarChart,
  "student-absent": UserRoundCheck,
  "teacher-and-employee-attendance": CalendarCheck,
  "teacher-and-employee-attendance-report": ClipboardList,
  "teacher-and-employee-details-attendance": Users,
  "teacher-and-employee-attendance-summary": FileBarChart,
  "teacher-and-employee-absent": UserRoundCheck,
  "teacher-class-attendance": CalendarCheck,
};

export default function AttendanceDashboard() {
  const base = useAttendanceBase();

  return (
    <div className="space-y-5">
      <AttendanceNav />

      <div className="py-2 text-center">
        <h1 className="text-2xl font-black uppercase sm:text-3xl">Attendance Dashboard</h1>
        <p className="mt-1 text-sm text-base-content/60">Manage student, teacher and employee attendance.</p>
      </div>

      <section className="rounded-lg border border-base-300 bg-base-100 p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {attendanceMenuItems.map(([title, slug]) => {
            const Icon = iconBySlug[slug] || CalendarCheck;

            return (
            <Link key={slug} to={`${base}/${slug}`}>
              <motion.div
                whileHover={{ y: -4 }}
                className="h-full rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm transition hover:border-success/40 hover:shadow-md"
              >
                <Icon size={24} className="text-success" />
                <h3 className="mt-3 font-black">{title}</h3>
              </motion.div>
            </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
