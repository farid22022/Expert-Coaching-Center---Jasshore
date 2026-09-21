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

export function LeaveCategoryCreatePage() {
  const base = useSystemSetupBase();

  return (
    <SystemSetupPageShell
      title="Leave Category Create"
      action={
        <Link
          to={`${base}/leave-category/list`}
          className="btn btn-info btn-sm text-white"
        >
          Back to Leave Category List
        </Link>
      }
    >
      <div className="space-y-5">
        <RequiredNotice />

        <FormGrid>
          <Field label="Leave Category Name:" required>
            <input
              className={inputClass}
              placeholder="Enter Leave Category Name"
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

export function LeaveCategoryListPage() {
  const base = useSystemSetupBase();

  return (
    <SystemSetupPageShell
      title="Leave Category List"
      action={
        <Link
          to={`${base}/leave-category/create`}
          className="btn btn-info btn-sm text-white"
        >
          Create Leave Category
        </Link>
      }
    >
      <EmptyTable
        columns={["#", "Leave Category Name", "Created By", "Created Date", "Action"]}
        message="No leave category data available."
      />
      <p className="mt-4 text-sm font-bold">Showing 0 to 0 of 0 results.</p>
    </SystemSetupPageShell>
  );
}
