# Test → Notification → Student pipeline: state before changes

Audited 2026-10-02 against the actual repository (Django 5.1/DRF, React 19/Vite, PostgreSQL on Neon). Names differ from the generic spec; this is the mapping:

| Spec term | Repository model |
|---|---|
| Admission | `courses.Course` |
| StudentEnrollment | `courses.Enrollment` (`status="active"`; created only by the verified-payment service) |
| Section/Batch | `courses.CourseSection` |
| Subject | `courses.CourseSubject` |
| TeacherAssignment / Head Teacher | `courses.TeacherAssignment` (`role="head_teacher"`, `assignment_status="accepted"`, `is_active`) |
| OnlineTest / TestAttempt / StudentAnswer | `assessments.Assessment` (`assessment_type` mcq/exam/assignment) / `AssessmentAttempt` / `StudentAnswer` |
| Question bank | `assessments.Question` + `QuestionOption`, linked by `AssessmentQuestion` |

## Existing Test Models
`Assessment` carries course, section, subject, chapter, `timing_mode`, `duration_minutes`, `starts_at`, `ends_at`, `publish_at`, `status` (draft/published/scheduled/live/closed/archived), `review_status` (draft/pending/approved/rejected), `attempts_allowed`, result-visibility flags and `allowed_students` (individually targeted practice). `AssessmentAttempt` is unique per (assessment, student); `deadline = min(started_at + duration, ends_at)`.

## Existing Test Types
`assessment_type`: `mcq`, `exam`, `assignment`. `timing_mode`: `practice`, `live`, `scheduled`, `individual`. There is one assessment engine; PRACTICE/NORMAL/LIVE/SCHEDULED are `timing_mode` values, not separate models. No new engine is introduced.

## Existing Notification Model
`messaging.Notification`: recipient, title, body, `notification_type` (free text), `target_url`, `is_read`, `read_at`. No structured target (type/id), no priority, no metadata, no uniqueness/idempotency key. Endpoints: `GET /api/v1/sms/notifications/`, `POST …/{id}/read/`, `POST …/read_all/`, `GET …/unread_count/`.

## Existing Notification Creation Logic
`assessments/views.py::AssessmentAdminViewSet.perform_create` → `_notify_enrolled_students_of_new_content` → `services.notify_enrolled_students` → `_notify_student` (one `User` lookup and one `Notification.objects.create` **per student**).
It fires only inside `perform_create`, only when the creator is a head teacher, and **regardless of the test's `status`**.

## Current Recipient Logic
Active `Enrollment` for the course (section-narrowed if the test has a section), de-duplicated by student, mapped to `User` by `email__iexact`. `allowed_students` is **not** considered, so individually-targeted tests would notify everyone enrolled. N+1 queries.

## Current Deep-Link Logic
Every test notification uses `target_url="/student/dashboard/assessments"` (assignments: `/student/assignments`). That list page links each card to `/student/courses/:enrollmentId` (the course workspace, which then auto-selects the "first incomplete item"), not to the test. The notification page renders `<a href={target_url}>` (full page reload) and the click on the card itself only marks read; the header bell dropdown only marks read. There is no route that addresses a single test.

## Current Scheduled-Test Logic
Student list API returns published, approved, released tests with `ends_at >= now` and `starts_at` in the future allowed ("Upcoming"). `AssessmentService.ensure_assessment_open` rejects `start` before `starts_at` / after `ends_at` / non-open status (server-side gate: sound). The course workspace API (`courses …/content/`) instead filters `starts_at <= now`, so an upcoming test is invisible there.

## Current Timer Logic
Only the in-test timer exists: `deadline` from the server, but `seconds = deadline - Date.now()` uses the **device clock**. There is no pre-start countdown anywhere and no API returns `server_time`.

## Current Student Dashboard
`StudentDashboard.jsx` / `StudentDashboardView.jsx` (learning data from `/courses/student/dashboard/`), `StudentActionsPage` (`/assessments/student/assessments/actions/`), assessments page with Available/Upcoming/Completed computed **in the browser** from `new Date()`.

## Current Admission → Enrollment Pipeline
Application → admin approval → payment (`payments` app: mock/sandbox/live bKash provider, backend verification) → `courses.Enrollment` activated by the payment service (`payments/services.py`, `admissions/services.py`) → course appears in `/student/courses`. Not modified by this work.

## Existing Bugs (found by tracing the chain)
1. **Root cause of missing student notices:** notifications are generated only at *creation* by a head teacher. The two real publication paths – `AssessmentViewSet.publish` and the head-teacher approval `review` (used for every subject-teacher test) – create **no notification**. Subject-teacher tests therefore never notify anyone.
2. Draft tests created by a head teacher notify students (and the test is not visible to them).
3. The teacher builder creates the test *before* its questions exist, so a creation-time notification points at an empty test.
4. Links never open the exact test (see Deep-Link Logic).
5. No idempotency: a retried/duplicated call notifies twice.
6. `allowed_students` ignored by recipient resolution.
7. Tests with a future `publish_at` would notify while still invisible.
8. A cancelled/closed/expired test returns 404 to the student, so an old notification dead-ends.
9. Reschedule/cancel produce no notification.

## Stale-State Problems
Notification list/bell/unread badge/dashboard each fetch once on mount; marking read updates local state only (bell uses a `notificationschange` window event for unread). Upcoming→Available is decided from the device clock at render time and never re-evaluated.

## Missing Query Invalidations
The project does **not** use React Query (no dependency, no usage). Equivalent behaviour is implemented with the existing pattern: local refetch + `notificationschange` window event.

## Permission Issues
Backend scope checks (`_ensure_scope`, head-teacher gate on publish/review, enrollment check in `AssessmentService.ensure_student_can_access`) are sound and are kept. Existing business rule retained: a *subject teacher's* test is "pending" until the head teacher approves it; approval is the publication event.

## Current Routes (student)
`/student/dashboard{,/courses,/assessments,/assignments,/materials,/results,/notifications,/profile}`, `/student/courses/:enrollmentId`, `…/materials/:id`, `/student/assessments`, `/student/assignments`, `/student/notifications`, payments. **No** per-test route.

## Current APIs
`/assessments/assessments/` (+`publish`, `review`), `/assessments/student/assessments/` (list/retrieve, `start`, `answer`, `submit`, `submit_assignment`, `history`, `actions`, …), `/sms/notifications/`, `/courses/student/dashboard/{id}/content/`.

## Infrastructure facts
`TIME_ZONE="Asia/Dhaka"`, `USE_TZ=True` (UTC in DB). `celery` is in `requirements.txt` but **not configured** anywhere (no app, no beat). No WebSocket/SSE. Therefore: no fake background reminders; freshness is done by server-synced countdown + refetch at the transition + focus/interval refetch.
