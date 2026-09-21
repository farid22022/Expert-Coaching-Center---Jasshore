import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AnimatedAttendancePage,
  AttendancePanel,
  EmptyRow,
  SearchButton,
  monthLabel,
  dayLabel,
  useAttendanceBase,
  useAttendanceRecords,
} from "./attendanceShared.jsx";

export default function TimeAttendance() {
  const base = useAttendanceBase();
  const [records] = useAttendanceRecords();
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);

  const rows = useMemo(() => {
    if (!searched || !query.trim()) return [];
    const q = query.trim().toLowerCase();
    return records.filter((r) =>
      String(r.userId).toLowerCase().includes(q) ||
      String(r.name).toLowerCase().includes(q)
    );
  }, [records, query, searched]);

  return (
    <AnimatedAttendancePage>
      <AttendancePanel title="Search Attendance">
        <div className="mx-auto max-w-4xl space-y-5">
          <label className="grid gap-2 md:grid-cols-[120px_minmax(0,1fr)] md:items-center">
            <span className="text-sm">ID:</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Student, Teacher or Employee Id"
              className="input input-bordered input-sm w-full"
            />
          </label>
          <div className="md:ml-[168px]">
            <SearchButton onClick={() => setSearched(true)} />
          </div>
        </div>
      </AttendancePanel>

      <AttendancePanel
        title="Attendance Log Data"
        subtitle="(Teacher, Employee, Student Attendance Data)"
        action={
          <Link to={`${base}/student-attendance`} className="btn btn-sm border-0 bg-cyan-500 text-white hover:bg-cyan-600">
            Create Attendance
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="table table-zebra table-sm min-w-[900px]">
            <thead className="bg-base-200">
              <tr>
                <th>Id</th><th>Name</th><th>User Role</th><th>Month</th><th>Date</th><th>Day</th><th>Attendance Time</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.userId}</td><td>{row.name}</td><td>{row.role}</td><td>{monthLabel(row.date)}</td>
                  <td>{row.date}</td><td>{dayLabel(row.date)}</td><td>{row.entryTime || row.status}</td>
                </tr>
              ))}
              {!rows.length && <EmptyRow colSpan={7} text="No attendance data found." />}
            </tbody>
          </table>
        </div>
        <p className="mt-5 text-sm font-semibold">Showing {rows.length} result{rows.length === 1 ? "" : "s"}.</p>
      </AttendancePanel>
    </AnimatedAttendancePage>
  );
}
