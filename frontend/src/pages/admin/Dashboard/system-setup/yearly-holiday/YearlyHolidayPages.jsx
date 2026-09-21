import { Link } from "react-router-dom";
import {
  SystemSetupPageShell,
  useSystemSetupBase,
  RequiredNotice,
  Field,
  FormGrid,
  EmptyTable,
  inputClass,
  selectClass,
} from "../systemSetupShared.jsx";

export function YearlyHolidayCreatePage() {
  const base = useSystemSetupBase();

  return (
    <SystemSetupPageShell
      title="Yearly Holiday Create"
      action={
        <Link
          to={`${base}/yearly-holiday/list`}
          className="btn btn-info btn-sm text-white"
        >
          Back to Yearly Holiday List
        </Link>
      }
    >
      <div className="space-y-5">
        <RequiredNotice />

        <FormGrid>
          <Field label="Holiday Category:" required>
            <select className={selectClass} defaultValue="">
              <option value="">Select Holiday Category</option>
              <option>Government Holiday</option>
              <option>Institution Holiday</option>
            </select>
          </Field>

          <Field label="Holiday Title:" required>
            <input className={inputClass} placeholder="Enter Holiday Title" />
          </Field>

          <Field label="From Date:" required>
            <input type="date" className={inputClass} />
          </Field>

          <Field label="To Date:" required>
            <input type="date" className={inputClass} />
          </Field>

          <Field label="Session Year:" required>
            <select className={selectClass} defaultValue="2026">
              <option>2026</option>
              <option>2025</option>
            </select>
          </Field>

          <div className="md:col-start-2">
            <button className="btn btn-success btn-sm text-white">
              Submit
            </button>
          </div>
        </FormGrid>
      </div>
    </SystemSetupPageShell>
  );
}

export function YearlyHolidayListPage() {
  const base = useSystemSetupBase();

  return (
    <SystemSetupPageShell
      title="Yearly Holiday List"
      action={
        <Link
          to={`${base}/yearly-holiday/create`}
          className="btn btn-info btn-sm text-white"
        >
          Create Yearly Holiday
        </Link>
      }
    >
      <EmptyTable
        columns={[
          "#",
          "Holiday Title",
          "Holiday Category",
          "From Date",
          "To Date",
          "Session",
          "Created By",
          "Action",
        ]}
        message="No yearly holiday data available."
      />
      <p className="mt-4 text-sm font-bold">Showing 0 to 0 of 0 results.</p>
    </SystemSetupPageShell>
  );
}
