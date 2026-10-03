# Academic notification event matrix

Notification = awareness + navigation. Access to a test/assignment/result is always decided by the authenticated student's **active enrollment + course/section scope + `allowed_students` + publish/schedule window + attempt rules**, enforced in the backend. Deleting or never receiving a notification removes no access.

`✅` = implemented and exercised in this pass. `➖` = existing behaviour, not changed. `⏳` = not implemented here.

| Event | Created by | Recipients | `notification_type` | Deep link (`target_type`/`target_id`) | Priority | State |
|---|---|---|---|---|---|---|
| Normal / practice MCQ published | Head teacher (publish), or subject teacher after head-teacher approval | Active enrollments of the course (section-matched; `allowed_students` if set) | `MCQ_PUBLISHED` | `/student/tests/:id` (`ONLINE_TEST`) | normal | ✅ |
| Live MCQ published | same | same | `LIVE_TEST_PUBLISHED` | `/student/tests/:id` | urgent | ✅ |
| Scheduled MCQ/test published | same | same | `SCHEDULED_TEST_PUBLISHED` | `/student/tests/:id` | important | ✅ |
| Online test (`exam`) published | same | same | by `timing_mode` (above) | `/student/tests/:id` | by `timing_mode` | ✅ |
| Test rescheduled (`starts_at` changed on a published test) | Head teacher edit | same | `TEST_UPDATED` | `/student/tests/:id` | important | ✅ once per distinct new start time |
| Test cancelled (published → `archived`) | Head teacher edit | same | `TEST_CANCELLED` | `/student/tests/:id` (page shows "This test has been cancelled.") | important | ✅ |
| Assignment published | same publish path | same | `ASSIGNMENT_PUBLISHED` | `/student/courses/:enrollmentId?open=assignment:ID` (`ASSIGNMENT`) | important | ✅ |
| Future-dated publication (`publish_at` later) | system sweep | same, once `publish_at` passes | the matching `*_PUBLISHED` | same | same | ✅ (`deliver_due`, idempotent) |
| Draft saved / edited, pending review | — | **nobody** | — | — | — | ✅ (asserted) |
| Test "starting soon" / "started" reminders | — | — | `TEST_STARTING_SOON` / `TEST_STARTED` | — | — | ⏳ not built: `celery` is listed in requirements but not configured and there is no worker/beat. The live countdown + `STARTING_SOON` state on the test page and dashboard cover this without a fake scheduler. |
| Assignment graded | Teacher grading | The student | `assignment_graded` | existing `target_url` | — | ➖ existing |
| Result published | Gradebook publish | The student | existing | existing | — | ➖ existing |
| Teacher feedback | Teacher | The student | existing | existing | — | ➖ existing |
| Payment required / verified, Enrollment activated | `payments` + `admissions` services | The applicant | existing | existing | — | ➖ existing, not modified |
| Question answered / announcements | — | — | — | — | — | ⏳ not part of this pass |

## Idempotency
`Notification.dedupe_key` (unique per recipient): `assessment:{id}:published`, `assessment:{id}:resched:{unix start}`, `assessment:{id}:cancelled`. `bulk_create(..., ignore_conflicts=True)` makes a double click / retry / publish-then-approve harmless.

## Structured target
`target_type`, `target_id`, `target_url` (internal path only), `priority`, `metadata` (`admission_id`, `subject_id`, `subject_name`, `test_title`, `test_type`, `timing_mode`, `starts_at`, `ends_at`, `enrollment_id`). The frontend (`services/notificationTarget.js`) follows `target_type`/`target_id` first, then `target_url` only if it is an internal path; anything else is ignored.
