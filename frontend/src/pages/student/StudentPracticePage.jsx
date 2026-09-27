import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Target, RotateCcw } from "lucide-react";

import { getApiErrorMessage } from "../../services/api.js";
import { studentDashboardApi, studentPortalApi } from "../../services/resourceApi.js";
import { LoadingOrError, PortalPage } from "./studentPortalShared.jsx";

export default function StudentPracticePage() {
  const [assessments, setAssessments] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([studentPortalApi.practice(), studentDashboardApi.list()])
      .then(([practiceData, learningData]) => {
        setAssessments(Array.isArray(practiceData) ? practiceData : []);
        setEnrollments(learningData?.enrollments || []);
      })
      .catch((requestError) => setError(getApiErrorMessage(requestError, "Unable to load your practice sets.")))
      .finally(() => setLoading(false));
  }, []);

  const courseToEnrollment = useMemo(() => {
    const map = {};
    enrollments.forEach((enrollment) => { map[enrollment.course] = enrollment.id; });
    return map;
  }, [enrollments]);

  const groups = useMemo(() => ({
    recommended: assessments.filter((item) => item.is_recommended),
    recovery: assessments.filter((item) => item.is_recovery && !item.is_recommended),
    regular: assessments.filter((item) => !item.is_recovery && !item.is_recommended),
  }), [assessments]);

  return (
    <PortalPage title="Practice Center" eyebrow="Practice sets targeted to you, plus recovery and regular practice">
      <LoadingOrError loading={loading} error={error} />
      {!loading && !error && (
        <div className="space-y-6">
          <Section title="Recommended for You" icon={Sparkles} iconClass="text-amber-600" items={groups.recommended} courseToEnrollment={courseToEnrollment} emptyText="No recommended practice right now." />
          <Section title="Recovery Practice" icon={RotateCcw} iconClass="text-red-600" items={groups.recovery} courseToEnrollment={courseToEnrollment} emptyText="No recovery practice assigned." />
          <Section title="Regular Practice" icon={Target} iconClass="text-emerald-700" items={groups.regular} courseToEnrollment={courseToEnrollment} emptyText="No general practice sets available yet." />
        </div>
      )}
    </PortalPage>
  );
}

function Section({ title, icon: Icon, iconClass, items, courseToEnrollment, emptyText }) {
  return (
    <div className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 font-black text-slate-950"><Icon size={18} className={iconClass} /> {title}</h2><span className="badge badge-outline">{items.length}</span></div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {items.map((item) => {
          const enrollmentId = courseToEnrollment[item.course];
          return (
            <article key={item.id} className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-4">
              <h3 className="font-black text-slate-950">{item.title}</h3>
              <p className="mt-1 text-sm font-semibold text-slate-500">{item.duration_minutes} minutes</p>
              {enrollmentId ? (
                <Link to={`/student/courses/${enrollmentId}`} className="btn btn-success btn-sm mt-3 text-white">Start Practice</Link>
              ) : null}
            </article>
          );
        })}
        {!items.length && <p className="rounded-lg border border-dashed border-slate-200 p-5 font-semibold text-slate-500">{emptyText}</p>}
      </div>
    </div>
  );
}
