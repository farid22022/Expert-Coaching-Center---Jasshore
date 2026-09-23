import { useState } from "react";

import { getApiErrorMessage } from "../../services/api.js";
import { assessmentApi, assessmentQuestionApi, materialApi, questionApi, questionOptionApi } from "../../services/resourceApi.js";

const blankOptions = () => [
  { text: "", correct: true },
  { text: "", correct: false },
  { text: "", correct: false },
  { text: "", correct: false },
];

const blankQuestion = () => ({ text: "", marks: 1, question_type: "single", options: blankOptions() });

function FieldScope({ form, update, data }) {
  return <div className="grid gap-3 md:grid-cols-4">
    <select required className="select select-bordered" value={form.course || ""} onChange={(event) => update("course", event.target.value)}><option value="">Select course</option>{data.assigned_courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select>
    <select className="select select-bordered" value={form.course_section || ""} onChange={(event) => update("course_section", event.target.value)}><option value="">All sections</option>{data.assigned_sections.map((section) => <option key={section.id} value={section.id}>{section.name}</option>)}</select>
    <select className="select select-bordered" value={form.subject || ""} onChange={(event) => update("subject", event.target.value)}><option value="">All subjects</option>{data.assigned_subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select>
    <input className="input input-bordered" placeholder="Chapter, e.g. Chapter 1" value={form.chapter || ""} onChange={(event) => update("chapter", event.target.value)} />
  </div>;
}

function Dialog({ title, error, saving, onClose, children, submitLabel = "Save" }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4"><div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-lg bg-white p-5 shadow-2xl"><div className="mb-5 flex items-center justify-between gap-4"><h2 className="text-xl font-black text-slate-950">{title}</h2><button type="button" className="btn btn-sm" onClick={onClose}>Close</button></div>{error && <p className="mb-4 rounded bg-red-50 p-3 font-bold text-red-700">{error}</p>}{children}<div className="mt-5 flex justify-end gap-2"><button type="button" className="btn" onClick={onClose}>Cancel</button><button disabled={saving} form="teacher-builder" className="btn btn-success text-white">{saving ? "Saving..." : submitLabel}</button></div></div></div>;
}

function QuestionFields({ question, index, updateQuestion, removeQuestion, canRemove }) {
  const updateOption = (optionIndex, key, value) => updateQuestion(index, { ...question, options: question.options.map((option, current) => current === optionIndex ? { ...option, [key]: value } : option) });
  const toggleCorrect = (optionIndex) => updateQuestion(index, { ...question, options: question.options.map((option, current) => ({ ...option, correct: question.question_type === "single" ? current === optionIndex : current === optionIndex ? !option.correct : option.correct })) });
  return <article className="rounded-md border border-emerald-100 bg-emerald-50/40 p-4"><div className="mb-3 flex items-center justify-between"><h3 className="font-black">Question {index + 1}</h3>{canRemove && <button type="button" className="btn btn-error btn-xs text-white" onClick={() => removeQuestion(index)}>Remove</button>}</div><div className="grid gap-3 md:grid-cols-[1fr_150px_180px]"><textarea required className="textarea textarea-bordered" placeholder="Question text" value={question.text} onChange={(event) => updateQuestion(index, { ...question, text: event.target.value })} /><input required min="0.25" step="0.25" type="number" className="input input-bordered" placeholder="Marks" value={question.marks} onChange={(event) => updateQuestion(index, { ...question, marks: event.target.value })} /><select className="select select-bordered" value={question.question_type} onChange={(event) => updateQuestion(index, { ...question, question_type: event.target.value, options: event.target.value === "single" ? question.options.map((option, current) => ({ ...option, correct: current === 0 })) : question.options })}><option value="single">Single answer</option><option value="multiple">Multiple answers</option></select></div><div className="mt-3 grid gap-2 md:grid-cols-2">{question.options.map((option, optionIndex) => <label key={optionIndex} className="flex items-center gap-2"><input type={question.question_type === "single" ? "radio" : "checkbox"} name={`correct-${index}`} checked={option.correct} onChange={() => toggleCorrect(optionIndex)} className={question.question_type === "single" ? "radio radio-success" : "checkbox checkbox-success"} /><input required className="input input-bordered w-full" placeholder={`Option ${optionIndex + 1}`} value={option.text} onChange={(event) => updateOption(optionIndex, "text", event.target.value)} /></label>)}</div><button type="button" className="btn btn-outline btn-sm mt-3" onClick={() => updateQuestion(index, { ...question, options: [...question.options, { text: "", correct: false }] })}>+ Add option</button></article>;
}

export function AssessmentBuilder({ data, assessment, onClose, onSaved }) {
  const [form, setForm] = useState({ title: assessment?.title || "", assessment_type: assessment?.assessment_type || "mcq", course: assessment?.course || data.assigned_courses[0]?.id || "", course_section: assessment?.course_section || data.assigned_sections[0]?.id || "", subject: assessment?.subject || data.assigned_subjects[0]?.id || "", chapter: assessment?.chapter || "", duration_minutes: assessment?.duration_minutes || 30, starts_at: assessment?.starts_at ? assessment.starts_at.slice(0, 16) : "", ends_at: assessment?.ends_at ? assessment.ends_at.slice(0, 16) : "", status: assessment?.status || "published" });
  const [questions, setQuestions] = useState([blankQuestion()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const updateQuestion = (index, value) => setQuestions((current) => current.map((question, currentIndex) => currentIndex === index ? value : question));

  async function submit(event) {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const payload = { ...form, course_section: form.course_section || null, subject: form.subject || null, duration_minutes: Number(form.duration_minutes), starts_at: form.starts_at || null, ends_at: form.ends_at || null };
      const saved = assessment ? await assessmentApi.update(assessment.id, payload) : await assessmentApi.create(payload);
      if (!assessment && form.assessment_type !== "assignment") {
        for (let index = 0; index < questions.length; index += 1) {
          const row = questions[index];
          if (!row.text.trim()) continue;
          const question = await questionApi.create({ course: form.course, course_section: form.course_section || null, subject: form.subject || null, chapter: form.chapter, text: row.text, question_type: row.question_type, marks: Number(row.marks), status: "active" });
          await Promise.all(row.options.filter((option) => option.text.trim()).map((option, order) => questionOptionApi.create({ question: question.id, text: option.text, is_correct: option.correct, order })));
          await assessmentQuestionApi.create({ assessment: saved.id, question: question.id, order: index + 1, marks: Number(row.marks) });
        }
      }
      await onSaved(); onClose();
    } catch (requestError) { setError(getApiErrorMessage(requestError, "Could not save the assessment.")); } finally { setSaving(false); }
  }

  return <Dialog title={assessment ? "Edit Assessment" : "Build MCQ / Online Test"} error={error} saving={saving} onClose={onClose} submitLabel={assessment ? "Update assessment" : "Create assessment"}><form id="teacher-builder" onSubmit={submit} className="space-y-4"><input required className="input input-bordered w-full" placeholder="Test title, e.g. Physics Chapter 1 MCQ" value={form.title} onChange={(event) => update("title", event.target.value)} /><FieldScope form={form} update={update} data={data} /><div className="grid gap-3 md:grid-cols-4"><select className="select select-bordered" value={form.assessment_type} onChange={(event) => update("assessment_type", event.target.value)}><option value="mcq">MCQ Test</option><option value="exam">Online Test</option><option value="assignment">Assignment</option></select><input type="number" min="1" className="input input-bordered" value={form.duration_minutes} onChange={(event) => update("duration_minutes", event.target.value)} placeholder="Duration (minutes)" /><input type="datetime-local" className="input input-bordered" value={form.starts_at} onChange={(event) => update("starts_at", event.target.value)} /><input type="datetime-local" className="input input-bordered" value={form.ends_at} onChange={(event) => update("ends_at", event.target.value)} /></div>{!assessment && form.assessment_type !== "assignment" && <section className="space-y-3"><div className="flex items-center justify-between"><h3 className="text-lg font-black">Questions</h3><button type="button" className="btn btn-outline btn-sm" onClick={() => setQuestions((current) => [...current, blankQuestion()])}>+ Add question</button></div>{questions.map((question, index) => <QuestionFields key={index} question={question} index={index} updateQuestion={updateQuestion} removeQuestion={(target) => setQuestions((current) => current.filter((_, currentIndex) => currentIndex !== target))} canRemove={questions.length > 1} />)}</section>}</form></Dialog>;
}

export function QuestionEditor({ data, question, onClose, onSaved }) {
  const [form, setForm] = useState({ course: question?.course || data.assigned_courses[0]?.id || "", course_section: question?.course_section || data.assigned_sections[0]?.id || "", subject: question?.subject || data.assigned_subjects[0]?.id || "", chapter: question?.chapter || "", text: question?.text || "", marks: question?.marks || 1, question_type: question?.question_type || "single", options: question?.options?.map((option) => ({ text: option.text, correct: option.is_correct })) || blankOptions() });
  const [saving, setSaving] = useState(false); const [error, setError] = useState("");
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  async function submit(event) { event.preventDefault(); setSaving(true); setError(""); try { const payload = { ...form, course_section: form.course_section || null, subject: form.subject || null, marks: Number(form.marks), status: "active" }; const saved = question ? await questionApi.update(question.id, payload) : await questionApi.create(payload); if (question) { const existing = await questionOptionApi.listResults({ question: question.id }); await Promise.all(existing.map((option) => questionOptionApi.remove(option.id))); } await Promise.all(form.options.filter((option) => option.text.trim()).map((option, order) => questionOptionApi.create({ question: saved.id, text: option.text, is_correct: option.correct, order }))); await onSaved(); onClose(); } catch (requestError) { setError(getApiErrorMessage(requestError, "Could not save the question.")); } finally { setSaving(false); } }
  return <Dialog title={question ? "Edit Question" : "Create Question"} error={error} saving={saving} onClose={onClose} submitLabel={question ? "Update question" : "Create question"}><form id="teacher-builder" onSubmit={submit} className="space-y-4"><FieldScope form={form} update={update} data={data} /><QuestionFields question={form} index={0} updateQuestion={(_, value) => setForm(value)} removeQuestion={() => {}} canRemove={false} /></form></Dialog>;
}

export function MaterialEditor({ data, material, onClose, onSaved }) {
  const [form, setForm] = useState({ title: material?.title || "", description: material?.description || "", material_type: material?.material_type || "note", url: material?.url || "", course: material?.course || data.assigned_courses[0]?.id || "", course_section: material?.course_section || data.assigned_sections[0]?.id || "", subject: material?.subject || data.assigned_subjects[0]?.id || "", chapter: material?.chapter || "", is_published: material?.is_published ?? true });
  const [saving, setSaving] = useState(false); const [error, setError] = useState(""); const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  async function submit(event) { event.preventDefault(); setSaving(true); setError(""); try { const payload = { ...form, course_section: form.course_section || null, subject: form.subject || null }; if (material) await materialApi.update(material.id, payload); else await materialApi.create(payload); await onSaved(); onClose(); } catch (requestError) { setError(getApiErrorMessage(requestError, "Could not save the study material.")); } finally { setSaving(false); } }
  return <Dialog title={material ? "Edit Study Material" : "Create Study Material"} error={error} saving={saving} onClose={onClose} submitLabel={material ? "Update material" : "Publish material"}><form id="teacher-builder" onSubmit={submit} className="space-y-4"><input required className="input input-bordered w-full" placeholder="Material title" value={form.title} onChange={(event) => update("title", event.target.value)} /><FieldScope form={form} update={update} data={data} /><textarea className="textarea textarea-bordered w-full" placeholder="Notes or description" value={form.description} onChange={(event) => update("description", event.target.value)} /><div className="grid gap-3 md:grid-cols-2"><select className="select select-bordered" value={form.material_type} onChange={(event) => update("material_type", event.target.value)}><option value="note">Study note</option><option value="link">Web link</option><option value="video">Video</option><option value="file">File URL</option></select><input className="input input-bordered" placeholder="Link, video, or file URL" value={form.url} onChange={(event) => update("url", event.target.value)} /></div><label className="label cursor-pointer justify-start gap-3"><input type="checkbox" className="checkbox checkbox-success" checked={form.is_published} onChange={(event) => update("is_published", event.target.checked)} /><span className="label-text font-bold">Publish for enrolled students</span></label></form></Dialog>;
}
