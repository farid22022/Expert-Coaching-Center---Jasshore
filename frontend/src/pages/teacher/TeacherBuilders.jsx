import { useEffect, useState } from "react";

import { getApiErrorMessage } from "../../services/api.js";
import { assessmentApi, assessmentQuestionApi, materialApi, questionApi, questionOptionApi } from "../../services/resourceApi.js";

const blankOptions = () => [
  { text: "", correct: true, image: null },
  { text: "", correct: false, image: null },
  { text: "", correct: false, image: null },
  { text: "", correct: false, image: null },
];

const blankQuestion = () => ({ text: "", image: null, marks: 1, negative_marks: 0, question_type: "single", difficulty: "medium", topic: "", tags: "", explanation: "", options: blankOptions() });

function uploadPayload(values) {
  const payload = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "" || value instanceof File || key === "options" || key === "id") return;
    payload.append(key, Array.isArray(value) ? JSON.stringify(value) : String(value));
  });
  return payload;
}

function ImageInput({ label, value, onChange, onPreview }) {
  const [preview, setPreview] = useState("");
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    if (!value) { setPreview(""); return undefined; }
    if (typeof value === "string") { setPreview(value); return undefined; }
    const url = URL.createObjectURL(value);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);
  return <><div className="flex min-w-0 items-center gap-2"><label className="min-w-0 flex-1"><span className="mb-1 block text-xs font-bold text-slate-600">{label}</span><input type="file" accept="image/*" className="file-input file-input-bordered file-input-xs w-full" onChange={(event) => onChange(event.target.files?.[0] || null)} /></label>{preview && <button type="button" onClick={() => { setExpanded(true); onPreview?.(preview); }} className="mt-5 h-12 w-12 shrink-0 overflow-hidden rounded border border-emerald-200 bg-white" title={`Preview ${label.toLowerCase()}`}><img src={preview} alt={label} className="h-full w-full object-cover" /></button>}</div><ImageModal image={expanded ? preview : ""} onClose={() => setExpanded(false)} /></>;
}

function ImageModal({ image, onClose }) {
  if (!image) return null;
  return <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/75 p-4" role="dialog" aria-modal="true" aria-label="Image preview" onClick={onClose}><div className="relative max-h-full max-w-4xl" onClick={(event) => event.stopPropagation()}><button type="button" className="btn btn-sm absolute right-2 top-2 z-10" onClick={onClose}>Close</button><img src={image} alt="Expanded preview" className="max-h-[88vh] max-w-full rounded-lg bg-white object-contain shadow-2xl" /></div></div>;
}

function sectionCourseId(section, assignments = []) {
  return section.course || assignments.find((assignment) => String(assignment.course_section || "") === String(section.id))?.course || "";
}

function subjectSectionId(subject) {
  return subject.course_section || subject.section || "";
}

function scopeDefaults(data, current = {}) {
  const course = current.course || data.assigned_courses[0]?.id || "";
  const sections = data.assigned_sections.filter((section) => !course || String(sectionCourseId(section, data.assignments)) === String(course));
  const courseSection = current.course_section || sections[0]?.id || "";
  const subjects = data.assigned_subjects.filter((subject) => {
    const sectionId = subjectSectionId(subject);
    return sections.some((section) => String(section.id) === String(sectionId)) && (!courseSection || String(sectionId) === String(courseSection));
  });
  return { course, course_section: courseSection, subject: current.subject || subjects[0]?.id || "" };
}

function FieldScope({ form, update, data }) {
  const sections = data.assigned_sections.filter((section) => !form.course || String(sectionCourseId(section, data.assignments)) === String(form.course));
  const subjects = data.assigned_subjects.filter((subject) => {
    const sectionId = subjectSectionId(subject);
    return sections.some((section) => String(section.id) === String(sectionId)) && (!form.course_section || String(sectionId) === String(form.course_section));
  });
  return <div className="grid gap-3 md:grid-cols-4">
    <select required className="select select-bordered" value={form.course || ""} onChange={(event) => { const nextCourse = event.target.value; const nextSections = data.assigned_sections.filter((section) => !nextCourse || String(sectionCourseId(section, data.assignments)) === String(nextCourse)); update("course", nextCourse); update("course_section", nextSections[0]?.id || ""); update("subject", ""); }}><option value="">Select course</option>{data.assigned_courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select>
    <select className="select select-bordered" value={form.course_section || ""} onChange={(event) => { update("course_section", event.target.value); update("subject", ""); }}><option value="">All sections</option>{sections.map((section) => <option key={section.id} value={section.id}>{section.name}</option>)}</select>
    <select className="select select-bordered" value={form.subject || ""} onChange={(event) => update("subject", event.target.value)}><option value="">All subjects</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select>
    <input className="input input-bordered" placeholder="Chapter, e.g. Chapter 1" value={form.chapter || ""} onChange={(event) => update("chapter", event.target.value)} />
  </div>;
}

function Dialog({ title, error, saving, onClose, children, submitLabel = "Save" }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-2 sm:p-4"><div className="max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-lg bg-white p-3 shadow-2xl sm:p-5"><div className="mb-5 flex items-start justify-between gap-3"><h2 className="min-w-0 text-lg font-black text-slate-950 sm:text-xl">{title}</h2><button type="button" className="btn btn-sm shrink-0" onClick={onClose}>Close</button></div>{error && <p className="mb-4 rounded bg-red-50 p-3 font-bold text-red-700">{error}</p>}{children}<div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" className="btn w-full sm:w-auto" onClick={onClose}>Cancel</button><button disabled={saving} form="teacher-builder" className="btn btn-success w-full text-white sm:w-auto">{saving ? "Saving..." : submitLabel}</button></div></div></div>;
}

function QuestionFields({ question, index, updateQuestion, removeQuestion, canRemove, onPreview }) {
  const updateOption = (optionIndex, key, value) => updateQuestion(index, { ...question, options: question.options.map((option, current) => current === optionIndex ? { ...option, [key]: value } : option) });
  const toggleCorrect = (optionIndex) => updateQuestion(index, { ...question, options: question.options.map((option, current) => ({ ...option, correct: question.question_type === "single" ? current === optionIndex : current === optionIndex ? !option.correct : option.correct })) });
  return <article className="rounded-md border border-emerald-100 bg-emerald-50/40 p-4">
    <div className="mb-3 flex items-center justify-between gap-3"><h3 className="font-black">Question {index + 1}</h3>{canRemove && <button type="button" className="btn btn-error btn-xs text-white" onClick={() => removeQuestion(index)}>Remove</button>}</div>
    <div className="grid gap-3 md:grid-cols-[1fr_120px_120px_160px]"><textarea required className="textarea textarea-bordered" placeholder="Question text" value={question.text} onChange={(event) => updateQuestion(index, { ...question, text: event.target.value })} /><input required min="0.25" step="0.25" type="number" className="input input-bordered" placeholder="Marks" value={question.marks} onChange={(event) => updateQuestion(index, { ...question, marks: event.target.value })} /><input min="0" step="0.25" type="number" className="input input-bordered" placeholder="Negative marks" value={question.negative_marks ?? 0} onChange={(event) => updateQuestion(index, { ...question, negative_marks: event.target.value })} /><select className="select select-bordered" value={question.question_type} onChange={(event) => updateQuestion(index, { ...question, question_type: event.target.value, options: event.target.value === "single" ? question.options.map((option, current) => ({ ...option, correct: current === 0 })) : question.options })}><option value="single">Single answer</option><option value="multiple">Multiple answers</option></select></div>
    <div className="mt-3 grid gap-3 md:grid-cols-3"><select className="select select-bordered" value={question.difficulty || "medium"} onChange={(event) => updateQuestion(index, { ...question, difficulty: event.target.value })}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select><input className="input input-bordered" placeholder="Topic" value={question.topic || ""} onChange={(event) => updateQuestion(index, { ...question, topic: event.target.value })} /><input className="input input-bordered" placeholder="Tags, comma separated" value={question.tags || ""} onChange={(event) => updateQuestion(index, { ...question, tags: event.target.value })} /></div>
    <div className="mt-3 max-w-md"><ImageInput label="Question image (optional)" value={question.image} onChange={(image) => updateQuestion(index, { ...question, image })} onPreview={onPreview} /></div>
    <textarea className="textarea textarea-bordered mt-3 w-full" placeholder="Explanation (optional)" value={question.explanation || ""} onChange={(event) => updateQuestion(index, { ...question, explanation: event.target.value })} />
    <div className="mt-3 grid gap-3 md:grid-cols-2">{question.options.map((option, optionIndex) => <div key={option.id || optionIndex} className="rounded border border-emerald-100 bg-white p-2"><div className="flex items-center gap-2"><input type={question.question_type === "single" ? "radio" : "checkbox"} name={`correct-${index}`} checked={option.correct} onChange={() => toggleCorrect(optionIndex)} className={question.question_type === "single" ? "radio radio-success" : "checkbox checkbox-success"} /><input required className="input input-bordered w-full" placeholder={`Option ${optionIndex + 1}`} value={option.text} onChange={(event) => updateOption(optionIndex, "text", event.target.value)} /></div><div className="mt-2"><ImageInput label={`Option ${optionIndex + 1} image (optional)`} value={option.image} onChange={(image) => updateOption(optionIndex, "image", image)} onPreview={onPreview} /></div></div>)}</div>
    <button type="button" className="btn btn-outline btn-sm mt-3" onClick={() => updateQuestion(index, { ...question, options: [...question.options, { text: "", correct: false, image: null }] })}>+ Add option</button>
  </article>;
}

export function AssessmentBuilder({ data, assessment, onClose, onSaved }) {
  const [form, setForm] = useState({ title: assessment?.title || "", description: assessment?.description || "", instructions: assessment?.instructions || "", assessment_type: assessment?.assessment_type || "mcq", timing_mode: assessment?.timing_mode || "practice", course: assessment?.course || data.assigned_courses[0]?.id || "", course_section: assessment?.course_section || data.assigned_sections[0]?.id || "", subject: assessment?.subject || data.assigned_subjects[0]?.id || "", chapter: assessment?.chapter || "", topic: assessment?.topic || "", duration_minutes: assessment?.duration_minutes || 30, starts_at: assessment?.starts_at ? assessment.starts_at.slice(0, 16) : "", ends_at: assessment?.ends_at ? assessment.ends_at.slice(0, 16) : "", publish_at: assessment?.publish_at ? assessment.publish_at.slice(0, 16) : "", attempts_allowed: assessment?.attempts_allowed ?? 1, shuffle_questions: assessment?.shuffle_questions || false, shuffle_options: assessment?.shuffle_options || false, show_result_immediately: assessment?.show_result_immediately || false, show_correct_answers: assessment?.show_correct_answers || false, show_explanations: assessment?.show_explanations || false, allow_review_before_submit: assessment?.allow_review_before_submit ?? true, passing_percentage: assessment?.passing_percentage || 40, status: assessment?.status || "published" });
  const [questions, setQuestions] = useState([blankQuestion()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const updateQuestion = (index, value) => setQuestions((current) => current.map((question, currentIndex) => currentIndex === index ? value : question));
  useEffect(() => {
    if (assessment || form.course || !data.assigned_courses.length) return;
    setForm((current) => ({ ...current, ...scopeDefaults(data, current) }));
  }, [assessment, data, form.course]);

  async function submit(event) {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const payload = { ...form, course_section: form.course_section || null, subject: form.subject || null, duration_minutes: Number(form.duration_minutes), attempts_allowed: Number(form.attempts_allowed), passing_percentage: Number(form.passing_percentage), starts_at: form.starts_at || null, ends_at: form.ends_at || null, publish_at: form.publish_at || null };
      const saved = assessment ? await assessmentApi.update(assessment.id, payload) : await assessmentApi.create(payload);
      if (!assessment && form.assessment_type !== "assignment") {
        for (let index = 0; index < questions.length; index += 1) {
          const row = questions[index];
          if (!row.text.trim()) continue;
          const questionPayload = uploadPayload({ course: form.course, course_section: form.course_section || null, subject: form.subject || null, chapter: form.chapter, topic: row.topic, text: row.text, question_type: row.question_type, marks: Number(row.marks), negative_marks: Number(row.negative_marks || 0), difficulty: row.difficulty, tags: row.tags.split(",").map((tag) => tag.trim()).filter(Boolean), explanation: row.explanation, status: "active" });
          if (row.image instanceof File) questionPayload.append("image", row.image);
          const question = await questionApi.create(questionPayload);
          await Promise.all(row.options.filter((option) => option.text.trim()).map((option, order) => {
            const optionPayload = uploadPayload({ question: question.id, text: option.text, is_correct: option.correct, order });
            if (option.image instanceof File) optionPayload.append("image", option.image);
            return questionOptionApi.create(optionPayload);
          }));
          await assessmentQuestionApi.create({ assessment: saved.id, question: question.id, order: index + 1, marks: Number(row.marks) });
        }
      }
      await onSaved(); onClose();
    } catch (requestError) { setError(getApiErrorMessage(requestError, "Could not save the assessment.")); } finally { setSaving(false); }
  }

  const totalMarks = questions.reduce((total, question) => total + Number(question.marks || 0), 0);
  return <Dialog title={assessment ? "Edit Assessment" : "Build MCQ / Online Test"} error={error} saving={saving} onClose={onClose} submitLabel={assessment ? "Update assessment" : "Create assessment"}><form id="teacher-builder" onSubmit={submit} className="space-y-4"><input required className="input input-bordered w-full" placeholder="Test title, e.g. Physics Chapter 1 MCQ" value={form.title} onChange={(event) => update("title", event.target.value)} /><textarea className="textarea textarea-bordered w-full" placeholder="Description" value={form.description} onChange={(event) => update("description", event.target.value)} /><textarea className="textarea textarea-bordered w-full" placeholder="Instructions for students" value={form.instructions} onChange={(event) => update("instructions", event.target.value)} /><FieldScope form={form} update={update} data={data} /><input className="input input-bordered w-full" placeholder="Topic" value={form.topic} onChange={(event) => update("topic", event.target.value)} /><div className="grid gap-3 md:grid-cols-4"><select className="select select-bordered" value={form.assessment_type} onChange={(event) => update("assessment_type", event.target.value)}><option value="mcq">MCQ Test</option><option value="exam">Online Test</option><option value="assignment">File/PDF Submission Test</option></select><select className="select select-bordered" value={form.timing_mode} onChange={(event) => update("timing_mode", event.target.value)}><option value="practice">Practice / Anytime</option><option value="live">Fixed-time Live</option><option value="scheduled">Scheduled</option><option value="individual">Individual Timed</option></select><input type="number" min="1" className="input input-bordered" value={form.duration_minutes} onChange={(event) => update("duration_minutes", event.target.value)} placeholder="Duration (minutes)" /><input type="number" min="0" className="input input-bordered" value={form.attempts_allowed} onChange={(event) => update("attempts_allowed", event.target.value)} placeholder="Attempts (0 unlimited)" /></div><div className="grid gap-3 md:grid-cols-3"><input type="datetime-local" className="input input-bordered" value={form.publish_at} onChange={(event) => update("publish_at", event.target.value)} /><input type="datetime-local" className="input input-bordered" value={form.starts_at} onChange={(event) => update("starts_at", event.target.value)} /><input type="datetime-local" className="input input-bordered" value={form.ends_at} onChange={(event) => update("ends_at", event.target.value)} /></div><div className="grid gap-2 md:grid-cols-3"><input type="number" min="0" max="100" className="input input-bordered" value={form.passing_percentage} onChange={(event) => update("passing_percentage", event.target.value)} placeholder="Passing percentage" />{[["shuffle_questions", "Shuffle questions"], ["shuffle_options", "Shuffle options"], ["show_result_immediately", "Show result immediately"], ["show_correct_answers", "Show correct answers"], ["show_explanations", "Show explanations"], ["allow_review_before_submit", "Allow review before submit"]].map(([key, label]) => <label key={key} className="label cursor-pointer justify-start gap-2"><input type="checkbox" className="checkbox checkbox-success" checked={form[key]} onChange={(event) => update(key, event.target.checked)} /><span className="label-text text-sm font-bold">{label}</span></label>)}</div>{!assessment && form.assessment_type !== "assignment" && <section className="space-y-3"><div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="text-lg font-black">Questions</h3><p className="text-sm font-semibold text-slate-500">{questions.length} questions · {totalMarks} total marks</p></div><button type="button" className="btn btn-outline btn-sm" onClick={() => setQuestions((current) => [...current, blankQuestion()])}>+ Add question</button></div>{questions.map((question, index) => <QuestionFields key={index} question={question} index={index} updateQuestion={updateQuestion} removeQuestion={(target) => setQuestions((current) => current.filter((_, currentIndex) => currentIndex !== target))} canRemove={questions.length > 1} />)}</section>}</form></Dialog>;
}

export function QuestionEditor({ data, question, onClose, onSaved }) {
  const [form, setForm] = useState({
    course: question?.course || data.assigned_courses[0]?.id || "", course_section: question?.course_section || data.assigned_sections[0]?.id || "", subject: question?.subject || data.assigned_subjects[0]?.id || "", chapter: question?.chapter || "", text: question?.text || "", image: question?.image || null, marks: question?.marks || 1, question_type: question?.question_type || "single",
    options: question?.options?.map((option) => ({ id: option.id, text: option.text, correct: option.is_correct, image: option.image || null })) || blankOptions(),
  });
  const [saving, setSaving] = useState(false); const [error, setError] = useState("");
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  useEffect(() => {
    if (question || form.course || !data.assigned_courses.length) return;
    setForm((current) => ({ ...current, ...scopeDefaults(data, current) }));
  }, [question, data, form.course]);
  async function submit(event) {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const payload = uploadPayload({ ...form, course_section: form.course_section || null, subject: form.subject || null, marks: Number(form.marks), status: "active" });
      if (form.image instanceof File) payload.append("image", form.image);
      const saved = question ? await questionApi.update(question.id, payload) : await questionApi.create(payload);
      const previousOptions = question?.options || [];
      const retainedIds = new Set(form.options.filter((option) => option.id && option.text.trim()).map((option) => option.id));
      await Promise.all(previousOptions.filter((option) => !retainedIds.has(option.id)).map((option) => questionOptionApi.remove(option.id)));
      await Promise.all(form.options.filter((option) => option.text.trim()).map((option, order) => {
        const optionPayload = uploadPayload({ question: saved.id, text: option.text, is_correct: option.correct, order });
        if (option.image instanceof File) optionPayload.append("image", option.image);
        return option.id ? questionOptionApi.update(option.id, optionPayload) : questionOptionApi.create(optionPayload);
      }));
      await onSaved(); onClose();
    } catch (requestError) { setError(getApiErrorMessage(requestError, "Could not save the question.")); } finally { setSaving(false); }
  }
  return <Dialog title={question ? "Edit Question" : "Create Question"} error={error} saving={saving} onClose={onClose} submitLabel={question ? "Update question" : "Create question"}><form id="teacher-builder" onSubmit={submit} className="space-y-4"><FieldScope form={form} update={update} data={data} /><QuestionFields question={form} index={0} updateQuestion={(_, value) => setForm(value)} removeQuestion={() => {}} canRemove={false} /></form></Dialog>;
}

export function MaterialEditor({ data, material, onClose, onSaved }) {
  const [form, setForm] = useState({ title: material?.title || "", description: material?.description || "", material_type: material?.material_type || "note", url: material?.url || "", course: material?.course || data.assigned_courses[0]?.id || "", course_section: material?.course_section || data.assigned_sections[0]?.id || "", subject: material?.subject || data.assigned_subjects[0]?.id || "", chapter: material?.chapter || "", topic: material?.topic || "", publish_at: material?.publish_at ? material.publish_at.slice(0, 16) : "", status: material?.status || "published", is_published: material?.is_published ?? true, file: null });
  const [saving, setSaving] = useState(false); const [error, setError] = useState(""); const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  useEffect(() => {
    if (material || form.course || !data.assigned_courses.length) return;
    setForm((current) => ({ ...current, ...scopeDefaults(data, current) }));
  }, [material, data, form.course]);
  async function submit(event) { event.preventDefault(); setSaving(true); setError(""); try { const payload = new FormData(); Object.entries({ ...form, course_section: form.course_section || "", subject: form.subject || "" }).forEach(([key, value]) => { if (value !== null && value !== "") payload.append(key, value); }); if (material) await materialApi.update(material.id, payload); else await materialApi.create(payload); await onSaved(); onClose(); } catch (requestError) { setError(getApiErrorMessage(requestError, "Could not save the study material.")); } finally { setSaving(false); } }
  return <Dialog title={material ? "Edit Study Material" : "Create Study Material"} error={error} saving={saving} onClose={onClose} submitLabel={material ? "Update material" : "Publish material"}><form id="teacher-builder" onSubmit={submit} className="space-y-4"><input required className="input input-bordered w-full" placeholder="Material title" value={form.title} onChange={(event) => update("title", event.target.value)} /><FieldScope form={form} update={update} data={data} /><div className="grid gap-3 md:grid-cols-2"><input className="input input-bordered" placeholder="Topic" value={form.topic} onChange={(event) => update("topic", event.target.value)} /><input type="datetime-local" className="input input-bordered" value={form.publish_at} onChange={(event) => update("publish_at", event.target.value)} /></div><textarea className="textarea textarea-bordered w-full" placeholder="Notes or description" value={form.description} onChange={(event) => update("description", event.target.value)} /><div className="grid gap-3 md:grid-cols-2"><select className="select select-bordered" value={form.material_type} onChange={(event) => update("material_type", event.target.value)}><option value="note">Study note</option><option value="link">Web link</option><option value="video">Video</option><option value="file">File upload</option></select><input className="input input-bordered" placeholder="Link or video URL" value={form.url} onChange={(event) => update("url", event.target.value)} /></div><input type="file" className="file-input file-input-bordered w-full" onChange={(event) => update("file", event.target.files?.[0] || null)} /><label className="label cursor-pointer justify-start gap-3"><input type="checkbox" className="checkbox checkbox-success" checked={form.is_published} onChange={(event) => update("is_published", event.target.checked)} /><span className="label-text font-bold">Publish for enrolled students</span></label></form></Dialog>;
}
