import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ClipboardCheck, RefreshCw } from "lucide-react";

import { getApiErrorMessage } from "../../services/api.js";
import { confirmAction, notifyError, notifySuccess } from "../../services/alerts.js";
import { gradebookApi } from "../../services/resourceApi.js";
import { ErrorMessage, Loading, Shell, useTeacherData } from "./TeacherModulePages.jsx";

const STATUS_LABEL = {
  draft: "Draft", calculated: "Calculated", published: "Published", locked: "Locked", not_calculated: "Not Calculated",
};

function DataStatusBadge({ status }) {
  const styles = {
    complete: "badge-success text-white",
    not_attempted: "badge-ghost",
    missing: "badge-error text-white",
    not_graded: "badge-warning text-white",
    excused: "badge-info text-white",
  };
  return <span className={`badge badge-xs ${styles[status] || "badge-ghost"}`}>{(status || "").replaceAll("_", " ")}</span>;
}

export default function TeacherGradebookPage() {
  const { data, loading: teacherLoading } = useTeacherData();
  const [subjectId, setSubjectId] = useState("");
  const [gradebook, setGradebook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState({});

  const subjectOptions = useMemo(() => {
    const sectionById = Object.fromEntries((data.assigned_sections || []).map((s) => [s.id, s]));
    const courseById = Object.fromEntries((data.assigned_courses || []).map((c) => [c.id, c]));
    return (data.assigned_subjects || []).map((subject) => {
      const section = sectionById[subject.course_section];
      const course = section ? courseById[section.course] : null;
      return { ...subject, courseTitle: course?.title || "" };
    });
  }, [data]);

  const load = async (id) => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      setGradebook(await gradebookApi.get(id));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to load the gradebook."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (subjectOptions.length && !subjectId) {
      setSubjectId(String(subjectOptions[0].id));
      load(subjectOptions[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectOptions]);

  const calculate = async () => {
    const confirmed = await confirmAction({ title: "Recalculate results?", text: "This recalculates every student's result for this subject from real test/assignment/manual marks." });
    if (!confirmed) return;
    setBusy(true);
    try {
      await gradebookApi.action(subjectId, "calculate");
      notifySuccess("Results recalculated.");
      await load(subjectId);
    } catch (requestError) {
      notifyError(getApiErrorMessage(requestError, "Unable to recalculate results."));
    } finally {
      setBusy(false);
    }
  };

  const publish = async () => {
    const missing = (gradebook?.students || []).filter((row) => row.result_status !== "published" && row.result_status !== "calculated").length;
    const confirmed = await confirmAction({
      title: "Publish results?",
      text: `${gradebook?.students?.length || 0} students. Results with missing required marks will be skipped.`,
      danger: missing > 0,
    });
    if (!confirmed) return;
    setBusy(true);
    try {
      const result = await gradebookApi.action(subjectId, "publish");
      if (result.failed?.length) {
        notifyError(`Published ${result.published}, but ${result.failed.length} student(s) could not be published (missing required marks).`);
      } else {
        notifySuccess(`Published results for ${result.published} student(s).`);
      }
      await load(subjectId);
    } catch (requestError) {
      notifyError(getApiErrorMessage(requestError, "Unable to publish results."));
    } finally {
      setBusy(false);
    }
  };

  const saveManualMark = async (enrollmentId, componentId) => {
    const key = `${enrollmentId}-${componentId}`;
    const value = editing[key];
    if (value === undefined) return;
    try {
      await gradebookApi.action(subjectId, "manual-mark", { enrollment_id: enrollmentId, component_id: componentId, obtained: value });
      notifySuccess("Mark saved.");
      setEditing((current) => { const next = { ...current }; delete next[key]; return next; });
      await load(subjectId);
    } catch (requestError) {
      notifyError(getApiErrorMessage(requestError, "Unable to save this mark."));
    }
  };

  const components = gradebook?.components || [];

  return (
    <Shell title="Gradebook">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-emerald-100 bg-white p-4 shadow-sm">
        <select
          className="select select-bordered select-sm h-9 min-h-9 max-w-xs bg-white"
          value={subjectId}
          onChange={(event) => { setSubjectId(event.target.value); load(event.target.value); }}
        >
          {subjectOptions.map((subject) => (
            <option key={subject.id} value={subject.id}>{subject.courseTitle ? `${subject.courseTitle} - ${subject.name}` : subject.name}</option>
          ))}
        </select>
        <button type="button" disabled={busy || !subjectId} onClick={calculate} className="btn btn-outline btn-sm border-emerald-700 text-emerald-800">
          <RefreshCw size={14} /> Calculate Results
        </button>
        <button type="button" disabled={busy || !subjectId} onClick={publish} className="btn btn-success btn-sm text-white">
          <ClipboardCheck size={14} /> Publish Results
        </button>
      </div>

      <ErrorMessage error={error} />
      {(loading || teacherLoading) && <Loading label="Loading gradebook..." />}

      {!loading && gradebook && (
        <div className="overflow-x-auto rounded-xl border border-emerald-100 bg-white shadow-sm">
          <table className="table table-xs min-w-[900px]">
            <thead className="bg-slate-100 text-slate-950">
              <tr>
                <th>Student</th>
                {components.map((component) => (
                  <th key={component.id}>{component.name} <span className="font-normal text-slate-400">({component.weight_percentage}%)</span></th>
                ))}
                <th>Total %</th>
                <th>Grade</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {gradebook.students.map((row) => (
                <tr key={row.enrollment_id}>
                  <td className="font-bold">{row.student_name}</td>
                  {row.components.map((cell, index) => {
                    const component = components[index];
                    const key = `${row.enrollment_id}-${cell.component_id}`;
                    const isManualType = component?.source_type === "manual";
                    return (
                      <td key={cell.component_id}>
                        {isManualType ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min={0}
                              max={cell.raw_total}
                              className="input input-bordered input-xs h-7 w-16"
                              defaultValue={cell.raw_obtained ?? ""}
                              onChange={(event) => setEditing((current) => ({ ...current, [key]: event.target.value }))}
                            />
                            <span className="text-slate-400">/{cell.raw_total}</span>
                            {editing[key] !== undefined && (
                              <button type="button" className="btn btn-success btn-xs h-6 min-h-6" onClick={() => saveManualMark(row.enrollment_id, cell.component_id)}>
                                <CheckCircle2 size={12} />
                              </button>
                            )}
                          </div>
                        ) : (
                          <span>{cell.raw_obtained ?? "-"}/{cell.raw_total}</span>
                        )}
                        <div className="mt-1"><DataStatusBadge status={cell.data_status} /></div>
                      </td>
                    );
                  })}
                  <td className="font-black">{row.total_percentage ?? "-"}</td>
                  <td className="font-black">{row.grade || "-"}</td>
                  <td><span className="badge badge-outline badge-sm">{STATUS_LABEL[row.result_status] || row.result_status}</span></td>
                </tr>
              ))}
              {!gradebook.students.length && (
                <tr><td colSpan={components.length + 4} className="py-8 text-center text-slate-400">No active enrollments for this subject yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </Shell>
  );
}
