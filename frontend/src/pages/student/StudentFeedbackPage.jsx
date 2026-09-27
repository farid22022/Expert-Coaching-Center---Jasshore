import { useEffect, useState } from "react";
import { MessageSquareText } from "lucide-react";

import SafeHtml from "../../components/common/SafeHtml.jsx";
import { getApiErrorMessage } from "../../services/api.js";
import { studentPortalApi } from "../../services/resourceApi.js";
import { LoadingOrError, PortalPage } from "./studentPortalShared.jsx";

export default function StudentFeedbackPage() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    studentPortalApi
      .feedback()
      .then((data) => setFeedback(Array.isArray(data) ? data : []))
      .catch((requestError) => setError(getApiErrorMessage(requestError, "Unable to load your feedback.")))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PortalPage title="Teacher Feedback" eyebrow="What your teachers are saying about your progress">
      <LoadingOrError loading={loading} error={error} />
      {!loading && !error && (
        <div className="grid gap-3">
          {feedback.map((item) => (
            <article key={item.id} className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-50 text-emerald-700"><MessageSquareText size={18} /></span>
                <div>
                  <p className="font-black text-slate-950">{item.teacher_name || "Your teacher"}</p>
                  <p className="text-xs font-bold text-slate-400">
                    {item.subject_name ? `${item.subject_name} · ` : ""}
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <SafeHtml html={item.body} className="mt-3 text-sm text-slate-700" />
            </article>
          ))}
          {!feedback.length && (
            <p className="rounded-xl border border-dashed border-emerald-200 bg-white p-8 text-center font-semibold text-slate-500">
              No feedback yet - your teachers will share notes here as they review your work.
            </p>
          )}
        </div>
      )}
    </PortalPage>
  );
}
