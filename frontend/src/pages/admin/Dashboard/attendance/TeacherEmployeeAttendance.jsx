import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AnimatedAttendancePage, AttendancePanel, AppSelect, Field, RequiredNotice, SearchButton,
  currentTimeLabel, designations, staff, todayISO, useAttendanceBase, useAttendanceRecords,
} from "./attendanceShared.jsx";

export default function TeacherEmployeeAttendance() {
  const base = useAttendanceBase();
  const [, setRecords] = useAttendanceRecords();
  const [designation, setDesignation] = useState("");
  const [employee, setEmployee] = useState("");
  const [searched, setSearched] = useState(false);
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState(currentTimeLabel());
  const [absentSms, setAbsentSms] = useState(false);
  const [presentSms, setPresentSms] = useState(false);
  const [selected, setSelected] = useState(() => staff.map((s) => s.id));

  const list = useMemo(() => {
    if (!searched && !designation && !employee) return staff;
    return staff.filter((s) => (!designation || s.designation === designation) && (!employee || s.id === employee));
  }, [designation, employee, searched]);

  const toggle = (id) => setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const submit = () => {
    const created = list.map((person) => {
      const isPresent = selected.includes(person.id);
      return {
        id: `STAFFATT-${person.id}-${date}`,
        userId: person.id, name: person.name, role: person.role, designation: person.designation,
        date, status: isPresent ? "Present" : "Absent", entryTime: isPresent ? time : "Absent", exitTime: isPresent ? "Pending" : "Absent",
      };
    });
    setRecords((prev) => [...prev.filter((r) => !(r.role !== "Student" && r.date === date && created.some((n) => n.userId === r.userId))), ...created]);
    alert(`Attendance saved.${absentSms || presentSms ? " Demo SMS flags were captured." : ""}`);
  };

  return (
    <AnimatedAttendancePage>
      <AttendancePanel title="Online Attendance" action={<Link to={`${base}/teacher-employee-attendance-report`} className="btn btn-sm border-0 bg-cyan-500 text-white">Back to Attendance List</Link>}>
        <div className="space-y-5"><RequiredNotice/><div className="mx-auto max-w-3xl space-y-4">
          <Field label="Designation:"><AppSelect value={designation} onChange={(e) => setDesignation(e.target.value)} options={designations} placeholder="Select Designation"/></Field>
          <Field label="Employee:"><AppSelect value={employee} onChange={(e) => setEmployee(e.target.value)} options={staff.map((s) => ({ value: s.id, label: `${s.name} (${s.id})` }))} placeholder="Select Employee"/></Field>
          <div className="md:ml-[192px]"><SearchButton onClick={() => setSearched(true)}/></div>
        </div></div>
      </AttendancePanel>

      <AttendancePanel title="Online Teacher & Employee Attendance" action={<Link to={`${base}/teacher-employee-attendance-report`} className="btn btn-sm border-0 bg-cyan-500 text-white">Back to Attendance List</Link>}>
        <div className="grid gap-x-8 gap-y-4 xl:grid-cols-2">
          <Field label="Attendance Date:"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input input-bordered input-sm w-full"/></Field>
          <Field label="Entry Time:"><input value={time} onChange={(e) => setTime(e.target.value)} className="input input-bordered input-sm w-full"/></Field>
          <Field label="With Absent SMS?"><label className="flex items-center gap-2"><input type="checkbox" className="checkbox checkbox-sm" checked={absentSms} onChange={(e) => setAbsentSms(e.target.checked)}/>Yes</label></Field>
          <div />
          <Field label="With Present SMS?"><label className="flex items-center gap-2"><input type="checkbox" className="checkbox checkbox-sm" checked={presentSms} onChange={(e) => setPresentSms(e.target.checked)}/>Yes</label></Field>
        </div>
        <div className="my-5 flex justify-center"><button onClick={submit} className="btn btn-success btn-sm text-white">Submit</button></div>
        <div className="overflow-x-auto"><table className="table table-zebra table-sm min-w-[800px]"><thead className="bg-base-200"><tr><th>#</th><th>Teacher/Employee ID</th><th>Name</th><th>Designation</th></tr></thead><tbody>{list.map((person, i) => <tr key={person.id}><td><label className="flex items-center gap-2"><input type="checkbox" className="checkbox checkbox-primary checkbox-xs" checked={selected.includes(person.id)} onChange={() => toggle(person.id)}/>{i+1}</label></td><td>{person.id}</td><td>{person.name}</td><td>{person.designation}</td></tr>)}</tbody></table></div>
      </AttendancePanel>
    </AnimatedAttendancePage>
  );
}
