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

export function HolidayCategoryCreatePage() {
  const base = useSystemSetupBase();

  return (
    <SystemSetupPageShell
      title="Holiday Category Create"
      action={
        <Link
          to={`${base}/holiday-category/list`}
          className="btn btn-info btn-sm text-white"
        >
          Back to Holiday Category List
        </Link>
      }
    >
      <div className="space-y-5">
        <RequiredNotice />

        <FormGrid>
          <Field label="Holiday Category Name:" required>
            <input
              className={inputClass}
              placeholder="Enter Holiday Category Name"
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

export function HolidayCategoryListPage() {
  const base = useSystemSetupBase();

  return (
    <SystemSetupPageShell
      title="Holiday Category List"
      action={
        <Link
          to={`${base}/holiday-category/create`}
          className="btn btn-info btn-sm text-white"
        >
          Create Holiday Category
        </Link>
      }
    >
      <EmptyTable
        columns={["#", "Holiday Category Name", "Created By", "Created Date", "Action"]}
        message="No holiday category data available."
      />
      <p className="mt-4 text-sm font-bold">Showing 0 to 0 of 0 results.</p>
    </SystemSetupPageShell>
  );
}
