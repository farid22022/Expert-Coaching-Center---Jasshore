import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Clock, Radio } from "lucide-react";

import api, { getApiErrorMessage } from "../../services/api.js";
import { studentDashboardApi } from "../../services/resourceApi.js";
import { LoadingOrError, PortalPage } from "./studentPortalShared.jsx";

export default function StudentAssessmentsPage() {
  const [tests, setTests] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/assessments/student/assessments/?page_size=100"),
      api.get("/assessments/student/assessments/history/"),
      studentDashboardApi.list(),
    ])
      .then(([listResponse, historyResponse, learningData]) => {
        const listData = listResponse.data?.data || listResponse.data;
        const items = Array.isArray(listData) ? listData : listData?.results || [];
        const history = historyResponse.data?.data || historyResponse.data;
        const attempts = history?.attempts || [];
        const courseToEnrollment = {};
        (learningData?.enrollments || []).forEach((enrollment) => { courseToEnrollment[enrollment.course] = enrollment.id; });
        const now = new Date();

        const rows = items
          .filter((item) => ["mcq", "exam"].includes(item.assessment_type))
          .map((item) => {
            const attempt = attempts.find((row) => row.assessment === item.id);
            let section = "available";
            if (attempt) section = "completed";
            else if (item.starts_at && new Date(item.starts_at) > now) section = "upcoming";
            return { ...item, attempt, section, enrollmentId: courseToEnrollment[item.course] };
          });
        setTests(rows);
      })
      .catch((requestError) => setError(getApiErrorMessage(requestError, "Unable to load assessments.")))
      .finally(() => setLoading(false));
  }, []);

  const groups = useMemo(() => ({
    available: tests.filter((item) => item.section === "available"),
    upcoming: tests.filter((item) => item.section === "upcoming"),
    completed: tests.filter((item) => item.section === "completed"),
  }), [tests]);

  return (
    <PortalPage title="Assessments">
      <LoadingOrError loading={loading} error={error} />
      {!loading && !error && (
        <div className="space-y-6">
          <Section title="Available Now" icon={Radio} iconClass="text-red-600" items={groups.available} emptyText="No tests are currently available." />
          <Section title="Upcoming" icon={Clock} iconClass="text-amber-600" items={groups.upcoming} emptyText="No upcoming tests are scheduled." />
          <Section title="Completed" icon={CheckCircle2} iconClass="text-emerald-700" items={groups.completed} emptyText="You haven't completed any tests yet." />
        </div>
      )}
    </PortalPage>
  );
}

function Section({ title, icon: Icon, iconClass, items, emptyText }) {
  return (
    <div className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 font-black text-slate-950"><Icon size={18} className={iconClass} /> {title}</h2><span className="badge badge-outline">{items.length}</span></div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {items.map((test) => (
          <article key={test.id} className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-4">
            <h3 className="font-black text-slate-950">{test.title}</h3>
            <p className="mt-1 text-sm font-semibold text-slate-500">{test.duration_minutes} minutes {test.ends_at ? `· Available until ${new Date(test.ends_at).toLocaleDateString()}` : ""}</p>
            {test.attempt ? (
              <p className="mt-2 text-sm font-black text-emerald-700">Score: {test.attempt.score} / {test.attempt.total_marks}</p>
            ) : test.enrollmentId ? (
              <Link to={`/student/courses/${test.enrollmentId}`} className="btn btn-success btn-sm mt-3 text-white">Start Test</Link>
            ) : null}
          </article>
        ))}
        {!items.length && <p className="rounded-lg border border-dashed border-slate-200 p-5 font-semibold text-slate-500">{emptyText}</p>}
      </div>
    </div>
  );
}
