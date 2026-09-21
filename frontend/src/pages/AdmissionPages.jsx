import { useState } from "react";
import PageHeader from "../components/common/PageHeader.jsx";
import SEO from "../components/common/SEO.jsx";
import { admissionService } from "../services/api.js";

const containerClass = "mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8";
const fieldClass = "grid gap-1 text-sm font-bold text-slate-700";
const inputClass = "input input-bordered w-full";
const primaryButton = "btn bg-emerald-700 text-white hover:bg-emerald-800";

const sections = {
  "Student Information": ["Full Name", "Bengali Name", "Blood Group", "Student UID", "Mobile", "Email", "Date of Birth", "Birth Certificate Number", "Religion", "Gender", "Country", "Student Photograph"],
  "Father Information": ["Father Name", "Father Bengali Name", "Father Mobile", "Father NID", "Father Date of Birth", "Father Profession"],
  "Mother Information": ["Mother Name", "Mother Bengali Name", "Mother Mobile", "Mother NID", "Mother Date of Birth", "Mother Profession"],
  Guardian: ["Guardian Name", "Guardian Mobile", "Relationship"],
  "Academic Information": ["Category", "Session", "Shift", "Class", "Section", "Group", "Roll", "Version", "Register Number", "Student ID", "Admission Date"],
  "Previous Institution": ["Previous School Name", "Previous Class", "Previous Roll"],
  Payment: ["Payment Method", "Amount", "Sender Number", "Transaction Number", "Transaction ID"],
};

export function OnlineAdmissionPage() {
  const [submitted, setSubmitted] = useState(null);

  async function submit(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setSubmitted(await admissionService.submit(data));
  }

  return (
    <>
      <SEO title="Online Admission" />
      <PageHeader
        title="Online Admission"
        eyebrow="Admission"
        description="Mock admission submission with printable application preview."
      />
      <section>
        <div className={containerClass}>
          <form className="grid gap-5" onSubmit={submit}>
            {Object.entries(sections).map(([title, fields]) => (
              <fieldset className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm" key={title}>
                <legend className="px-2 text-lg font-black text-emerald-950">{title}</legend>
                <div className="grid gap-4 pt-3 md:grid-cols-2 lg:grid-cols-3">
                  {fields.map((f) => (
                    <label className={fieldClass} key={f}>
                      {f}
                      <input
                        className={inputClass}
                        required={["Full Name", "Mobile", "Class"].includes(f)}
                        name={f}
                        type={f.includes("Date") ? "date" : "text"}
                      />
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
            <button className={`${primaryButton} w-fit`}>Submit Application</button>
          </form>

          {submitted && (
            <div className="printable alert alert-success mt-6 flex-col items-start">
              <h2 className="text-xl font-black">Application Submitted</h2>
              <p>
                Reference: <strong>{submitted.applicationId}</strong>
              </p>
              <button className="btn no-print" onClick={() => window.print()}>
                Print Application
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export function AdmissionResultPage() {
  return <SearchStatus title="Admission Result" fields={["Application ID", "Mobile Number"]} />;
}

export function ApplicantPage() {
  return <SearchStatus title="Applicant's Form" fields={["Application ID", "Mobile", "Name"]} />;
}

function SearchStatus({ title, fields }) {
  const [status, setStatus] = useState(null);

  return (
    <>
      <SEO title={title} />
      <PageHeader title={title} eyebrow="Admission" />
      <section>
        <div className={containerClass}>
          <div className="grid gap-4 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm md:grid-cols-2 lg:grid-cols-4">
            {fields.map((f) => (
              <label className={fieldClass} key={f}>
                {f}
                <input className={inputClass} />
              </label>
            ))}
            <button
              className={`${primaryButton} self-end`}
              onClick={async () => setStatus(await admissionService.status())}
            >
              Search
            </button>
          </div>

          {status && (
            <div className="card mt-6 border border-emerald-100 bg-base-100 shadow-sm">
              <div className="card-body">
                <h2 className="card-title text-emerald-950">{status.name}</h2>
                <p>Application: {status.applicationId}</p>
                <p className="badge badge-success badge-outline font-bold">{status.status}</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export function BlankFormPage() {
  return (
    <PrintableDoc
      title="Blank Admission Form"
      lines={[
        "Student information",
        "Parent information",
        "Academic information",
        "Guardian information",
        "Photograph area",
        "Applicant and guardian signatures",
      ]}
    />
  );
}

export function AdmitCardPage() {
  return (
    <PrintableDoc
      title="Admit Card"
      search
      lines={[
        "Institution logo and name",
        "Student photo and name",
        "Roll, class, exam, venue",
        "Subject-wise exam dates",
        "Authorized signature",
      ]}
    />
  );
}

function PrintableDoc({ title, lines, search }) {
  return (
    <>
      <SEO title={title} />
      <PageHeader title={title} eyebrow="Admission" />
      <section className="printable">
        <div className={containerClass}>
          {search && (
            <div className="no-print mb-5 grid gap-4 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm md:grid-cols-4">
              {["Student ID", "Roll", "Application ID"].map((field) => (
                <label className={fieldClass} key={field}>
                  {field}
                  <input className={inputClass} />
                </label>
              ))}
              <button className={`${primaryButton} self-end`}>Search</button>
            </div>
          )}

          <div className="rounded-2xl border border-emerald-100 bg-white p-8 shadow-sm">
            <h2 className="mb-5 text-2xl font-black text-emerald-950">{title}</h2>
            <div className="grid gap-3">
              {lines.map((l) => (
                <p className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-slate-700" key={l}>
                  {l}
                </p>
              ))}
            </div>
            <div className="mt-10 grid gap-6 text-center text-sm font-bold text-slate-600 sm:grid-cols-3">
              <span className="border-t border-slate-300 pt-2">Applicant Signature</span>
              <span className="border-t border-slate-300 pt-2">Guardian Signature</span>
              <span className="border-t border-slate-300 pt-2">Authority</span>
            </div>
          </div>

          <button className="btn no-print mt-5" onClick={() => window.print()}>
            Print
          </button>
        </div>
      </section>
    </>
  );
}
