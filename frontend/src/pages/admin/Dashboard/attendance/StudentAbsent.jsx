import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AnimatedAttendancePage, AttendancePanel, AppSelect, EmptyRow, Field, SearchButton,
  classes, dayLabel, inDateRange, monthLabel, sections, sessions, shifts, students, todayISO,
  useAttendanceBase, useAttendanceRecords,
} from "./attendanceShared.jsx";

export default function StudentAbsent() {
  const base = useAttendanceBase();
  const [records] = useAttendanceRecords();
  const [form, setForm] = useState({ session: "2026", shift: "", className: "", section: "", roll: "", studentId: "", from: todayISO(), to: todayISO() });
  const [searched, setSearched] = useState(false);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const rows = useMemo(() => {
    if (!searched) return [];
    return records.filter((r) => r.role === "Student" && r.status === "Absent" &&
      (!form.session || r.session === form.session) && (!form.shift || r.shift === form.shift) &&
      (!form.className || r.className === form.className) && (!form.section || r.section === form.section) &&
      (!form.roll || r.roll === form.roll) && (!form.studentId || String(r.userId).toLowerCase().includes(form.studentId.toLowerCase())) &&
      inDateRange(r.date, form.from, form.to));
  }, [records, form, searched]);

  return (
    <AnimatedAttendancePage>
      <AttendancePanel title="Search Student Absent">
        <div className="grid gap-x-8 gap-y-4 xl:grid-cols-2">
          <Field label="Session Year:"><AppSelect value={form.session} onChange={(e) => set("session", e.target.value)} options={sessions} placeholder={null}/></Field>
          <Field label="School Shift:"><AppSelect value={form.shift} onChange={(e) => set("shift", e.target.value)} options={shifts} placeholder="Select Shift"/></Field>
          <Field label="Class:"><AppSelect value={form.className} onChange={(e) => set("className", e.target.value)} options={classes} placeholder="Select class"/></Field>
          <Field label="Section:"><AppSelect value={form.section} onChange={(e) => set("section", e.target.value)} options={sections} placeholder="Select Section"/></Field>
          <Field label="Roll:"><AppSelect value={form.roll} onChange={(e) => set("roll", e.target.value)} options={students.map((s) => s.roll)} placeholder="Select Roll"/></Field>
          <Field label="Student ID:"><input value={form.studentId} onChange={(e) => set("studentId", e.target.value)} placeholder="Enter Student Id" className="input input-bordered input-sm w-full"/></Field>
          <Field label="From:"><input type="date" value={form.from} onChange={(e) => set("from", e.target.value)} className="input input-bordered input-sm w-full"/></Field>
          <Field label="To:"><input type="date" value={form.to} onChange={(e) => set("to", e.target.value)} className="input input-bordered input-sm w-full"/></Field>
        </div>
        <div className="mt-5 flex justify-center"><SearchButton onClick={() => setSearched(true)}/></div>
      </AttendancePanel>

      <AttendancePanel title="Student Absent Log Data" subtitle="(Student Attendance Data)" action={<Link to={`${base}/student-attendance`} className="btn btn-sm border-0 bg-cyan-500 text-white">Create Attendance</Link>}>
        <div className="overflow-x-auto"><table className="table table-zebra table-sm min-w-[850px]"><thead className="bg-base-200"><tr><th>Id</th><th>Name</th><th>User Role</th><th>Month</th><th>Date</th><th>Day</th><th>Action</th></tr></thead><tbody>{rows.map((r) => <tr key={r.id}><td>{r.userId}</td><td>{r.name}</td><td>{r.role}</td><td>{monthLabel(r.date)}</td><td>{r.date}</td><td>{dayLabel(r.date)}</td><td><span className="badge badge-error badge-outline badge-sm">Absent</span></td></tr>)}{!rows.length && <EmptyRow colSpan={7} text="No absent records found."/>}</tbody></table></div>
        <p className="mt-5 text-sm font-semibold">Showing {rows.length} result{rows.length===1?"":"s"}.</p>
      </AttendancePanel>
    </AnimatedAttendancePage>
  );
}
