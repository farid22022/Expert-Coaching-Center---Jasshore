import { Link } from "react-router-dom";
import {
  CoachingPageShell,
  useCoachingManagementBase,
  RequiredNotice,
  Field,
  FormGrid,
  EmptyTable,
  ButtonRow,
  inputClass,
  selectClass,
  textareaClass,
} from "../coachingManagementShared.jsx";

export function CmsExpenseCreatePage() {
  const base = useCoachingManagementBase();

  return (
    <CoachingPageShell
      title="CMS Expense Create"
      action={<Link to={`${base}/cms-expense/list`} className="btn btn-info btn-sm text-white">Back to CMS Expense List</Link>}
    >
      <div className="space-y-5">
        <RequiredNotice />
        <FormGrid>
          <Field label="Expense Title:" required>
            <input className={inputClass} placeholder="Enter Expense Title" />
          </Field>
          <Field label="Expense Category:" required>
            <select className={selectClass} defaultValue="">
              <option value="" disabled>Select Expense Category</option>
            </select>
          </Field>
          <Field label="Amount:" required>
            <input type="number" className={inputClass} placeholder="Enter Amount" />
          </Field>
          <Field label="Paid By:" required>
            <select className={selectClass}>
              <option>Cash</option>
              <option>Bank</option>
            </select>
          </Field>
          <Field label="Expense Date:" required>
            <input type="date" className={inputClass} />
          </Field>
          <Field label="Short Note:">
            <textarea className={textareaClass} placeholder="N/A" />
          </Field>
          <div className="md:col-start-2">
            <button className="btn btn-success btn-sm text-white">Submit</button>
          </div>
        </FormGrid>
      </div>
    </CoachingPageShell>
  );
}

export function CmsExpenseListPage() {
  const base = useCoachingManagementBase();

  return (
    <div className="space-y-5">
      <CoachingPageShell
        title="CMS Expense Search"
        action={<Link to={`${base}/cms-expense/create`} className="btn btn-info btn-sm text-white">Create CMS Expense</Link>}
      >
        <FormGrid>
          <Field label="From Date:">
            <input type="date" className={inputClass} />
          </Field>
          <Field label="To Date:">
            <input type="date" className={inputClass} />
          </Field>
          <Field label="Category:">
            <select className={selectClass} defaultValue="">
              <option value="" disabled>Select Category</option>
            </select>
          </Field>
          <div />
          <div className="md:col-start-2">
            <ButtonRow>
              <button className="btn btn-info btn-sm text-white">Search</button>
              <button className="btn btn-success btn-sm text-white">Print</button>
            </ButtonRow>
          </div>
        </FormGrid>
      </CoachingPageShell>

      <CoachingPageShell title="CMS Expense List">
        <EmptyTable columns={["SL", "Expense Title", "Category", "Amount", "Paid By", "Expense Date", "Created By", "Action"]} />
      </CoachingPageShell>
    </div>
  );
}

export function CmsExpenseReportPage() {
  return (
    <div className="space-y-5">
      <CoachingPageShell title="CMS Expense Report Search">
        <FormGrid>
          <Field label="From Date:">
            <input type="date" className={inputClass} />
          </Field>
          <Field label="To Date:">
            <input type="date" className={inputClass} />
          </Field>
          <Field label="Category:">
            <select className={selectClass} defaultValue="">
              <option value="" disabled>Select Category</option>
            </select>
          </Field>
          <div />
          <div className="md:col-start-2">
            <ButtonRow>
              <button className="btn btn-info btn-sm text-white">Search</button>
              <button className="btn btn-success btn-sm text-white">Print</button>
              <button className="btn btn-primary btn-sm">PDF</button>
            </ButtonRow>
          </div>
        </FormGrid>
      </CoachingPageShell>

      <CoachingPageShell title="CMS Expense Report">
        <EmptyTable columns={["Expense Category", "Total Amount", "From Date", "To Date"]} />
      </CoachingPageShell>
    </div>
  );
}
