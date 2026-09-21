import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Printer } from "lucide-react";
import {
  AnimatedAttendancePage, AttendancePanel, AppSelect, EmptyRow, Field, SearchButton,
  classes, months, sections, sessions, shifts, useAttendanceBase, useAttendanceRecords,
} from "./attendanceShared.jsx";

export default function StudentDetailsAttendance() {
  const base = useAttendanceBase();
  const [records] = useAttendanceRecords();
  const [form, setForm] = useState({ session: "2026", shift: "", className: "", section: "", month: "", type: "Without Time" });
  const [searched, setSearched] = useState(false);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const rows = useMemo(() => {
    if (!searched) return [];
    return records.filter((r) => r.role === "Student" &&
      (!form.session || r.session === form.session) && (!form.shift || r.shift === form.shift) &&
      (!form.className || r.className === form.className) && (!form.section || r.section === form.section) &&
      (!form.month || new Date(`${r.date}T00:00:00`).toLocaleString("en-US", { month: "long" }) === form.month)
    );
  }, [records, form, searched]);

  return (
    <AnimatedAttendancePage>
      <AttendancePanel title="Student Details Attendance" action={<Link to={`${base}/student-attendance-report`} className="btn btn-sm border-0 bg-cyan-500 text-white">Back To Student List</Link>}>
        <div className="mx-auto max-w-4xl space-y-4">
          <Field label="Session Year:"><AppSelect value={form.session} onChange={(e) => set("session", e.target.value)} options={sessions} placeholder={null} /></Field>
          <Field label="School Shift:"><AppSelect value={form.shift} onChange={(e) => set("shift", e.target.value)} options={shifts} placeholder="Select Shift" /></Field>
          <Field label="Class:"><AppSelect value={form.className} onChange={(e) => set("className", e.target.value)} options={classes} placeholder="Select class" /></Field>
          <Field label="Section:"><AppSelect value={form.section} onChange={(e) => set("section", e.target.value)} options={sections} placeholder="Select Section" /></Field>
          <Field label="Month:"><AppSelect value={form.month} onChange={(e) => set("month", e.target.value)} options={months} placeholder="Select Month" /></Field>
          <Field label="Type:"><AppSelect value={form.type} onChange={(e) => set("type", e.target.value)} options={["Without Time", "With Time"]} placeholder={null} /></Field>
          <div className="flex flex-wrap gap-2 md:ml-[192px]"><SearchButton onClick={() => setSearched(true)} /><button onClick={() => window.print()} className="btn btn-success btn-sm text-white"><Printer size={15}/>Print Report</button><button className="btn btn-neutral btn-sm">Blank Sheet</button></div>
        </div>
        {searched && <div className="mt-6 overflow-x-auto"><table className="table table-zebra table-sm min-w-[900px]"><thead className="bg-base-200"><tr><th>ID</th><th>Name</th><th>Class</th><th>Section</th><th>Roll</th><th>Date</th><th>Status</th>{form.type === "With Time" && <><th>Entry</th><th>Exit</th></>}</tr></thead><tbody>{rows.map((r) => <tr key={r.id}><td>{r.userId}</td><td>{r.name}</td><td>{r.className}</td><td>{r.section}</td><td>{r.roll}</td><td>{r.date}</td><td>{r.status}</td>{form.type === "With Time" && <><td>{r.entryTime}</td><td>{r.exitTime}</td></>}</tr>)}{!rows.length && <EmptyRow colSpan={form.type === "With Time" ? 9 : 7} />}</tbody></table></div>}
      </AttendancePanel>
    </AnimatedAttendancePage>
  );
}
