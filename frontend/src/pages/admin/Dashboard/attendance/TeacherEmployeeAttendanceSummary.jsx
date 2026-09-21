import { useMemo, useState } from "react";
import { Printer } from "lucide-react";
import {
  AnimatedAttendancePage, AttendancePanel, AppSelect, EmptyRow, Field, SearchButton,
  months, userGroups, useAttendanceRecords,
} from "./attendanceShared.jsx";

export default function TeacherEmployeeAttendanceSummary() {
  const [records] = useAttendanceRecords();
  const [form, setForm] = useState({ userGroup: "", month: "" });
  const [searched, setSearched] = useState(false);
  const set = (k,v) => setForm((p) => ({ ...p, [k]: v }));

  const rows = useMemo(() => {
    if (!searched) return [];
    const filtered = records.filter((r) => r.role !== "Student" && (!form.userGroup || form.userGroup === "Teacher & Employee" || r.role === form.userGroup) && (!form.month || new Date(`${r.date}T00:00:00`).toLocaleString("en-US", { month: "long" }) === form.month));
    const map = new Map();
    for (const r of filtered) {
      const x = map.get(r.userId) || { id: r.userId, name: r.name, designation: r.designation, present: 0, absent: 0, leave: 0 };
      if (r.status === "Present") x.present++;
      if (r.status === "Absent") x.absent++;
      if (r.status === "Leave") x.leave++;
      map.set(r.userId, x);
    }
    return [...map.values()];
  }, [records, form, searched]);

  return (
    <AnimatedAttendancePage>
      <AttendancePanel title="Teacher & Employee Attendance Summary">
        <div className="mx-auto max-w-4xl space-y-4">
          <Field label="User Group:"><AppSelect value={form.userGroup} onChange={(e) => set("userGroup", e.target.value)} options={userGroups} placeholder="Select User Group"/></Field>
          <Field label="Month:"><AppSelect value={form.month} onChange={(e) => set("month", e.target.value)} options={months} placeholder="Nothing selected"/></Field>
          <div className="flex flex-wrap gap-2 md:ml-[192px]"><SearchButton onClick={() => setSearched(true)}/><button onClick={() => window.print()} className="btn btn-success btn-sm text-white"><Printer size={15}/>Print Report</button></div>
        </div>
        {searched && <div className="mt-6 overflow-x-auto"><table className="table table-zebra table-sm min-w-[800px]"><thead className="bg-base-200"><tr><th>ID</th><th>Name</th><th>Designation</th><th>Present</th><th>Absent</th><th>Leave</th><th>Total</th></tr></thead><tbody>{rows.map((r) => <tr key={r.id}><td>{r.id}</td><td>{r.name}</td><td>{r.designation}</td><td>{r.present}</td><td>{r.absent}</td><td>{r.leave}</td><td>{r.present+r.absent+r.leave}</td></tr>)}{!rows.length && <EmptyRow colSpan={7}/>}</tbody></table></div>}
      </AttendancePanel>
    </AnimatedAttendancePage>
  );
}
