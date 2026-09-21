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

export function ReligionCreatePage() {
  const base = useSystemSetupBase();

  return (
    <SystemSetupPageShell
      title="Religion Create"
      action={
        <Link
          to={`${base}/religion/list`}
          className="btn btn-info btn-sm text-white"
        >
          Back to Religion List
        </Link>
      }
    >
      <div className="space-y-5">
        <RequiredNotice />

        <FormGrid>
          <Field label="Religion Name:" required>
            <input
              className={inputClass}
              placeholder="Enter Religion Name"
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

export function ReligionListPage() {
  const base = useSystemSetupBase();

  return (
    <SystemSetupPageShell
      title="Religion List"
      action={
        <Link
          to={`${base}/religion/create`}
          className="btn btn-info btn-sm text-white"
        >
          Create Religion
        </Link>
      }
    >
      <EmptyTable
        columns={["#", "Religion Name", "Created By", "Created Date", "Action"]}
        message="No religion data available."
      />
      <p className="mt-4 text-sm font-bold">Showing 0 to 0 of 0 results.</p>
    </SystemSetupPageShell>
  );
}
