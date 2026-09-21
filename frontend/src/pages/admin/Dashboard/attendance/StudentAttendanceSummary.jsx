import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Printer } from "lucide-react";
import {
  AnimatedAttendancePage, AttendancePanel, AppSelect, EmptyRow, Field, SearchButton,
  classes, months, sections, sessions, shifts, useAttendanceBase, useAttendanceRecords,
} from "./attendanceShared.jsx";

export default function StudentAttendanceSummary() {
  const base = useAttendanceBase();
  const [records] = useAttendanceRecords();
  const [form, setForm] = useState({ session: "2026", shift: "", className: "", section: "", month: "" });
  const [searched, setSearched] = useState(false);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const rows = useMemo(() => {
    if (!searched) return [];
    const filtered = records.filter((r) => r.role === "Student" && (!form.session || r.session === form.session) && (!form.shift || r.shift === form.shift) && (!form.className || r.className === form.className) && (!form.section || r.section === form.section) && (!form.month || new Date(`${r.date}T00:00:00`).toLocaleString("en-US", { month: "long" }) === form.month));
    const map = new Map();
    for (const r of filtered) {
      const x = map.get(r.userId) || { id: r.userId, name: r.name, className: r.className, section: r.section, present: 0, absent: 0, leave: 0 };
      if (r.status === "Present") x.present++;
      if (r.status === "Absent") x.absent++;
      if (r.status === "Leave") x.leave++;
      map.set(r.userId, x);
    }
    return [...map.values()];
  }, [records, form, searched]);

  return (
    <AnimatedAttendancePage>
      <AttendancePanel title="Student Attendance Summary" action={<Link to={`${base}/student-attendance`} className="btn btn-sm border-0 bg-cyan-500 text-white">Student Attendance</Link>}>
        <div className="mx-auto max-w-4xl space-y-4">
          <Field label="Session Year:"><AppSelect value={form.session} onChange={(e) => set("session", e.target.value)} options={sessions} placeholder={null}/></Field>
          <Field label="School Shift:"><AppSelect value={form.shift} onChange={(e) => set("shift", e.target.value)} options={shifts} placeholder="Select Shift"/></Field>
          <Field label="Class:"><AppSelect value={form.className} onChange={(e) => set("className", e.target.value)} options={classes} placeholder="Select class"/></Field>
          <Field label="Section:"><AppSelect value={form.section} onChange={(e) => set("section", e.target.value)} options={sections} placeholder="Select Section"/></Field>
          <Field label="Month:"><AppSelect value={form.month} onChange={(e) => set("month", e.target.value)} options={months} placeholder="Nothing selected"/></Field>
          <div className="flex flex-wrap gap-2 md:ml-[192px]"><SearchButton onClick={() => setSearched(true)}/><button onClick={() => window.print()} className="btn btn-success btn-sm text-white"><Printer size={15}/>Print Report</button></div>
        </div>
        {searched && <div className="mt-6 overflow-x-auto"><table className="table table-zebra table-sm min-w-[780px]"><thead className="bg-base-200"><tr><th>ID</th><th>Name</th><th>Class/Section</th><th>Present</th><th>Absent</th><th>Leave</th><th>Total</th></tr></thead><tbody>{rows.map((r) => <tr key={r.id}><td>{r.id}</td><td>{r.name}</td><td>{r.className}/{r.section}</td><td>{r.present}</td><td>{r.absent}</td><td>{r.leave}</td><td>{r.present+r.absent+r.leave}</td></tr>)}{!rows.length && <EmptyRow colSpan={7}/>}</tbody></table></div>}
      </AttendancePanel>
    </AnimatedAttendancePage>
  );
}
