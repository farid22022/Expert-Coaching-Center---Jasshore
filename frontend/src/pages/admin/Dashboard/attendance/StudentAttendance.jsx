import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AnimatedAttendancePage, AttendancePanel, AppSelect, Field, RequiredNotice, SearchButton,
  classes, sections, sessions, shifts, students, todayISO, useAttendanceBase, useAttendanceRecords,
} from "./attendanceShared.jsx";

export default function StudentAttendance() {
  const base = useAttendanceBase();
  const [records, setRecords] = useAttendanceRecords();
  const [form, setForm] = useState({ session: "2026", shift: "", className: "", section: "", roll: "" });
  const [searched, setSearched] = useState(false);
  const [statusMap, setStatusMap] = useState({});

  const matched = useMemo(() => {
    if (!searched) return [];
    return students.filter((s) =>
      (!form.session || s.session === form.session) &&
      (!form.shift || s.shift === form.shift) &&
      (!form.className || s.className === form.className) &&
      (!form.section || s.section === form.section) &&
      (!form.roll || s.roll === form.roll)
    );
  }, [form, searched]);

  const set = (key, value) => setForm((p) => ({ ...p, [key]: value }));
  const submit = () => {
    if (!matched.length) return alert("Search students first.");
    const date = todayISO();
    const created = matched.map((s) => {
      const status = statusMap[s.id] || "Present";
      return {
        id: `STUATT-${s.id}-${date}`,
        userId: s.id, name: s.name, role: "Student", session: s.session, shift: s.shift,
        className: s.className, section: s.section, roll: s.roll, date, status,
        entryTime: status === "Present" ? "09:00 AM" : status,
        exitTime: status === "Present" ? "11:30 AM" : status,
      };
    });
    setRecords((prev) => [
      ...prev.filter((r) => !(r.role === "Student" && r.date === date && created.some((n) => n.userId === r.userId))),
      ...created,
    ]);
    alert("Student attendance saved.");
  };

  return (
    <AnimatedAttendancePage>
      <AttendancePanel
        title="Online Attendance"
        action={<Link to={`${base}/student-attendance-report`} className="btn btn-sm border-0 bg-cyan-500 text-white">Back to Student List</Link>}
      >
        <div className="space-y-5">
          <RequiredNotice />
          <div className="mx-auto max-w-3xl space-y-4">
            <Field label="Session Year:" required><AppSelect value={form.session} onChange={(e) => set("session", e.target.value)} options={sessions} placeholder={null} /></Field>
            <Field label="School Shift:" required><AppSelect value={form.shift} onChange={(e) => set("shift", e.target.value)} options={shifts} placeholder="Select Shift" /></Field>
            <Field label="Class:" required><AppSelect value={form.className} onChange={(e) => set("className", e.target.value)} options={classes} placeholder="Select class" /></Field>
            <Field label="Section:" required><AppSelect value={form.section} onChange={(e) => set("section", e.target.value)} options={sections} placeholder="Select Section" /></Field>
            <Field label="Roll:"><AppSelect value={form.roll} onChange={(e) => set("roll", e.target.value)} options={students.map((s) => s.roll)} placeholder="Select Roll" /></Field>
            <div className="md:ml-[188px]"><SearchButton onClick={() => setSearched(true)} /></div>
          </div>

          {searched && (
            <div className="overflow-x-auto pt-4">
              <table className="table table-zebra table-sm min-w-[760px]">
                <thead className="bg-base-200"><tr><th>Student ID</th><th>Name</th><th>Class</th><th>Section</th><th>Roll</th><th>Status</th></tr></thead>
                <tbody>
                  {matched.map((s) => (
                    <tr key={s.id}>
                      <td>{s.id}</td><td>{s.name}</td><td>{s.className}</td><td>{s.section}</td><td>{s.roll}</td>
                      <td><AppSelect value={statusMap[s.id] || "Present"} onChange={(e) => setStatusMap((p) => ({ ...p, [s.id]: e.target.value }))} options={["Present", "Absent", "Leave"]} placeholder={null} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 flex justify-end"><button type="button" onClick={submit} className="btn btn-success btn-sm text-white">Submit Attendance</button></div>
            </div>
          )}
        </div>
      </AttendancePanel>
    </AnimatedAttendancePage>
  );
}
