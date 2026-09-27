import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getApiErrorMessage } from "../../services/api.js";
import { studentPortalApi } from "../../services/resourceApi.js";
import { LoadingOrError, PortalPage } from "./studentPortalShared.jsx";

const LEVEL_STYLE = {
  weak: { label: "Needs Practice", bar: "bg-red-500", chip: "badge-error text-white" },
  needs_practice: { label: "Needs Practice", bar: "bg-amber-500", chip: "badge-warning text-white" },
  strong: { label: "Strong", bar: "bg-emerald-600", chip: "badge-success text-white" },
};

export default function StudentProgressPage() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    studentPortalApi
      .weakTopics()
      .then((data) => setTopics(Array.isArray(data) ? data : []))
      .catch((requestError) => setError(getApiErrorMessage(requestError, "Unable to load your progress.")))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PortalPage title="My Progress" eyebrow="Topic-by-topic accuracy, based on your own test answers">
      <LoadingOrError loading={loading} error={error} />
      {!loading && !error && (
        <div className="grid gap-3">
          {topics.map((topic, index) => {
            const style = LEVEL_STYLE[topic.level] || LEVEL_STYLE.needs_practice;
            return (
              <article key={`${topic.subject_id}-${topic.topic}-${index}`} className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-black text-slate-950">{topic.topic}</h3>
                    <p className="text-xs font-bold text-slate-400">{topic.question_count} question{topic.question_count === 1 ? "" : "s"} answered</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge ${style.chip}`}>{style.label}</span>
                    <p className="text-lg font-black text-slate-950">{topic.accuracy}%</p>
                  </div>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${style.bar}`} style={{ width: `${topic.accuracy}%` }} />
                </div>
                {topic.level !== "strong" && (
                  <Link to="/student/practice" className="mt-3 inline-block text-sm font-black text-emerald-700 hover:underline">
                    Practice this topic &rarr;
                  </Link>
                )}
              </article>
            );
          })}
          {!topics.length && (
            <p className="rounded-xl border border-dashed border-emerald-200 bg-white p-8 text-center font-semibold text-slate-500">
              Complete a few tests to see your topic-by-topic progress here.
            </p>
          )}
        </div>
      )}
    </PortalPage>
  );
}
