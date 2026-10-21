# Phase 0 — Liquid Future Campus audit

Date: 21 October 2026. Starting branch: version-2; implementation branch: codex/liquid-future-campus. ITJiggasha is read-only. The working tree already contained 356 changed/untracked entries; unrelated changes are excluded from phase commits.

## Architecture and contracts

React 19 / Vite 7 / React Router 7; TanStack Query 5 and Axios; Django REST Framework with organization-aware SimpleJWT authentication. Tailwind 4 + DaisyUI 5 and legacy global CSS. Framer Motion, GSAP, Lucide, Quill and DOMPurify are installed. three128 is already installed, so a procedural scene can use a lazy import without another dependency. No chart package is necessary for small accessible SVG charts. Current test tooling: Django unittest; Playwright fixture-based browser checks in frontend/verify-experience.cjs. No lint script exists at baseline.

Public App/Header/Footer; RoleDashboardShell for student and teacher; DashboardLayout for administration, with aliases under /dashboard and /admin/dashboard. Head teacher operations use existing teacher guards and backend assignment permissions. /result/* uses an independent print layout. Preserve every route in the generated inventory. The shared auth transport lives in services/authApi.js and api.js; public theme preferences live in theme/ThemeProvider.jsx. Student assessments use a shared query cache and a 60-second interval.

Notification targets are built on the backend in assessments/publication.py and messaging services, and consumed by services/notificationTarget.js. ONLINE_TEST_RESULT resolves to /student/tests/:id/result; ONLINE_TEST to /student/tests/:id; assignment targets preserve the stored internal target_url and submission/recheck metadata. External URLs are rejected. These mappings are frozen.

## Findings and priority

| Area | Finding | Impact | Effort | Decision |
|---|---|---|---|---|
| Theme/chrome | Current cream/green presentation differs from requested blue glass; fragmented legacy colors | High | Medium | Central tokens, role accents, solid data surfaces |
| Profile/security | Profile lacks tabs and real device revocation; JWT refresh blacklisting alone does not revoke access | High | High | Add owner-scoped sessions, sid claim, access/refresh checks, compatibility with existing tokens |
| Mobile student | Drawer exists, but no bottom navigation | High | Low | Add existing-route bottom navigation |
| Accessibility | Motion fallback exists; transparency/contrast preferences and 320px need coverage | High | Medium | Solid fallback, contrast media query, focus and target sizing |
| Component kit | Common components exist but no documented primitive entrypoint or dev guide | Medium | Medium | Compose existing modal/editor; add typed JSDoc primitives and dev-only guide |
| Performance | Previous main JS 306KB gzip; synchronous Firebase and legacy admin route imports | High | Medium | Lazy analytics, admin boundary and procedural scene; measure actual build |
| Marks | Existing custom assessments, components, optional subjects and publication engine must remain authoritative | High | Medium | Extend existing entry interaction without changing calculation rules |
| Presence/analytics | No proven presence endpoint; fabricated counts would violate brief | Medium | High | Only expose measured session activity to authorized staff; retain actual analytics |
| Print | Existing verified published cards already function | High | Low | Preserve print renderer; regression test |
| Assets | Current CSS book is decorative but lacks the required illustration family | Medium | Medium | Small original assets and manifest; preserve user-uploaded course imagery |

## ITJiggasha capability decisions

Reviewed LearnerTelemetry.jsx (visibility-aware 30-second heartbeat), motionSettings.js, ConfirmActionModal.jsx, AvatarCropUploader.jsx, and dashboard analytics locations. No ITJiggasha file is modified.

| Candidate | Fit / backend work / risk | Decision |
|---|---|---|
| Live presence | Online learners, requires authenticated organization-scoped endpoint, TTL and throttling; privacy and polling risk | Adapt session activity and visibility throttling; do not claim real-time presence from login counts |
| Analytics widgets | Existing actual KPI feeds; SVG presentation needs no API change | Adapt accessible chart frame; no synthetic business metrics |
| Attempt snapshot | Existing assessment result/publication snapshots already authoritative | Retain; do not mutate historical attempts |
| Practice/bookmarks/progress/history | Existing student routes provide these capabilities | Retain and reskin |
| Result/feedback | Existing result screens and recheck flows | Adapt shared score surfaces |
| Bulk import | Existing teacher builder is draft-first; only import into editable local draft after validation | Adapt validation/preview if existing question fields allow |
| Question reports | New moderation workflow requires backend ownership policy | Skip new workflow; preserve existing feedback/recheck |
| Activity log | Existing UserLoginHistory supports own sign-in timeline; avoid inventing admin event records | Adapt own timeline; retain existing admin reports |
| Appearance | Existing administrator brand/font settings | Retain, map institution brand separately from role chrome |
| Avatar crop | Existing avatar field; needs owner-only multipart endpoint and size validation | Adapt local crop, never reuse Supabase transport |
| Mobile nav | Existing student route destinations | Adapt five-item bottom nav |
| Primitives/motion | Confirm/focus, ListState/ErrorRetry, timings reusable as concepts | Adapt original implementations, existing Modal retained |
| KaTeX/Prism/markdown | Stored Quill HTML is the existing content contract | Skip new renderers; retain sanitization and Bangla fonts |
| Route splitting | Reduces home startup without backend work | Adapt lazy boundaries/vendor chunks after measurement |

## Baseline protocol and limits

The existing 29-check browser suite is running against the previously accepted production build, using intercepted synthetic API responses; this establishes the available UI baseline without sending messages or charging accounts. Django accounts/assessments/custom/multipaper tests run on the application's isolated SQLite test database. Current-source production build will be measured separately. A green synthetic browser test is not proof of a real gateway transaction or carrier delivery.

Protected regression checklist:

- Login and role redirects: browser guard cases + accounts permissions tests.
- Admission apply/payment/enrollment: existing request contracts and payment review screen; no real charge authorized by this redesign.
- Live MCQ: exact deep link, draft/question/options/link/publication transport and server assessment tests.
- Assignments: preserve submit, grade, publish, notify transports; server tests and browser inspection where fixture coverage exists.
- Marks/custom subjects: custom/multipaper backend tests, entry validation and printed result verification.
- SMS: preview only; no paid SMS sent during redesign.
- Result print: preserve neutral A4 renderer and public verification URLs.
- New device sessions: test owner isolation, access and refresh revocation, legacy token compatibility, masking and throttling.

Detailed pass/fail evidence is recorded in REPORT.md; unexecuted production actions remain explicitly marked, never checked off by assumption.
