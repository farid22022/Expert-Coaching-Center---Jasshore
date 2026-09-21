import { Link } from "react-router-dom";
import {
  StudentWorkPageShell,
  useStudentWorkBase,
  RequiredNotice,
  Field,
  FormGrid,
  ButtonRow,
  EmptyTable,
  CommonAcademicFilters,
  inputClass,
  selectClass,
  textareaClass,
} from "../studentWorkShared.jsx";

export function AssignmentCreatePage() {
  const base = useStudentWorkBase();

  return (
    <StudentWorkPageShell
      title="Assignment Create"
      action={
        <Link
          to={`${base}/assignment/list`}
          className="btn btn-info btn-sm text-white"
        >
          Back to Assignment List
        </Link>
      }
    >
      <div className="space-y-5">
        <RequiredNotice />

        <FormGrid>
          <Field label="Session Year:" required>
            <select className={selectClass} defaultValue="2026">
              <option>2026</option>
              <option>2025</option>
            </select>
          </Field>

          <Field label="School Shift:">
            <select className={selectClass} defaultValue="">
              <option value="">Select Shift</option>
              <option>Morning</option>
              <option>Day</option>
            </select>
          </Field>

          <Field label="Class:" required>
            <select className={selectClass} defaultValue="">
              <option value="">Select Class</option>
              <option>Class 09</option>
              <option>Class 10</option>
            </select>
          </Field>

          <Field label="Section:">
            <select className={selectClass} defaultValue="">
              <option value="">Select Section</option>
              <option>A</option>
              <option>Day</option>
            </select>
          </Field>

          <Field label="Subject:" required>
            <select className={selectClass} defaultValue="">
              <option value="">Select Subject</option>
              <option>Bangla</option>
              <option>English</option>
              <option>Mathematics</option>
            </select>
          </Field>

          <Field label="Assignment Date:" required>
            <input type="date" className={inputClass} />
          </Field>

          <Field label="Submission Date:" required>
            <input type="date" className={inputClass} />
          </Field>

          <Field label="Assignment Title:" required>
            <input className={inputClass} placeholder="Enter Assignment Title" />
          </Field>

          <Field label="Attachment:">
            <input type="file" className="file-input file-input-bordered file-input-sm w-full" />
          </Field>

          <Field label="Marks:">
            <input type="number" className={inputClass} placeholder="0" />
          </Field>
        </FormGrid>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-3 md:grid-cols-[180px_1fr]">
          <label className="text-sm font-bold">Assignment Details:</label>
          <textarea
            className={textareaClass}
            placeholder="Enter assignment details"
          />
        </div>

        <div className="mx-auto max-w-6xl md:pl-[188px]">
          <button className="btn btn-success btn-sm text-white">Submit</button>
        </div>
      </div>
    </StudentWorkPageShell>
  );
}

export function AssignmentListPage() {
  const base = useStudentWorkBase();

  return (
    <div className="space-y-5">
      <StudentWorkPageShell
        title="Assignment Search"
        action={
          <Link
            to={`${base}/assignment/create`}
            className="btn btn-info btn-sm text-white"
          >
            Create Assignment
          </Link>
        }
      >
        <CommonAcademicFilters />

        <ButtonRow className="mx-auto mt-5 max-w-6xl md:pl-[188px]">
          <button className="btn btn-info btn-sm text-white">Search</button>
          <button className="btn btn-success btn-sm text-white">Print</button>
          <button className="btn btn-primary btn-sm">PDF</button>
        </ButtonRow>
      </StudentWorkPageShell>

      <StudentWorkPageShell title="Assignment List">
        <EmptyTable
          minWidth="1100px"
          columns={[
            "SL",
            "Session",
            "Class",
            "Section",
            "Subject",
            "Assignment Title",
            "Assignment Date",
            "Submission Date",
            "Marks",
            "Teacher",
            "Action",
          ]}
          message="No assignment data available."
        />

        <p className="mt-4 text-sm font-bold">
          Showing 0 to 0 of 0 results.
        </p>
      </StudentWorkPageShell>
    </div>
  );
}
