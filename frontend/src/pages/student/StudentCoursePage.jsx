import CurriculumOutline from "./CurriculumOutline.jsx";
import PageIllustration from "../../components/common/PageIllustration.jsx";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Circle,
  ClipboardList,
  Clock,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Menu,
  PlayCircle,
  Timer,
  Video,
  X,
} from "lucide-react";

import api, { API_BASE_URL, getApiErrorMessage } from "../../services/api.js";
import RoleDashboardShell from "../../components/layout/RoleDashboardShell.jsx";
import SafeHtml from "../../components/common/SafeHtml.jsx";
import { confirmAction, notifyError, notifySuccess } from "../../services/alerts.js";
import { studentNav } from "./studentPortalShared.jsx";

const nav = studentNav;
const assessmentTypes = ["mcq", "exam", "assignment"];
const formatTime = (seconds) => `${String(Math.max(0, Math.floor(seconds / 60))).padStart(2, "0")}:${String(Math.max(0, seconds % 60)).padStart(2, "0")}`;

const mediaUrl = (value) => {
  if (!value) return "";
  if (/^https?:\/\//.test(value)) return value;
  return `${API_BASE_URL.replace(/\/api\/v1$/, "")}${value}`;
};

const looksLikeImage = (value = "") => /\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(value.split("?")[0]);
const rowIcon = (type) => (type === "video" ? PlayCircle : assessmentTypes.includes(type) ? ClipboardList : FileText);

function useCourseContent(enrollmentId) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    setData(null);
  }, [enrollmentId]);

  useEffect(() => {
    setError("");
    api
      .get(`/courses/student/dashboard/${enrollmentId}/content/`)
      .then((response) => setData(response.data?.data || response.data))
      .catch((requestError) => setError(getApiErrorMessage(requestError, "This course is not available to your account.")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrollmentId, reloadToken]);

  const refetch = () => setReloadToken((value) => value + 1);
  return { data, error, refetch };
}

const STATUS_META = {
  completed: { label: "Completed", icon: CheckCircle2, className: "text-emerald-700" },
  current: { label: "Current", icon: ArrowRight, className: "text-blue-700" },
  upcoming: { label: "Coming soon", icon: Clock, className: "text-slate-400" },
  empty: { label: "Coming soon", icon: Clock, className: "text-slate-400" },
};

function buildGroups(data) {
  if (!data) return [];
  const groups = [];
  const bySubject = new Map();
  const fallback = { key: "general", title: "General", chapter: "Course content", items: [], status: "current" };

  (data.outline || []).forEach((section) => {
    (section.subjects || []).forEach((subject) => {
      const group = {
        key: `subject-${subject.id}`,
        subjectId: String(subject.id),
        title: subject.name,
        chapter: section.section || "Subject content",
        status: subject.status || "empty",
        items: [],
      };
      bySubject.set(String(subject.id), group);
      groups.push(group);
    });
  });

  [...(data.materials || []), ...(data.assessments || [])].forEach((item) => {
    const group = bySubject.get(String(item.subject || "")) || fallback;
    group.items.push(item);
  });

  if (fallback.items.length) groups.push(fallback);
  return groups;
}

function MaterialMedia({ material }) {
  const source = mediaUrl(material.file || material.url);
  if (!source) return null;

  if (material.material_type === "video") {
    return (
      <div className="mt-6 overflow-hidden rounded-lg border border-emerald-100 bg-slate-950">
        <iframe className="aspect-video w-full" src={source} title={material.title} allowFullScreen />
      </div>
    );
  }

  if (looksLikeImage(source)) {
    return (
      <figure className="mt-6 rounded-lg border border-emerald-100 bg-white p-3">
        <img src={source} alt={material.title} className="mx-auto max-h-[680px] w-auto max-w-full rounded object-contain" />
      </figure>
    );
  }

  return (
    <a className="btn btn-success mt-6 text-white" href={source} target="_blank" rel="noreferrer">
      <ExternalLink size={17} /> Open attached resource
    </a>
  );
}

function MaterialDetails({ material, enrollmentId, onViewed }) {
  const TypeIcon = material.material_type === "video" ? Video : looksLikeImage(material.file || material.url) ? ImageIcon : FileText;

  useEffect(() => {
    if (material.viewed) return;
    api
      .post(`/courses/student/dashboard/${enrollmentId}/materials/${material.id}/view/`)
      .then(() => onViewed?.())
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [material.id]);

  return (
    <article className="rounded-lg border border-emerald-100 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase text-emerald-700">{material.subject_name || "Study material"}</p>
          <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">{material.title}</h1>
          <p className="mt-2 text-sm font-semibold text-slate-500">{material.chapter || "General"}{material.topic ? ` · ${material.topic}` : ""}</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-800">
          <TypeIcon size={16} /> {material.material_type || "material"}
        </span>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded bg-emerald-50 p-3">
          <p className="text-xs font-black uppercase text-emerald-700">Teacher</p>
          <p className="font-bold text-slate-800">{material.teacher_name || "Assigned teacher"}</p>
        </div>
        <div className="rounded bg-emerald-50 p-3">
          <p className="text-xs font-black uppercase text-emerald-700">Status</p>
          <p className="font-bold text-slate-800">Published and approved</p>
        </div>
        <div className="rounded bg-emerald-50 p-3">
          <p className="text-xs font-black uppercase text-emerald-700">Course part</p>
          <p className="font-bold text-slate-800">{material.chapter || "General lesson"}</p>
        </div>
      </div>
      {material.description && <SafeHtml html={material.description} className="mt-6 rounded-lg bg-slate-50 p-4 font-medium leading-7 text-slate-700" />}
      <MaterialMedia material={material} />
    </article>
  );
}

function EmptySubjectState({ group }) {
  return (
    <div className="rounded-lg border border-dashed border-emerald-200 bg-emerald-50/60 p-6 text-center">
      <Clock className="mx-auto text-emerald-700" size={38} />
      <h2 className="mt-3 text-xl font-black text-slate-950">Coming soon</h2>
      <p className="mx-auto mt-2 max-w-2xl font-semibold text-slate-600">
        Your teacher hasn't published lessons for {group.title} yet. New materials, MCQ tests, and assignments will appear here automatically as soon as they're published.
      </p>
    </div>
  );
}

function Test({ item, close, onDone }) {
  const [started, setStarted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [attempt, setAttempt] = useState(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!started) return;
    let active = true;
    setAttempt(null);
    setError("");
    api
      .post(`/assessments/student/assessments/${item.id}/start/`)
      .then((response) => {
        if (!active) return;
        const next = response.data?.data || response.data;
        setAnswers(next.saved_answers || {});
        setIndex(0);
        setAttempt(next);
        setSeconds(Math.max(0, Math.floor((new Date(next.deadline) - Date.now()) / 1000)));
      })
      .catch((requestError) => { if (active) { setError(getApiErrorMessage(requestError)); setStarted(false); } });
    return () => { active = false; };
  }, [item.id, started]);

  useEffect(() => {
    if (!attempt || result || attempt.status !== "in_progress") return undefined;
    const timer = setInterval(() => setSeconds(Math.max(0, Math.floor((new Date(attempt.deadline) - Date.now()) / 1000))), 1000);
    return () => clearInterval(timer);
  }, [attempt, result]);

  const submitTest = async () => {
    if (submitting || saving || !attempt || attempt.status !== "in_progress") return;
    setSubmitting(true);
    try {
      const response = await api.post(`/assessments/student/assessments/${item.id}/submit/`, { attempt: attempt.id });
      setResult(response.data?.data || response.data);
      notifySuccess("Test submitted successfully.");
      onDone?.();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
      notifyError(getApiErrorMessage(requestError, "Could not submit the test."));
      setSubmitting(false);
    }
  };

  // The countdown is a UI convenience only - `deadline` above is server-authoritative and
  // the backend rejects late submissions regardless of this timer. Auto-submit at zero so a
  // student isn't left stranded on the question screen with no feedback.
  useEffect(() => {
    if (attempt?.status === "in_progress" && !result && seconds === 0 && !submitting && !saving) {
      submitTest();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, saving, attempt?.status]);

  if (!started) return <section className="rounded-xl border border-emerald-200 bg-paper p-6">
    <PageIllustration kind="quiz" className="mb-4" />
    <h2 className="text-xl font-bold">{item.title}</h2>
    <p className="my-3">Start when you are ready. Resuming an existing attempt keeps its original deadline and saved answers.</p>
    {item.instructions && <SafeHtml html={item.instructions} />}
    {error && <p role="alert" className="my-3 text-red-700">{error}</p>}
    <button type="button" className="btn btn-success text-white" onClick={() => { setError(""); setStarted(true); }}>Start or resume test</button>
  </section>;
  if (error && !attempt) return <div role="alert" className="alert alert-error">{error}</div>;
  if (!attempt) return <div className="animate-pulse rounded-lg bg-slate-100 p-8">Preparing secure assessment...</div>;
  if (result) {
    return (
      <div className="rounded-lg bg-emerald-50 p-8 text-center">
        <CheckCircle2 className="mx-auto text-emerald-700" size={44} />
        <h2 className="mt-3 text-2xl font-black">Assessment submitted</h2>
        <p className="mt-3 font-bold">Score: {result.score} / {result.total_marks}</p>
        <button className="btn btn-success mt-5 text-white" onClick={close}>Return to course</button>
      </div>
    );
  }

  if (attempt.status && attempt.status !== "in_progress") {
    return (
      <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-8 text-center">
        <CheckCircle2 className="mx-auto text-emerald-700" size={44} />
        <h2 className="mt-3 text-2xl font-black">This test is already completed</h2>
        <p className="mt-2 font-semibold text-slate-600">Your previous attempt is marked as {attempt.status.replaceAll("_", " ")}.</p>
        <p className="mt-3 font-bold">Score: {attempt.score} / {attempt.total_marks}</p>
        <button className="btn btn-success mt-5 text-white" onClick={close}>Return to course</button>
      </div>
    );
  }

  if (!attempt.questions?.length) {
    return <div className="alert"><AlertCircle size={20} /> This test has no published questions yet. Please check again after your teacher updates it.</div>;
  }

  const question = attempt.questions[index];
  const answeredCount = Object.values(answers).filter((answer) => answer?.length).length;
  const unansweredCount = attempt.questions.length - answeredCount;

  const select = async (optionId) => {
    if (saving || submitting) return;
    setSaving(true);
    setError("");
    const current = answers[question.id] || [];
    const next = question.question_type === "multiple"
      ? current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId]
      : [optionId];
    setAnswers((previous) => ({ ...previous, [question.id]: next }));
    await api
      .post(`/assessments/student/assessments/${item.id}/answer/`, { attempt: attempt.id, question: question.id, selected_options: next })
      .catch((requestError) => { setAnswers((previous) => ({ ...previous, [question.id]: current })); setError(getApiErrorMessage(requestError)); })
      .finally(() => setSaving(false));
  };

  return (
    <div className="overflow-hidden rounded-lg border border-deep-green/10 bg-white">
      <div className="flex items-center justify-between gap-3 bg-deep-green px-4 py-4 text-white sm:px-5">
        <p className="font-black uppercase">Expert Coaching Center</p>
        <p className="text-right text-sm font-semibold uppercase sm:text-base">{item.title}</p>
      </div>
      {error && <p role="alert" className="p-4 text-red-700">{error}</p>}
      {saving && <p role="status" className="px-4">Saving answer...</p>}
      <div className="grid gap-5 p-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="min-w-0">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="font-semibold">Question {index + 1} / {attempt.questions.length}</p>
            <span className="rounded-full bg-slate-50 px-3 py-1 text-sm font-black text-slate-900">{item.subject_name || "MCQ"} · {item.chapter || "Practice"}</span>
          </div>
          <SafeHtml html={question.text} className="text-2xl font-medium leading-snug text-slate-950" />
          {question.image && (
            <button type="button" className="mt-4 block overflow-hidden rounded border border-emerald-100" onClick={() => setPreviewImage(mediaUrl(question.image))}>
              <img src={mediaUrl(question.image)} alt="Question reference" className="max-h-44 max-w-full object-contain" />
            </button>
          )}
          <div className="mt-6 grid gap-3">
            {question.options.map((option) => {
              const selected = (answers[question.id] || []).includes(option.id);
              return (
                <label key={option.id} className={`flex cursor-pointer items-center gap-3 rounded-md border p-4 font-bold transition-colors focus-within:ring-2 focus-within:ring-emerald-400 ${selected ? "border-emerald-500 bg-emerald-50 text-emerald-950" : "border-slate-200 hover:border-emerald-300"}`}>
                  <input type={question.question_type === "multiple" ? "checkbox" : "radio"} disabled={saving || submitting} checked={selected} onChange={() => select(option.id)} className={question.question_type === "multiple" ? "checkbox checkbox-success" : "radio radio-success"} />
                  <span className="min-w-0">{option.text}</span>
                  {option.image && <img src={mediaUrl(option.image)} alt="Option reference" className="ml-auto h-12 max-w-24 rounded object-contain" />}
                </label>
              );
            })}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="btn" disabled={!index} onClick={() => setIndex(index - 1)}>Previous</button>
            {index < attempt.questions.length - 1 ? (
              <button className="btn btn-success text-white" onClick={() => setIndex(index + 1)}>Next</button>
            ) : (
              <button
                className="btn btn-success text-white"
                disabled={submitting || saving}
                onClick={async () => {
                  const confirmed = await confirmAction({
                    title: "Submit Test?",
                    text: `Answered: ${answeredCount} · Unanswered: ${unansweredCount}. You cannot modify answers after final submission.`,
                    confirmText: "Yes, submit",
                  });
                  if (confirmed) submitTest();
                }}
              >
                {submitting ? "Submitting..." : "Submit Test"}
              </button>
            )}
          </div>
        </section>
        <aside className="rounded-lg border border-slate-200 p-4">
          <div className={`rounded-md p-6 text-center text-4xl font-black text-white ${seconds === 0 ? "bg-red-600" : "bg-deep-green"}`}><Timer className="mr-2 inline" size={28} />{formatTime(seconds)}</div>
          {seconds === 0 && <p className="mt-2 text-center text-sm font-black text-red-600">Time's up - submitting automatically...</p>}
          <p className="mt-3 font-semibold">{answeredCount} answered · {unansweredCount} unanswered</p>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {attempt.questions.map((row, currentIndex) => {
              const answered = (answers[row.id] || []).length > 0;
              return (
                <button key={row.id} type="button" onClick={() => setIndex(currentIndex)} className={`h-10 rounded border text-sm font-black ${currentIndex === index ? "border-blue-500 bg-blue-50 text-blue-700" : answered ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white text-slate-900"}`}>
                  {String(currentIndex + 1).padStart(2, "0")}
                </button>
              );
            })}
          </div>
          <div className="mt-5 space-y-1 text-sm font-medium text-slate-600">
            <p>Green answered</p>
            <p>Blue current</p>
            <p>White not answered</p>
          </div>
        </aside>
      </div>
      {previewImage && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/75 p-4" role="dialog" aria-modal="true" onClick={() => setPreviewImage("")}>
          <div className="relative max-h-full max-w-4xl" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="btn btn-sm absolute right-2 top-2 z-10" onClick={() => setPreviewImage("")}>Close</button>
            <img src={previewImage} alt="Expanded question reference" className="max-h-[88vh] max-w-full rounded-lg bg-white object-contain shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}

function AssignmentSubmission({ item, onDone }) {
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  const submit = async () => {
    if (!files.length) {
      notifyError("Please choose a file to submit first.");
      return;
    }
    const confirmed = await confirmAction({
      title: "Submit Assignment?",
      text: `${files.length} file(s) selected. You may not be able to change your submission after it's sent.`,
      confirmText: "Yes, submit",
    });
    if (!confirmed) return;
    setSubmitting(true);
    try {
      const form = new FormData();
      files.forEach((file) => form.append("files", file));
      await api.post(`/assessments/student/assessments/${item.id}/submit_assignment/`, form, { headers: { "Content-Type": "multipart/form-data" } });
      setSubmitted(new Date());
      setFiles([]);
      notifySuccess("Assignment submitted successfully.");
      onDone?.();
    } catch (requestError) {
      notifyError(getApiErrorMessage(requestError, "Could not submit the assignment."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <p className="text-sm font-black uppercase text-emerald-700">Assignment</p>
      <h2 className="text-2xl font-black">{item.title}</h2>
      {(item.instructions || item.description) ? <SafeHtml html={item.instructions || item.description} className="mt-4 text-slate-600" /> : <p className="mt-4 text-slate-600">Follow the teacher's instructions.</p>}
      {submitted ? (
        <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-5">
          <p className="flex items-center gap-2 font-black text-emerald-800"><CheckCircle2 size={18} /> Submitted successfully</p>
          <p className="mt-1 text-sm font-semibold text-slate-600">Submitted at: {submitted.toLocaleString()}</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          <input
            type="file"
            multiple
            className="file-input file-input-bordered w-full"
            onChange={(event) => setFiles([...event.target.files])}
          />
          <button type="button" className="btn btn-success text-white" disabled={submitting || !files.length} onClick={submit}>
            {submitting ? "Submitting..." : "Submit Assignment"}
          </button>
        </div>
      )}
    </div>
  );
}

export function StudentMaterialDetailPage() {
  const { enrollmentId, materialId } = useParams();
  const { data, error, refetch } = useCourseContent(enrollmentId);
  const material = (data?.materials || []).find((row) => String(row.id) === String(materialId));

  return (
    <RoleDashboardShell roleLabel="Student Portal" title="Study Material" items={nav}>
      <section className="mx-auto max-w-5xl">
        <Link className="btn btn-outline mb-5" to={`/student/courses/${enrollmentId}`}>Back to course</Link>
        {error && <div className="alert alert-error">{error}</div>}
        {!data && !error && <div className="animate-pulse rounded-lg bg-white p-8">Loading material details...</div>}
        {data && !material && <div className="alert"><AlertCircle size={20} /> This material is not published for your enrolled course.</div>}
        {material && <MaterialDetails material={material} enrollmentId={enrollmentId} onViewed={refetch} />}
      </section>
    </RoleDashboardShell>
  );
}

export default function StudentCoursePage() {
  const { enrollmentId } = useParams();
  const { data, error, refetch } = useCourseContent(enrollmentId);
  const [selected, setSelected] = useState(null);
  const [drawer, setDrawer] = useState(false);
  const [expanded, setExpanded] = useState({});

  const groups = useMemo(() => buildGroups(data), [data]);
  const allItems = useMemo(() => groups.flatMap((group) => group.items), [groups]);

  useEffect(() => {
    if (!data || selected) return;
    // Land the student on their first incomplete item in the "current" subject
    // (their real next step), not always the very first item in the course.
    const currentGroup = groups.find((group) => group.status === "current");
    const firstIncomplete = currentGroup?.items.find((item) => !(item.viewed || item.is_done));
    setSelected(firstIncomplete || currentGroup?.items[0] || allItems[0] || (groups[0] ? { unit_type: "empty", groupKey: groups[0].key } : null));
  }, [allItems, data, groups, selected]);

  const selectedIndex = allItems.findIndex((item) => item.id === selected?.id && item.unit_type === selected?.unit_type);
  const selectedGroup = groups.find((group) => group.key === selected?.groupKey) || groups.find((group) => group.items.some((item) => item.id === selected?.id && item.unit_type === selected?.unit_type));

  const content = !selected ? (
    <p className="rounded border border-dashed p-8 text-center text-slate-500">No published content is available yet.</p>
  ) : selected.unit_type === "empty" && selectedGroup ? (
    <EmptySubjectState group={selectedGroup} />
  ) : ["mcq", "exam"].includes(selected.unit_type) ? (
    <Test key={selected.id} item={selected} close={() => setSelected(null)} onDone={refetch} />
  ) : selected.unit_type === "assignment" ? (
    <AssignmentSubmission key={selected.id} item={selected} onDone={refetch} />
  ) : (
    <MaterialDetails key={selected.id} material={selected} enrollmentId={enrollmentId} onViewed={refetch} />
  );

  const outline = <CurriculumOutline groups={groups} weeks={data?.weeks || []} selected={selected} onSelect={(item) => {setSelected(item); setDrawer(false);}} onClose={() => setDrawer(false)} />;

  return (
    <RoleDashboardShell roleLabel="Student Portal" title="Course Learning" items={nav}>
      <section className="mx-auto max-w-7xl">
        {error && <div className="alert alert-error">{error}</div>}
        {!data && !error && <div className="animate-pulse rounded-lg bg-white p-8">Loading your enrolled course...</div>}
        {data && (
          <>
            <header className="mb-5 flex items-end justify-between gap-3">
              <div>
                <p className="text-sm font-black uppercase text-emerald-700">My course</p>
                <h1 className="text-2xl font-black sm:text-3xl">{data.enrollment.course_title}</h1>
                <p className="mt-1 text-sm font-semibold text-slate-500">{data.progress?.percentage || 0}% complete · {data.progress?.completed_units || 0}/{data.progress?.total_units || 0} activities completed</p>
              </div>
              <button className="btn btn-outline lg:hidden" onClick={() => setDrawer(true)}><Menu size={17} />Content</button>
            </header>
            {(data.notices || []).length > 0 && (
              <section className="mb-5 rounded-lg border border-emerald-100 bg-white p-4 shadow-sm">
                <h2 className="font-black text-emerald-950">Notice board</h2>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {data.notices.map((notice) => (
                    <button
                      key={notice.id}
                      type="button"
                      onClick={() => {
                        const target = [...(data.materials || []), ...(data.assessments || [])].find((item) => notice.id.endsWith(`-${item.id}`));
                        if (target) setSelected(target);
                      }}
                      className="rounded border border-emerald-100 bg-emerald-50/70 p-3 text-left hover:border-emerald-400"
                    >
                      <p className="text-xs font-black uppercase text-emerald-700">{notice.kind}</p>
                      <p className="font-black text-slate-950">{notice.title}</p>
                      <SafeHtml html={notice.message} className="text-sm font-semibold text-slate-600" />
                    </button>
                  ))}
                </div>
              </section>
            )}
            <div className="grid min-h-[620px] overflow-hidden rounded-lg border bg-white shadow-sm lg:grid-cols-[minmax(0,1fr)_360px]">
              <main className="min-w-0 p-5 sm:p-7">
                {content}
                <div className="mt-8 flex justify-between">
                  <button className="btn btn-outline" disabled={selectedIndex <= 0} onClick={() => setSelected(allItems[selectedIndex - 1])}>Previous</button>
                  <button
                    className="btn btn-success text-white"
                    disabled={selectedIndex < 0 || selectedIndex >= allItems.length - 1}
                    onClick={() => {
                      const current = allItems.findIndex((item) => item.id === selected?.id && item.unit_type === selected?.unit_type);
                      if (allItems[current + 1]) setSelected(allItems[current + 1]);
                    }}
                  >
                    Next
                  </button>
                </div>
              </main>
              <div className="hidden lg:block">{outline}</div>
            </div>
            {drawer && <div className="fixed inset-0 z-50 bg-black/40 lg:hidden"><div className="ml-auto h-full w-[min(390px,92vw)] bg-white">{outline}</div></div>}
          </>
        )}
      </section>
    </RoleDashboardShell>
  );
}
