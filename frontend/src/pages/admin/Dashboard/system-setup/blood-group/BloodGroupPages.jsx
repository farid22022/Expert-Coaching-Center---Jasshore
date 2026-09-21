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

export function BloodGroupCreatePage() {
  const base = useSystemSetupBase();

  return (
    <SystemSetupPageShell
      title="Blood Group Create"
      action={
        <Link
          to={`${base}/blood-group/list`}
          className="btn btn-info btn-sm text-white"
        >
          Back to Blood Group List
        </Link>
      }
    >
      <div className="space-y-5">
        <RequiredNotice />

        <FormGrid>
          <Field label="Blood Group Name:" required>
            <input
              className={inputClass}
              placeholder="Enter Blood Group Name"
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

export function BloodGroupListPage() {
  const base = useSystemSetupBase();

  return (
    <SystemSetupPageShell
      title="Blood Group List"
      action={
        <Link
          to={`${base}/blood-group/create`}
          className="btn btn-info btn-sm text-white"
        >
          Create Blood Group
        </Link>
      }
    >
      <EmptyTable
        columns={["#", "Blood Group Name", "Created By", "Created Date", "Action"]}
        message="No blood group data available."
      />
      <p className="mt-4 text-sm font-bold">Showing 0 to 0 of 0 results.</p>
    </SystemSetupPageShell>
  );
}
