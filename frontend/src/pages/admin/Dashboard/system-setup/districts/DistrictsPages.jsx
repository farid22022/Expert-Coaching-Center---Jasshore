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

export function DistrictsCreatePage() {
  const base = useSystemSetupBase();

  return (
    <SystemSetupPageShell
      title="Districts Create"
      action={
        <Link
          to={`${base}/districts/list`}
          className="btn btn-info btn-sm text-white"
        >
          Back to Districts List
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

          <Field label="District Name:" required>
            <input className={inputClass} placeholder="Enter District Name" />
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

export function DistrictsListPage() {
  const base = useSystemSetupBase();

  return (
    <SystemSetupPageShell
      title="Districts List"
      action={
        <Link
          to={`${base}/districts/create`}
          className="btn btn-info btn-sm text-white"
        >
          Create Districts
        </Link>
      }
    >
      <EmptyTable
        columns={["#", "Division Name", "District Name", "Created By", "Created Date", "Action"]}
        message="No district data available."
      />
      <p className="mt-4 text-sm font-bold">Showing 0 to 0 of 0 results.</p>
    </SystemSetupPageShell>
  );
}
