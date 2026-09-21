import { useMemo, useState } from "react";
import {
  AnimatedAttendancePage, AttendancePanel, AppSelect, EmptyRow, Field, SearchButton,
  classes, sections, sessions, staff, todayISO,
} from "./attendanceShared.jsx";

const demoClasses = [
  { id: "TC-1", teacherId: "201704", teacher: "MD NAIMUR RAHMAN", className: "SSC", section: "A", subject: "Mathematics", date: todayISO(), status: "Taken", start: "01:00 PM", end: "01:45 PM" },
  { id: "TC-2", teacherId: "201705", teacher: "MD ASHIQ", className: "SSC", section: "A", subject: "English 1st Paper", date: todayISO(), status: "Taken", start: "12:00 PM", end: "12:45 PM" },
  { id: "TC-3", teacherId: "201707", teacher: "MASUL BILLAH", className: "SSC", section: "A", subject: "Bangla 1st Paper", date: todayISO(), status: "Pending", start: "07:00 AM", end: "09:00 AM" },
];

export default function TeacherClassAttendance() {
  const [form, setForm] = useState({ session: "2026", teacher: "", className: "", section: "", date: todayISO() });
  const [searched, setSearched] = useState(false);
  const set = (k,v) => setForm((p) => ({ ...p, [k]: v }));
  const rows = useMemo(() => searched ? demoClasses.filter((r) => (!form.teacher || r.teacherId === form.teacher) && (!form.className || r.className === form.className) && (!form.section || r.section === form.section) && (!form.date || r.date === form.date)) : [], [form, searched]);

  return (
    <AnimatedAttendancePage>
      <AttendancePanel title="Teacher Class Attendance">
        <div className="grid gap-x-8 gap-y-4 xl:grid-cols-2">
          <Field label="Session Year:"><AppSelect value={form.session} onChange={(e) => set("session", e.target.value)} options={sessions} placeholder={null}/></Field>
          <Field label="Teacher:"><AppSelect value={form.teacher} onChange={(e) => set("teacher", e.target.value)} options={staff.filter((s) => s.role === "Teacher").map((s) => ({value:s.id,label:s.name}))} placeholder="Select Teacher"/></Field>
          <Field label="Class:"><AppSelect value={form.className} onChange={(e) => set("className", e.target.value)} options={classes} placeholder="Select class"/></Field>
          <Field label="Section:"><AppSelect value={form.section} onChange={(e) => set("section", e.target.value)} options={sections} placeholder="Select Section"/></Field>
          <Field label="Date:"><input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className="input input-bordered input-sm w-full"/></Field>
        </div>
        <div className="mt-5 flex justify-center"><SearchButton onClick={() => setSearched(true)}/></div>
        {searched && <div className="mt-6 overflow-x-auto"><table className="table table-zebra table-sm min-w-[900px]"><thead className="bg-base-200"><tr><th>Teacher</th><th>Class/Section</th><th>Subject</th><th>Date</th><th>Schedule</th><th>Status</th></tr></thead><tbody>{rows.map((r) => <tr key={r.id}><td>{r.teacher}</td><td>{r.className}/{r.section}</td><td>{r.subject}</td><td>{r.date}</td><td>{r.start} - {r.end}</td><td><span className={`badge badge-sm ${r.status === "Taken" ? "badge-success" : "badge-warning"}`}>{r.status}</span></td></tr>)}{!rows.length && <EmptyRow colSpan={6}/>}</tbody></table></div>}
      </AttendancePanel>
    </AnimatedAttendancePage>
  );
}
