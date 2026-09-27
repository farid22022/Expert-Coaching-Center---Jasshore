import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, BookmarkCheck, RotateCcw } from "lucide-react";

import { getApiErrorMessage } from "../../services/api.js";
import { studentBookmarkApi, studentPortalApi } from "../../services/resourceApi.js";
import { notifyError, notifySuccess } from "../../services/alerts.js";
import { LoadingOrError, PortalPage } from "./studentPortalShared.jsx";

export default function StudentMistakesPage() {
  const navigate = useNavigate();
  const [mistakes, setMistakes] = useState([]);
  const [selected, setSelected] = useState([]);
  const [bookmarkedQuestionIds, setBookmarkedQuestionIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([studentPortalApi.mistakes(), studentBookmarkApi.listResults().catch(() => [])])
      .then(([mistakeData, bookmarkData]) => {
        setMistakes(Array.isArray(mistakeData) ? mistakeData : []);
        setBookmarkedQuestionIds(bookmarkData.map((item) => item.question));
      })
      .catch((requestError) => setError(getApiErrorMessage(requestError, "Unable to load your mistakes.")))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id) => setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));

  const toggleBookmark = async (questionId) => {
    try {
      if (bookmarkedQuestionIds.includes(questionId)) {
        const bookmarks = await studentBookmarkApi.listResults();
        const match = bookmarks.find((item) => item.question === questionId);
        if (match) await studentBookmarkApi.remove(match.id);
        setBookmarkedQuestionIds((current) => current.filter((id) => id !== questionId));
        notifySuccess("Bookmark removed.");
      } else {
        await studentBookmarkApi.create({ question: questionId });
        setBookmarkedQuestionIds((current) => [...current, questionId]);
        notifySuccess("Question bookmarked.");
      }
    } catch (requestError) {
      notifyError(getApiErrorMessage(requestError, "Unable to update bookmark."));
    }
  };

  const practiceSelected = async () => {
    if (!selected.length) return;
    setSubmitting(true);
    try {
      await studentPortalApi.practiceMistakes(selected);
      notifySuccess("New practice set created from your selected mistakes.");
      navigate("/student/practice");
    } catch (requestError) {
      notifyError(getApiErrorMessage(requestError, "Unable to create a practice set."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PortalPage title="My Mistakes" eyebrow="Review your incorrect answers and turn them into practice">
      <LoadingOrError loading={loading} error={error} />
      {!loading && !error && (
        <div className="space-y-4">
          {selected.length > 0 && (
            <div className="sticky top-0 z-10 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-sm font-black text-emerald-800">{selected.length} selected</p>
              <button type="button" disabled={submitting} onClick={practiceSelected} className="btn btn-success btn-sm text-white">
                <RotateCcw size={14} /> Practice Selected
              </button>
            </div>
          )}
          <div className="grid gap-3">
            {mistakes.map((item) => (
              <article key={item.id} className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <input type="checkbox" className="checkbox checkbox-success mt-1" checked={selected.includes(item.id)} onChange={() => toggle(item.id)} />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs font-black uppercase tracking-wide text-emerald-700">{item.assessment_title}{item.topic ? ` · ${item.topic}` : ""}</p>
                      <button type="button" onClick={() => toggleBookmark(item.question_id)} className="btn btn-ghost btn-xs shrink-0 text-amber-600">
                        {bookmarkedQuestionIds.includes(item.question_id) ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                      </button>
                    </div>
                    <h3 className="mt-1 font-black text-slate-950">{item.question_text}</h3>
                    {item.can_review ? (
                      <div className="mt-2 space-y-1 text-sm">
                        {item.your_answer && <p className="font-semibold text-red-600">Your answer: {item.your_answer.join(", ")}</p>}
                        {item.correct_answer && <p className="font-semibold text-emerald-700">Correct answer: {item.correct_answer.join(", ")}</p>}
                        {item.explanation && <p className="mt-1 font-semibold text-slate-500">{item.explanation}</p>}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm font-semibold text-slate-400">Answer review isn't enabled for this test.</p>
                    )}
                  </div>
                </div>
              </article>
            ))}
            {!mistakes.length && (
              <p className="rounded-xl border border-dashed border-emerald-200 bg-white p-8 text-center font-semibold text-slate-500">
                No mistakes to review - great work so far!
              </p>
            )}
          </div>
        </div>
      )}
    </PortalPage>
  );
}
