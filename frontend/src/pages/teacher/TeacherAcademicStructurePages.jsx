import { Shell, useTeacherData, Loading } from "./TeacherModulePages.jsx";
import {
  CourseSectionsPage,
  CourseSubjectsPage,
  AcademicStagesPage,
  AssessmentComponentsPage,
  CourseGradeScalesPage,
  CourseGradeScaleItemsPage,
  TeacherAssignmentsPage as HeadTeacherSubjectAssignmentsCrud,
} from "../admin/Dashboard/courses/CourseFoundationPages.jsx";

function HeadTeacherGate({ title, children }) {
  const { data, loading } = useTeacherData();
  if (loading) return <Shell title={title}><Loading label="Loading..." /></Shell>;
  if (!data.is_head_teacher) {
    return (
      <Shell title={title}>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <h1 className="text-2xl font-black">Head teacher access required</h1>
          <p className="mt-2 font-semibold text-slate-600">
            Only the Head Teacher assigned to an admission can manage its academic structure.
          </p>
        </div>
      </Shell>
    );
  }
  return <Shell title={title}>{children}</Shell>;
}

export function HeadTeacherSectionsPage() {
  return <HeadTeacherGate title="Sections"><CourseSectionsPage showNav={false} /></HeadTeacherGate>;
}

export function HeadTeacherSubjectsPage() {
  return <HeadTeacherGate title="Subjects"><CourseSubjectsPage showNav={false} /></HeadTeacherGate>;
}

export function HeadTeacherAcademicStagesPage() {
  return <HeadTeacherGate title="Academic Stages"><AcademicStagesPage showNav={false} /></HeadTeacherGate>;
}

export function HeadTeacherAssessmentComponentsPage() {
  return <HeadTeacherGate title="Assessment Components"><AssessmentComponentsPage showNav={false} /></HeadTeacherGate>;
}

export function HeadTeacherGradeScalesPage() {
  return <HeadTeacherGate title="Grade Scales"><CourseGradeScalesPage showNav={false} /></HeadTeacherGate>;
}

export function HeadTeacherGradeScaleItemsPage() {
  return <HeadTeacherGate title="Grade Scale Items"><CourseGradeScaleItemsPage showNav={false} /></HeadTeacherGate>;
}

export function HeadTeacherSubjectAssignmentsPage() {
  return <HeadTeacherGate title="Teacher Assignments"><HeadTeacherSubjectAssignmentsCrud showNav={false} /></HeadTeacherGate>;
}
