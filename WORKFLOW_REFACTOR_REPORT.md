# Role-Ownership Refactor: Admin / Head Teacher / Teacher / Student

## 1. Summary

The Admin portal previously owned almost the entire academic stack — Admission
Cards, the Admission Form Builder, academic structure (Courses / Sections /
Subjects / Academic Stages / Assessment Components / Grade Scales), and
Teacher Assignments — while a real Head Teacher role/portal barely existed.
This refactor relocated academic-structure ownership to the Head Teacher role,
enforced every boundary server-side (not just in the UI), fixed the Admission
Form Builder's root-cause bug, replaced the raw applicant sidebar with a full
review modal, removed the manual Enrollment admin screen, and closed two
confirmed authorization gaps. No new models were introduced; this was a
relocation-and-permission-fix pass on the existing `Course` /
`TeacherAssignment` / `AdmissionApplication` / `Enrollment` /
`AssignmentSubmission` data model.

## 2. Root causes and fixes

### 2.1 Admission Form Builder appeared broken
**Root cause:** `PublicAdmissionDetailSerializer` (`backend/apps/courses/serializers.py`)
never included `admission_form_schema` or `custom_content` in its output
fields. The builder correctly saved the schema to `Course.admission_form_schema`,
but the public application page (`GET /courses/courses/public-admissions/<id>/`)
never received it, so `AdmissionPages.jsx` always fell back to its own
hardcoded default field set regardless of what an admin built.
**Fix:** added both fields to the serializer's `Meta.fields` tuple. Purely
additive, no migration. **Verified live**: added a custom section/fields to
the E2E test admission's schema in the builder, refreshed the browser (schema
persisted), and confirmed the exact custom fields — not the hardcoded
defaults — rendered on the public `/admission/online/<slug>` page and could
be submitted successfully (see §7).

### 2.2 Duplicate admission-form-building surfaces
**Root cause:** `Course.admission_form_schema` was editable from two
independent admin screens with no coordination — the dedicated
`AdminAdmissionFormBuilderPage` and a second `admissionFormSchema` field
editor embedded inside the generic `CoursesPage` CRUD table
(`CourseFoundationPages.jsx`).
**Fix:** `CoursesPage` and its `admissionFormSchema` field-editor branch,
`defaultAdmissionFormSchema()` helper, and `cleanCoursePayload()` were deleted
outright — `AdminAdmissionsPage` (Course entity fields) and
`AdminAdmissionFormBuilderPage` (schema/landing page/teachers) together
already covered everything `CoursesPage` did, with no gap. The `courses` and
`courses/create`/`courses/:id` style routes to the old page were removed from
`adminDashboardChildren()`.

### 2.3 Admin required to configure the whole academic structure just to create an Admission
**Root cause:** `AdminAdmissionsPage` had its own inline Subject
create/reorder/remove UI (with an implicit auto-created default
`CourseSection` side effect), forcing an admin to manage Subjects while just
creating a Course/Admission record.
**Fix:** the inline Subject-management block was removed. `AdminAdmissionsPage`
is now pure Course-entity CRUD (title, code, fee, capacity, enrollment dates,
status, description, published) with an inline note directing the admin to
assign a Head Teacher for everything underneath.

### 2.4 No enforced Head Teacher scope (backend gap)
**Root cause:** `CourseSectionViewSet`, `CourseSubjectViewSet`,
`AcademicStageViewSet`, `TeacherAssignmentViewSet` had no course-scoped
authorization beyond organization filtering — any authenticated teacher could
read/write any admission's academic structure. Three grading-related
ViewSets — `AssessmentComponentViewSet`, `CourseGradeScaleViewSet`,
`CourseGradeScaleItemViewSet` (`backend/apps/assessments/views.py`) — had
**no write-authorization check at all** (`permissions.IsAuthenticated` only),
so any authenticated user holding any teacher `Employee` record could edit
any course's grading scheme org-wide.
**Fix:** new `apps/courses/services.py` centralizes `teacher_scope()`,
`ensure_teacher_subject_scope()`, and a new `ensure_head_teacher_of_course()`
(previously duplicated across the codebase). New
`HeadTeacherCourseScopeMixin` (`apps/courses/permissions.py`) is applied to
all seven ViewSets above:
- `get_queryset()` stays restrictive — only `is_staff`/`is_superuser` bypass
  to org-wide data; a teacher (head or not) only ever sees their own
  `head_course_ids` scope. This intentionally does **not** widen for
  role-permission grants alone (see the code comment in `permissions.py`) —
  a `course.*` Role permission authorizes a specific write action, never
  org-wide listing, matching a bug class already fixed earlier in this
  project.
- `perform_create`/`perform_update`/`perform_destroy` call
  `ensure_head_teacher_write()`/`ensure_head_teacher_destroy()`, which allow
  staff/role-based admins through, and otherwise require the acting teacher
  to head the target course.
- `TeacherAssignmentViewSet` additionally restricts `role="head_teacher"`
  writes to staff/role-based admins only (`_ensure_role_authority()`) — an
  ordinary Head Teacher can assign *subject* teachers but cannot make anyone
  else (or themselves) a Head Teacher.

### 2.5 Manual Enrollment admin screen
**Root cause:** `/admin/dashboard/enrollments` let an admin hand-create
`Enrollment` rows directly, bypassing the Application → Review → Approve
pipeline (and implicitly inviting a future "just mark it paid" shortcut).
**Fix:** the route, the live `EnrollmentsPage` export, and the dead
`AdminEnrollmentsPage` (hardcoded mock-stat placeholder,
`AdminCompactPages.jsx`) were removed, along with their nav entries. The
`Enrollment` model, `EnrollmentViewSet`, `enrollmentApi`, and the existing
approve-application → auto-enroll flow (`AdmissionApplicationViewSet`) were
**not** touched — enrollment is still created automatically, and only,
through application approval. **No payment automation of any kind was
added** — payment remains a separately-tracked field for future work.

### 2.6 Admission Applications review was unusable for real data
**Root cause:** `AdminAdmissionApplicationsPage` showed a 380px `<aside>`
with ~5 of the ~30 fields on `AdmissionApplication`, a raw
`Object.entries(form_data)` key:value dump with no field labels, and no way
to see uploaded documents or payment records.
**Fix:** new shared `components/common/Modal.jsx` (Framer Motion, `lg` size,
scrollable body) backs a full-screen "View Details" review modal. Sections:
Applicant Information, Guardian/Father/Mother Information, Admission
Information, **Application Form Responses** (every `form_data` key is
rendered, cross-referenced against the admission's live
`admission_form_schema` for a human label when available, falling back to a
humanized key — nothing is hardcoded to "a few known fields"), Documents
(lazy-fetched via new `applicantDocumentApi`), Payment (lazy-fetched via
existing `admissionPaymentApi`), Timeline, and Actions (the existing
`confirmAction`-gated Approve/Reject/Under-review handlers, unchanged,
relocated into the modal footer). **Verified live** end-to-end (§7).

### 2.7 Assignment grading notification
**Finding:** `AssessmentService.evaluate_submission()`
(`backend/apps/assessments/services.py`) already had both a scope guard
(head-teacher-or-own-subject, `PermissionDenied` otherwise) and a
`_notify_student(...)` call (`notification_type="assignment_graded"`,
`target_url="/student/assignments"`) from earlier work in this project — read
and confirmed directly against the live file before assuming this was still
outstanding. **No further change was needed here.** A Head Teacher can grade
any submission in a course they head (via the existing scoped queryset on
`AssignmentSubmissionViewSet`); a subject Teacher is restricted to their own
subject. There is exactly one grade field per submission
(`AssignmentSubmission.marks_obtained`/`feedback`/`evaluated_by`) — no
parallel grade record exists.

## 3. Per-role responsibilities (after this refactor)

| Role | Owns |
|---|---|
| **Admin** | Admission Card (`Course`) creation/fields, Admission Form Builder, Head Teacher assignment, Admission Applications review/approve/reject, site-wide content (notices, gallery, website theme/banners/stories) |
| **Head Teacher** | Academic Stages, Sections, Subjects, Assessment Components, Grade Scales/Items, and subject-Teacher assignment — all scoped to the admission(s) they head |
| **Teacher** | Chapters, Materials, Question Bank, Tests, Assignments, submissions/grading, subject analytics — scoped to their assigned subject/section |
| **Student** | Learning, test/assignment submission, viewing published results and feedback — own data only |

## 4. Duplicates removed

- `CoursesPage` (raw `Course` CRUD table with its own `admission_form_schema`
  editor) — fully retired; superseded by `AdminAdmissionsPage` +
  `AdminAdmissionFormBuilderPage`.
- `AdminAdmissionsPage`'s inline Subject create/reorder/remove UI — removed;
  Subjects are Head-Teacher-owned.
- Manual `EnrollmentsPage` / `AdminEnrollmentsPage` — removed; enrollment is
  system-managed via application approval only.
- Four independent copies of `teacher_scope()`/`ensure_teacher_subject_scope()`
  logic consolidated into `apps/courses/services.py`, re-exported from
  `apps/assessments/services.py` for existing callers.

## 5. Routes moved / removed

Moved from `/admin/dashboard/courses/*` to `/teacher/dashboard/academic/*`
(new `TeacherAcademicStructurePages.jsx`, gated on `is_head_teacher` from
`useTeacherData()`): `sections`, `subjects`, `stages`, `assessment-components`,
`grade-scales`, `grade-scale-items`, `teacher-assignments`.

Removed entirely: `/admin/dashboard/courses`, `/admin/dashboard/enrollments`.
`/admin/dashboard/teacher-assignments` remains, narrowed to "Assign Head
Teacher" only (no subject/section/role picker).

Admin sidebar: removed the "Academic Structure & Grading" entry (dead link
after relocation). A large pre-existing **unreachable** second `return` block
inside `adminDashboardChildren()` in `AppRoutes.jsx` (dead code predating this
refactor, confirmed via static analysis — JS code after a `return` never
executes) was deliberately left in place; touching it was out of scope and
it carries no runtime effect. The one dead reference it held to the now-deleted
`AdminEnrollmentsPage` import was removed since that component was deleted.

## 6. Files changed

**Backend new:** `apps/courses/services.py`, `apps/courses/permissions.py`.
**Backend modified:** `apps/courses/views.py`, `apps/assessments/views.py`,
`apps/assessments/services.py` (import cleanup only — grading/notification
logic was already correct), `apps/courses/serializers.py`.
**Frontend new:** `components/common/Modal.jsx`,
`pages/teacher/TeacherAcademicStructurePages.jsx`.
**Frontend modified:** `pages/admin/Dashboard/courses/CourseFoundationPages.jsx`,
`pages/admin/AdminPortalPages.jsx`, `pages/admin/Dashboard/AdminCompactPages.jsx`,
`pages/admin/DashboardSidebar.jsx`, `pages/teacher/TeacherModulePages.jsx`,
`routes/AppRoutes.jsx`, `services/resourceApi.js` (new `applicantDocumentApi`).

No new database models. No destructive migrations — the only schema changes
in this refactor's own scope are additive (serializer field exposure).

## 7. Tests performed

**Automated:** `python manage.py test apps.courses apps.assessments
apps.accounts apps.admissions` — 56/56 passing, including
`test_student_scope_security.py` and `test_teacher_scope_security.py`, which
specifically assert a student/teacher holding a role-granted `course.*`
permission still cannot list org-wide academic-structure or teacher-assignment
data. `vite build` — clean production build after every batch of changes.

**Live, in-browser, with real data (not mocked):**
1. Logged in as Admin (`expertjashore@gmail.com`); confirmed the "Academic
   Structure & Grading" sidebar link is gone and `AdminAdmissionsPage` shows
   no Subject-management UI.
2. Opened the Admission Form Builder for `E2E_TEST_2026 Medical Admission`,
   built a custom section with 5 fields (Full Name, Phone, Email, College
   Name, Guardian Phone), saved, hard-refreshed the browser, and confirmed
   the schema persisted exactly as entered.
3. Loaded the public application page for the same admission and confirmed
   the *custom* fields rendered — not the previous hardcoded default set —
   proving the serializer fix (§2.1) closes the loop end-to-end.
4. Logged in as a student, filled and submitted the live public form; the
   submission succeeded (`Application ID: ADM-2026-000008`).
5. Logged back in as Admin, opened Admission Applications, confirmed the new
   application appears in the list, opened "View Details" and verified every
   modal section (Applicant Info, Guardian Info, Admission Info, Application
   Form Responses showing all 5 custom fields with correct labels, Documents,
   Payment, Timeline, Actions) rendered correctly with the real submitted
   data.
6. Clicked "Approve & enroll" — confirmed the existing SweetAlert2 confirm
   dialog (not a browser `confirm()`), confirmed, and verified via a direct
   API call that a real `Enrollment` row was created
   (`ENR-ADM-2026-000008`, `status: "active"`, linked to the application) —
   with no manual admin enrollment screen involved.

## 8. Bugs found and fixed during this session

1. **Admission Form Builder silently non-functional** — §2.1 above.
2. **Two competing admission-form-schema editors** — §2.2.
3. **Admin forced to manage Subjects while creating an Admission** — §2.3.
4. **No server-side Head Teacher scope on 4 academic-structure ViewSets** — §2.4.
5. **No write-authorization at all on 3 grading ViewSets** (any teacher could
   edit any course's grading scheme org-wide) — §2.4.
6. **Manual Enrollment creation screen bypassing the approval pipeline** — §2.5.
7. **Admission Applications review unusable for real records** — §2.6.

## 9. Known limitations / remaining issues

- **Admission Form Builder: field rename after first save does not update the
  field's internal machine key.** Discovered during live testing: a field's
  `name` (used both as the HTML `name` attribute and, via
  `admissionValue()` label-heuristic matching in
  `frontend/src/services/api.js`, to auto-populate `applicant_name` /
  `applicant_phone` / etc.) is generated once from the label at first save
  and then frozen — by design, so existing submitted `form_data` keys don't
  break when a label is edited later. However, `admissionValue()` matches
  against the frozen `name`, not the current visible `label`. If an admin
  renames a field's label after the form has been saved once (an ordinary,
  expected action — the builder explicitly supports editing existing
  fields), the label the admin now sees can silently stop matching the
  auto-mapping heuristic, and if that field was relied on for
  `applicant_name`/`applicant_phone` (both required, non-nullable columns),
  every subsequent submission fails with a 400 until the admin removes and
  re-adds the field. This is a **pre-existing** issue, not introduced by
  this refactor, and was not in scope of the seven fixes above — flagging it
  here because it was directly observed while doing the live E2E test in
  §7. Recommended follow-up: either match `admissionValue()` against the
  field's current `label` (looked up from the schema) instead of its frozen
  `name`, or surface the field's machine key in the builder UI so admins can
  see when a rename has decoupled it.
- **`AdmissionApplication.form_data` includes a few non-field entries**
  (`course`, `programId`, and the read-only `Program` display input) mixed
  in with genuine dynamic field responses, because
  `admissionService.submit()` merges the whole submitted `FormData` object
  into `form_data` rather than filtering to only schema-declared fields.
  Harmless (the new review modal still renders every real field correctly),
  but slightly noisy in the "Application Form Responses" section.
- **The large audit of the full Student-portal workflow** (Dashboard, My
  Courses, Course Detail, Chapters, Materials, Progress, Practice, Tests,
  Assignments, Results, Study Plan, Recommendations, Weak Topics, Mistakes,
  Bookmarks, Ask Teacher, Feedback, Calendar, Announcements, Notifications,
  Goals, Profile) was largely built and verified in earlier phases of this
  overall project and was not re-audited specifically for this refactor —
  none of the pages in that list were touched by this refactor's changes.
- The pre-existing, confirmed-unreachable second `return` block in
  `adminDashboardChildren()` (`AppRoutes.jsx`) was left in place — dead code,
  zero runtime effect, out of scope for this pass (see §5).
- `custom_content`/`customContent` field editor (separate from
  `admission_form_schema`) was not audited for duplication in this pass.
