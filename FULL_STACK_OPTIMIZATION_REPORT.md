# Full-Stack Optimization Report (2026-10-03)

Numbers are in `PERFORMANCE_BEFORE_AFTER.md`; the starting point is in `PERFORMANCE_OPTIMIZATION_BASELINE.md`.
This document also covers the Neon/Postgres, React and duplicate-request sections that were requested as separate files.

## Root causes (measured)
1. **Connection cost, not PostgreSQL.** Neon (us-east-2) is ~270-390 ms per round trip from the dev machine and a *new*
   TLS connection costs 2.0-2.6 s. Django's dev server handles each request in a new thread, so per-thread persistent
   connections (`CONN_MAX_AGE`) were never reused: every request reconnected. 10 parallel requests averaged 5.2-5.7 s for
   one trivial `COUNT`. Dashboards fire ~10-20 parallel requests, some exceeded `connect_timeout`, returned 503
   (`Database unavailable`) and the browser aborted -> **`Broken pipe`**. PostgreSQL itself is not slow.
2. **N+1 in `CourseSerializer.get_public_syllabus`**: `.filter()` on a prefetched relation bypasses the prefetch cache
   (one query per course). 23 -> 9 queries.
3. **Duplicate frontend requests**: unread count fetched by the bell on `focus` *and* `visibilitychange` *and*
   again by the dashboard; `auth/me` called by 3 layouts + profile; student assessments fetched independently by two
   components with their own timers; admin pages each downloading 4 big lists (100-200 rows) just to show counts.
4. **React Query was not installed** (the app used `useApiResource` + hand-written `useEffect` loaders), so nothing was
   shared or cached.
5. **`ProtectedError` -> HTTP 500** when deleting a Course referenced by an application.

## Changes
### Connection pooling (Phase 3)
- Neon *pooled* endpoint (`-pooler`) was already in use; kept. Added Django 5.1 in-process pool
  (`OPTIONS.pool`, `psycopg[pool]`, env `DB_USE_POOL=1` default, `DB_POOL_MIN_SIZE=4`, `DB_POOL_MAX_SIZE=10`,
  `DB_POOL_TIMEOUT=20`, `DB_POOL_MAX_IDLE=300`). Django requires `CONN_MAX_AGE=0` with pooling, so it is forced to 0 when
  the pool is on; `DB_USE_POOL=0` restores the old behaviour. `DISABLE_SERVER_SIDE_CURSORS=True` for `-pooler` hosts
  (PgBouncer transaction mode). SSL stays `require`. No credentials in code.
- Fresh connect 1.96-2.61 s -> 0.26 s; 10 parallel requests 5.4 s -> 0.72 s avg.

### Backend queries / endpoints
- `apps/courses/serializers.py`: filter prefetched syllabus items in Python.
- `apps/assessments/views.py` (`StudentAssessmentViewSet`): one `Student` lookup per request (was 2), no lazy
  `user.organization` fetch, deterministic ordering (fixes `UnorderedObjectListWarning` / unstable pagination). 5 -> 3 queries.
- New `GET /api/v1/dashboard/admin-stats/` (`apps/core/dashboard.py`): all counters in **one SQL statement**; each counter
  is only computed if the caller has the matching list permission (`application.view`, `employee.view`, `student.view`,
  `course.view`), organization-scoped for non-superusers, 401 when anonymous.
- `apps/admissions/views.py`: added `status__in` filter (all previous filters kept) so "pending" is a server-side 5-row request.

### ProtectedError / archive (Phases 20-22, 62, 69)
- `apps/core/exceptions.py`: `ProtectedError`/`RestrictedError` -> **409** `{code: "RESOURCE_IN_USE", detail, message,
  action: "archive"|null}`; no stack trace. `action` is `archive` only when the model has an `archived` status
  (Course does; reused existing `CourseStatus.ARCHIVED`, no new fields/migrations).
- PROTECT relations were **not** changed to CASCADE. Historical applications remain.
- Frontend (admin admissions): on 409 + `action=archive` a confirm dialog offers **Archive admission**, which PATCHes
  `status=archived, is_published=false`.
- Tests: `apps/core/tests/test_protected_delete_and_stats.py` (409 not 500, archive keeps application, stats use exactly 1
  query, anonymous 401) - 4/4 pass.

### React Query (Phases 5-8, 24, 41-42)
- Installed `@tanstack/react-query`; `QueryClientProvider` in `main.jsx`; `services/queryClient.js` with defaults
  (`staleTime 30 s`, `gcTime 5 min`, `refetchOnWindowFocus false`, retry once and never on 4xx, no mutation retry) and
  per-resource freshness constants (`STALE.reference 10 min`, `list 30 s`, `auth 5 min`, `live 10 s`) plus stable key factories.
- `useAdminData(needs)` rebuilt on `useQuery`: pages request only the lists they render; shared cache; same return shape.
- Admin dashboard uses stats + a 5-row pending query; `signal` passed so navigation cancels obsolete requests.
- `hooks/useStudentAssessments.js`: one cache entry shared by dashboard "Upcoming tests" and the Assessments page, 60 s poll,
  refetch on focus (live tests stay server-authoritative; countdown code untouched).
- `services/notificationsQuery.js`: unread count shared via `fetchQuery` (5 s dedupe window); a notification mutation bypasses it.
- `authApi.me()`: in-flight sharing + 30 s TTL **keyed on the access token** (login/logout/refresh always miss);
  `me({force:true})` available.

## Duplicate request audit (Phase 4, abbreviated)
| Component / route | API | Why duplicated | Fix | Before -> After |
|---|---|---|---|---|
| RoleDashboardShell (all portals) | `sms/notifications/unread_count/` | `focus` + `visibilitychange` + interval each trigger | shared `fetchQuery` (5 s) | 2 per tab switch -> 1 |
| StudentDashboard | same | separate fetch in dashboard effect | same shared fetch | 4+ -> 1 per load |
| 3 layouts + StudentProfile | `auth/me/` | each calls `me()` | token-keyed shared `me()` | 4+ -> 1-2 |
| UpcomingTests + StudentAssessmentsPage | `assessments/student/assessments/?page_size=100` | own effect + interval + focus | `useStudentAssessments` | 1 per component -> 1 shared |
| Admin pages (6 consumers of `useAdminData`) | courses/employees/assignments/applications | every mount refetched all 4 | per-page `needs` + cache | 4 per page -> 1-3, cached 30 s |
| Student dashboard other 9 calls | `courses/student/dashboard/` etc. | StrictMode double effect (dev only) | **not changed** | unchanged |

## Verification actually performed
- Django `check`: clean. Backend tests (SQLite): **89/89 pass** across `core, assessments, courses, admissions, payments,
  messaging` (includes the new protected-delete/stats tests, payment idempotency, bKash, test-notification pipeline).
- `npm run build` succeeds.
- Browser (student session, local PG dev servers): dashboard and Assessments page render and show correct data; no console
  errors after the final code; backend log shows no 5xx and no `Database unavailable` after the pool.

## NOT done / remaining (be explicit)
- **Admin UI not browser-tested** (no admin test credentials in project fixtures; I did not use a real password). Admin changes are covered by API tests + build only.
- Teacher, Head Teacher roles and full E2E regression (Phase 74), payment flow, scheduled-test countdown and MCQ attempt
  flows were **not re-run end to end**; code on those paths was not modified apart from the student assessment list queryset
  (no filtering logic changed, only student lookup caching and ordering).
- Applications/teachers/assignments admin tables still request 100-200 rows and filter in the browser (Phases 14-15, 29);
  needs server pagination UI per table.
- Remaining N+1 candidates not yet audited: teacher/head-teacher dashboards, notification bulk creation (Phase 30), course
  workspace. `courses/courses` still costs 9 queries (3 prefetch levels); a lighter list serializer would cut it further.
- No indexes added: I did not run `EXPLAIN ANALYZE` on slow plans, and dataset sizes (14 courses, 20 applications) don't
  justify any yet. No ANALYZE/VACUUM run.
- Only unread-count/assessments/me/admin lists moved to React Query; many other pages still use `useEffect` loaders.
- Production bundle: main chunk `index-*.js` is ~1.0 MB (319 KB gzip); routes are already lazy; chunk splitting of
  firebase/three not done. Compression, CORS preflight max-age, slow-request logging middleware, and `window.location.reload`
  audit were not done.
- Load test (Phase 64) limited to the 10-parallel DB benchmark above.

## Production recommendations
- Run behind gunicorn (gthread) or uvicorn near the database region; with the pool, a few workers x 10 pooled connections is plenty.
- Host the API in/near **us-east-2** (or move the Neon project to Singapore/Mumbai region nearest users): 270-390 ms per query is the
  floor for every remaining query, so region proximity beats any further tuning.
- Keep `DEBUG=False`, keep `DISABLE_SERVER_SIDE_CURSORS` for the pooler endpoint, and use the unpooled URL only for migrations.

---

# Round 2 (2026-10-03): student dashboard speed + MCQ answer review

## Why the student dashboard was still slow
Measured with a real JWT (`backend/scripts/measure_student.py`, `trace_queries.py`): the dashboard fired 10 parallel calls (about 45-77 queries
in total, each ~0.3 s round trip) and showed nothing until the slowest finished (`Promise.all`); in dev, StrictMode doubled every call.
Four of those calls (`performance`, `unread_count`, `materials`, `recommended`) were stored in state but **never rendered**.

## Fixes
| Area | Change | Effect |
|---|---|---|
| Dashboard loader | `StudentDashboard.jsx` -> independent cached React Query queries; page renders when the 2 core calls (`courses/student/dashboard`, `assessments/dashboard`) return, others fill in | 10 -> 6 requests; each exactly once; revisit within 30 s served from cache; browser: slowest call 2.6 s |
| Auth | `apps/core/authentication.py`: JWT user loaded with `select_related("organization")` | -1 query on nearly every authenticated request |
| Student lookup | `apps/core/request_cache.py::student_for_user` memoized per request, used by student viewsets, content view, notices, course serializer | -1 to -3 queries per student request |
| N+1: `allowed_students` | `AssessmentSerializer(fields="__all__")` queried the M2M per assessment; prefetched in content view and student list | -N queries |
| N+1: `question_count`, `attempt.deadline` | `len(prefetched)` instead of `.count()`; `select_related("assessment")` on attempts | -2N queries on the list |
| `_progress` / content | pass `organization_id` instead of lazy FK; `select_related("assessment")` on attempts | -2 queries |
| Cache correctness | submitting a test invalidates `studentDashboard`, `studentAssessments`, `testReview` | no stale dashboard after a submit |

Measured per endpoint (real JWT, student with 1 enrollment): content 22 -> 19 queries, assessments list 10 -> 8, assessments dashboard 7,
courses dashboard 9 (the user-lookup query counts are +1 under real JWT vs. the earlier `force_authenticate` probes). Remaining queries are
distinct tables doing real work; the next step would be merging endpoints or moving the API near the database region.

## Bug found: other students' targeted tests appeared in course content
`courses/.../content/` did not apply the `allowed_students` filter that `StudentAssessmentViewSet` has, so Sarafat saw another student's
"Practice: My Mistakes" test (title and target ids), clicked Start and got **404** (the log line in your report). Fixed + tests.

## MCQ answer review (new)
- Backend: `GET /api/v1/assessments/student/assessments/{id}/review/` (`AssessmentService`-style builder `attempt_review` in `services.py`).
  Returns per question: text, options with `selected` / `is_correct`, marks obtained, result (`correct|incorrect|unanswered|answered`), explanation.
  Only the requesting student's own submitted attempt (409 if not submitted/no attempt, 401 anonymous). 3 + (constant) queries.
- Release rule: practice tests and closed windows show everything. While a live/scheduled window is open, correct answers / explanations are shown
  only if the teacher enabled `show_correct_answers` / `show_explanations` (separately); otherwise the student sees only their own answers and
  a notice. Correct/incorrect markers are also withheld in that case (they would reveal the answer).
- Frontend: `StudentTestReviewPage.jsx` at `/student/tests/:id/review`; "Review answers" buttons after submit (both runners), on the
  "completed" card, and on every row of the Results page.
- Tests: `test_attempt_review.py` (11 tests: own answer + correct answer + explanation, unanswered, query bound, live-window withholding, teacher flags
  independently, closed window, not-submitted 409, no-attempt 409, anonymous 401, targeted-test visibility).
- Browser-verified as `sarafat`: Results -> Review answers -> question 1 green "Your answer" + "Correct answer", question 2 red "Your answer"
  with the correct option in green.

## Still not done
- Explanation rendering verified by tests only (the seeded E2E questions have no explanation text).
- Teacher/Head-teacher/admin UI not browser-tested; payment/scheduled-test countdown/MCQ-take flows covered by the existing automated tests only.
- `AssessmentSerializer` still exposes the `allowed_students` id list to students; I did not change it (separate privacy cleanup).
