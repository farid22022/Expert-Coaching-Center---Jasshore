import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Circle, MessageSquare, Sparkles, StickyNote, Target } from "lucide-react";

import api, { getApiErrorMessage } from "../../services/api.js";
import { confirmAction, notifyError, notifySuccess } from "../../services/alerts.js";
import RichTextEditor from "../../components/common/RichTextEditor.jsx";
import SafeHtml from "../../components/common/SafeHtml.jsx";
import { interventionApi, teacherFeedbackApi, teacherPrivateNoteApi } from "../../services/resourceApi.js";
import { ErrorMessage, Loading, Shell } from "./TeacherModulePages.jsx";

const TABS = ["Overview", "Weak Topics", "Tests", "Assignments", "Timeline", "Teacher Notes", "Interventions", "Feedback"];

const LEVEL_META = {
  weak: { label: "Weak", className: "bg-red-50 text-red-700 border-red-200" },
  needs_practice: { label: "Needs Practice", className: "bg-amber-50 text-amber-800 border-amber-200" },
  strong: { label: "Strong", className: "bg-emerald-50 text-emerald-800 border-emerald-200" },
};

function useStudentProfile(studentId) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const reload = () => {
    api
      .get(`/assessments/analytics/students/${studentId}/profile/`)
      .then((response) => setData(response.data?.data || response.data))
      .catch((requestError) => setError(getApiErrorMessage(requestError, "Unable to load this student's profile.")))
      .finally(() => setLoading(false));
  };

  useEffect(() => { setLoading(true); reload(); }, [studentId]);
  return { data, error, loading, reload };
}

function TimelineIcon({ type }) {
  if (type === "test_missed") return <AlertTriangle size={16} className="text-red-600" />;
  if (type === "test_completed") return <CheckCircle2 size={16} className="text-emerald-600" />;
  return <Circle size={16} className="text-blue-600" />;
}

export default function TeacherStudentProfilePage() {
  const { studentId } = useParams();
  const { data, error, loading, reload } = useStudentProfile(studentId);
  const [tab, setTab] = useState("Overview");
  const [noteText, setNoteText] = useState("");
  const [feedbackBody, setFeedbackBody] = useState("");
  const [feedbackSubject, setFeedbackSubject] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [sendingFeedback, setSendingFeedback] = useState(false);
  const [interventionForm, setInterventionForm] = useState({ intervention_type: "extra_practice", reason: "", action_note: "", deadline: "", subject: "" });
  const [creatingIntervention, setCreatingIntervention] = useState(false);

  const subjectRollup = useMemo(() => {
    if (!data) return [];
    const bySubject = new Map();
    const track = (list, kind) => {
      list.forEach((item) => {
        const key = item.subject_id || "general";
        const entry = bySubject.get(key) || { subject_id: item.subject_id, tests: 0, assignments: 0 };
        entry[kind] += 1;
        bySubject.set(key, entry);
      });
    };
    track(data.tests || [], "tests");
    track(data.assignments || [], "assignments");
    return [...bySubject.values()];
  }, [data]);

  if (loading) return <Shell title="Student Profile"><Loading label="Loading student profile..." /></Shell>;
  if (error) return <Shell title="Student Profile"><ErrorMessage error={error} /></Shell>;
  if (!data) return null;

  const addNote = async () => {
    if (!noteText.trim()) return;
    setSavingNote(true);
    try {
      await teacherPrivateNoteApi.create({ student: data.student.id, note: noteText.trim() });
      setNoteText("");
      notifySuccess("Note saved.");
      reload();
    } catch (requestError) {
      notifyError(getApiErrorMessage(requestError, "Could not save the note."));
    } finally {
      setSavingNote(false);
    }
  };

  const sendFeedback = async () => {
    if (!feedbackBody || feedbackBody === "<p><br></p>") {
      notifyError("Write some feedback first.");
      return;
    }
    setSendingFeedback(true);
    try {
      await teacherFeedbackApi.create({ student: data.student.id, subject: feedbackSubject || null, body: feedbackBody });
      setFeedbackBody("");
      notifySuccess("Feedback sent to the student.");
      reload();
    } catch (requestError) {
      notifyError(getApiErrorMessage(requestError, "Could not send feedback."));
    } finally {
      setSendingFeedback(false);
    }
  };

  const createIntervention = async () => {
    if (!interventionForm.reason.trim()) {
      notifyError("Describe the reason for this intervention.");
      return;
    }
    const confirmed = await confirmAction({ title: "Create Intervention?", text: "The student will be notified immediately.", confirmText: "Yes, create" });
    if (!confirmed) return;
    setCreatingIntervention(true);
    try {
      await interventionApi.create({
        student: data.student.id,
        subject: interventionForm.subject || null,
        intervention_type: interventionForm.intervention_type,
        reason: interventionForm.reason.trim(),
        action_note: interventionForm.action_note.trim(),
        deadline: interventionForm.deadline || null,
      });
      setInterventionForm({ intervention_type: "extra_practice", reason: "", action_note: "", deadline: "", subject: "" });
      notifySuccess("Intervention created.");
      reload();
    } catch (requestError) {
      notifyError(getApiErrorMessage(requestError, "Could not create the intervention."));
    } finally {
      setCreatingIntervention(false);
    }
  };

  const updateInterventionStatus = async (intervention, statusValue) => {
    try {
      await interventionApi.update(intervention.id, { status: statusValue });
      notifySuccess("Intervention updated.");
      reload();
    } catch (requestError) {
      notifyError(getApiErrorMessage(requestError, "Could not update the intervention."));
    }
  };

  return (
    <Shell title="Student Profile">
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
        {data.student.photo ? (
          <img src={data.student.photo} alt={data.student.full_name} className="h-16 w-16 rounded-full object-cover" />
        ) : (
          <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-700 text-2xl font-black text-white">{data.student.full_name.charAt(0).toUpperCase()}</div>
        )}
        <div>
          <h1 className="text-xl font-black text-slate-950">{data.student.full_name}</h1>
          <p className="text-sm font-bold text-slate-500">Student ID: {data.student.student_id} · {data.enrollments.map((enrollment) => enrollment.course_title).join(", ")}</p>
          <span className="badge badge-success badge-outline mt-1">{data.student.status}</span>
        </div>
        {data.summary && (
          <div className="ml-auto flex flex-wrap gap-4 text-sm">
            <div><p className="font-bold text-slate-500">Progress</p><p className="font-black text-slate-950">{data.summary.progress}%</p></div>
            <div><p className="font-bold text-slate-500">MCQ Avg</p><p className="font-black text-slate-950">{data.summary.mcq_average ?? "-"}%</p></div>
            <div><p className="font-bold text-slate-500">Assignments</p><p className="font-black text-slate-950">{data.summary.assignment_average ?? "-"}%</p></div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1 rounded-xl border border-emerald-100 bg-white p-2 shadow-sm">
        {TABS.map((item) => (
          <button key={item} type="button" onClick={() => setTab(item)} className={`rounded-lg px-3 py-2 text-sm font-black ${tab === item ? "bg-emerald-700 text-white" : "text-slate-600 hover:bg-emerald-50"}`}>
            {item}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="grid gap-4 md:grid-cols-2">
          {data.summary?.reasons?.length > 0 && (
            <div className="md:col-span-2 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="flex items-center gap-2 font-black text-amber-800"><AlertTriangle size={16} /> Needs Attention</p>
              <ul className="mt-2 space-y-1 text-sm font-bold text-amber-800">{data.summary.reasons.map((reason) => <li key={reason}>• {reason}</li>)}</ul>
            </div>
          )}
          <div className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
            <h2 className="font-black text-slate-950">Per-Subject Activity</h2>
            <div className="mt-3 space-y-2">
              {subjectRollup.map((row) => (
                <div key={row.subject_id || "general"} className="flex items-center justify-between rounded bg-emerald-50 px-3 py-2 text-sm font-bold text-slate-700">
                  <span>Subject #{row.subject_id || "General"}</span>
                  <span>{row.tests} tests · {row.assignments} assignments</span>
                </div>
              ))}
              {!subjectRollup.length && <p className="text-sm font-semibold text-slate-500">No activity recorded yet.</p>}
            </div>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
            <h2 className="font-black text-slate-950">Tests Completed</h2>
            <p className="mt-2 text-3xl font-black text-emerald-800">{data.summary?.tests_completed ?? 0}/{data.summary?.tests_total ?? 0}</p>
            <h2 className="mt-4 font-black text-slate-950">Missing Assignments</h2>
            <p className="mt-2 text-3xl font-black text-amber-700">{data.summary?.missing_assignments ?? 0}</p>
          </div>
        </div>
      )}

      {tab === "Weak Topics" && (
        <div className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
          <p className="flex items-center gap-2 font-black text-slate-950"><Target size={17} className="text-emerald-700" /> Topic Accuracy (from actual MCQ answers)</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {data.weak_topics.map((topic) => {
              const meta = LEVEL_META[topic.level];
              return (
                <div key={topic.topic} className={`rounded-lg border p-4 ${meta.className}`}>
                  <p className="font-black">{topic.topic}</p>
                  <p className="text-sm font-bold">Accuracy: {topic.accuracy}% · {topic.question_count} questions</p>
                  <span className="badge mt-2 border-none bg-white/70 font-black">{meta.label}</span>
                </div>
              );
            })}
            {!data.weak_topics.length && <p className="text-sm font-semibold text-slate-500 sm:col-span-2">Not enough MCQ answer data yet to compute topic accuracy.</p>}
          </div>
        </div>
      )}

      {tab === "Tests" && (
        <div className="grid gap-2">
          {data.tests.map((test) => (
            <div key={test.id} className="flex items-center justify-between rounded-lg border border-emerald-100 bg-white p-4 shadow-sm">
              <div><p className="font-black text-slate-950">{test.assessment}</p><p className="text-xs font-bold text-slate-500">{test.submitted_at ? new Date(test.submitted_at).toLocaleString() : "Not submitted"}</p></div>
              <p className="font-black text-emerald-800">{test.score}/{test.total_marks}</p>
            </div>
          ))}
          {!data.tests.length && <p className="rounded-xl border border-dashed border-emerald-200 bg-white p-8 text-center font-semibold text-slate-500">No tests completed yet.</p>}
        </div>
      )}

      {tab === "Assignments" && (
        <div className="grid gap-2">
          {data.assignments.map((row) => (
            <div key={row.id} className="flex items-center justify-between rounded-lg border border-emerald-100 bg-white p-4 shadow-sm">
              <div><p className="font-black text-slate-950">{row.assessment}</p><p className="text-xs font-bold text-slate-500">{row.status} · {row.submitted_at ? new Date(row.submitted_at).toLocaleString() : "Not submitted"}</p></div>
              <p className="font-black text-emerald-800">{row.marks_obtained ?? "-"}/{row.total_marks}</p>
            </div>
          ))}
          {!data.assignments.length && <p className="rounded-xl border border-dashed border-emerald-200 bg-white p-8 text-center font-semibold text-slate-500">No assignment submissions yet.</p>}
        </div>
      )}

      {tab === "Timeline" && (
        <div className="grid gap-2">
          {data.timeline.map((event, index) => (
            <div key={index} className="flex items-center gap-3 rounded-lg border border-emerald-100 bg-white p-3 shadow-sm">
              <TimelineIcon type={event.type} />
              <div><p className="text-sm font-bold text-slate-800">{event.title}</p><p className="text-xs font-semibold text-slate-500">{new Date(event.at).toLocaleString()}</p></div>
            </div>
          ))}
          {!data.timeline.length && <p className="rounded-xl border border-dashed border-emerald-200 bg-white p-8 text-center font-semibold text-slate-500">No learning activity recorded yet.</p>}
        </div>
      )}

      {tab === "Teacher Notes" && (
        <div className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
          <p className="flex items-center gap-2 font-black text-slate-950"><StickyNote size={17} /> Private Teacher Notes <span className="badge badge-outline">Teacher only</span></p>
          <div className="mt-3 flex gap-2">
            <textarea className="textarea textarea-bordered flex-1" rows={2} value={noteText} onChange={(event) => setNoteText(event.target.value)} placeholder="e.g. Struggling with vectors. Assigned additional practice." />
            <button type="button" className="btn btn-success text-white" disabled={savingNote} onClick={addNote}>{savingNote ? "Saving..." : "Add Note"}</button>
          </div>
          <div className="mt-4 space-y-2">
            {data.teacher_notes.map((note) => (
              <div key={note.id} className="rounded bg-slate-50 p-3">
                <p className="text-xs font-bold text-slate-500">{new Date(note.created_at).toLocaleString()} · {note.teacher_name}</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">{note.note}</p>
              </div>
            ))}
            {!data.teacher_notes.length && <p className="text-sm font-semibold text-slate-500">No private notes yet.</p>}
          </div>
        </div>
      )}

      {tab === "Interventions" && (
        <div className="grid gap-4">
          <div className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
            <p className="flex items-center gap-2 font-black text-slate-950"><Sparkles size={17} /> Create Intervention</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <select className="select select-bordered" value={interventionForm.intervention_type} onChange={(event) => setInterventionForm((current) => ({ ...current, intervention_type: event.target.value }))}>
                <option value="extra_practice">Extra Practice</option>
                <option value="revision">Revision Required</option>
                <option value="meeting">Teacher Meeting</option>
                <option value="guardian_contact">Guardian Contact</option>
                <option value="retest">Retest</option>
                <option value="assignment_recovery">Assignment Recovery</option>
                <option value="study_plan">Study Plan</option>
              </select>
              <input type="date" className="input input-bordered" value={interventionForm.deadline} onChange={(event) => setInterventionForm((current) => ({ ...current, deadline: event.target.value }))} />
              <textarea className="textarea textarea-bordered sm:col-span-2" rows={2} placeholder="Reason (e.g. Weak performance in Newton's Laws)" value={interventionForm.reason} onChange={(event) => setInterventionForm((current) => ({ ...current, reason: event.target.value }))} />
              <textarea className="textarea textarea-bordered sm:col-span-2" rows={2} placeholder="Action / teacher note (e.g. Revise Chapter 03 before attempting.)" value={interventionForm.action_note} onChange={(event) => setInterventionForm((current) => ({ ...current, action_note: event.target.value }))} />
            </div>
            <button type="button" className="btn btn-success mt-3 text-white" disabled={creatingIntervention} onClick={createIntervention}>{creatingIntervention ? "Creating..." : "Create Intervention"}</button>
          </div>
          <div className="grid gap-2">
            {data.interventions.map((item) => (
              <div key={item.id} className="rounded-lg border border-emerald-100 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-black text-slate-950">{item.intervention_type.replaceAll("_", " ")}</p>
                  <select className="select select-bordered select-sm" value={item.status} onChange={(event) => updateInterventionStatus(item, event.target.value)}>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="partially_completed">Partially Completed</option>
                    <option value="not_completed">Not Completed</option>
                  </select>
                </div>
                <p className="mt-1 text-sm font-semibold text-slate-700">{item.reason}</p>
                {item.action_note && <p className="mt-1 text-sm text-slate-500">Action: {item.action_note}</p>}
                {item.deadline && <p className="mt-1 text-xs font-bold text-slate-400">Deadline: {item.deadline}</p>}
              </div>
            ))}
            {!data.interventions.length && <p className="rounded-xl border border-dashed border-emerald-200 bg-white p-8 text-center font-semibold text-slate-500">No interventions yet.</p>}
          </div>
        </div>
      )}

      {tab === "Feedback" && (
        <div className="grid gap-4">
          <div className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
            <p className="flex items-center gap-2 font-black text-slate-950"><MessageSquare size={17} /> Send Feedback</p>
            <RichTextEditor value={feedbackBody} onChange={setFeedbackBody} className="mt-3" placeholder="Your Physics performance has improved significantly, but revise Newton's Laws before the next model test." />
            <button type="button" className="btn btn-success mt-3 text-white" disabled={sendingFeedback} onClick={sendFeedback}>{sendingFeedback ? "Sending..." : "Send Feedback"}</button>
          </div>
          <div className="grid gap-2">
            {data.feedback.map((item) => (
              <div key={item.id} className="rounded-lg border border-emerald-100 bg-white p-4 shadow-sm">
                <p className="text-xs font-bold text-slate-500">{new Date(item.created_at).toLocaleString()} · {item.teacher_name}</p>
                <SafeHtml html={item.body} className="mt-1 text-sm font-semibold text-slate-700" />
              </div>
            ))}
            {!data.feedback.length && <p className="rounded-xl border border-dashed border-emerald-200 bg-white p-8 text-center font-semibold text-slate-500">No feedback sent yet.</p>}
          </div>
        </div>
      )}
    </Shell>
  );
}
