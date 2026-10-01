import { useEffect, useState } from "react";
import { subjectWeekApi, courseChapterApi } from "../../services/resourceApi.js";
import { getApiErrorMessage } from "../../services/api.js";
import PageIllustration from "../../components/common/PageIllustration.jsx";
import RichTextEditor from "../../components/common/RichTextEditor.jsx";

const localDate = (date) => {
  if (!date) return "";
  const value = new Date(date);
  return new Date(value.getTime() - value.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export default function CurriculumManager({ data }) {
  const [subject, setSubject] = useState("");
  const [weeks, setWeeks] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [revision, setRevision] = useState(0);
  const selectedSubject = data.assigned_subjects.find((item) => String(item.id) === String(subject));
  const selectedSection = data.assigned_sections.find((item) => String(item.id) === String(selectedSubject?.course_section));
  const canManage = (data.assignments || []).some((assignment) => assignment.role === "head_teacher" && String(assignment.course) === String(selectedSection?.course));
  useEffect(() => {
    let active = true;
    setWeeks([]); setChapters([]); setEditing(null); setChapter(null); setError("");
    if (subject) Promise.all([subjectWeekApi.listResults({subject}), courseChapterApi.listResults({"week__subject": subject})])
      .then(([w, c]) => { if (active) { setWeeks(w); setChapters(c); } })
      .catch((e) => { if (active) setError(getApiErrorMessage(e, "Unable to load curriculum.")); });
    return () => { active = false; };
  }, [subject, revision]);
  async function save(event, kind) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const item = kind === "week" ? editing : chapter;
      const api = kind === "week" ? subjectWeekApi : courseChapterApi;
      if (kind === "week" && !Number.isFinite(new Date(item.release_at).getTime())) { setError("Choose a valid release date and time."); return; }
      const payload = kind === "week" ? {...item, subject, release_at: new Date(item.release_at).toISOString()} : item;
      if (item.id) await api.update(item.id, payload); else await api.create(payload);
      setRevision((v) => v + 1);
    } catch (e) { setError(getApiErrorMessage(e, "Could not save curriculum.")); }
    finally { setBusy(false); }
  }
  const field = "input input-bordered w-full";
  return <section className="rounded-2xl border border-emerald-100 bg-white p-5 sm:p-7">
    <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Learning journey</p><h2 className="mt-2 text-2xl font-black">Weekly curriculum</h2><p className="mt-2 text-sm text-slate-500">Choose a subject, schedule its weeks, and add chapters. Attach lessons and tests from their editors.</p></div><PageIllustration kind="calendar" className="hidden sm:block" /></div>
    <label className="mt-5 grid gap-2 text-sm font-bold">Subject<select className="select select-bordered w-full" value={subject} onChange={(e) => setSubject(e.target.value)}><option value="">Choose a subject</option>{data.assigned_subjects.map((s) => <option key={s.id} value={s.id}>{data.assigned_courses.find((c) => c.id === data.assigned_sections.find((section) => section.id === s.course_section)?.course)?.title} · {s.name}</option>)}</select></label>
    {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}
    {subject && canManage && <button className="btn btn-success mt-4 text-white" onClick={() => { setChapter(null); setEditing({title:"", number: Math.max(0, ...weeks.map((w) => w.number)) + 1, release_at:"", is_published:false}); }}>Add week</button>}
    {subject && !canManage && <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">Your head teacher manages the weekly release schedule. You can attach your materials and tests to these chapters.</p>}
    {editing && <form onSubmit={(e) => save(e, "week")} className="mt-4 grid gap-3 rounded-xl bg-emerald-50 p-4 sm:grid-cols-2">
      <label className="grid gap-1 text-sm">Week title<input required className={field} value={editing.title} onChange={(e) => setEditing({...editing,title:e.target.value})} /></label>
      <label className="grid gap-1 text-sm">Week number<input required min="1" type="number" className={field} value={editing.number} onChange={(e) => setEditing({...editing,number:Number(e.target.value)})} /></label>
      <label className="grid gap-1 text-sm">Release date and time (your local time)<input required type="datetime-local" className={field} value={editing.release_at} onChange={(e) => setEditing({...editing,release_at:e.target.value})} /></label>
      <label className="flex items-center gap-2"><input type="checkbox" className="checkbox checkbox-success" checked={editing.is_published} onChange={(e) => setEditing({...editing,is_published:e.target.checked})} />Publish on the release date</label>
      <div className="flex gap-2"><button disabled={busy} className="btn btn-success text-white">{busy ? "Saving…" : "Save week"}</button><button type="button" className="btn" onClick={() => setEditing(null)}>Cancel</button></div>
    </form>}
    <div className="mt-4 space-y-3">{weeks.map((w) => <article key={w.id} className="rounded-xl border border-slate-200 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold">Week {w.number}: {w.title}</h3><p className="mt-1 text-xs text-slate-500">{w.is_published ? "Published schedule" : "Draft"} · {new Date(w.release_at).toLocaleString()}</p></div>{canManage && <div className="flex gap-2"><button className="btn btn-sm" onClick={() => {setChapter(null);setEditing({...w,release_at:localDate(w.release_at)});}}>Edit week</button><button className="btn btn-sm btn-outline" onClick={() => {setEditing(null);setChapter({week:w.id,title:"",description:"",order:chapters.filter((c) => c.week===w.id).length});}}>Add chapter</button></div>}</div>
      {chapters.filter((c) => c.week===w.id).map((c) => <div key={c.id} className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3"><span className="text-sm">{c.title}</span>{canManage && <button className="btn btn-ghost btn-xs" onClick={() => {setEditing(null);setChapter(c);}}>Edit chapter</button>}</div>)}
    </article>)}</div>
    {subject && !weeks.length && !editing && <p className="mt-4 text-sm text-slate-500">No weeks yet. Add the first week to start planning this subject.</p>}
    {chapter && <form onSubmit={(e) => save(e, "chapter")} className="mt-4 grid gap-3 rounded-xl bg-amber-50 p-4"><h3 className="font-bold">Chapter / topic</h3><label className="grid gap-1 text-sm">Title<input required className={field} value={chapter.title} onChange={(e) => setChapter({...chapter,title:e.target.value})} /></label><label className="grid gap-1 text-sm">Order<input required type="number" min="0" className={field} value={chapter.order} onChange={(e) => setChapter({...chapter,order:Number(e.target.value)})} /></label><div className="grid gap-1 text-sm"><span>Chapter introduction</span><RichTextEditor value={chapter.description} onChange={(value) => setChapter({...chapter,description:value})} placeholder="Welcome students, introduce the topic, or add preparation notes" /></div><div className="flex gap-2"><button disabled={busy} className="btn btn-success text-white">{busy ? "Saving…" : "Save chapter"}</button><button type="button" className="btn" onClick={() => setChapter(null)}>Cancel</button></div></form>}
  </section>;
}
