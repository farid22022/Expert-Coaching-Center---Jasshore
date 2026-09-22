import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  academicClassApi,
  admissionExamApi,
  admissionMarkApi,
  admissionPaymentApi,
  admissionResultApi,
  applicationApi,
  sessionApi,
} from "../../../../services/resourceApi.js";
import { getApiErrorMessage, unwrapApiData } from "../../../../services/api.js";
import {
  defaultAdmissionPrograms,
  getAdmissionPrograms,
  saveAdmissionPrograms,
} from "../../../../data/admissionPrograms.js";
import {
  OnlineApplicationNav,
  onlineApplicationMenuItems,
  useOnlineApplicationBase,
} from "./onlineApplicationShared.jsx";

const card = "rounded-lg border border-base-300 bg-white shadow-sm";
const titleBar = "flex min-h-11 items-center justify-between gap-3 bg-[#456db5] px-4 py-2 text-white";
const input = "input input-bordered input-sm h-9 min-h-9 w-full rounded border-slate-300 bg-white";
const select = "select select-bordered select-sm h-9 min-h-9 w-full rounded border-slate-300 bg-white";
const btn = "btn btn-sm min-h-0";
const primary = `${btn} btn-info text-white`;
const success = `${btn} btn-success text-white`;
const danger = `${btn} btn-error text-white`;

function rows(payload) {
  const data = unwrapApiData(payload);
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data)) return data;
  return [];
}

function count(payload) {
  const data = unwrapApiData(payload);
  if (typeof data?.count === "number") return data.count;
  return rows(payload).length;
}

function Page({ children }) {
  return (
    <div className="min-h-[calc(100vh-60px)] space-y-5 bg-[#f5f5f5] p-2 sm:p-3">
      <OnlineApplicationNav />
      {children}
    </div>
  );
}

function Panel({ title, action, children }) {
  return (
    <section className={card}>
      <header className={titleBar}>
        <h2 className="text-base font-bold sm:text-lg">{title}</h2>
        {action}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

function Notice({ type = "info", children }) {
  if (!children) return null;
  const cls = type === "error"
    ? "border-red-200 bg-red-50 text-red-700"
    : "border-emerald-200 bg-emerald-50 text-emerald-800";
  return <div className={`mb-4 rounded border px-4 py-2 text-sm font-bold ${cls}`}>{children}</div>;
}

function Field({ label, children }) {
  return (
    <label className="grid gap-1 text-sm font-bold text-slate-800">
      {label}
      {children}
    </label>
  );
}

function useLookups() {
  const [sessions, setSessions] = useState([]);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    Promise.all([sessionApi.listResults(), academicClassApi.listResults()])
      .then(([sessionRows, classRows]) => {
        setSessions(sessionRows);
        setClasses(classRows);
      })
      .catch(() => {});
  }, []);

  return { sessions, classes };
}

function sessionName(sessions, id) {
  return sessions.find((item) => item.id === id)?.name || id || "-";
}

function className(classes, id) {
  return classes.find((item) => item.id === id)?.name || id || "-";
}

function ApplicationForm({ onSaved }) {
  const { sessions, classes } = useLookups();
  const [form, setForm] = useState({
    session: "",
    academic_class: "",
    applicant_name: "",
    applicant_phone: "",
    applicant_email: "",
    guardian_name: "",
    guardian_phone: "",
    previous_institute: "",
    remarks: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await applicationApi.create({
        ...form,
        session: Number(form.session),
        academic_class: Number(form.academic_class),
      });
      setForm({
        session: "",
        academic_class: "",
        applicant_name: "",
        applicant_phone: "",
        applicant_email: "",
        guardian_name: "",
        guardian_phone: "",
        previous_institute: "",
        remarks: "",
      });
      onSaved?.("Application created successfully.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to create application."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-4 lg:grid-cols-3">
      <Notice type="error">{error}</Notice>
      <Field label="Session">
        <select className={select} value={form.session} onChange={(e) => update("session", e.target.value)} required>
          <option value="">Select session</option>
          {sessions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </Field>
      <Field label="Class">
        <select className={select} value={form.academic_class} onChange={(e) => update("academic_class", e.target.value)} required>
          <option value="">Select class</option>
          {classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </Field>
      <Field label="Applicant Name"><input className={input} value={form.applicant_name} onChange={(e) => update("applicant_name", e.target.value)} required /></Field>
      <Field label="Applicant Phone"><input className={input} value={form.applicant_phone} onChange={(e) => update("applicant_phone", e.target.value)} required /></Field>
      <Field label="Applicant Email"><input className={input} type="email" value={form.applicant_email} onChange={(e) => update("applicant_email", e.target.value)} /></Field>
      <Field label="Guardian Name"><input className={input} value={form.guardian_name} onChange={(e) => update("guardian_name", e.target.value)} /></Field>
      <Field label="Guardian Phone"><input className={input} value={form.guardian_phone} onChange={(e) => update("guardian_phone", e.target.value)} /></Field>
      <Field label="Previous Institute"><input className={input} value={form.previous_institute} onChange={(e) => update("previous_institute", e.target.value)} /></Field>
      <Field label="Remarks"><input className={input} value={form.remarks} onChange={(e) => update("remarks", e.target.value)} /></Field>
      <div className="lg:col-span-3">
        <button className={success} disabled={saving}>{saving ? "Saving..." : "Create Application"}</button>
      </div>
    </form>
  );
}

function ApplicationsTable({ status, pendingOnly = false }) {
  const { sessions, classes } = useLookups();
  const [applications, setApplications] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async (params = {}) => {
    setLoading(true);
    setError("");
    try {
      const response = await applicationApi.list({
        ...(status ? { status } : {}),
        ...(search ? { search } : {}),
        ...params,
      });
      setApplications(rows(response));
      setTotal(count(response));
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load applications."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [status]);

  const approve = async (application) => {
    setMessage("");
    setError("");
    try {
      await applicationApi.action(application.id, "approve");
      setMessage("Application approved and student created.");
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to approve application."));
    }
  };

  const reject = async (application) => {
    setMessage("");
    setError("");
    try {
      await applicationApi.action(application.id, "reject", { remarks: "Rejected by admin" });
      setMessage("Application rejected.");
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to reject application."));
    }
  };

  const remove = async (application) => {
    if (!window.confirm(`Delete application ${application.application_no}?`)) return;
    try {
      await applicationApi.remove(application.id);
      setMessage("Application deleted.");
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to delete application."));
    }
  };

  return (
    <div>
      <Notice>{message}</Notice>
      <Notice type="error">{error}</Notice>
      <div className="mb-4 flex flex-wrap gap-2">
        <input className={`${input} max-w-xs`} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search application, name, phone" />
        <button className={primary} onClick={() => load()}>Search</button>
        <button className={btn} onClick={() => { setSearch(""); load({ search: "" }); }}>Reset</button>
      </div>
      <div className="overflow-x-auto">
        <table className="table table-sm min-w-[1100px] border border-base-300 bg-white">
          <thead className="bg-base-200 text-slate-950">
            <tr>
              <th>Application</th>
              <th>Applicant</th>
              <th>Phone</th>
              <th>Session</th>
              <th>Class</th>
              <th>Status</th>
              <th>Student</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={8} className="py-8 text-center">Loading applications...</td></tr>}
            {!loading && !applications.length && <tr><td colSpan={8} className="py-8 text-center">No applications found.</td></tr>}
            {!loading && applications.map((application) => (
              <tr key={application.id}>
                <td className="font-bold">{application.application_no}</td>
                <td>{application.applicant_name}</td>
                <td>{application.applicant_phone}</td>
                <td>{sessionName(sessions, application.session)}</td>
                <td>{className(classes, application.academic_class)}</td>
                <td><span className="badge badge-outline">{application.status}</span></td>
                <td>{application.approved_student || "-"}</td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {(pendingOnly || application.status === "pending") && <button className={success} onClick={() => approve(application)}>Approve</button>}
                    {(pendingOnly || application.status === "pending") && <button className={danger} onClick={() => reject(application)}>Reject</button>}
                    <button className={danger} onClick={() => remove(application)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm font-bold">Showing {applications.length ? 1 : 0} to {applications.length} of {total} results.</p>
    </div>
  );
}

export function ApplicationListPage() {
  const [message, setMessage] = useState("");
  return (
    <Page>
      <Panel title="Create Online Application"><ApplicationForm onSaved={setMessage} /></Panel>
      <Panel title="Application List">
        <Notice>{message}</Notice>
        <ApplicationsTable />
      </Panel>
    </Page>
  );
}

export function PendingApplicationPage() {
  return <Page><Panel title="Pending Application List"><ApplicationsTable status="pending" pendingOnly /></Panel></Page>;
}

function AdmissionProgramManager() {
  const empty = {
    id: "",
    title: "",
    className: "",
    image: "/slide1.jpeg",
    startDate: "",
    endDate: "",
    admissionFee: "",
    seats: "",
    teachers: "",
    subjects: "",
    schedule: "",
    eligibility: "",
    description: "",
    formFields: ["Student Name", "Guardian Phone", "School Name", "Preferred Shift"],
  };
  const [programs, setPrograms] = useState(() => getAdmissionPrograms());
  const [form, setForm] = useState(programs[0] || empty);
  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const save = () => {
    const id = form.id || form.title.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-");
    const next = { ...form, id };
    const nextPrograms = programs.some((item) => item.id === id)
      ? programs.map((item) => item.id === id ? next : item)
      : [next, ...programs];
    setPrograms(nextPrograms);
    setForm(next);
    saveAdmissionPrograms(nextPrograms);
  };
  return (
    <div className="grid gap-4 xl:grid-cols-[280px_1fr]">
      <div className="space-y-2">
        <button className={primary} onClick={() => setForm(empty)}>New Card</button>
        <button className={btn} onClick={() => { setPrograms(defaultAdmissionPrograms); setForm(defaultAdmissionPrograms[0]); saveAdmissionPrograms(defaultAdmissionPrograms); }}>Reset</button>
        {programs.map((program) => (
          <button key={program.id} className="block w-full rounded border bg-white p-2 text-left text-sm font-bold" onClick={() => setForm(program)}>
            {program.title}
          </button>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Title"><input className={input} value={form.title} onChange={(e) => update("title", e.target.value)} /></Field>
        <Field label="Class/Program"><input className={input} value={form.className} onChange={(e) => update("className", e.target.value)} /></Field>
        <Field label="Image"><select className={select} value={form.image} onChange={(e) => update("image", e.target.value)}><option value="/slide1.jpeg">slide1</option><option value="/slide2.jpeg">slide2</option><option value="/slide3.jpeg">slide3</option></select></Field>
        <Field label="Fee"><input className={input} value={form.admissionFee} onChange={(e) => update("admissionFee", e.target.value)} /></Field>
        <Field label="Start Date"><input className={input} type="date" value={form.startDate} onChange={(e) => update("startDate", e.target.value)} /></Field>
        <Field label="End Date"><input className={input} type="date" value={form.endDate} onChange={(e) => update("endDate", e.target.value)} /></Field>
        <Field label="Teachers"><input className={input} value={form.teachers} onChange={(e) => update("teachers", e.target.value)} /></Field>
        <Field label="Subjects"><input className={input} value={form.subjects} onChange={(e) => update("subjects", e.target.value)} /></Field>
        <Field label="Schedule"><input className={input} value={form.schedule} onChange={(e) => update("schedule", e.target.value)} /></Field>
        <Field label="Seats"><input className={input} value={form.seats} onChange={(e) => update("seats", e.target.value)} /></Field>
        <div className="md:col-span-2"><Field label="Description"><textarea className="textarea textarea-bordered w-full bg-white" value={form.description} onChange={(e) => update("description", e.target.value)} /></Field></div>
        <button className={success} onClick={save}>Save Admission Card</button>
      </div>
    </div>
  );
}

export function ApplicationFormSettingPage() {
  return <Page><Panel title="Form Setting"><AdmissionProgramManager /></Panel></Page>;
}

export const ApplicationDashboard = ApplicationListPage;

function ExamForm({ onSaved }) {
  const { sessions, classes } = useLookups();
  const [form, setForm] = useState({ name: "", session: "", academic_class: "", exam_date: "", total_marks: "100", pass_marks: "40" });
  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const submit = async (event) => {
    event.preventDefault();
    await admissionExamApi.create({ ...form, session: Number(form.session), academic_class: Number(form.academic_class) });
    setForm({ name: "", session: "", academic_class: "", exam_date: "", total_marks: "100", pass_marks: "40" });
    onSaved?.();
  };
  return (
    <form className="grid gap-3 md:grid-cols-3" onSubmit={submit}>
      <Field label="Exam Name"><input className={input} value={form.name} onChange={(e) => update("name", e.target.value)} required /></Field>
      <Field label="Session"><select className={select} value={form.session} onChange={(e) => update("session", e.target.value)} required><option value="">Select</option>{sessions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
      <Field label="Class"><select className={select} value={form.academic_class} onChange={(e) => update("academic_class", e.target.value)} required><option value="">Select</option>{classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
      <Field label="Exam Date"><input className={input} type="date" value={form.exam_date} onChange={(e) => update("exam_date", e.target.value)} /></Field>
      <Field label="Total Marks"><input className={input} type="number" value={form.total_marks} onChange={(e) => update("total_marks", e.target.value)} /></Field>
      <Field label="Pass Marks"><input className={input} type="number" value={form.pass_marks} onChange={(e) => update("pass_marks", e.target.value)} /></Field>
      <button className={success}>Save Exam</button>
    </form>
  );
}

function useExams() {
  const [exams, setExams] = useState([]);
  const load = async () => setExams(await admissionExamApi.listResults());
  useEffect(() => { load(); }, []);
  return { exams, load };
}

function ExamTable({ onChanged }) {
  const { sessions, classes } = useLookups();
  const { exams, load } = useExams();
  const remove = async (exam) => {
    if (!window.confirm(`Delete exam ${exam.name}?`)) return;
    await admissionExamApi.remove(exam.id);
    await load();
    onChanged?.();
  };
  return (
    <div className="overflow-x-auto">
      <table className="table table-sm min-w-[900px] border border-base-300 bg-white">
        <thead className="bg-base-200"><tr><th>Name</th><th>Session</th><th>Class</th><th>Date</th><th>Total</th><th>Pass</th><th>Action</th></tr></thead>
        <tbody>{exams.map((exam) => <tr key={exam.id}><td>{exam.name}</td><td>{sessionName(sessions, exam.session)}</td><td>{className(classes, exam.academic_class)}</td><td>{exam.exam_date || "-"}</td><td>{exam.total_marks}</td><td>{exam.pass_marks}</td><td><button className={danger} onClick={() => remove(exam)}>Delete</button></td></tr>)}</tbody>
      </table>
    </div>
  );
}

export function AdmissionExamDashboard() {
  const base = useOnlineApplicationBase();
  return (
    <Page>
      <Panel title="Admission Exam">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {onlineApplicationMenuItems.filter(([, slug]) => slug.startsWith("admission-exam")).map(([label, slug]) => <Link className="rounded border bg-white p-4 font-black shadow-sm" key={slug} to={`${base}/${slug}`}>{label}</Link>)}
        </div>
      </Panel>
    </Page>
  );
}

export function MarkConfigurePage() {
  const [tick, setTick] = useState(0);
  return <Page><Panel title="Mark Configure"><ExamForm onSaved={() => setTick((v) => v + 1)} /></Panel><Panel title="Admission Exams"><ExamTable key={tick} /></Panel></Page>;
}

function MarkForm({ mode = "create" }) {
  const { exams } = useExams();
  const [applications, setApplications] = useState([]);
  const [marks, setMarks] = useState([]);
  const [form, setForm] = useState({ exam: "", application: "", obtained_marks: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const load = async () => {
    setApplications(await applicationApi.listResults());
    setMarks(await admissionMarkApi.listResults());
  };
  useEffect(() => { load(); }, []);
  const save = async (event) => {
    event.preventDefault();
    setMessage(""); setError("");
    try {
      await admissionMarkApi.create({ exam: Number(form.exam), application: Number(form.application), obtained_marks: form.obtained_marks });
      setMessage("Mark saved.");
      await load();
    } catch (err) { setError(getApiErrorMessage(err, "Unable to save mark.")); }
  };
  const remove = async (mark) => {
    await admissionMarkApi.remove(mark.id);
    setMessage("Mark deleted.");
    await load();
  };
  return (
    <>
      <Notice>{message}</Notice><Notice type="error">{error}</Notice>
      {mode !== "delete" && <form className="grid gap-3 md:grid-cols-3" onSubmit={save}>
        <Field label="Exam"><select className={select} value={form.exam} onChange={(e) => setForm((p) => ({ ...p, exam: e.target.value }))} required><option value="">Select exam</option>{exams.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select></Field>
        <Field label="Application"><select className={select} value={form.application} onChange={(e) => setForm((p) => ({ ...p, application: e.target.value }))} required><option value="">Select applicant</option>{applications.map((a) => <option key={a.id} value={a.id}>{a.application_no} - {a.applicant_name}</option>)}</select></Field>
        <Field label="Obtained Marks"><input className={input} type="number" value={form.obtained_marks} onChange={(e) => setForm((p) => ({ ...p, obtained_marks: e.target.value }))} required /></Field>
        <button className={success}>Save Mark</button>
      </form>}
      <div className="mt-5 overflow-x-auto">
        <table className="table table-sm min-w-[800px] border bg-white">
          <thead><tr><th>Exam</th><th>Application</th><th>Marks</th><th>Action</th></tr></thead>
          <tbody>{marks.map((m) => <tr key={m.id}><td>{exams.find((e) => e.id === m.exam)?.name || m.exam}</td><td>{applications.find((a) => a.id === m.application)?.applicant_name || m.application}</td><td>{m.obtained_marks}</td><td><button className={danger} onClick={() => remove(m)}>Delete</button></td></tr>)}</tbody>
        </table>
      </div>
    </>
  );
}

export function AddMarkPage() { return <Page><Panel title="Add Mark"><MarkForm /></Panel></Page>; }
export function DeleteMarksPage() { return <Page><Panel title="Delete Marks"><MarkForm mode="delete" /></Panel></Page>; }
export function UpdateMarkPage() { return <Page><Panel title="Update Mark"><MarkForm /></Panel></Page>; }

export function SeatPlanPage() {
  const { exams } = useExams();
  const [applications, setApplications] = useState([]);
  useEffect(() => { applicationApi.listResults().then(setApplications); }, []);
  return (
    <Page><Panel title="Seat Plan">
      {exams.map((exam) => <div key={exam.id} className="mb-5"><h3 className="mb-2 font-black">{exam.name}</h3><div className="grid gap-2 md:grid-cols-4">{applications.map((app, index) => <div className="rounded border bg-white p-3 text-sm" key={app.id}><b>Seat {index + 1}</b><br />{app.application_no}<br />{app.applicant_name}</div>)}</div></div>)}
    </Panel></Page>
  );
}

function ResultsTable({ selectedOnly = false }) {
  const [results, setResults] = useState([]);
  const [applications, setApplications] = useState([]);
  const [exams, setExams] = useState([]);
  useEffect(() => {
    Promise.all([admissionResultApi.listResults(selectedOnly ? { is_selected: true } : undefined), applicationApi.listResults(), admissionExamApi.listResults()])
      .then(([r, a, e]) => { setResults(r); setApplications(a); setExams(e); });
  }, [selectedOnly]);
  return (
    <div className="overflow-x-auto">
      <table className="table table-sm min-w-[900px] border bg-white">
        <thead><tr><th>Position</th><th>Exam</th><th>Application</th><th>Marks</th><th>Status</th></tr></thead>
        <tbody>{results.map((r) => <tr key={r.id}><td>{r.position}</td><td>{exams.find((e) => e.id === r.exam)?.name || r.exam}</td><td>{applications.find((a) => a.id === r.application)?.applicant_name || r.application}</td><td>{r.obtained_marks}</td><td>{r.is_selected ? "Selected" : "Not selected"}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

export function AdmissionResultDashboard() {
  const base = useOnlineApplicationBase();
  return <Page><Panel title="Admission Result">{onlineApplicationMenuItems.filter(([, slug]) => slug.startsWith("admission-result")).map(([label, slug]) => <Link className="btn m-1" key={slug} to={`${base}/${slug}`}>{label}</Link>)}</Panel></Page>;
}

export function ResultProcessPage() {
  const { exams } = useExams();
  const [examId, setExamId] = useState("");
  const [message, setMessage] = useState("");
  const process = async () => {
    const result = await admissionExamApi.action(examId, "process_result");
    setMessage(`Processed ${result.processed ?? 0} result rows.`);
  };
  return <Page><Panel title="Result Process"><Notice>{message}</Notice><div className="flex flex-wrap gap-2"><select className={`${select} max-w-sm`} value={examId} onChange={(e) => setExamId(e.target.value)}><option value="">Select exam</option>{exams.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select><button className={success} disabled={!examId} onClick={process}>Process Result</button></div></Panel></Page>;
}
export function TabulationSheetPage() { return <Page><Panel title="Tabulation Sheet"><ResultsTable /></Panel></Page>; }
export function PromotedListPage() { return <Page><Panel title="Promoted List"><ResultsTable selectedOnly /></Panel></Page>; }
export function SubjectWiseResultPage() { return <Page><Panel title="Subject Wise Result"><ResultsTable /></Panel></Page>; }

export function ApplicationReportDashboard() {
  const base = useOnlineApplicationBase();
  return <Page><Panel title="Application Report">{onlineApplicationMenuItems.filter(([, slug]) => slug.startsWith("application-report")).map(([label, slug]) => <Link className="btn m-1" key={slug} to={`${base}/${slug}`}>{label}</Link>)}</Panel></Page>;
}

function ReportStats() {
  const [applications, setApplications] = useState([]);
  const [payments, setPayments] = useState([]);
  useEffect(() => { Promise.all([applicationApi.listResults(), admissionPaymentApi.listResults()]).then(([a, p]) => { setApplications(a); setPayments(p); }); }, []);
  const amount = useMemo(() => payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0), [payments]);
  return { applications, payments, amount };
}

export function FeesReportPage() {
  const { payments, amount } = ReportStats();
  return <Page><Panel title="Fees Report"><p className="mb-3 font-black">Total collected: {amount}</p><div className="overflow-x-auto"><table className="table table-sm border bg-white"><thead><tr><th>Application</th><th>Amount</th><th>Method</th><th>Status</th><th>Reference</th></tr></thead><tbody>{payments.map((p) => <tr key={p.id}><td>{p.application}</td><td>{p.amount}</td><td>{p.method || "-"}</td><td>{p.status}</td><td>{p.reference || "-"}</td></tr>)}</tbody></table></div></Panel></Page>;
}
export function ApplicationReportPage() {
  const { applications } = ReportStats();
  return <Page><Panel title="Application Report"><ApplicationsTable /></Panel><Panel title="Summary"><p className="font-black">Total applications: {applications.length}</p></Panel></Page>;
}
export function AmountCollectedPage() {
  const { payments, amount } = ReportStats();
  return <Page><Panel title="Amount Collected"><div className="grid gap-4 md:grid-cols-3"><div className="rounded bg-emerald-50 p-5"><b>Total Amount</b><p className="text-3xl font-black">{amount}</p></div><div className="rounded bg-blue-50 p-5"><b>Payments</b><p className="text-3xl font-black">{payments.length}</p></div><div className="rounded bg-amber-50 p-5"><b>Approved</b><p className="text-3xl font-black">{payments.filter((p) => p.status === "approved" || p.status === "paid").length}</p></div></div></Panel></Page>;
}
