import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, Sparkles } from "lucide-react";

import { getApiErrorMessage } from "../../services/api.js";
import { interventionApi, teacherFeedbackApi } from "../../services/resourceApi.js";
import { notifyError, notifySuccess } from "../../services/alerts.js";
import { ErrorMessage, Loading, Shell } from "./TeacherModulePages.jsx";

const STATUS_OPTIONS = ["open", "in_progress", "completed", "partially_completed", "not_completed"];

export default function TeacherInterventionsPage() {
  const [tab, setTab] = useState("interventions");
  const [interventions, setInterventions] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([interventionApi.listResults(), teacherFeedbackApi.listResults()])
      .then(([interventionRows, feedbackRows]) => { setInterventions(interventionRows); setFeedback(feedbackRows); })
      .catch((requestError) => setError(getApiErrorMessage(requestError, "Unable to load interventions/feedback.")))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const updateStatus = async (intervention, statusValue) => {
    try {
      await interventionApi.update(intervention.id, { status: statusValue });
      notifySuccess("Intervention updated.");
      load();
    } catch (requestError) {
      notifyError(getApiErrorMessage(requestError, "Could not update the intervention."));
    }
  };

  return (
    <Shell title="Interventions & Feedback">
      <div>
        <h1 className="text-2xl font-black text-slate-950">Interventions & Feedback</h1>
        <p className="mt-1 font-semibold text-slate-500">Every academic action you've taken for students in your assigned courses.</p>
      </div>
      <div className="flex gap-2 border-b border-emerald-100">
        <button type="button" onClick={() => setTab("interventions")} className={`flex items-center gap-1 border-b-2 px-4 py-2 text-sm font-black ${tab === "interventions" ? "border-emerald-700 text-emerald-800" : "border-transparent text-slate-500"}`}><Sparkles size={15} /> Interventions</button>
        <button type="button" onClick={() => setTab("feedback")} className={`flex items-center gap-1 border-b-2 px-4 py-2 text-sm font-black ${tab === "feedback" ? "border-emerald-700 text-emerald-800" : "border-transparent text-slate-500"}`}><MessageSquare size={15} /> Feedback Sent</button>
      </div>
      <ErrorMessage error={error} />
      {loading && <Loading />}
      {!loading && !error && tab === "interventions" && (
        <div className="grid gap-2">
          {interventions.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-100 bg-white p-4 shadow-sm">
              <div className="min-w-0">
                <p className="font-black text-slate-950">{item.intervention_type.replaceAll("_", " ")} · {item.subject_name || "General"}</p>
                <p className="text-sm font-semibold text-slate-600">{item.reason}</p>
                {item.deadline && <p className="text-xs font-bold text-slate-400">Deadline: {item.deadline}</p>}
              </div>
              <div className="flex items-center gap-2">
                <select className="select select-bordered select-sm" value={item.status} onChange={(event) => updateStatus(item, event.target.value)}>
                  {STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option.replaceAll("_", " ")}</option>)}
                </select>
                <Link className="btn btn-outline btn-sm" to={`/teacher/dashboard/students/${item.student}`}>View Student</Link>
              </div>
            </div>
          ))}
          {!interventions.length && <p className="rounded-xl border border-dashed border-emerald-200 bg-white p-8 text-center font-semibold text-slate-500">No interventions created yet.</p>}
        </div>
      )}
      {!loading && !error && tab === "feedback" && (
        <div className="grid gap-2">
          {feedback.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-100 bg-white p-4 shadow-sm">
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-500">{new Date(item.created_at).toLocaleString()} · {item.subject_name || "General"}</p>
                <p className="mt-1 line-clamp-2 text-sm font-semibold text-slate-700">{item.body.replace(/<[^>]+>/g, " ")}</p>
              </div>
              <Link className="btn btn-outline btn-sm" to={`/teacher/dashboard/students/${item.student}`}>View Student</Link>
            </div>
          ))}
          {!feedback.length && <p className="rounded-xl border border-dashed border-emerald-200 bg-white p-8 text-center font-semibold text-slate-500">No feedback sent yet.</p>}
        </div>
      )}
    </Shell>
  );
}
