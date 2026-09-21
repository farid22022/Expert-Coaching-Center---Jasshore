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

export function GenderCreatePage() {
  const base = useSystemSetupBase();

  return (
    <SystemSetupPageShell
      title="Gender Create"
      action={
        <Link
          to={`${base}/gender/list`}
          className="btn btn-info btn-sm text-white"
        >
          Back to Gender List
        </Link>
      }
    >
      <div className="space-y-5">
        <RequiredNotice />

        <FormGrid>
          <Field label="Gender Name:" required>
            <input
              className={inputClass}
              placeholder="Enter Gender Name"
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

export function GenderListPage() {
  const base = useSystemSetupBase();

  return (
    <SystemSetupPageShell
      title="Gender List"
      action={
        <Link
          to={`${base}/gender/create`}
          className="btn btn-info btn-sm text-white"
        >
          Create Gender
        </Link>
      }
    >
      <EmptyTable
        columns={["#", "Gender Name", "Created By", "Created Date", "Action"]}
        message="No gender data available."
      />
      <p className="mt-4 text-sm font-bold">Showing 0 to 0 of 0 results.</p>
    </SystemSetupPageShell>
  );
}
