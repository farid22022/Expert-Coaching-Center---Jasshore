import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ClipboardList, XCircle } from "lucide-react";

import api, { getApiErrorMessage } from "../../services/api.js";
import { LoadingOrError, PortalPage } from "./studentPortalShared.jsx";

const TABS = [
  { key: "mcq", label: "MCQ / Test Results" },
  { key: "assignments", label: "Assignment Results" },
];

function percentage(score, total) {
  if (!total) return 0;
  return Math.round((Number(score) / Number(total)) * 100);
}

export default function StudentResultsPage() {
  const [history, setHistory] = useState({ attempts: [], submissions: [] });
  const [performance, setPerformance] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("mcq");

  useEffect(() => {
    Promise.all([
      api.get("/assessments/student/assessments/history/"),
      api.get("/assessments/student/assessments/performance/").catch(() => null),
    ])
      .then(([historyResponse, performanceResponse]) => {
        setHistory(historyResponse.data?.data || historyResponse.data);
        if (performanceResponse) setPerformance(performanceResponse.data?.data || performanceResponse.data);
      })
      .catch((requestError) => setError(getApiErrorMessage(requestError, "Unable to load your results.")))
      .finally(() => setLoading(false));
  }, []);

  const attempts = useMemo(() => [...(history.attempts || [])].sort((a, b) => new Date(b.submitted_at || 0) - new Date(a.submitted_at || 0)), [history]);
  const submissions = useMemo(() => [...(history.submissions || [])].filter((row) => row.status === "evaluated").sort((a, b) => new Date(b.evaluated_at || 0) - new Date(a.evaluated_at || 0)), [history]);

  return (
    <PortalPage title="Results">
      <LoadingOrError loading={loading} error={error} />
      {!loading && !error && (
        <div className="space-y-5">
          {performance && (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-emerald-100 bg-white p-4 shadow-sm"><p className="text-2xl font-black text-slate-950">{Number(performance.average_percentage || 0).toFixed(1)}%</p><p className="text-sm font-bold text-slate-500">Average score</p></div>
              <div className="rounded-lg border border-emerald-100 bg-white p-4 shadow-sm"><p className="text-2xl font-black text-slate-950">{attempts.length}</p><p className="text-sm font-bold text-slate-500">Tests completed</p></div>
              <div className="rounded-lg border border-emerald-100 bg-white p-4 shadow-sm"><p className="text-2xl font-black text-slate-950">{submissions.length}</p><p className="text-sm font-bold text-slate-500">Assignments graded</p></div>
            </div>
          )}

          <div className="flex gap-2 border-b border-emerald-100">
            {TABS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={`border-b-2 px-4 py-2 text-sm font-black ${tab === item.key ? "border-emerald-700 text-emerald-800" : "border-transparent text-slate-500 hover:text-slate-700"}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {tab === "mcq" && (
            <div className="grid gap-3">
              {attempts.map((attempt) => {
                const pct = percentage(attempt.score, attempt.total_marks);
                const passed = pct >= 40;
                return (
                  <article key={attempt.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
                    <div>
                      <p className="font-black text-slate-950">Assessment #{attempt.assessment}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-500">{attempt.submitted_at ? new Date(attempt.submitted_at).toLocaleString() : "Not submitted"}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-lg font-black text-slate-950">{attempt.score} / {attempt.total_marks} <span className="text-sm font-bold text-slate-500">({pct}%)</span></p>
                      <span className={`badge gap-1 ${passed ? "badge-success text-white" : "badge-error text-white"}`}>{passed ? <CheckCircle2 size={13} /> : <XCircle size={13} />} {passed ? "Passed" : "Failed"}</span>
                    </div>
                  </article>
                );
              })}
              {!attempts.length && <p className="rounded-xl border border-dashed border-emerald-200 bg-white p-8 text-center font-semibold text-slate-500">You haven't completed any assessments yet.</p>}
            </div>
          )}

          {tab === "assignments" && (
            <div className="grid gap-3">
              {submissions.map((submission) => (
                <article key={submission.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-50 text-emerald-700"><ClipboardList size={18} /></span>
                    <div>
                      <p className="font-black text-slate-950">Assignment #{submission.assessment}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-500">{submission.evaluated_at ? new Date(submission.evaluated_at).toLocaleString() : ""}</p>
                    </div>
                  </div>
                  <p className="text-lg font-black text-emerald-800">{submission.marks_obtained ?? "-"} / {submission.total_marks}</p>
                </article>
              ))}
              {!submissions.length && <p className="rounded-xl border border-dashed border-emerald-200 bg-white p-8 text-center font-semibold text-slate-500">You haven't completed any assessments yet.</p>}
            </div>
          )}
        </div>
      )}
    </PortalPage>
  );
}
