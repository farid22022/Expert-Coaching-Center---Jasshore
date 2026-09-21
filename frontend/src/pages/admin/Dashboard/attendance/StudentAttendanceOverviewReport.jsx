import { useMemo, useState } from "react";
import {
  AnimatedAttendancePage, AttendancePanel, SearchButton, RequiredNotice,
  todayISO, useAttendanceRecords,
} from "./attendanceShared.jsx";

function SummaryTable({ rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra table-sm min-w-[720px]">
        <thead className="bg-base-200"><tr><th>Class</th><th>Section</th><th>Present</th><th>Absent</th><th>Leave</th></tr></thead>
        <tbody>{rows.map((r) => <tr key={`${r.className}-${r.section}`}><td>{r.className}</td><td>{r.section}</td><td>{r.present}</td><td>{r.absent}</td><td>{r.leave}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

export default function StudentAttendanceOverviewReport() {
  const [records] = useAttendanceRecords();
  const [date, setDate] = useState(todayISO());
  const [searchedDate, setSearchedDate] = useState(todayISO());

  const studentRows = useMemo(() => records.filter((r) => r.role === "Student" && r.date === searchedDate), [records, searchedDate]);
  const total = useMemo(() => ({
    total: studentRows.length,
    present: studentRows.filter((r) => r.status === "Present").length,
    absent: studentRows.filter((r) => r.status === "Absent").length,
    leave: studentRows.filter((r) => r.status === "Leave").length,
  }), [studentRows]);

  const groups = useMemo(() => {
    const map = new Map();
    for (const r of studentRows) {
      const key = `${r.shift}|${r.className}|${r.section}`;
      const current = map.get(key) || { shift: r.shift || "Unassigned", className: r.className, section: r.section, present: 0, absent: 0, leave: 0 };
      if (r.status === "Present") current.present += 1;
      if (r.status === "Absent") current.absent += 1;
      if (r.status === "Leave") current.leave += 1;
      map.set(key, current);
    }
    return [...map.values()].reduce((acc, row) => {
      (acc[row.shift] ||= []).push(row);
      return acc;
    }, {});
  }, [studentRows]);

  return (
    <AnimatedAttendancePage>
      <AttendancePanel title="Attendance Overview Search">
        <div className="space-y-5">
          <RequiredNotice />
          <div className="mx-auto max-w-3xl space-y-4">
            <label className="grid gap-2 md:grid-cols-[170px_minmax(0,1fr)] md:items-center">
              <span className="text-sm font-semibold">Date:</span>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input input-bordered input-sm w-full" />
            </label>
            <div className="md:ml-[182px]"><SearchButton onClick={() => setSearchedDate(date)} /></div>
          </div>
        </div>
      </AttendancePanel>

      <AttendancePanel title={`Student Attendance on ${searchedDate}`}>
        <div className="overflow-x-auto">
          <table className="table table-zebra table-sm min-w-[700px]">
            <thead className="bg-base-200"><tr><th>Total</th><th>Present</th><th>Absent</th><th>Leaves</th></tr></thead>
            <tbody><tr><td>{total.total}</td><td>{total.present}</td><td>{total.absent}</td><td>{total.leave}</td></tr></tbody>
          </table>
        </div>
        <div className="mt-5 space-y-5">
          {Object.entries(groups).map(([shift, rows]) => (
            <section key={shift}>
              <h3 className="mb-2 text-xl font-semibold">{shift}</h3>
              <SummaryTable rows={rows} />
            </section>
          ))}
          {!Object.keys(groups).length && <p className="text-sm text-base-content/50">No student attendance for this date.</p>}
        </div>
      </AttendancePanel>
    </AnimatedAttendancePage>
  );
}
