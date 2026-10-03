# EXPERT Coaching Center
## Current System State

Baseline recorded on 2026-10-01, before the changes requested in the latest academic-workflow specification. `EXISTS` means code is present; it does not imply an end-to-end browser test passed. Existing user changes in `frontend/.firebase/hosting.ZGlzdA.cache` and `frontend/public/academic/` were left untouched.

### Project Architecture

| Area | Current implementation | State |
| --- | --- | --- |
| Frontend | React 19, Vite 7, React Router 7; public, admin, teacher/head-teacher, and student route trees | EXISTS |
| Backend | Django 5.1, Django REST Framework; `accounts`, `courses`, `admissions`, `payments`, `assessments`, `messaging`, and other domain apps | EXISTS |
| Database | MySQL configuration for application use; SQLite test database (`backend/test.sqlite3`) | EXISTS |
| Authentication | JWT access/refresh with SimpleJWT and session authentication; frontend keeps tokens in local storage | EXISTS |
| State management | Component state and Axios requests, with some older admin UI using local-storage demo state; no React Query | PARTIAL |
| UI framework | Tailwind 4, DaisyUI 5, Framer Motion, project components | EXISTS |
| Rich text editor | `react-quill-new` and DOMPurify-backed `SafeHtml` display | EXISTS |
| Payment | `payments` bKash agreement/transaction flow, mock/sandbox/live mode selection | PARTIAL |
| Notifications | `messaging.Notification` plus grading notification creation | EXISTS |
| File upload | Django `MEDIA_ROOT`/`MEDIA_URL`; model `FileField`s for syllabus, material, assessment, submission attachments | PARTIAL |
| Testing | Django test modules and Vite build scripts exist; no fresh full-suite result was established at baseline | PARTIAL |

### Current Roles

| Role | Existing routes/pages | Existing API/capabilities | Gaps or unverified behavior |
| --- | --- | --- | --- |
| Admin | `/admin/dashboard` and children for admissions, form builder, teachers, assignments, applications, payments, notices, gallery, website; `/dashboard` is an alias using the same active children | Course/admission cards, form schema on `Course`, head-teacher assignment, application review, payment oversight, site content | Numerous legacy admin components remain on disk, but the old child-route block after `adminDashboardChildren()`'s first return is unreachable. Complete browser regression and persistence across all editors are unverified. |
| Head Teacher | Teacher dashboard academic routes for stages, sections, subjects, teacher assignments, components and grade scales; course outline | Scoped academic structure for assigned admission through course/assessment APIs | Scope and full authoring of lesson video/PDF/post content need verification; separate role-specific route shell is not used. |
| Teacher | `/teacher/dashboard` course, assessments, question bank, materials, outline, students, submissions/review, analytics and online-test routes | Assigned-subject content, question bank, assessment/assignment creation, grading, feedback and notifications | Upload preview/security, scheduled/live timing and multi-step workflow need current end-to-end verification. |
| Student | `/student/dashboard` children for courses, assessments, assignments, materials, results, notifications and profile; `/student/courses/:enrollmentId` and payment routes | Own enrollment, learning content, attempts, submissions, results and payment initiation/status | Full admission → verified payment → course-content path, media rendering, locked weeks and refresh/deep-link behavior need verification. |

### Current Models

`accounts.User`, `Role`, `Permission`; `people.Student`, `StudentProfile`, `TeacherProfile`; `courses.Course` (the admission/program record), `CourseSection`, `AcademicStage`, `CourseSubject`, `SubjectWeek` (`release_at`, `is_published`), `CourseChapter`, `CourseSyllabusItem`, `TeacherAssignment` (including head-teacher role), `Enrollment`; `admissions.AdmissionApplication` (`form_data` JSON), `ApplicantDocument`, legacy `AdmissionPayment`, `AdmissionExam`, `AdmissionExamMark`, `AdmissionResult`; `assessments.Question`, `QuestionOption`, `CourseMaterial`, `Assessment`, `AssessmentQuestion`, `AssessmentAttempt`, `StudentAnswer`, `AssignmentSubmission`, `SubmissionAttachment`, `MaterialView`, `AssessmentComponent`, `CourseGradeScale`, `CourseGradeScaleItem`, `StudentCourseResult`, `StudentComponentResult`, `TeacherPrivateNote`; `payments.BkashAgreement`, `AdmissionPaymentTransaction`, `PaymentWebhookEvent`; `messaging.Notification`, `Notice`. Form definitions are stored on `Course`, rather than in standalone `AdmissionForm`/`AdmissionFormField` tables. Do not create duplicate equivalents without a migration reason.

### Current Route Map

- Public: home, admission/course landing and application, authentication, public content.
- Admin: `/admin/dashboard/*` is the current operating area; `/dashboard/*` renders the same child routes. The old legacy route declaration after a `return` is unreachable.
- Head Teacher: `/teacher/dashboard/academic/*` and related teacher dashboard pages, with server-side assigned-course scope.
- Teacher: `/teacher/dashboard/*`, `/teacher/online-tests/*`.
- Student: `/student/dashboard/*`, `/student/courses/:enrollmentId`, and payment pages.

### Current API Map

`/api/v1/auth/` serves login/register/token lifecycle/users/roles. `/api/v1/courses/` serves courses, sections, stages, subjects, weeks, chapters, syllabus items, teacher assignments, enrollment and dashboard data. `/api/v1/applications/` and `/api/v1/admissions/` serve applicant forms/review and admission exam data. `/api/v1/payments/` serves bKash initiate, execute, agreement start/step, callback/webhook, own/detail/status/cancel/disconnect and admin oversight. `/api/v1/assessments/` serves questions, materials, assessments, attempts, submissions, attachments, analytics, gradebook and result data. `/api/v1/sms/` serves notifications/notices. The public, admin, head-teacher, teacher and student frontend pages consume these via Axios service modules; endpoint-by-endpoint ownership remains to be checked in the implementation map.

### Current Workflow

Admin creates a `Course` and admission-form schema, assigns a head teacher, and reviews `AdmissionApplication` records. Assigned academic staff manage course structure and assessments. Student applications and payments feed enrollment; enrolled students can use course content, submit assessment attempts/assignments, and view published results. These connections exist in code, but the complete ordered browser journey has **not** been demonstrated at baseline.

### Current Payment State

The bKash integration has separate agreement and admission-payment transaction models, with mock, sandbox and live paths. Backend verification controls success and enrollment. Mock flow was exercised in earlier work; a fresh run is required here. Sandbox/live require valid merchant credentials and fail closed when unavailable. Payment callback, idempotency, retry and automatic enrollment must be verified in this task; no live-money success is claimed.

### Current File/Media State

The supplied files are `frontend/public/academic/prob ch-2.pdf` (16,471,876 bytes) and `frontend/public/academic/istockphoto-931134082-640_adpp_is.mp4` (696,281 bytes). Neither was referenced in `frontend/src` or backend source at baseline. They are public static assets, not authenticated Django media. Three animated icons (`frontend/public/icons/study.mp4`, `student.mp4`, `teacher.mp4`) are used by `LearningIcon`. Django model uploads use `backend/media`; in DEBUG the project URL configuration serves that directory directly. Submission upload validation allows PDF and common image extensions up to 10 MB, but extension and request MIME alone are insufficient to prove file type. No initial audit asset was moved or deleted.

### Current Rich Text Usage

`RichTextEditor` appears in teacher question text/explanation, assessment description/instructions, material description, feedback/notices and admin admission description. Student display uses DOMPurify-backed `SafeHtml` in relevant pages. Chapter introduction/post text and any remaining plain-text content editors are candidates for reuse of this component, after checking each data model and serializer.

### Current Problems and Unknowns

- Many older admin module components and local-storage demo pages remain in source but are unreachable through `adminDashboardChildren()`; maintaining these can confuse future route ownership.
- Full API-to-page persistence, refresh, permissions and console/network-error audit is not yet complete; these are **unverified**, not reported broken.
- The user-provided academic PDF and video are unused. There is no demonstrated authenticated video/PDF lesson path at baseline.
- Upload checks based on file name/MIME are insufficient for hostile files; direct DEBUG media serving is not private.
- Full workflow boundaries, scheduled-week locking and role scoping have code, but require targeted regression tests and browser checks.

### Current Test Status

Repository test modules and frontend build command exist. At the moment this baseline was written, the current working tree had **no fresh test/build/browser result** for this request, so none is labeled PASS. Test outcomes and unresolved limits belong in `ACADEMIC_WORKFLOW_IMPLEMENTATION_REPORT.md` after implementation.

## Update 2026-10-02: Test → Notification → Student pipeline

Database is now PostgreSQL on Neon (see `POSTGRES_NEON_IMGBB_MIGRATION_STATE.md`). Test publication is centralised in `apps/assessments/publication.py` (`TestPublicationService`): publish / head-teacher approval / reschedule / cancel create one structured `messaging.Notification` per eligible active-enrolled student (idempotent via `dedupe_key`). Students open a test at `/student/tests/:id`; availability and countdown come from the backend (`student_status`, `server_time`) and `start` is still gated server-side. No React Query and no background worker exist in this project. Details: `TEST_NOTIFICATION_STUDENT_PIPELINE_STATE.md` (before), `TEST_NOTIFICATION_PIPELINE_REPORT.md` (after), `ACADEMIC_NOTIFICATION_MATRIX.md` (events).
