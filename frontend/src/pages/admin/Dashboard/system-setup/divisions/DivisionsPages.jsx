import { Link } from "react-router-dom";
import {
  SystemSetupPageShell,
  useSystemSetupBase,
  RequiredNotice,
  Field,
  FormGrid,
  EmptyTable,
  inputClass,
} from "../systemSetupShared.jsx";

export function DivisionsCreatePage() {
  const base = useSystemSetupBase();

  return (
    <SystemSetupPageShell
      title="Divisions Create"
      action={
        <Link
          to={`${base}/divisions/list`}
          className="btn btn-info btn-sm text-white"
        >
          Back to Divisions List
        </Link>
      }
    >
      <div className="space-y-5">
        <RequiredNotice />

        <FormGrid>
          <Field label="Division Name:" required>
            <input
              className={inputClass}
              placeholder="Enter Division Name"
            />
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

export function DivisionsListPage() {
  const base = useSystemSetupBase();

  return (
    <SystemSetupPageShell
      title="Divisions List"
      action={
        <Link
          to={`${base}/divisions/create`}
          className="btn btn-info btn-sm text-white"
        >
          Create Divisions
        </Link>
      }
    >
      <EmptyTable
        columns={["#", "Division Name", "Created By", "Created Date", "Action"]}
        message="No divisions data available."
      />
      <p className="mt-4 text-sm font-bold">Showing 0 to 0 of 0 results.</p>
    </SystemSetupPageShell>
  );
}
