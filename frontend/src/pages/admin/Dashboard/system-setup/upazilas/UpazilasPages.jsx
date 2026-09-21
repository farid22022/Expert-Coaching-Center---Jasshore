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

export function UpazilasCreatePage() {
  const base = useSystemSetupBase();

  return (
    <SystemSetupPageShell
      title="Upazilas Create"
      action={
        <Link
          to={`${base}/upazilas/list`}
          className="btn btn-info btn-sm text-white"
        >
          Back to Upazilas List
        </Link>
      }
    >
      <div className="space-y-5">
        <RequiredNotice />

        <FormGrid>
          <Field label="Division:" required>
            <select className={selectClass} defaultValue="">
              <option value="">Select Division</option>
            </select>
          </Field>

          <Field label="District:" required>
            <select className={selectClass} defaultValue="">
              <option value="">Select District</option>
            </select>
          </Field>

          <Field label="Upazila Name:" required>
            <input className={inputClass} placeholder="Enter Upazila Name" />
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

export function UpazilasListPage() {
  const base = useSystemSetupBase();

  return (
    <SystemSetupPageShell
      title="Upazilas List"
      action={
        <Link
          to={`${base}/upazilas/create`}
          className="btn btn-info btn-sm text-white"
        >
          Create Upazilas
        </Link>
      }
    >
      <EmptyTable
        columns={["#", "Division Name", "District Name", "Upazila Name", "Created By", "Created Date", "Action"]}
        message="No upazila data available."
      />
      <p className="mt-4 text-sm font-bold">Showing 0 to 0 of 0 results.</p>
    </SystemSetupPageShell>
  );
}
