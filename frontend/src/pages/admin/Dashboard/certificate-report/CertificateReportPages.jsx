import { Link } from "react-router-dom";
import {
  CertificateReportPageShell,
  useCertificateReportBase,
} from "./certificateReportShared.jsx";

const fieldClass =
  "select select-bordered select-sm h-9 min-h-9 w-full rounded border-slate-300 bg-white text-sm focus:border-blue-500 focus:outline-none";
const inputClass =
  "input input-bordered input-sm h-9 min-h-9 w-full rounded border-slate-300 bg-white text-sm focus:border-blue-500 focus:outline-none";
const labelClass = "text-sm font-bold text-slate-900";

function RequiredNotice() {
  return (
    <div className="rounded border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-bold text-red-500">
      (*) field required
    </div>
  );
}

function Field({ label, required = false, children }) {
  return (
    <>
      <label className={labelClass}>
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div>{children}</div>
    </>
  );
}

export function GiveCertificatePage() {
  const base = useCertificateReportBase();

  return (
    <CertificateReportPageShell
      title="Give Certificate"
      action={
        <Link to={`${base}/certificate-report`} className="btn btn-info btn-sm text-white">
          Certificate Report
        </Link>
      }
    >
      <div className="space-y-5">
        <RequiredNotice />

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-[180px_1fr_180px_1fr] md:items-center">
          <Field label="Session Year:" required>
            <select className={fieldClass} defaultValue="2026">
              <option>2026</option>
              <option>2025</option>
            </select>
          </Field>

          <Field label="School Shift:">
            <select className={fieldClass} defaultValue="">
              <option value="" disabled>Select Shift</option>
              <option>Morning</option>
              <option>Day</option>
            </select>
          </Field>

          <Field label="Class:" required>
            <select className={fieldClass} defaultValue="">
              <option value="" disabled>Select class</option>
              <option>Class 09</option>
              <option>Class 10</option>
            </select>
          </Field>

          <Field label="Section:">
            <select className={fieldClass} defaultValue="">
              <option value="" disabled>Select Section</option>
              <option>Day</option>
            </select>
          </Field>

          <Field label="Student ID:">
            <input className={inputClass} placeholder="Enter Student ID" />
          </Field>

          <Field label="Roll:">
            <input className={inputClass} placeholder="Enter Roll" />
          </Field>

          <Field label="Certificate Type:" required>
            <select className={fieldClass} defaultValue="">
              <option value="" disabled>Select Certificate Type</option>
              <option>Testimonial</option>
              <option>Character Certificate</option>
              <option>Transfer Certificate</option>
            </select>
          </Field>

          <Field label="Issue Date:" required>
            <input type="date" className={inputClass} defaultValue="2026-09-18" />
          </Field>

          <div className="md:col-start-2">
            <button className="btn btn-info btn-sm text-white">Search</button>
          </div>
        </div>
      </div>
    </CertificateReportPageShell>
  );
}

export function CertificateReportPage() {
  const base = useCertificateReportBase();

  return (
    <div className="space-y-5">
      <CertificateReportPageShell
        title="Certificate Report Search"
        action={
          <Link to={`${base}/give-certificate`} className="btn btn-info btn-sm text-white">
            Give Certificate
          </Link>
        }
      >
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-[180px_1fr_180px_1fr] md:items-center">
          <Field label="Session Year:">
            <select className={fieldClass} defaultValue="2026">
              <option>2026</option>
              <option>2025</option>
            </select>
          </Field>

          <Field label="Class:">
            <select className={fieldClass} defaultValue="">
              <option value="" disabled>Select Class</option>
              <option>Class 09</option>
              <option>Class 10</option>
            </select>
          </Field>

          <Field label="Student ID:">
            <input className={inputClass} placeholder="Student ID" />
          </Field>

          <Field label="Certificate Type:">
            <select className={fieldClass} defaultValue="">
              <option value="" disabled>Select Certificate Type</option>
              <option>Testimonial</option>
              <option>Character Certificate</option>
              <option>Transfer Certificate</option>
            </select>
          </Field>

          <Field label="From Date:">
            <input type="date" className={inputClass} />
          </Field>

          <Field label="To Date:">
            <input type="date" className={inputClass} />
          </Field>

          <div className="md:col-start-2 flex gap-2">
            <button className="btn btn-info btn-sm text-white">Search</button>
            <button className="btn btn-success btn-sm text-white">Print</button>
            <button className="btn btn-primary btn-sm">PDF</button>
          </div>
        </div>
      </CertificateReportPageShell>

      <section className="overflow-hidden rounded-lg border border-base-300 bg-base-100 shadow-sm">
        <header className="flex min-h-11 items-center bg-[#476db4] px-5 py-2 text-white">
          <h2 className="text-base font-bold sm:text-lg">Certificate Report List</h2>
        </header>

        <div className="overflow-x-auto p-5">
          <table className="table table-sm min-w-[900px] border border-base-300">
            <thead className="bg-base-200 text-slate-950">
              <tr>
                <th>SL</th>
                <th>Student ID</th>
                <th>Student Name</th>
                <th>Class</th>
                <th>Certificate Type</th>
                <th>Issue Date</th>
                <th>Created By</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={8} className="py-8 text-center text-sm text-slate-500">
                  No certificate data available.
                </td>
              </tr>
            </tbody>
          </table>
          <p className="mt-4 text-sm font-bold">Showing 0 to 0 of 0 results.</p>
        </div>
      </section>
    </div>
  );
}

export function CertificateSettingsPage() {
  return (
    <CertificateReportPageShell title="Certificate Settings">
      <div className="space-y-5">
        <RequiredNotice />

        <div className="mx-auto max-w-5xl space-y-5">
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-[220px_1fr] md:items-center">
            <Field label="Certificate Title:" required>
              <input className={inputClass} placeholder="Enter Certificate Title" />
            </Field>

            <Field label="Certificate Type:" required>
              <select className={fieldClass} defaultValue="">
                <option value="" disabled>Select Certificate Type</option>
                <option>Testimonial</option>
                <option>Character Certificate</option>
                <option>Transfer Certificate</option>
              </select>
            </Field>

            <Field label="Template:" required>
              <select className={fieldClass} defaultValue="Template 1">
                <option>Template 1</option>
                <option>Template 2</option>
              </select>
            </Field>

            <Field label="Layout:">
              <select className={fieldClass} defaultValue="Portrait">
                <option>Portrait</option>
                <option>Landscape</option>
              </select>
            </Field>

            <Field label="Authorized Person:">
              <input className={inputClass} placeholder="Enter Authorized Person" />
            </Field>

            <Field label="Designation:">
              <input className={inputClass} placeholder="Enter Designation" />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-[220px_1fr]">
            <label className={labelClass}>Certificate Body:</label>
            <textarea
              className="textarea textarea-bordered min-h-40 w-full rounded border-slate-300 bg-white text-sm"
              placeholder="Write certificate body..."
            />
          </div>

          <div className="md:ml-[220px]">
            <button className="btn btn-success btn-sm text-white">Submit</button>
          </div>
        </div>
      </div>
    </CertificateReportPageShell>
  );
}
