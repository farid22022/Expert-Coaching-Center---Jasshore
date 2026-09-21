import { useMemo, useState } from "react";
import { FileDown, Printer } from "lucide-react";
import {
  AnimatedAttendancePage, AttendancePanel, AppSelect, EmptyRow, Field, SearchButton,
  attendanceTypes, dayLabel, designations, inDateRange, monthLabel, months, staff, todayISO, useAttendanceRecords,
} from "./attendanceShared.jsx";

export default function TeacherEmployeeAttendanceReport() {
  const [records] = useAttendanceRecords();
  const [form, setForm] = useState({ designation: "", employee: "", from: todayISO(), to: todayISO(), month: "", type: "Absent", educationOfficer: false });
  const [searched, setSearched] = useState(true);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const rows = useMemo(() => {
    if (!searched) return [];
    return records.filter((r) => r.role !== "Student" && (!form.designation || r.designation === form.designation) && (!form.employee || r.userId === form.employee) && (!form.type || r.status === form.type) && inDateRange(r.date, form.from, form.to) && (!form.month || new Date(`${r.date}T00:00:00`).toLocaleString("en-US", { month: "long" }) === form.month));
  }, [records, form, searched]);

  return (
    <AnimatedAttendancePage>
      <AttendancePanel title="Attendance List">
        <div className="grid gap-x-8 gap-y-4 xl:grid-cols-2">
          <Field label="Designation:"><AppSelect value={form.designation} onChange={(e) => set("designation", e.target.value)} options={designations} placeholder="Select Designation"/></Field>
          <Field label="Employee:"><AppSelect value={form.employee} onChange={(e) => set("employee", e.target.value)} options={staff.map((s) => ({ value: s.id, label: s.name }))} placeholder="Select Employee"/></Field>
          <Field label="From Date:"><input type="date" value={form.from} onChange={(e) => set("from", e.target.value)} className="input input-bordered input-sm w-full"/></Field>
          <Field label="To Date:"><input type="date" value={form.to} onChange={(e) => set("to", e.target.value)} className="input input-bordered input-sm w-full"/></Field>
          <Field label="Month:"><AppSelect value={form.month} onChange={(e) => set("month", e.target.value)} options={months} placeholder="Select Month"/></Field>
          <Field label="Report? :"><label className="flex items-center gap-2"><input type="checkbox" className="checkbox checkbox-sm" checked={form.educationOfficer} onChange={(e) => set("educationOfficer", e.target.checked)}/>Education Officer</label></Field>
          <Field label="Type:"><AppSelect value={form.type} onChange={(e) => set("type", e.target.value)} options={attendanceTypes} placeholder={null}/></Field>
        </div>
        <div className="mt-5 flex flex-wrap gap-2 md:ml-[192px]"><SearchButton onClick={() => setSearched(true)}/><button className="btn btn-sm border-0 bg-violet-600 text-white"><FileDown size={15}/>PDF</button><button onClick={() => window.print()} className="btn btn-success btn-sm text-white"><Printer size={15}/>Print</button><button className="btn btn-success btn-sm text-white">Monthly Summary</button></div>
        <div className="mt-6 overflow-x-auto"><table className="table table-zebra table-sm min-w-[1000px]"><thead className="bg-base-200"><tr><th>#</th><th>Name</th><th>Designation</th><th>Month</th><th>Date</th><th>Day</th><th>Entry Time</th><th>Exit Time</th></tr></thead><tbody>{rows.map((r,i) => <tr key={r.id}><td>{i+1}</td><td>{r.name}</td><td>{r.designation}</td><td>{monthLabel(r.date)}</td><td>{r.date}</td><td>{dayLabel(r.date)}</td><td>{r.entryTime}</td><td>{r.exitTime}</td></tr>)}{!rows.length && <EmptyRow colSpan={8}/>}</tbody></table></div>
      </AttendancePanel>
    </AnimatedAttendancePage>
  );
}
