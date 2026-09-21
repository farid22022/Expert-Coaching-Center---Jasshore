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

export function CmsExpenseCategoryCreatePage() {
  const base = useCoachingManagementBase();

  return (
    <CoachingPageShell
      title="CMS Expense Category Create"
      action={<Link to={`${base}/cms-expense-category/list`} className="btn btn-info btn-sm text-white">Back to CMS Expense Category List</Link>}
    >
      <div className="space-y-5">
        <RequiredNotice />
        <FormGrid>
          <Field label="Expense Category Name:" required>
            <input className={inputClass} placeholder="Enter Expense Category Name" />
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

export function CmsExpenseCategoryListPage() {
  const base = useCoachingManagementBase();

  return (
    <CoachingPageShell
      title="CMS Expense Category List"
      action={<Link to={`${base}/cms-expense-category/create`} className="btn btn-info btn-sm text-white">Create CMS Expense Category</Link>}
    >
      <EmptyTable columns={["#", "Expense Category Name", "Created By", "Created Date", "Action"]} />
      <p className="mt-4 text-sm font-bold">Showing 0 to 0 of 0 results.</p>
    </CoachingPageShell>
  );
}
