const STYLES = {
  // lifecycle
  active: "bg-emerald-50 text-emerald-800 border-emerald-200",
  inactive: "bg-slate-100 text-slate-500 border-slate-200",
  draft: "bg-slate-100 text-slate-600 border-slate-200",
  pending: "bg-amber-50 text-amber-800 border-amber-200",
  approved: "bg-emerald-50 text-emerald-800 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  published: "bg-emerald-50 text-emerald-800 border-emerald-200",
  upcoming: "bg-sky-50 text-sky-700 border-sky-200",
  in_progress: "bg-amber-50 text-amber-800 border-amber-200",
  completed: "bg-emerald-50 text-emerald-800 border-emerald-200",
  archived: "bg-slate-100 text-slate-500 border-slate-200",
  // results
  passed: "bg-emerald-50 text-emerald-800 border-emerald-200",
  failed: "bg-red-50 text-red-700 border-red-200",
  graded: "bg-emerald-50 text-emerald-800 border-emerald-200",
  submitted: "bg-sky-50 text-sky-700 border-sky-200",
  calculated: "bg-amber-50 text-amber-800 border-amber-200",
  locked: "bg-slate-100 text-slate-600 border-slate-200",
  // data completeness
  complete: "bg-emerald-50 text-emerald-800 border-emerald-200",
  missing: "bg-red-50 text-red-700 border-red-200",
  not_graded: "bg-amber-50 text-amber-800 border-amber-200",
  not_attempted: "bg-slate-100 text-slate-500 border-slate-200",
  excused: "bg-sky-50 text-sky-700 border-sky-200",
  // interventions
  open: "bg-amber-50 text-amber-800 border-amber-200",
  partially_completed: "bg-amber-50 text-amber-800 border-amber-200",
  not_completed: "bg-red-50 text-red-700 border-red-200",
};

const DEFAULT_STYLE = "bg-slate-100 text-slate-600 border-slate-200";

function label(status) {
  return String(status || "").replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function StatusBadge({ status, children, className = "" }) {
  const key = String(status || "").toLowerCase();
  const style = STYLES[key] || DEFAULT_STYLE;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${style} ${className}`}>
      {children || label(status)}
    </span>
  );
}
