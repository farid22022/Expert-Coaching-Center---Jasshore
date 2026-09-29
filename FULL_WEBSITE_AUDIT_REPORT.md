# Production-readiness audit — 2026-09-27

Status: IN PROGRESS. This is an evidence log, not production certification.

## Baseline and architecture

Existing staged and unstaged work on main was preserved. Exact baseline: `audit/baseline-git-status.txt` and `audit/baseline-branch.txt`. No reset, clean, deployment, dependency upgrade, or migration was performed in this pass.

React 19 / React Router 7 / Vite frontend; Axios with JWT in browser storage; local React state (no TanStack Query). Tailwind 4 / DaisyUI, Framer Motion and GSAP, Lucide, React Quill, DOMPurify, SweetAlert2. Django 5.1 / DRF / SimpleJWT backend; local MySQL, isolated SQLite for tests. Redis and Celery are dependencies; no running worker/broker validation has been completed. Firebase hosting includes SPA rewrites. Local API defaults to port 8000.

Source inventories: `audit/route-inventory.json` (148 literal route declarations, includes relative nested paths; not an exhaustive expansion of generated routes), `audit/endpoint-inventory.json`, `audit/backend-test-inventory.json`.

Data flow: route -> component/local React state -> resourceApi/api Axios -> Django router/ViewSet -> permissions and scope helpers -> serializer -> assessment/admission/course services -> models -> database. Head teachers are teacher accounts with head-teacher assignments, not a separate login role. Admission form builder remains the existing authoritative configuration.

## Verified so far

- Baseline: 61 backend tests PASS.
- After backend changes: 64 backend tests PASS, 338.738 seconds (`audit/backend-final.txt`). Includes existing admission, assignment, gradebook, MCQ, privacy and scope suites, plus three new regression tests.
- Six frontend session tests PASS (`audit/frontend-tests.txt`).
- Production builds PASS before and after portal splitting, and after SVG integration (`audit/build-svg.txt`).
- Browser: homepage crash reproduced and fixed; initial fallback slide collection changed length after backend banner response. Homepage renders after reload.
- Student demo account signs in, survives refresh, and logs out. Earlier E2E student credentials are rejected; current demo.student01 fixture works.
- Student routes inspected with loaded data: dashboard, courses, assessments, assignments, materials, results, actions, progress, feedback, notifications, profile, course player. These are page checks, not full CRUD coverage for every module.
- Browser MCQ: explicit start -> select answer -> wait for save -> reload -> resume -> same selected answer and reduced remaining time -> submit -> success -> course progress reaches 100% -> results shows new test. Test used the existing demo student; it created/submitted test attempts only for that account. A previously automatically started demo attempt expired during interruptions.
- Browser results average now 65% for scores 95%, 0%, 100%; formerly raw average marks were labeled percent.
- Teacher demo account signs in; dashboard and six content/gradebook routes load. This account is subject teacher for GST A Unit and head teacher for SSC 2027.
- Head-teacher section form reproduced empty lookup failure. Permitted course dropdown restored by independent lookup handling. Save workflow remains under investigation.

## Implemented changes

See BUG_FIX_REPORT.md for bugs and retest limitations; PERFORMANCE_OPTIMIZATION_REPORT.md for measurements; ROLE_TEST_MATRIX.md for role coverage.

- Single shared token refresh per tab, rotated refresh persistence, terminal invalid-session cleanup, transient-error preservation, request timeout, auth endpoint exclusion and logout-in-flight guard.
- Logout completes locally even when server sign-out fails.
- Portal layouts wait for server role verification before rendering protected children.
- Route error boundary with recovery action; lazy portal pages and loading fallback.
- Safe carousel index for asynchronously changing image lists; reduced-motion pauses auto-rotation.
- Admission status no longer fabricates Demo Applicant; input matching and failure feedback. Anonymous lookup is still blocked by existing API permissions; no permission bypass added.
- Notification badge refresh on mutations, focus/visibility and a one-minute foreground cadence; dropdown reloads on opening.
- Academic lookup failure isolation and submit disabling, persistent save errors.
- MCQ explicit start/resume, persisted selections, deadline-based clock, state isolation per test, save-before-submit protection, failed-answer rollback and formatted question rendering.
- Separate average_percentage API field; raw average_score contract retained. Three aggregate queries verified by regression test.
- Shared modal keyboard trapping, Escape, focus restoration and scroll lock (browser keyboard coverage still incomplete).
- SVGs from public/expertjasshore mapped to relevant shared page headers, student page headers, login, registration, teacher dashboard and test instructions. No new illustration library. Decorative SVGs have empty alt, fixed dimensions and lazy decoding/loading.

## Remaining scope and risks

Full route-by-route audit, every role CRUD workflow, multi-tab session races, admin form-builder cross-role scenario, network-failure simulation, all responsive widths, full accessibility audit and final visual modernization remain incomplete. Do not infer that existing backend tests prove complete browser coverage.

Known pre-existing issues requiring follow-up: public contact form claims success without a backend request; forgot-password link lacks a confirmed recovery implementation; legacy mock/public placeholder modules remain; results list uses assessment IDs and a hardcoded pass threshold; some lookup endpoints are not accessible to teacher roles; notification deep-link/empty/error UX is incomplete; pagination warnings for User, Role and Assessment; main bundle remains above 500 KB; head-teacher course dropdown includes non-managed courses even though writes should be scoped.

External SMS, email, payment providers and production deployment were not exercised. Database migrations and indexes were not changed. No claim of complete production readiness or complete UI redesign is made.
# Continuation status — 2026-09-27

Added scheduled subject weeks/chapters, teacher content associations, release gates, refreshed homepage assets, and shared admin styling/motion. See BUG_FIX_REPORT.md and PERFORMANCE_OPTIMIZATION_REPORT.md for scope and limitations. Six session tests pass; the earlier full backend suite passed 69 tests. Final build/backend rerun stalled and were stopped without a result. Authenticated browser QA and the teacher weekly form save still require verification. This audit remains incomplete.

