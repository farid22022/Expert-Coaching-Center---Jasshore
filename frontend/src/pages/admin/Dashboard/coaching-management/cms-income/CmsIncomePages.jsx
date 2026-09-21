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

export function CmsIncomeCreatePage() {
  const base = useCoachingManagementBase();

  return (
    <CoachingPageShell
      title="Cms Income Create"
      action={<Link to={`${base}/cms-income/list`} className="btn btn-info btn-sm text-white">Back to Cms Income List</Link>}
    >
      <div className="space-y-5">
        <RequiredNotice />
        <FormGrid>
          <Field label="Income Title:" required>
            <input className={inputClass} placeholder="Enter Income Title" />
          </Field>
          <Field label="Income Category:" required>
            <select className={selectClass} defaultValue="">
              <option value="" disabled>Select Income Category</option>
            </select>
          </Field>
          <Field label="Amount:" required>
            <input type="number" className={inputClass} placeholder="Enter Amount" />
          </Field>
          <Field label="Received By:" required>
            <select className={selectClass}>
              <option>Cash</option>
              <option>Bank</option>
            </select>
          </Field>
          <Field label="Income Date:" required>
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

export function CmsIncomeListPage() {
  const base = useCoachingManagementBase();

  return (
    <div className="space-y-5">
      <CoachingPageShell
        title="Cms Income Search"
        action={<Link to={`${base}/cms-income/create`} className="btn btn-info btn-sm text-white">Create Cms Income</Link>}
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

      <CoachingPageShell title="Cms Income List">
        <EmptyTable columns={["SL", "Income Title", "Category", "Amount", "Received By", "Income Date", "Created By", "Action"]} />
      </CoachingPageShell>
    </div>
  );
}
