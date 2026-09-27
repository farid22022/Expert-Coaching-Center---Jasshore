import { useEffect, useState } from "react";
import { Bookmark, Trash2 } from "lucide-react";

import { getApiErrorMessage } from "../../services/api.js";
import { studentBookmarkApi } from "../../services/resourceApi.js";
import { confirmDelete, notifyError, notifySuccess } from "../../services/alerts.js";
import { LoadingOrError, PortalPage } from "./studentPortalShared.jsx";

export default function StudentBookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    studentBookmarkApi
      .listResults()
      .then((data) => setBookmarks(data))
      .catch((requestError) => setError(getApiErrorMessage(requestError, "Unable to load your bookmarks.")))
      .finally(() => setLoading(false));
  }, []);

  const remove = async (bookmark) => {
    const confirmed = await confirmDelete("This bookmark");
    if (!confirmed) return;
    try {
      await studentBookmarkApi.remove(bookmark.id);
      setBookmarks((current) => current.filter((item) => item.id !== bookmark.id));
      notifySuccess("Bookmark removed.");
    } catch (requestError) {
      notifyError(getApiErrorMessage(requestError, "Unable to remove this bookmark."));
    }
  };

  return (
    <PortalPage title="Bookmarks" eyebrow="Questions you've saved for later review">
      <LoadingOrError loading={loading} error={error} />
      {!loading && !error && (
        <div className="grid gap-3">
          {bookmarks.map((item) => (
            <article key={item.id} className="flex items-start justify-between gap-4 rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber-50 text-amber-600"><Bookmark size={18} /></span>
                <div>
                  {item.subject_name && <p className="text-xs font-black uppercase tracking-wide text-emerald-700">{item.subject_name}</p>}
                  <p className="mt-1 font-black text-slate-950">{item.question_text}</p>
                </div>
              </div>
              <button type="button" onClick={() => remove(item)} className="btn btn-ghost btn-sm text-red-600"><Trash2 size={16} /></button>
            </article>
          ))}
          {!bookmarks.length && (
            <p className="rounded-xl border border-dashed border-emerald-200 bg-white p-8 text-center font-semibold text-slate-500">
              You haven't bookmarked any questions yet. Bookmark a question while reviewing your test results to save it here.
            </p>
          )}
        </div>
      )}
    </PortalPage>
  );
}
