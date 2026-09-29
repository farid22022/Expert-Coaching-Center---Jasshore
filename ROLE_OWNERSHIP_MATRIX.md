# Role Ownership Matrix

One business function, one authoritative owner, enforced server-side.
"Backend enforcement" means the boundary is checked in a DRF
`get_queryset()`/`perform_create`/`perform_update`/`perform_destroy` (or
equivalent), not only hidden in the UI.

| Feature | Admin | Head Teacher | Teacher | Student | Source of truth / enforcement |
|---|---|---|---|---|---|
| Admission Card (`Course` entity: title, dates, fee, status, published) | **Create / Edit / Delete** | — | — | — | `CourseViewSet`, staff/role-based only. `AdminAdmissionsPage`. |
| Admission Form Builder (`admission_form_schema`, landing page, `custom_content`) | **Create / Edit** | — | — | — | `CourseViewSet` (same as above). `AdminAdmissionFormBuilderPage` — the only editor; `CoursesPage`'s duplicate editor was removed. |
| Head Teacher assignment (`TeacherAssignment role=head_teacher`) | **Create / Remove** | — (cannot assign self or others) | — | — | `TeacherAssignmentViewSet._ensure_role_authority()` — only staff/role-based admins may write `role="head_teacher"`. `AdminTeacherAssignmentsPage`. |
| Admission Applications (review, approve/reject/under-review) | **Full** | — | — | Submit own only | `AdmissionApplicationViewSet`. `AdminAdmissionApplicationsPage` + review modal. |
| Enrollment | Read-only (via approval outcome) | Read-only (own admissions) | — | Read own | System-managed only — created exclusively by application approval (`AdmissionApplicationViewSet.action("approve")`). No manual create UI exists anywhere. |
| Academic Stage | View | **Create / Edit / Delete** (own admission) | — | — | `AcademicStageViewSet` + `HeadTeacherCourseScopeMixin`. `/teacher/dashboard/academic/stages`. |
| Sections | View | **Create / Edit / Delete** (own admission) | — | — | `CourseSectionViewSet` + `HeadTeacherCourseScopeMixin`. `/teacher/dashboard/academic/sections`. |
| Subjects | View | **Create / Edit / Delete** (own admission) | — | — | `CourseSubjectViewSet` + `HeadTeacherCourseScopeMixin`. `/teacher/dashboard/academic/subjects`. |
| Assessment Components | View | **Create / Edit / Delete** (own admission) | — | — | `AssessmentComponentViewSet` + `HeadTeacherCourseScopeMixin` (previously **unauthenticated-write bug**, now fixed). `/teacher/dashboard/academic/assessment-components`. |
| Grade Scale / Grade Scale Items | View | **Create / Edit / Delete** (own admission) | — | — | `CourseGradeScaleViewSet` / `CourseGradeScaleItemViewSet` + `HeadTeacherCourseScopeMixin` (previously **unauthenticated-write bug**, now fixed). `/teacher/dashboard/academic/grade-scales`, `.../grade-scale-items`. |
| Subject-Teacher Assignment (`TeacherAssignment role≠head_teacher`) | View | **Create / Edit / Delete** (own admission) | — | — | `TeacherAssignmentViewSet` + `HeadTeacherCourseScopeMixin`. `/teacher/dashboard/academic/teacher-assignments`. |
| Chapters / Materials / Question Bank | View (org) | View (own admission) | **Create / Edit / Delete** (own subject) | View (enrolled + published) | `apps.assessments` content ViewSets, scoped via `ensure_teacher_subject_scope()`. |
| Tests / Assignments | View (org) | View (own admission) | **Create / Edit / Delete** (own subject) | Attempt / Submit own | Same as above. |
| Assignment Submission grading (marks + feedback) | — | **Grade / override** (own admission's submissions) | **Grade** (own subject's submissions) | Read own result only | `AssignmentSubmissionViewSet` scoped queryset (`scope_via="assessment"`) + `AssessmentService.evaluate_submission()` defense-in-depth scope check. **Exactly one grade field per submission** — no parallel/duplicate grade record. |
| Grading notification | — (system) | — (system) | — (system) | Receives | `AssessmentService._notify_student()`, `notification_type="assignment_graded"`, fired inside `evaluate_submission()` in the same transaction as the grade save. |
| `TeacherPrivateNote` | — | — | **Create / Edit** (own) | **Never visible** | Structurally absent from every student-facing serializer/component — not merely hidden by CSS. |
| Subject Analytics | View (org) | View (own admission) | **Own subject** | — | `AnalyticsViewSet`, scoped via `ensure_teacher_subject_scope()`. |
| Student learning progress / test-taking / submissions | View (org) | View (own admission) | View (own subject) | **Own only** | Scoped to `request.user`'s own `Student`/`Enrollment` records throughout `apps.assessments` student-facing endpoints. |
| Published Results | Publish trigger | View (own admission) | View (own subject) | **View own, published only** | `publish_course_result` gate — unpublished results never serialize to the student. |
| Site content (Notices, Gallery, Banners, Success Stories, Renowned Teachers, Theme, i18n) | **Full** | — | — | View (public) | `apps.website`/`apps.messaging` ViewSets, staff/role-based only. |

## Legend
- **Bold** = create/edit/delete authority.
- "View" = read access only, no write path.
- "—" = no access; backend returns 403/404, not merely a hidden button.
- Every boundary above marked with a backend ViewSet name is enforced in
  `get_queryset()`/`perform_*`, independent of any frontend route guard —
  verified via `apps.courses.tests.test_student_scope_security`,
  `apps.assessments.tests.test_teacher_scope_security`, and
  `apps.assessments.tests.test_student_privacy` (56/56 passing).
