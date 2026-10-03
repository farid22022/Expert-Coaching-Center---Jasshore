# Test → Notification → Student pipeline: report

Date: 2026-10-02. Baseline audit: [TEST_NOTIFICATION_STUDENT_PIPELINE_STATE.md](TEST_NOTIFICATION_STUDENT_PIPELINE_STATE.md). Event table: [ACADEMIC_NOTIFICATION_MATRIX.md](ACADEMIC_NOTIFICATION_MATRIX.md).

Everything below was run against the real application: Django on `:8000` backed by the Neon database, Vite on `:5173`, demo accounts from `demo-credentials.md`, course "SSC 2027" (15 active enrollments). Artifacts created by the tests are titled `ASTRA …` (assessments 33–37).

## Root Cause
Student notices depended on a single code path: `AssessmentAdminViewSet.perform_create`, fired only when a **head teacher created** a test. The two real publication paths – `AssessmentViewSet.publish` and head-teacher approval via `review` (the only way a subject teacher's test goes live) – created no notification. Additionally: drafts notified, the builder created the test before its questions, every link was the generic `/student/dashboard/assessments`, nothing was idempotent, `allowed_students` was ignored, and there was no route for a single test. Details in the state document.

## Backend Fixes
* `messaging.Notification` (additive migration `0006`): `target_type`, `target_id`, `priority`, `metadata`, `dedupe_key` + unique `(recipient, dedupe_key)`.
* `assessments.Assessment.notified_at` (migration `0014`).
* New `assessments/publication.py` – `TestPublicationService`: `publish`, `notify_published`, `notify_rescheduled`, `notify_cancelled`, `deliver_due`. One recipient query (active enrollment → section → `allowed_students` → user by case-insensitive email), `bulk_create` in batches of 500, `ignore_conflicts` on the dedupe key. Wired into create, `publish`, `review` (approve) and update (draft→published, schedule change, cancel). Existing review gate preserved: only a head teacher publishes; a subject teacher's test is pending until approved, and approval is the publication event.
* New `assessments/student_status.py` – backend-authoritative `student_status` (`UPCOMING`, `STARTING_SOON` (≤15 min), `AVAILABLE_NOW`, `IN_PROGRESS`, `SUBMITTED`, `EXPIRED`, `CANCELLED`, `NOT_AVAILABLE`).
* `StudentAssessmentSerializer`: adds `server_time`, `student_status`, `can_start`, `attempt`, `enrollment_id`, `subject_name`, `teacher_name`, `course_title`, `question_count` (list = 2 extra queries total, not per row). Detail (`retrieve`) also resolves closed/archived tests so an old notification lands on "ended"/"cancelled" instead of 404, and auto-submits an expired in-progress attempt (same as the course workspace already did).
* `deliver_due_test_notifications` management command + a once-a-minute lazy sweep on notification list/unread-count (no worker exists).

## Frontend Fixes
* New route `/student/tests/:assessmentId` (`StudentTestPage`) – details, status badge, countdown, Start/Resume, submitted/ended/cancelled/unavailable states, breadcrumbs, 60 s + focus refetch.
* `StudentTestRunner` = the existing test runner, exported (with `autoStart`); no second MCQ engine.
* `UpcomingTests` component (dashboard) driven by `student_status`; Assessments page sections now come from `student_status` (device clock removed).
* Teacher builder: create as draft → attach questions → `publish`; toast reports how many students were notified. Subject teachers still end up pending review.

## Deep-Link Fixes
`services/notificationTarget.js`: `resolveNotificationTarget` (target_type/target_id first, internal `target_url` second, external/`//`/backslash URLs rejected) and `openNotification` (navigate immediately; mark-read is fire-and-forget so a failed request cannot block navigation). Used by both the bell dropdown and the notifications page (previously a plain `<a href>` full reload / read-only click). Assignment links open the course workspace on the exact item via `?open=assignment:ID` (works on refresh).

## Countdown Fixes
`hooks/useServerCountdown.js`: offset = `server_time − Date.now()` captured with the data; remaining = `starts_at − (Date.now() + offset)`. `onZero` re-asks the backend (it is not authorization); the backend still rejects `start` before `starts_at` and after `ends_at`. Times displayed in `Asia/Dhaka` (override with `VITE_APP_TIME_ZONE`). Digits are `aria-hidden`; a static sentence is exposed to screen readers.

## Query Invalidation Fixes
The project has **no React Query**; none was added. Equivalent behaviour: local refetch, the existing `notificationschange` window event (badge), refetch on focus/visibility and a 60 s interval on the test page, dashboard widget and Assessments page, refetch after submit.

## Student Pipeline Improvements
Done: notification → exact test → countdown → start → submit → result; dashboard "Upcoming and live tests". **Not done in this pass** (see Remaining Issues): dashboard re-ordering, admission-card state redesign, My-Courses card "next lesson/upcoming test", enrollment-aware onboarding notification.

## RBAC
No permission weakened. Verified: unrelated-admission, other-section, inactive-enrollment students get **404** on detail and `start` and no notification; draft not reachable; reading/deleting a notification neither grants nor removes access; a student cannot mark another student's notification read (404); a subject teacher cannot publish (403).

## Performance
Recipients: 1 enrollment query + 1 user query, one `bulk_create`. The old path did a user lookup and an insert per student. Sized for 1,000 students (batched inserts); delivery is isolated in `TestPublicationService` so a worker can be introduced without touching test logic.

## Tests
Automated: `apps/assessments/tests/test_test_notification_pipeline.py` – 13 tests. Full backend suite earlier in this pass: 111 tests OK (before the final response-shape tweak; the assessments package was re-run afterwards – see below). Browser/API E2E (real data):

| # | Check | Result |
|---|---|---|
| 1 | Head teacher builds a **Scheduled** MCQ in the real UI (draft → question → publish) | PASS – 15 notifications, 1 per enrolled student |
| 2 | Student dashboard shows bell badge, announcement, "Starts in 03:22" | PASS |
| 3 | Click notification in bell → exact `/student/tests/33`, read state 2→1, persisted server-side | PASS |
| 4 | Countdown across a hard refresh (02:37 → 02:27 → 02:18) | PASS (no reset) |
| 5 | At start time page flips to "Available now", "Closes in" countdown and **Start Test** with no reload | PASS |
| 6 | Early `start` over the API | PASS – 400 "Assessment has not started yet." |
| 7 | Unrelated student (other admission): GET / start / notifications | PASS – 404 / 404 / 0 |
| 8 | Refresh mid-attempt → "Resume Test", saved answer kept, deadline kept (09:17) | PASS |
| 9 | Submit → 2/2, page shows Submitted + score | PASS |
| 10 | Double publish (twice) | PASS – `notified: 0`, still 15 total, max 1 per student |
| 11 | Normal MCQ published by head teacher | PASS – 15, `MCQ_PUBLISHED`, `/student/tests/34` |
| 12 | Live MCQ created by assigned Physics teacher: teacher publish → 403, 0 notifications; head approval → 15; approve again → 15 | PASS |
| 13 | Reschedule: one `TEST_UPDATED` per student with Dhaka-time text; open page updates to the new time on focus | PASS |
| 14 | Cancel: `TEST_CANCELLED`; page shows "This test has been cancelled." | PASS |
| 15 | Nonexistent test id → "This assessment is no longer available" with CTAs | PASS |
| 16 | Notifications page lists new types; click → exact test; unread count = list | PASS |
| 17 | Assignment notification link `?open=assignment:ID` opens the assignment in the course workspace | PASS |
| 18 | 360 px and 390 px: no horizontal overflow, countdown readable | PASS |
| 19 | Console | PASS (only the expected 404 from #15) |

## Remaining Issues
* **Subject-teacher publish rule**: the spec lists the assigned teacher as able to "publish"; the repository's existing rule (head-teacher approval) was kept deliberately rather than redesigned. A subject teacher's test notifies students when the head teacher approves it.
* **Not built**: timed reminders (no worker), dashboard action-first re-ordering, admission-card pipeline redesign, My-Courses "next lesson/upcoming test" cards, onboarding notification for students who enroll after publication (they *do* see the test in Upcoming/Assessments because visibility never depended on notification history), email/SMS channel hook.
* `attempts_allowed` > 1 is not honored by the engine (`AssessmentAttempt` is unique per student+test) – pre-existing.
* Deleting (soft) a test gives the 404 "no longer available" page, not a "cancelled" notification; cancellation = status `archived`.
* The bell dropdown title text is low-contrast in dark theme (pre-existing).
* E2E artifacts remain in the Neon database (assessments 33–37 and their notifications/attempt for `demo.student04`); delete if unwanted.
* Not run: full admission → payment → enrollment E2E (spec §61); the existing payment tests (in the 111-test suite) still pass and that code path was not touched.
