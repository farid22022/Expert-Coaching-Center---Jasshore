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

export function DesignationCreatePage() {
  const base = useSystemSetupBase();

  return (
    <SystemSetupPageShell
      title="Designation Create"
      action={
        <Link
          to={`${base}/designation/list`}
          className="btn btn-info btn-sm text-white"
        >
          Back to Designation List
        </Link>
      }
    >
      <div className="space-y-5">
        <RequiredNotice />

        <FormGrid>
          <Field label="Designation Name:" required>
            <input
              className={inputClass}
              placeholder="Enter Designation Name"
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

export function DesignationListPage() {
  const base = useSystemSetupBase();

  return (
    <SystemSetupPageShell
      title="Designation List"
      action={
        <Link
          to={`${base}/designation/create`}
          className="btn btn-info btn-sm text-white"
        >
          Create Designation
        </Link>
      }
    >
      <EmptyTable
        columns={["#", "Designation Name", "Created By", "Created Date", "Action"]}
        message="No designation data available."
      />
      <p className="mt-4 text-sm font-bold">Showing 0 to 0 of 0 results.</p>
    </SystemSetupPageShell>
  );
}
