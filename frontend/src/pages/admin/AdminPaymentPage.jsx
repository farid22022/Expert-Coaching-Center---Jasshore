import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock3, CreditCard, Search, ShieldCheck } from "lucide-react";
import api, { getApiErrorMessage } from "../../services/api.js";
import Modal from "../../components/common/Modal.jsx";

const currency = (value) => `৳${Number(value || 0).toLocaleString("en-BD", { minimumFractionDigits: 2 })}`;
const badge = (status) => ({ completed: "bg-emerald-50 text-emerald-700", failed: "bg-red-50 text-red-700", cancelled: "bg-amber-50 text-amber-800", pending: "bg-blue-50 text-blue-700", ready_for_payment: "bg-fuchsia-50 text-fuchsia-700" }[status] || "bg-slate-100 text-slate-700");

export default function AdminPaymentPage() {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get("/payments/admin/", { params: { search: search || undefined, status: status || undefined } })
      .then(({ data }) => setRows(data.data || []))
      .catch((requestError) => setError(getApiErrorMessage(requestError)))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [status]);

  const stats = useMemo(() => ({
    total: rows.length,
    completed: rows.filter((row) => row.status === "completed").length,
    pending: rows.filter((row) => ["pending", "processing", "agreement_pending", "ready_for_payment"].includes(row.status)).length,
    collected: rows.filter((row) => row.status === "completed").reduce((sum, row) => sum + Number(row.amount || 0), 0),
  }), [rows]);

  const details = selected ? [
    ["Internal Payment ID", selected.public_id], ["Applicant", selected.applicant_name],
    ["Admission", selected.admission_name], ["Application", selected.application_no],
    ["Amount", `${currency(selected.amount)} ${selected.currency}`], ["Environment", selected.environment],
    ["Agreement", selected.agreement?.agreement_id || selected.agreement?.status || "Not started"],
    ["Masked wallet", selected.agreement?.masked_account || "—"], ["Provider Payment ID", selected.provider_payment_id || "—"],
    ["Transaction ID", selected.transaction_id || "—"], ["Invoice", selected.merchant_invoice_number],
    ["Enrollment", selected.enrollment_status], ["Activation", selected.enrollment_activation_status],
    ["Activation error", selected.enrollment_failure_message || "—"],
    ["Verified", selected.verified_at ? new Date(selected.verified_at).toLocaleString() : "—"],
  ] : [];
  const timeline = selected ? [
    ["Payment created", selected.created_at], ["Agreement started", selected.agreement?.initiated_at],
    ["Agreement verified", selected.agreement?.verified_at], ["Payment verified", selected.verified_at],
    ["Enrollment activated", selected.enrollment_activated_at],
  ].filter(([, value]) => value) : [];

  return <div className="space-y-6">
    <header><p className="text-sm font-black uppercase text-emerald-700">Admin · Financial verification</p><h1 className="text-3xl font-black text-slate-950">bKash Admission Payments</h1><p className="mt-1 text-sm text-slate-500">Inspect gateway-verified transactions. Financial status cannot be manually marked paid.</p></header>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[["Transactions", stats.total, CreditCard], ["Completed", stats.completed, CheckCircle2], ["In progress", stats.pending, Clock3], ["Verified collected", currency(stats.collected), ShieldCheck]].map(([label, value, Icon], index) => <motion.article key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .05 }} className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm"><Icon className="text-emerald-700" size={20}/><p className="mt-3 text-2xl font-black">{value}</p><p className="text-sm text-slate-500">{label}</p></motion.article>)}
    </section>
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <form onSubmit={(event) => { event.preventDefault(); load(); }} className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row">
        <label className="relative flex-1"><span className="sr-only">Search payments</span><Search className="absolute left-3 top-3 text-slate-400" size={17}/><input value={search} onChange={(event) => setSearch(event.target.value)} className="input input-bordered w-full pl-10" placeholder="Search invoice, trxID, applicant…"/></label>
        <select aria-label="Payment status" value={status} onChange={(event) => setStatus(event.target.value)} className="select select-bordered"><option value="">All statuses</option>{["agreement_required", "agreement_pending", "ready_for_payment", "pending", "processing", "completed", "failed", "cancelled"].map((value) => <option key={value}>{value}</option>)}</select>
        <button className="btn btn-success text-white">Search</button>
      </form>
      {error && <p className="m-4 rounded bg-red-50 p-3 text-red-700">{error}</p>}
      <div className="overflow-x-auto"><table className="table"><thead><tr><th>Applicant</th><th>Admission</th><th>Amount</th><th>Agreement</th><th>Status</th><th>Created</th><th></th></tr></thead><tbody>{rows.map((row) => <tr key={row.public_id}><td><p className="font-bold">{row.applicant_name}</p><p className="text-xs text-slate-500">{row.application_no}</p></td><td>{row.admission_name}</td><td>{currency(row.amount)}</td><td><p className="text-xs font-bold uppercase">{row.agreement?.status || "not started"}</p><p className="text-xs text-slate-500">{row.agreement?.masked_account || "—"}</p></td><td><span className={`rounded px-2 py-1 text-xs font-black uppercase ${badge(row.status)}`}>{row.status}</span>{row.enrollment_activation_status === "failed" && <p className="mt-1 text-xs font-bold text-red-700">Enrollment activation failed</p>}</td><td className="text-xs">{new Date(row.created_at).toLocaleString()}</td><td><button className="btn btn-outline btn-xs" onClick={() => setSelected(row)}>Details</button></td></tr>)}</tbody></table>{loading && <p className="p-8 text-center text-sm text-slate-500">Loading payments…</p>}{!loading && !rows.length && <p className="p-8 text-center text-sm text-slate-500">No gateway payment records found.</p>}</div>
    </section>
    <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title="Payment Details" size="lg">
      {selected && <div className="p-5"><dl className="grid gap-4 text-sm sm:grid-cols-2">{details.map(([label, value]) => <div key={label}><dt className="text-xs font-bold text-slate-500">{label}</dt><dd className="mt-1 break-all font-semibold">{value}</dd></div>)}</dl><h3 className="mt-7 font-black">Event timeline</h3><ol className="mt-3 space-y-3 border-l-2 border-emerald-100 pl-5">{timeline.map(([label, value]) => <li key={label}><p className="font-bold">{label}</p><p className="text-xs text-slate-500">{new Date(value).toLocaleString()}</p></li>)}</ol></div>}
    </Modal>
  </div>;
}
