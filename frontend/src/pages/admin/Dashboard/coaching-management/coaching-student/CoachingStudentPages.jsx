import { Link } from "react-router-dom";
import {
  CoachingPageShell,
  useCoachingManagementBase,
  RequiredNotice,
  Field,
  FormGrid,
  EmptyTable,
  ButtonRow,
  inputClass,
  selectClass,
} from "../coachingManagementShared.jsx";

function StudentFields() {
  return (
    <FormGrid>
      <Field label="Session Year:" required>
        <select className={selectClass} defaultValue="2026">
          <option>2026</option>
          <option>2025</option>
        </select>
      </Field>

      <Field label="School Shift:" required>
        <select className={selectClass} defaultValue="">
          <option value="" disabled>Select Shift</option>
          <option>Morning</option>
          <option>Day</option>
        </select>
      </Field>

      <Field label="Class:" required>
        <select className={selectClass} defaultValue="">
          <option value="" disabled>Select Class</option>
          <option>Class 09</option>
          <option>Class 10</option>
        </select>
      </Field>

      <Field label="Section:">
        <select className={selectClass} defaultValue="">
          <option value="" disabled>Select Section</option>
          <option>A</option>
          <option>Day</option>
        </select>
      </Field>

      <Field label="Student ID:">
        <input className={inputClass} placeholder="Enter Student ID" />
      </Field>

      <Field label="Roll:">
        <input className={inputClass} placeholder="Enter Roll" />
      </Field>
    </FormGrid>
  );
}

export function CoachingStudentAutoEnrollPage() {
  const base = useCoachingManagementBase();

  return (
    <CoachingPageShell
      title="Coaching Student Auto Enroll"
      action={
        <Link
          to={`${base}/coaching-student/list`}
          className="btn btn-info btn-sm text-white"
        >
          Coaching Student List
        </Link>
      }
    >
      <div className="space-y-5">
        <RequiredNotice />
        <StudentFields />
        <ButtonRow className="mx-auto max-w-6xl md:pl-[188px]">
          <button className="btn btn-info btn-sm text-white">Search</button>
          <button className="btn btn-success btn-sm text-white">Enroll Selected</button>
        </ButtonRow>

        <EmptyTable
          columns={["#", "Student ID", "Student Name", "Class", "Section", "Roll", "Action"]}
          message="Search students to auto enroll."
        />
      </div>
    </CoachingPageShell>
  );
}

export function CoachingStudentCreatePage() {
  const base = useCoachingManagementBase();

  return (
    <CoachingPageShell
      title="Coaching Student Create"
      action={
        <Link
          to={`${base}/coaching-student/list`}
          className="btn btn-info btn-sm text-white"
        >
          Back to Coaching Student List
        </Link>
      }
    >
      <div className="space-y-5">
        <RequiredNotice />

        <FormGrid>
          <Field label="Student ID:" required>
            <input className={inputClass} placeholder="Enter Student ID" />
          </Field>

          <Field label="Student Name:" required>
            <input className={inputClass} placeholder="Enter Student Name" />
          </Field>

          <Field label="Session Year:" required>
            <select className={selectClass} defaultValue="2026">
              <option>2026</option>
            </select>
          </Field>

          <Field label="Class:" required>
            <select className={selectClass} defaultValue="">
              <option value="" disabled>Select Class</option>
            </select>
          </Field>

          <Field label="Section:">
            <select className={selectClass} defaultValue="">
              <option value="" disabled>Select Section</option>
            </select>
          </Field>

          <Field label="Roll:">
            <input className={inputClass} placeholder="Enter Roll" />
          </Field>

          <Field label="Mobile:" required>
            <input className={inputClass} placeholder="Enter Mobile" />
          </Field>

          <Field label="Admission Date:" required>
            <input type="date" className={inputClass} />
          </Field>

          <div className="md:col-start-2">
            <button className="btn btn-success btn-sm text-white">Submit</button>
          </div>
        </FormGrid>
      </div>
    </CoachingPageShell>
  );
}

export function CoachingStudentListPage() {
  const base = useCoachingManagementBase();

  return (
    <div className="space-y-5">
      <CoachingPageShell
        title="Coaching Student Search"
        action={
          <Link
            to={`${base}/coaching-student/create`}
            className="btn btn-info btn-sm text-white"
          >
            Create Coaching Student
          </Link>
        }
      >
        <StudentFields />
        <ButtonRow className="mx-auto mt-5 max-w-6xl md:pl-[188px]">
          <button className="btn btn-info btn-sm text-white">Search</button>
          <button className="btn btn-success btn-sm text-white">Print</button>
          <button className="btn btn-primary btn-sm">PDF</button>
        </ButtonRow>
      </CoachingPageShell>

      <CoachingPageShell title="Coaching Student List">
        <EmptyTable
          columns={["SL", "Student ID", "Student Name", "Class", "Section", "Roll", "Mobile", "Status", "Action"]}
        />
        <p className="mt-4 text-sm font-bold">Showing 0 to 0 of 0 results.</p>
      </CoachingPageShell>
    </div>
  );
}
