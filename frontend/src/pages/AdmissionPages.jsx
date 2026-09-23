import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import PageHeader from "../components/common/PageHeader.jsx";
import SEO from "../components/common/SEO.jsx";
import { getAdmissionPrograms } from "../data/admissionPrograms.js";
import { API_BASE_URL, admissionService } from "../services/api.js";
import { publicAdmissionCardApi } from "../services/resourceApi.js";

const containerClass = "mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8";
const fieldClass = "grid gap-1 text-sm font-bold text-slate-700";
const inputClass = "input input-bordered w-full";
const primaryButton = "btn bg-emerald-700 text-white hover:bg-emerald-800";

const defaultAdmissionFormSchema = [
  { title: "Student Information", fields: ["Full Name", "Bengali Name", "Blood Group", "Student UID", "Mobile", "Email", "Date of Birth", "Birth Certificate Number"].map((label) => ({ label, type: label.includes("Date") ? "date" : label === "Email" ? "email" : "text", required: ["Full Name", "Mobile"].includes(label) })) },
  { title: "Father Information", fields: ["Father Name", "Father Bengali Name", "Father Mobile", "Father NID"].map((label) => ({ label, type: "text" })) },
  { title: "Mother Information", fields: ["Mother Name", "Mother Bengali Name", "Mother Mobile", "Mother NID"].map((label) => ({ label, type: "text" })) },
  { title: "Guardian", fields: ["Guardian Name", "Guardian Mobile", "Relationship"].map((label) => ({ label, type: "text" })) },
  { title: "Academic Information", fields: ["Category", "Session", "Shift", "Class"].map((label) => ({ label, type: "text", required: label === "Class" })) },
  { title: "Previous Institution", fields: ["Previous School Name", "Previous Class", "Previous Roll"].map((label) => ({ label, type: "text" })) },
  { title: "Payment", fields: ["Payment Method", "Amount", "Sender Number", "Transaction Number"].map((label) => ({ label, type: label === "Amount" ? "number" : "text" })) },
];

export function OnlineAdmissionPage() {
  const [programs, setPrograms] = useState(() => getAdmissionPrograms());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicAdmissionCardApi
      .list()
      .then((rows) => {
        if (rows.length) setPrograms(rows.map(courseToProgram));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <SEO title="Online Admission" />
      <PageHeader title="Online Admission" eyebrow="Admission" description="Choose an admission program, review fees, teachers, dates, subjects, and submit the form." />
      <section>
        <div className={containerClass}>
          {loading && <div className="alert mb-6 border-emerald-100 bg-emerald-50 text-emerald-900">Loading admission cards...</div>}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {programs.map((program) => (
              <article key={program.id} className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <img src={program.image} alt={program.title} className="h-48 w-full object-cover" />
                <div className="grid gap-4 p-5">
                  <div>
                    <span className="badge badge-success badge-outline font-black">{program.className}</span>
                    <h2 className="mt-3 text-2xl font-black text-emerald-950">{program.title}</h2>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{program.description}</p>
                  </div>
                  <dl className="grid gap-3 text-sm">
                    <Info label="Admission Date" value={`${program.startDate} to ${program.endDate}`} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Info label="Admission Fee" value={`BDT ${program.admissionFee}`} />
                      <Info label="Seats" value={program.seats} />
                    </div>
                    <PlainInfo label="Teachers" value={formatList(program.teachers)} />
                    <PlainInfo label="Subjects Covered" value={formatList(program.subjects)} />
                    <PlainInfo label="Schedule" value={program.schedule} />
                  </dl>
                  <Link to={`/admission/online/${program.slug || program.id}`} className={`${primaryButton} w-full`}>
                    View Details & Apply
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export function AdmissionCardDetailPage() {
  const { identifier } = useParams();
  const [program, setProgram] = useState(null);
  const [submitted, setSubmitted] = useState(null);

  useEffect(() => {
    publicAdmissionCardApi
      .get(identifier)
      .then((course) => setProgram(courseToProgram(course)))
      .catch(() => {
        const fallback = getAdmissionPrograms().find((item) => String(item.id) === String(identifier));
        setProgram(fallback || null);
      });
  }, [identifier]);

  async function submit(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setSubmitted(await admissionService.submit({ ...data, programId: program?.id, course: program?.id }));
  }

  if (!program) {
    return (
      <>
        <SEO title="Admission Details" />
        <PageHeader title="Admission Details" eyebrow="Admission" />
        <div className={containerClass}>
          <div className="alert border-emerald-100 bg-white text-slate-700">Admission card not found.</div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO title={program.title} />
      <PageHeader title={program.title} eyebrow="Admission Details" description={program.description} />
      <section>
        <div className={containerClass}>
          <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
            <div className="space-y-6">
              <img src={program.image} alt={program.title} className="h-[340px] w-full rounded-2xl object-cover shadow-sm" />
              <div className="grid gap-4 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm md:grid-cols-2">
                <Info label="Admission Date" value={`${program.startDate} to ${program.endDate}`} />
                <Info label="Course Schedule" value={program.schedule} />
                <Info label="Admission Fee" value={`BDT ${program.admissionFee}`} />
                <Info label="Course Fee" value={`BDT ${program.courseFee || 0}`} />
                <Info label="Seats" value={program.seats} />
                <Info label="Code" value={program.className} />
                <Info label="Teachers" value={formatList(program.teachers)} wide />
                <Info label="Subjects Covered" value={formatList(program.subjects)} wide />
              </div>

              {program.customContent.length > 0 && (
                <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
                  <h2 className="text-2xl font-black text-emerald-950">Additional Details</h2>
                  <div className="mt-4 grid gap-4">
                    {program.customContent.map((item, index) => <CustomContent item={item} key={`${item.label}-${index}`} />)}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm lg:sticky lg:top-24 lg:self-start">
              <h2 className="text-2xl font-black text-emerald-950">Admission Form</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">Submit your information for this admission card.</p>
              <form className="mt-5 grid gap-4" onSubmit={submit}>
                <label className={fieldClass}>Program<input className={inputClass} name="Program" value={program.title} readOnly /></label>
                {program.formSchema.map((section) => (
                  <fieldset className="rounded-xl border border-emerald-100 p-4" key={section.title}>
                    <legend className="px-2 text-sm font-black text-emerald-900">{section.title}</legend>
                    <div className="grid gap-3 pt-2">
                      {(section.fields || []).map((field) => <AdmissionFormField field={field} program={program} key={field.name || field.label} />)}
                    </div>
                  </fieldset>
                ))}
                <button className={primaryButton}>Submit Application</button>
              </form>

              {submitted && (
                <div className="alert alert-success mt-5 flex-col items-start">
                  <h3 className="font-black">Application Submitted</h3>
                  <p>Reference: <strong>{submitted.applicationId}</strong></p>
                  <button className="btn btn-sm" onClick={() => window.print()}>Print Application</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function courseToProgram(course) {
  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    className: course.code || course.course_type?.replaceAll("_", " ") || "Admission",
    description: course.description || "Admission is open for this program.",
    image: resolveMediaUrl(course.thumbnail) || "/images/admission-class-9.jpg",
    startDate: course.enrollment_start || course.start_date || "Announced soon",
    endDate: course.enrollment_end || course.end_date || "Announced soon",
    admissionFee: course.admission_fee || 0,
    courseFee: course.course_fee || 0,
    seats: course.capacity || "Limited",
    teachers: course.teacher_names?.length ? course.teacher_names : ["Assigned teachers will be announced by admin."],
    subjects: course.subject_names?.length ? course.subject_names : ["Subjects will be covered according to the selected course plan."],
    schedule: course.start_date ? `Starts ${course.start_date}` : "Schedule will be announced.",
    customContent: Array.isArray(course.custom_content) ? course.custom_content : [],
    formSchema: normalizeFormSchema(course.admission_form_schema),
  };
}

function normalizeFormSchema(schema) {
  const source = Array.isArray(schema) && schema.length ? schema : defaultAdmissionFormSchema;
  return source
    .map((section) => ({
      title: section.title || "Information",
      fields: Array.isArray(section.fields) ? section.fields.filter((field) => field?.label) : [],
    }))
    .filter((section) => section.fields.length);
}

function AdmissionFormField({ field, program }) {
  const name = field.name || field.label;
  const commonProps = {
    className: inputClass,
    name,
    required: Boolean(field.required),
    defaultValue: field.label === "Class" ? program.className : "",
    placeholder: field.placeholder || "",
  };

  return (
    <label className={fieldClass}>
      {field.label}
      {field.type === "textarea" ? (
        <textarea {...commonProps} className="textarea textarea-bordered w-full" />
      ) : field.type === "select" ? (
        <select {...commonProps} defaultValue="">
          <option value="">{field.placeholder || `Select ${field.label}`}</option>
          {(field.options || []).map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      ) : (
        <input {...commonProps} type={field.type || "text"} />
      )}
    </label>
  );
}

function formatList(value) {
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  return value || "-";
}

function Info({ label, value, wide }) {
  return (
    <div className={`rounded-xl bg-emerald-50 p-3 ${wide ? "md:col-span-2" : ""}`}>
      <dt className="font-black text-emerald-800">{label}</dt>
      <dd className="mt-1 font-semibold text-slate-700">{value}</dd>
    </div>
  );
}

function PlainInfo({ label, value }) {
  return (
    <div>
      <dt className="font-black text-slate-950">{label}</dt>
      <dd className="mt-1 font-semibold text-slate-600">{value}</dd>
    </div>
  );
}

function CustomContent({ item }) {
  const type = item.type || "text";
  if (type === "image" && item.url) {
    return (
      <figure>
        <img src={resolveMediaUrl(item.url)} alt={item.label || "Admission detail"} className="max-h-80 w-full rounded-xl object-cover" />
        <figcaption className="mt-2 font-bold text-slate-700">{item.label}</figcaption>
      </figure>
    );
  }
  if (type === "video" && item.url) {
    return (
      <div>
        <h3 className="font-black text-emerald-900">{item.label}</h3>
        <iframe className="mt-2 aspect-video w-full rounded-xl" src={item.url} title={item.label || "Admission video"} allowFullScreen />
      </div>
    );
  }
  if (["link", "file"].includes(type) && item.url) {
    return <a className="link link-success font-black" href={resolveMediaUrl(item.url)} target="_blank" rel="noreferrer">{item.label || item.url}</a>;
  }
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <h3 className="font-black text-emerald-900">{item.label || "Detail"}</h3>
      <p className="mt-1 font-semibold text-slate-700">{item.value || item.url}</p>
    </div>
  );
}

function resolveMediaUrl(value) {
  if (!value) return "";
  if (/^https?:\/\//.test(value)) return value;
  return `${API_BASE_URL.replace(/\/api\/v1$/, "")}${value}`;
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
            <button className={`${primaryButton} self-end`} onClick={async () => setStatus(await admissionService.status())}>Search</button>
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
      lines={["Student information", "Parent information", "Academic information", "Guardian information", "Photograph area", "Applicant and guardian signatures"]}
    />
  );
}

export function AdmitCardPage() {
  return (
    <PrintableDoc
      title="Admit Card"
      search
      lines={["Institution logo and name", "Student photo and name", "Roll, class, exam, venue", "Subject-wise exam dates", "Authorized signature"]}
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
                <p className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-slate-700" key={l}>{l}</p>
              ))}
            </div>
            <div className="mt-10 grid gap-6 text-center text-sm font-bold text-slate-600 sm:grid-cols-3">
              <span className="border-t border-slate-300 pt-2">Applicant Signature</span>
              <span className="border-t border-slate-300 pt-2">Guardian Signature</span>
              <span className="border-t border-slate-300 pt-2">Authority</span>
            </div>
          </div>

          <button className="btn no-print mt-5" onClick={() => window.print()}>Print</button>
        </div>
      </section>
    </>
  );
}
