import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Award, MessageSquare, Star, TrendingUp } from "lucide-react";

import SafeHtml from "../../components/common/SafeHtml.jsx";
import { getApiErrorMessage } from "../../services/api.js";
import { courseRatingApi } from "../../services/resourceApi.js";
import { studentAcademicApi } from "../../services/resourceApi.js";
import { notifyError, notifySuccess } from "../../services/alerts.js";
import { LoadingOrError, PortalPage } from "./studentPortalShared.jsx";

function StarPicker({ value, onChange, readOnly }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          className={readOnly ? "cursor-default" : "cursor-pointer"}
        >
          <Star size={22} className={star <= value ? "fill-amber-400 text-amber-400" : "text-slate-300"} />
        </button>
      ))}
    </div>
  );
}

export default function StudentCourseResultPage() {
  const { enrollmentId, subjectId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingText, setRatingText] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);

  const load = () => {
    studentAcademicApi
      .courseResult(enrollmentId, subjectId)
      .then((data) => {
        setResult(data);
        if (data.rating) {
          setRatingValue(data.rating.rating);
          setRatingText(data.rating.feedback_text || "");
        }
      })
      .catch((requestError) => setError(getApiErrorMessage(requestError, "Unable to load this course result.")))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrollmentId, subjectId]);

  const submitRating = async () => {
    if (!ratingValue) return;
    setSubmittingRating(true);
    try {
      if (result.rating) {
        await courseRatingApi.update(result.rating.id, { rating: ratingValue, feedback_text: ratingText });
      } else {
        await courseRatingApi.create({ enrollment: Number(enrollmentId), course_subject: Number(subjectId), rating: ratingValue, feedback_text: ratingText });
      }
      notifySuccess("Thanks for your feedback!");
      load();
    } catch (requestError) {
      notifyError(getApiErrorMessage(requestError, "Unable to submit your rating."));
    } finally {
      setSubmittingRating(false);
    }
  };

  const published = result?.result_status === "published";

  return (
    <PortalPage title={result?.course_subject?.name || "Course Result"} eyebrow={result?.course_subject?.admission}>
      <LoadingOrError loading={loading} error={error} />
      {!loading && !error && result && (
        <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <div className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-black text-slate-950">{result.course_subject.name}</h2>
              {result.course_subject.stage_name && <p className="mt-1 text-sm font-bold text-emerald-700">{result.course_subject.stage_name}</p>}
              <p className="mt-3 text-sm font-semibold text-slate-500">Teacher(s)</p>
              <p className="font-bold text-slate-900">{result.course_subject.teachers.length ? result.course_subject.teachers.join(", ") : "Not assigned yet"}</p>
              <p className="mt-3 text-sm font-semibold text-slate-500">Admission</p>
              <p className="font-bold text-slate-900">{result.course_subject.admission}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-sm font-black text-emerald-700">
                <Link to={`/student/courses/${enrollmentId}/overview`} className="hover:underline">View Academic Overview</Link>
              </div>
            </div>

            <div className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
              <h3 className="flex items-center gap-2 font-black text-slate-950"><TrendingUp size={16} className="text-emerald-700" /> Keep Improving</h3>
              <div className="mt-3 flex flex-col gap-2 text-sm font-black text-emerald-700">
                <Link to="/student/progress" className="hover:underline">Weak Topics &amp; Progress</Link>
                <Link to="/student/practice" className="hover:underline">Practice Center</Link>
                <Link to="/student/practice/mistakes" className="hover:underline">My Mistakes</Link>
                <Link to="/student/feedback" className="hover:underline">Teacher Feedback</Link>
              </div>
            </div>
          </aside>

          <div className="space-y-5">
            <section className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
              <h3 className="font-black text-slate-950">Assessment Breakdown</h3>
              <div className="mt-3 overflow-x-auto">
                <table className="table table-sm">
                  <thead className="bg-slate-100 text-slate-950">
                    <tr><th>Assessment</th><th>Obtained</th><th>Weight</th><th>Contribution</th></tr>
                  </thead>
                  <tbody>
                    {result.components.map((component) => (
                      <tr key={component.id}>
                        <td className="font-bold">{component.name}</td>
                        <td>{component.raw_obtained ?? "-"} / {component.raw_total}</td>
                        <td>{component.weight_percentage}%</td>
                        <td className="font-black">{published && component.weighted_score !== null ? `${component.weighted_score}%` : "N/A"}</td>
                      </tr>
                    ))}
                    {!result.components.length && (
                      <tr><td colSpan={4} className="py-6 text-center text-slate-400">No assessment information is available.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
              <h3 className="flex items-center gap-2 font-black text-slate-950"><Award size={18} className="text-emerald-700" /> Final Result</h3>
              {published ? (
                <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div><p className="text-2xl font-black text-slate-950">{result.total_percentage}%</p><p className="text-xs font-bold text-slate-500">Total Percentage</p></div>
                  <div><p className="text-2xl font-black text-slate-950">{result.grade || "N/A"}</p><p className="text-xs font-bold text-slate-500">Grade</p></div>
                  <div><p className="text-2xl font-black text-slate-950">{result.grade_point ?? "N/A"}</p><p className="text-xs font-bold text-slate-500">Grade Point</p></div>
                  <div><p className="text-2xl font-black capitalize text-slate-950">{result.pass_status || "N/A"}</p><p className="text-xs font-bold text-slate-500">Status</p></div>
                </div>
              ) : (
                <p className="mt-3 font-semibold text-slate-600">Final result has not been published yet.</p>
              )}
            </section>

            {result.teacher_comment && (
              <section className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
                <h3 className="flex items-center gap-2 font-black text-slate-950"><MessageSquare size={16} className="text-emerald-700" /> Teacher Comment</h3>
                <SafeHtml html={result.teacher_comment} className="mt-2 text-sm text-slate-700" />
              </section>
            )}

            {published && (
              <section className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
                <h3 className="font-black text-slate-950">How would you rate this course?</h3>
                <div className="mt-3"><StarPicker value={ratingValue} onChange={setRatingValue} /></div>
                <textarea
                  value={ratingText}
                  onChange={(event) => setRatingText(event.target.value)}
                  placeholder="What helped you most?"
                  className="textarea textarea-bordered mt-3 w-full"
                  rows={2}
                />
                <button type="button" disabled={submittingRating || !ratingValue} onClick={submitRating} className="btn btn-success btn-sm mt-3 text-white">
                  {result.rating ? "Update Rating" : "Submit Feedback"}
                </button>
              </section>
            )}
          </div>
        </div>
      )}
    </PortalPage>
  );
}
