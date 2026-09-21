import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AnimatedAttendancePage, AttendancePanel, EmptyRow, Field, SearchButton,
  dayLabel, inDateRange, monthLabel, todayISO, useAttendanceBase, useAttendanceRecords,
} from "./attendanceShared.jsx";

export default function TeacherEmployeeAbsent() {
  const base = useAttendanceBase();
  const [records] = useAttendanceRecords();
  const [form, setForm] = useState({ id: "", from: todayISO(), to: todayISO() });
  const [searched, setSearched] = useState(false);
  const set = (k,v) => setForm((p) => ({ ...p, [k]: v }));

  const rows = useMemo(() => {
    if (!searched) return [];
    return records.filter((r) => r.role !== "Student" && r.status === "Absent" && (!form.id || String(r.userId).toLowerCase().includes(form.id.toLowerCase())) && inDateRange(r.date, form.from, form.to));
  }, [records, form, searched]);

  return (
    <AnimatedAttendancePage>
      <AttendancePanel title="Search Teacher Employee Absent">
        <div className="grid gap-x-8 gap-y-4 xl:grid-cols-2">
          <Field label="Teacher or Employee ID:"><input value={form.id} onChange={(e) => set("id", e.target.value)} placeholder="Enter Teacher or Employee Id" className="input input-bordered input-sm w-full"/></Field><div/>
          <Field label="From:"><input type="date" value={form.from} onChange={(e) => set("from", e.target.value)} className="input input-bordered input-sm w-full"/></Field>
          <Field label="To:"><input type="date" value={form.to} onChange={(e) => set("to", e.target.value)} className="input input-bordered input-sm w-full"/></Field>
        </div>
        <div className="mt-5 flex justify-center"><SearchButton onClick={() => setSearched(true)}/></div>
      </AttendancePanel>

      <AttendancePanel title="Teacher Employee Absent Log Data" subtitle="(Teacher Employee Attendance Data)" action={<Link to={`${base}/teacher-employee-attendance`} className="btn btn-sm border-0 bg-cyan-500 text-white">Create Attendance</Link>}>
        <div className="overflow-x-auto"><table className="table table-zebra table-sm min-w-[850px]"><thead className="bg-base-200"><tr><th>Id</th><th>Name</th><th>User Role</th><th>Month</th><th>Date</th><th>Day</th><th>Action</th></tr></thead><tbody>{rows.map((r) => <tr key={r.id}><td>{r.userId}</td><td>{r.name}</td><td>{r.role}</td><td>{monthLabel(r.date)}</td><td>{r.date}</td><td>{dayLabel(r.date)}</td><td><span className="badge badge-error badge-outline badge-sm">Absent</span></td></tr>)}{!rows.length && <EmptyRow colSpan={7} text="No absent records found."/>}</tbody></table></div>
        <p className="mt-5 text-sm font-semibold">Showing {rows.length} result{rows.length===1?"":"s"}.</p>
      </AttendancePanel>
    </AnimatedAttendancePage>
  );
}
