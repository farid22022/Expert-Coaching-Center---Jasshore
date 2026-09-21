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

export function ProfessionCreatePage() {
  const base = useSystemSetupBase();

  return (
    <SystemSetupPageShell
      title="Profession Create"
      action={
        <Link
          to={`${base}/profession/list`}
          className="btn btn-info btn-sm text-white"
        >
          Back to Profession List
        </Link>
      }
    >
      <div className="space-y-5">
        <RequiredNotice />

        <FormGrid>
          <Field label="Profession Name:" required>
            <input
              className={inputClass}
              placeholder="Enter Profession Name"
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

export function ProfessionListPage() {
  const base = useSystemSetupBase();

  return (
    <SystemSetupPageShell
      title="Profession List"
      action={
        <Link
          to={`${base}/profession/create`}
          className="btn btn-info btn-sm text-white"
        >
          Create Profession
        </Link>
      }
    >
      <EmptyTable
        columns={["#", "Profession Name", "Created By", "Created Date", "Action"]}
        message="No profession data available."
      />
      <p className="mt-4 text-sm font-bold">Showing 0 to 0 of 0 results.</p>
    </SystemSetupPageShell>
  );
}
