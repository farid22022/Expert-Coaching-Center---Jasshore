import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Printer } from "lucide-react";
import {
  AnimatedAttendancePage, AttendancePanel, AppSelect, EmptyRow, Field, SearchButton,
  attendanceTypes, classes, dayLabel, inDateRange, monthLabel, months, sections, sessions, shifts,
  todayISO, useAttendanceBase, useAttendanceRecords,
} from "./attendanceShared.jsx";

export default function StudentAttendanceReport() {
  const base = useAttendanceBase();
  const [records] = useAttendanceRecords();
  const [form, setForm] = useState({ session: "2026", shift: "", className: "", section: "", roll: "", month: "", from: todayISO(), to: todayISO(), type: "Absent" });
  const [searched, setSearched] = useState(false);
  const set = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const rows = useMemo(() => {
    if (!searched) return [];
    return records.filter((r) => r.role === "Student" &&
      (!form.session || r.session === form.session) && (!form.shift || r.shift === form.shift) &&
      (!form.className || r.className === form.className) && (!form.section || r.section === form.section) &&
      (!form.roll || r.roll === form.roll) && (!form.type || r.status === form.type) && inDateRange(r.date, form.from, form.to) &&
      (!form.month || new Date(`${r.date}T00:00:00`).toLocaleString("en-US", { month: "long" }) === form.month)
    );
  }, [records, form, searched]);

  return (
    <AnimatedAttendancePage>
      <AttendancePanel
        title="Student Attendance Report"
        action={<Link to={`${base}/student-attendance`} className="btn btn-sm border-0 bg-cyan-500 text-white">Student Attendance</Link>}
      >
        <div className="grid gap-x-8 gap-y-4 xl:grid-cols-2">
          <Field label="Session Year:"><AppSelect value={form.session} onChange={(e) => set("session", e.target.value)} options={sessions} placeholder={null} /></Field>
          <Field label="School Shift:"><AppSelect value={form.shift} onChange={(e) => set("shift", e.target.value)} options={shifts} placeholder="Select Shift" /></Field>
          <Field label="Class:"><AppSelect value={form.className} onChange={(e) => set("className", e.target.value)} options={classes} placeholder="Select class" /></Field>
          <Field label="Section:"><AppSelect value={form.section} onChange={(e) => set("section", e.target.value)} options={sections} placeholder="Select Section" /></Field>
          <Field label="Roll:"><input value={form.roll} onChange={(e) => set("roll", e.target.value)} placeholder="Enter Roll" className="input input-bordered input-sm w-full" /></Field>
          <Field label="Month:"><AppSelect value={form.month} onChange={(e) => set("month", e.target.value)} options={months} placeholder="Select Month" /></Field>
          <Field label="From Date:"><input type="date" value={form.from} onChange={(e) => set("from", e.target.value)} className="input input-bordered input-sm w-full" /></Field>
          <Field label="To Date:"><input type="date" value={form.to} onChange={(e) => set("to", e.target.value)} className="input input-bordered input-sm w-full" /></Field>
          <Field label="Type:"><AppSelect value={form.type} onChange={(e) => set("type", e.target.value)} options={attendanceTypes} placeholder={null} /></Field>
        </div>
        <div className="mt-5 md:ml-[188px]"><SearchButton onClick={() => setSearched(true)} /></div>

        {searched && (
          <div className="mt-6 overflow-x-auto">
            <div className="mb-3 flex justify-end"><button onClick={() => window.print()} className="btn btn-success btn-sm text-white"><Printer size={15} />Print</button></div>
            <table className="table table-zebra table-sm min-w-[900px]">
              <thead className="bg-base-200"><tr><th>ID</th><th>Name</th><th>Class/Section</th><th>Roll</th><th>Month</th><th>Date</th><th>Day</th><th>Status</th></tr></thead>
              <tbody>
                {rows.map((r) => <tr key={r.id}><td>{r.userId}</td><td>{r.name}</td><td>{r.className}/{r.section}</td><td>{r.roll}</td><td>{monthLabel(r.date)}</td><td>{r.date}</td><td>{dayLabel(r.date)}</td><td>{r.status}</td></tr>)}
                {!rows.length && <EmptyRow colSpan={8} text="No attendance records found." />}
              </tbody>
            </table>
          </div>
        )}
      </AttendancePanel>
    </AnimatedAttendancePage>
  );
}
