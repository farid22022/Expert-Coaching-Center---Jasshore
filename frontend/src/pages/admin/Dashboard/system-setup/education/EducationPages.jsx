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

export function EducationCreatePage() {
  const base = useSystemSetupBase();

  return (
    <SystemSetupPageShell
      title="Education Create"
      action={
        <Link
          to={`${base}/education/list`}
          className="btn btn-info btn-sm text-white"
        >
          Back to Education List
        </Link>
      }
    >
      <div className="space-y-5">
        <RequiredNotice />

        <FormGrid>
          <Field label="Education Name:" required>
            <input
              className={inputClass}
              placeholder="Enter Education Name"
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

export function EducationListPage() {
  const base = useSystemSetupBase();

  return (
    <SystemSetupPageShell
      title="Education List"
      action={
        <Link
          to={`${base}/education/create`}
          className="btn btn-info btn-sm text-white"
        >
          Create Education
        </Link>
      }
    >
      <EmptyTable
        columns={["#", "Education Name", "Created By", "Created Date", "Action"]}
        message="No education data available."
      />
      <p className="mt-4 text-sm font-bold">Showing 0 to 0 of 0 results.</p>
    </SystemSetupPageShell>
  );
}
