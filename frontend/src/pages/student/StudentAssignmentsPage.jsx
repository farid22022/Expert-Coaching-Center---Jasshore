import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Clock, FileWarning, Send } from "lucide-react";

import api, { getApiErrorMessage } from "../../services/api.js";
import { studentDashboardApi } from "../../services/resourceApi.js";
import { LoadingOrError, PortalPage } from "./studentPortalShared.jsx";

const STATUS_META = {
  graded: { label: "Graded", className: "badge-success text-white", icon: CheckCircle2 },
  evaluated: { label: "Graded", className: "badge-success text-white", icon: CheckCircle2 },
  submitted: { label: "Submitted", className: "badge-info text-white", icon: Send },
  overdue: { label: "Overdue", className: "badge-error text-white", icon: FileWarning },
  pending: { label: "Not Submitted", className: "badge-outline", icon: Clock },
};

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
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
        const submissions = history?.submissions || [];
        const courseToEnrollment = {};
        (learningData?.enrollments || []).forEach((enrollment) => { courseToEnrollment[enrollment.course] = enrollment.id; });

        const now = new Date();
        const rows = items
          .filter((item) => item.assessment_type === "assignment")
          .map((item) => {
            const submission = submissions.find((row) => row.assessment === item.id);
            let statusKey = "pending";
            if (submission) statusKey = submission.status === "evaluated" ? "graded" : "submitted";
            else if (item.ends_at && new Date(item.ends_at) < now) statusKey = "overdue";
            return {
              ...item,
              submission,
              statusKey,
              enrollmentId: courseToEnrollment[item.course],
            };
          })
          .sort((a, b) => new Date(a.ends_at || 0) - new Date(b.ends_at || 0));
        setAssignments(rows);
      })
      .catch((requestError) => setError(getApiErrorMessage(requestError, "Unable to load assignments.")))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PortalPage title="Assignments">
      <LoadingOrError loading={loading} error={error} />
      {!loading && !error && (
        <div className="grid gap-3">
          {assignments.map((item) => {
            const meta = STATUS_META[item.statusKey];
            const StatusIcon = meta.icon;
            return (
              <article key={item.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
                <div className="min-w-0">
                  <h2 className="font-black text-slate-950">{item.title}</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {item.submission?.total_marks ? `Total: ${item.submission.total_marks} marks · ` : ""}
                    Deadline: {item.ends_at ? new Date(item.ends_at).toLocaleString() : "No deadline set"}
                  </p>
                  {item.statusKey === "graded" && (
                    <p className="mt-1 text-sm font-black text-emerald-700">Score: {item.submission.marks_obtained ?? "-"} / {item.submission.total_marks}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${meta.className} gap-1`}><StatusIcon size={13} /> {meta.label}</span>
                  {item.enrollmentId && <Link to={`/student/courses/${item.enrollmentId}`} className="btn btn-success btn-sm text-white">View Assignment</Link>}
                </div>
              </article>
            );
          })}
          {!assignments.length && <p className="rounded-xl border border-dashed border-emerald-200 bg-white p-8 text-center font-semibold text-slate-500">No assignments are currently available.</p>}
        </div>
      )}
    </PortalPage>
  );
}
