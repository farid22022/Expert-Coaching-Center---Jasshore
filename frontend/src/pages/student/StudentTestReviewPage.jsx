import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, CircleDashed, Lock, XCircle } from "lucide-react";

import api, { getApiErrorMessage } from "../../services/api.js";
import RoleDashboardShell from "../../components/layout/RoleDashboardShell.jsx";
import SafeHtml from "../../components/common/SafeHtml.jsx";
import { formatAppDateTime } from "../../hooks/useServerCountdown.js";
import { studentNav } from "./studentPortalShared.jsx";

const RESULT = {
  correct: { label: "Correct", icon: CheckCircle2, tone: "bg-emerald-100 text-emerald-800" },
  incorrect: { label: "Incorrect", icon: XCircle, tone: "bg-red-100 text-red-800" },
  unanswered: { label: "Not answered", icon: CircleDashed, tone: "bg-slate-100 text-slate-700" },
  answered: { label: "Answered", icon: CheckCircle2, tone: "bg-sky-100 text-sky-800" },
};

function optionClass(option, released) {
  if (!released) return option.selected ? "border-sky-400 bg-sky-50" : "border-slate-200 bg-white";
  if (option.is_correct) return "border-emerald-500 bg-emerald-50";
  if (option.selected) return "border-red-400 bg-red-50";
  return "border-slate-200 bg-white";
}

function Question({ question, number, released, explained }) {
  const meta = RESULT[question.result] || RESULT.answered;
  const Icon = meta.icon;
  return (
    <article className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-black uppercase text-slate-500">Question {number}</p>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black ${meta.tone}`}><Icon size={14} aria-hidden="true" /> {meta.label}</span>
      </div>
      <SafeHtml html={question.text} className="mt-2 font-bold text-slate-950" />
      {question.image && <img src={question.image} alt="" className="mt-3 max-h-64 rounded-lg border" loading="lazy" />}
      <ul className="mt-4 space-y-2">
        {question.options.map((option) => (
          <li key={option.id} className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border-2 p-3 ${optionClass(option, released)}`}>
            <span className="font-semibold text-slate-800">{option.text}</span>
            <span className="flex gap-2 text-xs font-black">
              {option.selected && <span className="rounded bg-slate-800 px-2 py-0.5 text-white">Your answer</span>}
              {released && option.is_correct && <span className="rounded bg-emerald-600 px-2 py-0.5 text-white">Correct answer</span>}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm font-bold text-slate-600">Marks: {Number(question.marks_obtained)} / {Number(question.marks)}</p>
      {explained && question.explanation && (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-black uppercase text-amber-800">Explanation</p>
          <SafeHtml html={question.explanation} className="mt-1 text-slate-700" />
        </div>
      )}
    </article>
  );
}

export default function StudentTestReviewPage() {
  const { assessmentId } = useParams();
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["testReview", assessmentId],
    queryFn: ({ signal }) => api.get(`/assessments/student/assessments/${assessmentId}/review/`, { signal }).then((response) => response.data),
    staleTime: 60_000,
    retry: false,
  });

  let body;
  if (isLoading) {
    body = <div className="animate-pulse rounded-xl border border-emerald-100 bg-white p-8 text-sm font-bold text-slate-500">Loading your review...</div>;
  } else if (error) {
    const notSubmitted = error.response?.status === 409;
    body = (
      <div role="alert" className="rounded-xl border border-slate-200 bg-slate-50 p-6">
        <p className="font-black text-slate-900">{notSubmitted ? "Submit the test to review your answers" : "Couldn't load your review"}</p>
        <p className="mt-1 text-sm font-semibold text-slate-600">{notSubmitted ? "Your answers become available for review once you have submitted the test." : getApiErrorMessage(error, "Please try again.")}</p>
        <div className="mt-4 flex gap-2">
          <Link className="btn btn-outline btn-sm" to={`/student/tests/${assessmentId}`}>Go to test</Link>
          {!notSubmitted && <button type="button" className="btn btn-success btn-sm text-white" onClick={() => refetch()}>Retry</button>}
        </div>
      </div>
    );
  } else {
    const { summary, attempt, questions } = data;
    const released = data.answers_released;
    body = (
      <div className="space-y-5">
        <header className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-black text-slate-950">{data.assessment.title}</h2>
          <p className="mt-1 font-bold text-slate-700">Score: {Number(attempt.score)} / {Number(attempt.total_marks)}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-sm font-black">
            {released ? (
              <>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800">{summary.correct} correct</span>
                <span className="rounded-full bg-red-100 px-3 py-1 text-red-800">{summary.incorrect} incorrect</span>
              </>
            ) : (
              <span className="rounded-full bg-sky-100 px-3 py-1 text-sky-800">{summary.answered} answered</span>
            )}
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{summary.unanswered} not answered</span>
          </div>
        </header>
        {(!released || !data.explanations_released) && (
          <p role="status" className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-900">
            <Lock size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
            {released ? "Explanations" : data.explanations_released ? "Correct answers" : "Correct answers and explanations"} will be shown{data.release_at ? ` after the test closes on ${formatAppDateTime(data.release_at)}` : " once the test closes"}. Your own answers are shown below.
          </p>
        )}
        {questions.map((question, index) => <Question key={question.id} question={question} number={index + 1} released={released} explained={data.explanations_released} />)}
      </div>
    );
  }

  return (
    <RoleDashboardShell roleLabel="Student Portal" title="Review answers" items={studentNav}>
      <section className="mx-auto max-w-3xl">
        <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap gap-2">
          <Link className="btn btn-outline btn-sm" to={`/student/tests/${assessmentId}`}><ArrowLeft size={15} /> Back to test</Link>
          <Link className="btn btn-ghost btn-sm" to="/student/results">All results</Link>
        </nav>
        {body}
      </section>
    </RoleDashboardShell>
  );
}
