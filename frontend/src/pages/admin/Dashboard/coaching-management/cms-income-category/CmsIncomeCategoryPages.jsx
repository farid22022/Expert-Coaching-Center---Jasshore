import { Link } from "react-router-dom";
import {
  CoachingPageShell,
  useCoachingManagementBase,
  RequiredNotice,
  Field,
  FormGrid,
  EmptyTable,
  inputClass,
} from "../coachingManagementShared.jsx";

export function CmsIncomeCategoryCreatePage() {
  const base = useCoachingManagementBase();

  return (
    <CoachingPageShell
      title="Cms Income Category Create"
      action={<Link to={`${base}/cms-income-category/list`} className="btn btn-info btn-sm text-white">Back to Cms Income Category List</Link>}
    >
      <div className="space-y-5">
        <RequiredNotice />
        <FormGrid>
          <Field label="Income Category Name:" required>
            <input className={inputClass} placeholder="Enter Income Category Name" />
          </Field>
          <div />
          <div className="md:col-start-2">
            <button className="btn btn-success btn-sm text-white">Submit</button>
          </div>
        </FormGrid>
      </div>
    </CoachingPageShell>
  );
}

export function CmsIncomeCategoryListPage() {
  const base = useCoachingManagementBase();

  return (
    <CoachingPageShell
      title="Cms Income Category List"
      action={<Link to={`${base}/cms-income-category/create`} className="btn btn-info btn-sm text-white">Create Cms Income Category</Link>}
    >
      <EmptyTable columns={["Income Category Name", "Created By", "Created Date", "Action"]} />
      <p className="mt-4 text-sm font-bold">Showing 0 to 0 of 0 results.</p>
    </CoachingPageShell>
  );
}
