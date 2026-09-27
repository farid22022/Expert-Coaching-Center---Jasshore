import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Search } from "lucide-react";

import api, { getApiErrorMessage } from "../../services/api.js";
import { ErrorMessage, Loading, Shell } from "./TeacherModulePages.jsx";

function StatusBadge({ row }) {
  if (row.academic_status === "needs_attention") {
    return <span className="badge gap-1 border-none bg-amber-100 font-black text-amber-800"><AlertTriangle size={13} /> Needs Attention</span>;
  }
  return <span className="badge gap-1 border-none bg-emerald-100 font-black text-emerald-800"><CheckCircle2 size={13} /> On Track</span>;
}

function metricText(value, suffix = "%") {
  return value === null || value === undefined ? "No data" : `${value}${suffix}`;
}

export default function TeacherPerformanceCenterPage() {
  const [searchParams] = useSearchParams();
  const attentionOnly = searchParams.get("flag") === "attention";
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api
      .get("/assessments/analytics/students/", { params: attentionOnly ? { flag: "attention" } : undefined })
      .then((response) => setRows(response.data?.data || response.data || []))
      .catch((requestError) => setError(getApiErrorMessage(requestError, "Unable to load student performance data.")))
      .finally(() => setLoading(false));
  }, [attentionOnly]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((row) => row.student_name.toLowerCase().includes(query) || row.student_code.toLowerCase().includes(query));
  }, [rows, search]);

  return (
    <Shell title={attentionOnly ? "Needs Attention" : "Student Performance Center"}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-950">{attentionOnly ? "Needs Attention" : "Student Performance Center"}</h1>
          <p className="mt-1 font-semibold text-slate-500">{attentionOnly ? "Students flagged by deterministic academic-risk rules - reasons shown explicitly." : "Real, database-derived academic metrics for every student in your assigned courses."}</p>
        </div>
        <label className="input input-bordered flex items-center gap-2">
          <Search size={16} className="text-slate-400" />
          <input className="grow" placeholder="Search student name or ID" value={search} onChange={(event) => setSearch(event.target.value)} />
        </label>
      </div>
      <ErrorMessage error={error} />
      {loading && <Loading label="Loading student performance..." />}
      {!loading && !error && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((row) => (
            <article key={`${row.student_id}-${row.course_id}`} className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-black text-slate-950">{row.student_name}</h2>
                  <p className="text-xs font-bold text-slate-500">{row.student_code} · {row.course_title}</p>
                </div>
                <StatusBadge row={row} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div><p className="font-bold text-slate-500">Progress</p><p className="font-black text-slate-950">{row.progress}%</p></div>
                <div><p className="font-bold text-slate-500">MCQ Average</p><p className="font-black text-slate-950">{metricText(row.mcq_average)}</p></div>
                <div><p className="font-bold text-slate-500">Assignments</p><p className="font-black text-slate-950">{metricText(row.assignment_average)}</p></div>
                <div><p className="font-bold text-slate-500">Tests Completed</p><p className="font-black text-slate-950">{row.tests_completed}/{row.tests_total}</p></div>
                <div><p className="font-bold text-slate-500">Missing</p><p className="font-black text-slate-950">{row.missing_assignments}</p></div>
                <div><p className="font-bold text-slate-500">Last Active</p><p className="font-black text-slate-950">{row.last_active ? new Date(row.last_active).toLocaleDateString() : "Never"}</p></div>
              </div>
              {row.reasons?.length > 0 && (
                <ul className="mt-3 space-y-1 rounded-lg bg-amber-50 p-3 text-xs font-bold text-amber-800">
                  {row.reasons.map((reason) => <li key={reason}>• {reason}</li>)}
                </ul>
              )}
              <Link to={`/teacher/dashboard/students/${row.student_id}`} className="btn btn-success btn-sm mt-4 w-full text-white">View Student</Link>
            </article>
          ))}
          {!filtered.length && <p className="col-span-full rounded-xl border border-dashed border-emerald-200 bg-white p-8 text-center font-semibold text-slate-500">{attentionOnly ? "No students are currently flagged." : "No students found."}</p>}
        </div>
      )}
    </Shell>
  );
}
