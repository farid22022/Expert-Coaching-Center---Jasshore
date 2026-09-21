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

function FeeSearchFields() {
  return (
    <FormGrid>
      <Field label="Session Year:">
        <select className={selectClass} defaultValue="2026">
          <option>2026</option>
        </select>
      </Field>
      <Field label="Class:">
        <select className={selectClass} defaultValue="">
          <option value="" disabled>Select Class</option>
        </select>
      </Field>
      <Field label="Student ID:">
        <input className={inputClass} placeholder="Enter Student ID" />
      </Field>
      <Field label="Month:">
        <select className={selectClass} defaultValue="">
          <option value="" disabled>Select Month</option>
          <option>January</option>
          <option>February</option>
        </select>
      </Field>
    </FormGrid>
  );
}

export function CoachingFeeCreatePage() {
  const base = useCoachingManagementBase();

  return (
    <CoachingPageShell
      title="Coaching Fee Create"
      action={<Link to={`${base}/coaching-fee/list`} className="btn btn-info btn-sm text-white">Back to Coaching Fee List</Link>}
    >
      <div className="space-y-5">
        <RequiredNotice />
        <FormGrid>
          <Field label="Student ID:" required>
            <input className={inputClass} placeholder="Enter Student ID" />
          </Field>
          <Field label="Fee Name:" required>
            <input className={inputClass} placeholder="Enter Fee Name" />
          </Field>
          <Field label="Amount:" required>
            <input type="number" className={inputClass} placeholder="0" />
          </Field>
          <Field label="Paid By:" required>
            <select className={selectClass}>
              <option>Cash</option>
              <option>Bank</option>
              <option>Mobile Banking</option>
            </select>
          </Field>
          <Field label="Discount:">
            <input type="number" className={inputClass} defaultValue="0" />
          </Field>
          <Field label="Due:">
            <input type="number" className={inputClass} defaultValue="0" />
          </Field>
          <Field label="Payment Date:" required>
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

export function CoachingFeeListPage() {
  const base = useCoachingManagementBase();

  return (
    <div className="space-y-5">
      <CoachingPageShell
        title="Coaching Fee Search"
        action={<Link to={`${base}/coaching-fee/create`} className="btn btn-info btn-sm text-white">Create Coaching Fee</Link>}
      >
        <FeeSearchFields />
        <ButtonRow className="mx-auto mt-5 max-w-6xl md:pl-[188px]">
          <button className="btn btn-info btn-sm text-white">Search</button>
          <button className="btn btn-success btn-sm text-white">Print</button>
        </ButtonRow>
      </CoachingPageShell>

      <CoachingPageShell title="Coaching Fee List">
        <EmptyTable columns={["SL", "Student ID", "Student Name", "Fee Details", "Amount", "Discount", "Due", "Paid By", "Date", "Action"]} />
      </CoachingPageShell>
    </div>
  );
}

export function CoachingFeeDuesPage() {
  return (
    <div className="space-y-5">
      <CoachingPageShell title="Coaching Fee Dues Search">
        <FeeSearchFields />
        <ButtonRow className="mx-auto mt-5 max-w-6xl md:pl-[188px]">
          <button className="btn btn-info btn-sm text-white">Search</button>
          <button className="btn btn-secondary btn-sm">Print</button>
          <button className="btn btn-primary btn-sm">PDF</button>
          <button className="btn btn-accent btn-sm">Excel</button>
        </ButtonRow>
      </CoachingPageShell>

      <CoachingPageShell title="Coaching Fee Dues">
        <EmptyTable columns={["Student ID", "Student Name", "Class", "Month", "Fee", "Paid", "Due"]} />
      </CoachingPageShell>
    </div>
  );
}

export function FeesCollectionSummaryPage() {
  return (
    <div className="space-y-5">
      <CoachingPageShell title="Fees Collection Summary Search">
        <FormGrid>
          <Field label="From Date:">
            <input type="date" className={inputClass} />
          </Field>
          <Field label="To Date:">
            <input type="date" className={inputClass} />
          </Field>
          <Field label="Class:">
            <select className={selectClass} defaultValue="">
              <option value="" disabled>Select Class</option>
            </select>
          </Field>
          <Field label="Paid By:">
            <select className={selectClass} defaultValue="">
              <option value="" disabled>Select Payment Method</option>
            </select>
          </Field>
          <div className="md:col-start-2">
            <ButtonRow>
              <button className="btn btn-info btn-sm text-white">Search</button>
              <button className="btn btn-success btn-sm text-white">Print</button>
            </ButtonRow>
          </div>
        </FormGrid>
      </CoachingPageShell>

      <CoachingPageShell title="Fees Collection Summary">
        <EmptyTable columns={["Date", "Total Invoice", "Collected Amount", "Discount", "Due", "Net Collection"]} />
      </CoachingPageShell>
    </div>
  );
}

export function CoachingIncomeStatementPage() {
  return (
    <div className="space-y-5">
      <CoachingPageShell title="Income Statement Search">
        <FormGrid>
          <Field label="From Date:">
            <input type="date" className={inputClass} />
          </Field>
          <Field label="To Date:">
            <input type="date" className={inputClass} />
          </Field>
          <div className="md:col-start-2">
            <ButtonRow>
              <button className="btn btn-info btn-sm text-white">Search</button>
              <button className="btn btn-success btn-sm text-white">Print</button>
              <button className="btn btn-primary btn-sm">PDF</button>
            </ButtonRow>
          </div>
        </FormGrid>
      </CoachingPageShell>

      <CoachingPageShell title="Income Statement">
        <EmptyTable columns={["Particulars", "Income", "Expense", "Balance"]} />
      </CoachingPageShell>
    </div>
  );
}

export function CoachingPaymentHistoryPage() {
  return (
    <div className="space-y-5">
      <CoachingPageShell title="Payment History Search">
        <FormGrid>
          <Field label="Student ID:">
            <input className={inputClass} placeholder="Enter Student ID" />
          </Field>
          <Field label="From Date:">
            <input type="date" className={inputClass} />
          </Field>
          <Field label="To Date:">
            <input type="date" className={inputClass} />
          </Field>
          <div />
          <div className="md:col-start-2">
            <ButtonRow>
              <button className="btn btn-info btn-sm text-white">Search</button>
              <button className="btn btn-success btn-sm text-white">Print</button>
              <button className="btn btn-primary btn-sm">Download PDF</button>
            </ButtonRow>
          </div>
        </FormGrid>
      </CoachingPageShell>

      <CoachingPageShell title="Payment History">
        <EmptyTable columns={["SL", "Student ID", "Student Name", "Invoice ID", "Amount", "Paid By", "Payment Date", "Due"]} />
      </CoachingPageShell>
    </div>
  );
}

export function CoachingFeeSetupPage() {
  return (
    <CoachingPageShell title="Coaching Fee Setup">
      <div className="space-y-5">
        <RequiredNotice />
        <FormGrid>
          <Field label="Session Year:" required>
            <select className={selectClass} defaultValue="2026">
              <option>2026</option>
            </select>
          </Field>
          <Field label="Class:" required>
            <select className={selectClass} defaultValue="">
              <option value="" disabled>Select Class</option>
            </select>
          </Field>
          <Field label="Fee Name:" required>
            <input className={inputClass} placeholder="Enter Fee Name" />
          </Field>
          <Field label="Amount:" required>
            <input type="number" className={inputClass} placeholder="Enter Amount" />
          </Field>
          <Field label="Month:">
            <select className={selectClass}>
              <option>January</option>
              <option>February</option>
              <option>March</option>
            </select>
          </Field>
          <Field label="One Time?">
            <select className={selectClass}>
              <option>No</option>
              <option>Yes</option>
            </select>
          </Field>
          <div className="md:col-start-2">
            <button className="btn btn-success btn-sm text-white">Submit</button>
          </div>
        </FormGrid>
      </div>
    </CoachingPageShell>
  );
}
