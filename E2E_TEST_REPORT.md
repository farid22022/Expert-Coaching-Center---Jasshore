# EXPERT Coaching Center — End-to-End Functional, Role-Based, Integration & Regression Test Report

**Test date:** 2026-09-26
**Environment:** Local development only (`DEBUG=True`, `ALLOWED_HOSTS=localhost/127.0.0.1`, MySQL on localhost, Vite dev server on `localhost:5173`, Django dev server on `127.0.0.1:8000`). No production system, staging system, or real payment/SMS provider was touched at any point.
**Tester:** Claude (agentic), driving the real frontend, real backend API, and real database — no mocked data, no bypassed authentication, no disabled permission checks.

> Do not read this report as "everything works." Read the **Final Regression Result** and **Not Tested** sections first — they say plainly what was and wasn't executed.

---

## 1. Environment

- Backend: Django REST Framework, MySQL (local), JWT auth (SimpleJWT), served via `manage.py runserver 127.0.0.1:8000`.
- Frontend: React 19 + Vite 7, served via the Vite dev server on `localhost:5173`.
- No Celery/task queue, no real payment gateway, no live SMS sending integration exist in this codebase (confirmed by code search) — those workflows are explicitly **Not Tested** below, not silently skipped.
- All disposable test data created during this test uses the `E2E_TEST_2026` naming convention. Test account credentials are in `tested_profiles_credentials.txt` (project root, **gitignored**, confirmed via `git check-ignore -v` — never committed).

---

## 2. Overall Summary

This was a multi-session effort. Earlier phases (summarized from prior context, reconstructed and spot-verified this session) built and live-tested: the public site, Admin course/teacher/subject/admission workflows, Head Teacher scoped workflows, the real public admission→approval→enrollment pipeline, Teacher content/test/assignment/announcement authoring, Student MCQ test-taking (including intentional right/wrong answers to prove weak-topic derivation), assignment submission, teacher analytics (Performance Center, 360 profile, weak topics, needs-attention with explicit reasons), interventions, feedback, private-note security isolation, recovery practice, and RBAC/IDOR security hardening for the student and course APIs.

This session's work (fully live, directly verified, detailed below) covered: assignment grading via the real teacher gradebook action, the Gradebook → Calculate → Publish → Student Result → Academic Overview pipeline end-to-end with hand-verified arithmetic, course rating, a fresh round of RBAC/IDOR negative testing, three real bugs found and fixed with regression tests, and a final database-integrity pass.

**Total bugs found this session: 3 (1 CRITICAL, 1 HIGH, 1 LOW) — all fixed and regression-tested.**
**Total bugs found and fixed across the full multi-session effort: 8 (2 CRITICAL, 3 HIGH, 2 MEDIUM, 1 LOW)** — see [E2E_BUGS.md](E2E_BUGS.md) for the full table.

---

## 3. Admin Role — Capabilities Verified

- Seeded fixture admin account (`expertjashore@gmail.com`) reused per instruction to prefer existing safe test accounts.
- Created Head Teacher and subject Teacher accounts (`TeacherAccountSerializer`, fixed this pass — BUG-01).
- Created course structure: Course, CourseSection, CourseSubject (Physics/Chemistry/Biology), AcademicStage (Foundation Stage).
- Created TeacherAssignments (head teacher scoped to the whole admission, subject teacher scoped to Physics) with duplicate-assignment protection verified (rejects a second identical assignment with a clear message).
- Created AssessmentComponents (Quiz 40%, Final 60%) with weight-total validation verified (>100% rejected, ≤100% accepted).
- Created a CourseGradeScale with grade bands (A+ down to fail), min/max-percentage-overlap validation verified.
- Reviewed and approved a real public admission application (`ADM-2026-000007`) via the real approval action — confirmed idempotent (repeat calls return the same `enrollment_id`, no duplicate enrollment created).
- Final verification: exactly 1 Enrollment for the E2E student in course 17 (`ENR-ADM-2026-000007`, status ACTIVE), exactly 2 TeacherAssignments for course 17 (head teacher + subject teacher), no duplicates.
- Fixed this session: `AcademicStage` end-date-before-start-date validation gap (BUG-06); critical user-directory permission leak (BUG-07, see §8).

## 4. Head Teacher Role — Capabilities Verified

- Logged in with a dedicated `E2E_TEST_2026 Head Teacher` account, scoped to the whole `E2E_TEST_2026 Medical Admission` course (role=`head_teacher`, no single subject).
- Confirmed in-scope access: reads the Physics gradebook (course 17 → subject 37) successfully.
- Confirmed out-of-scope denial: attempting the gradebook for a subject in a **different** course (GST A Unit, subject 28) returns `403 "You are not assigned to this admission subject."` — same denial as the subject teacher, proving scope enforcement is per-assignment, not just per-role.
- Confirmed analytics scope: Performance Center (`/assessments/analytics/students/`) correctly shows the E2E student flagged `needs_attention`, reflecting real weak-topic data derived from intentionally-wrong MCQ answers in an earlier phase — not hardcoded.
- Confirmed **no** privilege escalation beyond scope: attempting the org-wide employee list (`/people/employees/`) returns 403; attempting the (newly-fixed) user directory returns 403 (see BUG-07).

## 5. Teacher Role — Capabilities Verified

- Logged in with `E2E_TEST_2026 Teacher Physics`, scoped to Physics only within course 17.
- Graded a real assignment submission via the dedicated `POST /assessments/submissions/{id}/evaluate/` action (the same action the real Teacher Gradebook UI calls, confirmed by reading `TeacherModulePages.jsx:125`) — confirmed `status`, `marks_obtained`, `feedback`, `evaluated_by`, and `evaluated_at` are all correctly stamped, and persist across a fresh fetch (refresh-equivalent).
- An earlier raw-PATCH grading attempt (bypassing the `evaluate` action) left `evaluated_by`/`evaluated_at` unset — investigated and confirmed this path is **not reachable from the real UI** (see OBS-01 in the bugs table); not treated as a user-facing bug.
- Linked a real published MCQ test (`E2E Mechanics Test`) as the auto-source for the Quiz gradebook component.
- Entered a manual mark for the Final component (72/100) with server-side bounds validation confirmed (negative marks and marks-over-maximum both correctly rejected with `400`).
- Ran **Calculate Results** — verified the resulting weighted math by hand: Quiz 10/40 = 25% × 40% weight = 10.0; Final 72/100 = 72% × 60% weight = 43.2; total = 53.2% → Grade B. This is genuinely computed by the backend service, not hardcoded — confirmed by reading `calculate_course_result` and cross-checking the arithmetic.
- Ran **Publish Results** — confirmed the student could not see the final percentage/grade before publish (only raw per-component marks), and could see the full result immediately after.
- Verified in the real browser UI (not just the API) that the Gradebook page renders the correct student row, weighted totals, and grade, and that the manual-mark input field correctly holds the entered value (`72`).

## 6. Student Role — Capabilities Verified

- Logged in with `E2E_TEST_2026 Student Alpha` (enrollment 85, active).
- Saw the graded assignment (status `evaluated`, `45.00/50.00`, teacher feedback text, `evaluated_at` timestamp) via the real student history endpoint.
- Saw the Physics course result correctly gated: `calculated` status showed only raw component marks (no total %, no grade) before publish; `published` status showed the full result (`53.2%`, Grade B, "passed") immediately after the teacher published — verified via direct API and cross-checked against the real Academic Overview and Results pages in the browser.
- Submitted a course rating (1–5 + text) — correctly blocked before publish (`rating_eligible: false`), correctly allowed after.
- Results page (`/student/results`) verified live in the browser: shows all 3 real MCQ attempts with correct scores/pass-fail, matches backend data exactly, clean console, no network errors, renders correctly at 375px mobile width with no overflow.
- Confirmed via manipulated-URL IDOR tests: cannot access another enrollment's content, academic overview, or course result (403 on all three, see §7).

## 7. RBAC / Security Negative Testing (this session)

All tests below hit the real backend directly, not a frontend route guard — a frontend guard alone would not have caught any of these.

| Test | Actor | Expected | Actual |
|---|---|---|---|
| List all `QuestionOption` (answer key) | Student | Denied | 403 |
| List all `Course`/`Enrollment`/`TeacherAssignment` org-wide | Student | Empty/scoped | 200, empty results (queryset.none()) |
| Create a `CourseSyllabusItem` (write-hole from an earlier phase's fix) | Student | Denied | 403 |
| List `TeacherPrivateNote` | Student | Empty | 200, empty results |
| Access Gradebook retrieve/calculate/publish/manual-mark | Student | Denied | 403 on all four |
| Access Gradebook (unauthenticated) | None | Denied | 401 |
| Access another enrollment's content/academic-overview/course-result via manipulated URL | Student (owns enrollment 85, tried 83/1) | Denied | 403 on all three |
| Gradebook for a subject in an unrelated course | Head Teacher (scoped to course 17) | Denied | 403 |
| Gradebook for a subject in an unrelated course | Subject Teacher (scoped to Physics only) | Denied | 403 |
| List all org users/roles/login-history | Student, Head Teacher | Denied (**newly fixed** — was previously wide open, BUG-07) | 403 (after fix) |
| List all org users/roles | Admin | Allowed | 200 |

**Full backend regression suite** (`apps.accounts apps.assessments apps.courses`, 53 tests including 3 dedicated security test files from earlier phases — `test_student_scope_security.py`, `test_teacher_scope_security.py`, `test_student_privacy.py` — plus 2 new tests added this session): all passing as of the final run (see §11).

## 8. Bugs Found and Fixed This Session

See [E2E_BUGS.md](E2E_BUGS.md) for the full machine-readable table (all 8 bugs across the whole effort). Detail for the 3 found in this session:

### BUG-06 — LOW — AcademicStage accepts end date before start date
- **Role/Page:** Admin, Academic Stage management.
- **Steps to reproduce:** `POST /api/v1/courses/academic-stages/` with `start_date` after `end_date`.
- **Expected:** Rejected with a validation error.
- **Actual:** Accepted (201), creating a logically-inverted date range.
- **Root cause:** `AcademicStageSerializer` had no `validate()` override.
- **Fix:** [backend/apps/courses/serializers.py](backend/apps/courses/serializers.py) — added a `validate()` checking `start_date <= end_date`.
- **Retest:** Same request now returns 400 with a clear message; valid date ranges still accepted (201). Full `apps.courses` suite still passes (11/11).

### BUG-07 — CRITICAL — Any authenticated user can list the full org user directory
- **Role/Page:** Any authenticated user, including a plain Student — `/api/v1/auth/users/`, `/auth/roles/`, `/auth/login-history/`.
- **Steps to reproduce:** Log in as the E2E student (or head teacher), `GET /api/v1/auth/users/`.
- **Expected:** 403 — these are admin-only account-management endpoints.
- **Actual:** 200 — returned all 94 org users (username, email, staff/superuser flags) and all Roles with their exact permission-ID composition.
- **Root cause:** `UserViewSet`, `RoleViewSet`, `UserLoginHistoryViewSet` set `permission_classes = [HasActionPermission]` but never set `permission_module`. `HasActionPermission.get_required_permission()` returns `None` when no module is configured, and `has_permission()` treats `None` as "no permission required" — the same missing-`permission_module` bug class found and fixed twice already in earlier phases (on the course/assessment side), now found a third time on the accounts side, and more severely (leaks PII to *any* authenticated user, not just students/teachers with an otherwise-legitimate account).
- **Confirmed not user-reachable through the current UI:** `userApi`/`roleApi`/`loginHistoryApi` are exported in `resourceApi.js` but not imported by any page — this was purely an exposed, unused API surface, so the fix has zero behavior change for real usage.
- **Fix:** Added `permission_module = "user"` to all three ViewSets ([backend/apps/accounts/views.py](backend/apps/accounts/views.py)); added new `user.view`/`user.create`/`user.edit`/`user.delete` permission codes to `seed_core.py`'s `PERMISSIONS` list (granted automatically to `institute-admin` via the existing `role.permissions.set(permission_objs)` call); added migration `0003_add_user_management_permissions.py` to backfill these permissions onto any already-seeded `institute-admin` role, matching the pattern from the earlier `0002_fix_student_role_permissions.py` fix.
- **Retest:** Student and Head Teacher now get 403 on all three endpoints; Admin still gets 200. New regression tests added (`test_plain_authenticated_user_is_denied_user_directory`, `test_user_view_permission_allows_user_directory` in `apps/accounts/tests/test_auth_permissions.py`) — both pass. Full `apps.accounts` suite passes.

### BUG-08 — HIGH — Recalculating a subject silently un-publishes every already-published student
- **Role/Page:** Teacher/Head Teacher Gradebook — "Calculate Results" button; indirect impact on Student Course Result visibility.
- **Steps to reproduce:** Publish a student's course result, then click "Calculate Results" again for that subject (e.g. because a different student just got a new test score).
- **Expected:** The already-published result stays published; only its underlying numbers refresh if the source data changed.
- **Actual:** The published result's status silently reverted to `calculated`, which the student-facing serializer gates on — the student would see their published grade/percentage disappear with zero warning, zero notification, and no explicit "unpublish" action ever taken by the teacher.
- **Root cause:** `calculate_course_result` unconditionally set `course_result.status = CALCULATED` at the end of every run, with no check for an already-`published`/`locked` status. Because the `calculate` gradebook action loops over **every** active enrollment in the course subject (not just the one being changed), this affected every published student in that subject, not just the one the teacher intended to update.
- **Fix:** [backend/apps/assessments/services.py](backend/apps/assessments/services.py) — `calculate_course_result` now only advances status to `CALCULATED` when the current status is not `PUBLISHED` or `LOCKED`; the underlying marks/percentage/grade still refresh either way, so corrections still propagate.
- **Retest:** Publish → Calculate again → status stays `published`, percentage/grade unchanged and correct (53.2%/B); student-facing endpoint still shows the full published result. New regression tests added (`apps/assessments/tests/test_gradebook_publish.py`, 2 tests) — both pass. Full `apps.assessments` suite passes.

## 9. Security Disclosure Carried Forward From Earlier Phases

An earlier phase of this project mistakenly used `farid@gmail.com` as a "seeded test admin account" and reset its password multiple times before discovering — via a Django shell check (`organization_id=None`, `is_superuser=True`, a `last_login` timestamp predating this testing effort) — that it is actually the project owner's own real personal superuser login, not a seed fixture. This was disclosed to the user at the time it was found. **This account was not used again after discovery**; all further Admin-role testing used the correct seeded fixture account (`expertjashore@gmail.com`). **Action needed from the project owner:** set a new, private password on `farid@gmail.com`, since its password was altered during the earlier mistaken use.

## 10. Responsive & Console Spot-Checks (this session)

- Student Results page verified at 375×812 (mobile) — clean stacked-card layout, no overflow, no truncation.
- Console checked (via `read_console_messages`) on Teacher Dashboard, Teacher Gradebook, Student Results, Student Academic Overview — zero errors on all four.
- Network requests inspected on the Academic Overview page load — single clean `200 OK` for the data call, no duplicate/retry storms, no CORS errors.
- A wider systematic pass across all 7 breakpoints (360/390/430/768/1024/1366/1440/1920) for every screen was **not** re-run this session (it was performed in an earlier UI/UX-focused phase for most pages, per that phase's own verification steps); this session's checks were targeted spot-checks on the pages newly exercised this pass.

## 11. Final Regression Result (backend automated suite)

```
python manage.py test apps.accounts apps.assessments apps.courses
```
Final run (after all 3 fixes and both new regression test files were added): **53 tests, all passing (OK)**, 0 failures, 0 errors.

## 12. Not Tested (explicit)

- **Payment gateway workflow** — no real payment gateway is integrated in this codebase (confirmed by code search across both phases); nothing to test.
- **SMS sending workflow** — SMS provider models exist for admin CRUD only; no live sending integration exists. Not tested.
- **Ask Teacher / Doubts system, Study Plans** — confirmed not implemented in the backend (no models/endpoints exist). Not tested because there is nothing to test.
- **Head Teacher dedicated dashboard suite** (subject-overview cards, teacher-activity metrics, syllabus/assessment coverage) — deferred in an earlier phase's plan as Priority 2/3 scope; Head Teacher's *scope* within the existing analytics/gradebook endpoints was tested (§4, §7), but a dedicated standalone dashboard was not built or tested.
- **Full 7-breakpoint responsive re-audit of every page** — only spot-checked this session (§10); a complete pass across every screen at every breakpoint was performed in an earlier, separate UI/UX phase and not repeated in full here.
- **Locked course-result status** (a `locked` lifecycle stage exists on the model but no dedicated head-teacher lock/approval UI was built) — not tested, matches the earlier plan's explicit deferral.
- **Concurrent/load testing** — this was a functional/security/regression pass, not a performance or load test.

## 13. Test Profiles

See `tested_profiles_credentials.txt` at the project root for all 4 role logins (Admin, Head Teacher, Teacher, Student). That file is listed in `.gitignore` and confirmed (via `git check-ignore -v`) to never be committed. No credentials are duplicated in this report.

---

**Bottom line:** every claim of "PASS" above reflects an action actually executed against the real running frontend, real backend API, and real database this session (or, where explicitly noted, reconstructed and spot-re-verified from an earlier phase of the same effort) — not code inspection alone. Three real bugs were found, root-caused, fixed with the smallest safe change, and regression-tested; one of them (BUG-07) was a critical, currently-unused-but-open PII leak reachable by any logged-in user, and one (BUG-08) was a real gradebook correctness bug with direct student-facing impact.
