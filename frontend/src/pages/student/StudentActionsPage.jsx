import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Circle, Clock } from "lucide-react";
import { Link } from "react-router-dom";

import { getApiErrorMessage } from "../../services/api.js";
import { studentPortalApi } from "../../services/resourceApi.js";
import { LoadingOrError, PortalPage } from "./studentPortalShared.jsx";

const STATUS_STYLE = {
  open: { label: "Open", className: "badge-warning text-white", icon: Circle },
  in_progress: { label: "In Progress", className: "badge-info text-white", icon: Clock },
  completed: { label: "Completed", className: "badge-success text-white", icon: CheckCircle2 },
  partially_completed: { label: "Partially Completed", className: "badge-warning text-white", icon: AlertTriangle },
  not_completed: { label: "Not Completed", className: "badge-error text-white", icon: AlertTriangle },
};

function isOverdue(deadline, status) {
  if (!deadline || status === "completed") return false;
  return new Date(deadline) < new Date(new Date().toDateString());
}

export default function StudentActionsPage() {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    studentPortalApi
      .actions()
      .then((data) => setActions(Array.isArray(data) ? data : []))
      .catch((requestError) => setError(getApiErrorMessage(requestError, "Unable to load your action items.")))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PortalPage title="Action Required" eyebrow="Teacher-assigned academic actions">
      <LoadingOrError loading={loading} error={error} />
      {!loading && !error && (
        <div className="grid gap-3">
          {actions.map((item) => {
            const style = STATUS_STYLE[item.status] || STATUS_STYLE.open;
            const overdue = isOverdue(item.deadline, item.status);
            const Icon = style.icon;
            return (
              <article key={item.id} className={`rounded-xl border bg-white p-5 shadow-sm ${overdue ? "border-red-300" : "border-emerald-100"}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-emerald-700">{item.subject_name || "General"}</p>
                    <h3 className="mt-1 text-lg font-black text-slate-950">{item.reason}</h3>
                    {item.action_note && <p className="mt-1 text-sm font-semibold text-slate-500">{item.action_note}</p>}
                    <p className="mt-2 text-xs font-bold text-slate-400">
                      From {item.teacher_name || "your teacher"}
                      {item.deadline && ` · Due ${new Date(item.deadline).toLocaleDateString()}`}
                    </p>
                  </div>
                  <span className={`badge gap-1 ${style.className}`}>
                    <Icon size={13} /> {style.label}
                  </span>
                </div>
                {item.practice_assessment_title && item.linked_practice_assessment && (
                  <Link
                    to="/student/practice"
                    className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-black text-white hover:bg-emerald-800"
                  >
                    Start: {item.practice_assessment_title}
                  </Link>
                )}
                {overdue && <p className="mt-2 text-xs font-black text-red-600">Overdue - please complete this soon.</p>}
              </article>
            );
          })}
          {!actions.length && (
            <p className="rounded-xl border border-dashed border-emerald-200 bg-white p-8 text-center font-semibold text-slate-500">
              No action items right now - you're all caught up.
            </p>
          )}
        </div>
      )}
    </PortalPage>
  );
}
