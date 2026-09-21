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

export function HomeWorkCreatePage() {
  const base = useStudentWorkBase();

  return (
    <StudentWorkPageShell
      title="Home Work Create"
      action={
        <Link
          to={`${base}/home-work/list`}
          className="btn btn-info btn-sm text-white"
        >
          Back to Home Work List
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

          <Field label="Home Work Date:" required>
            <input type="date" className={inputClass} />
          </Field>

          <Field label="Submission Date:">
            <input type="date" className={inputClass} />
          </Field>

          <Field label="Home Work Title:" required>
            <input className={inputClass} placeholder="Enter Home Work Title" />
          </Field>

          <Field label="Attachment:">
            <input type="file" className="file-input file-input-bordered file-input-sm w-full" />
          </Field>

          <Field label="Status:">
            <select className={selectClass} defaultValue="Active">
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </Field>
        </FormGrid>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-3 md:grid-cols-[180px_1fr]">
          <label className="text-sm font-bold">Home Work Details:</label>
          <textarea
            className={textareaClass}
            placeholder="Enter home work details"
          />
        </div>

        <div className="mx-auto max-w-6xl md:pl-[188px]">
          <button className="btn btn-success btn-sm text-white">Submit</button>
        </div>
      </div>
    </StudentWorkPageShell>
  );
}

export function HomeWorkListPage() {
  const base = useStudentWorkBase();

  return (
    <div className="space-y-5">
      <StudentWorkPageShell
        title="Home Work Search"
        action={
          <div className="flex gap-1">
            <Link
              to={`${base}/home-work/create`}
              className="btn btn-info btn-sm text-white"
            >
              Create Home Work
            </Link>
            <Link
              to={`${base}/home-work/at-a-glance`}
              className="btn btn-success btn-sm text-white"
            >
              Home Work At A Glance
            </Link>
          </div>
        }
      >
        <CommonAcademicFilters />

        <ButtonRow className="mx-auto mt-5 max-w-6xl md:pl-[188px]">
          <button className="btn btn-info btn-sm text-white">Search</button>
          <button className="btn btn-success btn-sm text-white">Print</button>
          <button className="btn btn-primary btn-sm">PDF</button>
        </ButtonRow>
      </StudentWorkPageShell>

      <StudentWorkPageShell title="Home Work List">
        <EmptyTable
          minWidth="1150px"
          columns={[
            "SL",
            "Session",
            "Class",
            "Section",
            "Subject",
            "Home Work Title",
            "Home Work Date",
            "Submission Date",
            "Teacher",
            "Status",
            "Action",
          ]}
          message="No home work data available."
        />

        <p className="mt-4 text-sm font-bold">
          Showing 0 to 0 of 0 results.
        </p>
      </StudentWorkPageShell>
    </div>
  );
}

export function HomeWorkAtAGlancePage() {
  const base = useStudentWorkBase();

  return (
    <div className="space-y-5">
      <StudentWorkPageShell
        title="Home Work At A Glance"
        action={
          <Link
            to={`${base}/home-work/list`}
            className="btn btn-info btn-sm text-white"
          >
            Back to Home Work List
          </Link>
        }
      >
        <FormGrid>
          <Field label="Session Year:">
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

          <Field label="Class:">
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

          <Field label="From Date:">
            <input type="date" className={inputClass} />
          </Field>

          <Field label="To Date:">
            <input type="date" className={inputClass} />
          </Field>

          <div className="md:col-start-2">
            <ButtonRow>
              <button className="btn btn-info btn-sm text-white">Search</button>
              <button className="btn btn-success btn-sm text-white">Print</button>
              <button className="btn btn-primary btn-sm">PDF</button>
            </ButtonRow>
          </div>
        </FormGrid>
      </StudentWorkPageShell>

      <StudentWorkPageShell title="Home Work At A Glance Report">
        <EmptyTable
          minWidth="1000px"
          columns={[
            "Date",
            "Class",
            "Section",
            "Subject",
            "Home Work",
            "Submission Date",
            "Teacher",
          ]}
          message="No home work data available for the selected period."
        />
      </StudentWorkPageShell>
    </div>
  );
}
