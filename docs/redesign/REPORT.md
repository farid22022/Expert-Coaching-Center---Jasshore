# Liquid Future Campus implementation report

Implementation branch: `codex/liquid-future-campus`. Work began 21 October and continued 22 October 2026. The reference application ITJiggasha was read-only throughout.

## Outcome and boundary

The existing React/Django application now has a blue, cyan and violet visual system, role-specific dashboard spotlights, bounded glass chrome, a progressive procedural 3D hero, original illustration assets, mobile student navigation, an accessible component guide, owner-scoped profile editing and real device-session revocation. Teacher question import and offline spreadsheet marking enhance the existing domain workflows rather than replace them.

Institution branding, backend authorization, payment gateway semantics, enrollment transitions, assessment publication, notification targets and neutral print rendering remain authoritative. This work did not send production SMS, create charges, change real marks or publish academic records. Synthetic test fixtures are confined to verification scripts.

## Audit and visual direction

See `00-audit.md` for architecture, impact/effort priorities, baseline protocol and ITJiggasha decisions; `route-inventory.md` records the starting route declarations, layouts, styles and shared components. The earlier redesign used ivory and green; v2 adds deep-space navy, indigo/cyan actions, luminous surfaces, soft 3D geometry and a consistent radius/spacing scale.

| Token group | Light | Dark / behavior |
|---|---|---|
| Primary | #4f46e5 | #a5b4fc |
| Secondary | #0e7490 | #67e8f9 |
| Background | #f3f5fc | #080e20 |
| Surface / raised | #ffffff / #eef2fa | #111c32 / #19263f |
| Text / muted | #17223e / #54617c | #eff4ff / #aabbd7 |
| Role accents | Student indigo, teacher teal, head teacher violet, admin amber | Lighter readable equivalents |
| Glass | 8 / 16 / 28px blur tiers, tinted scrim, inner edge | Opaque on mobile, eco mode, reduced transparency, higher contrast or unsupported browsers |
| Radius | 8 / 12 / 16 / 24 / 32px / pill | Shared across themes |
| Motion | 80 / 160 / 240 / 400 / 800ms | System reduction and profile override |
| Depth / z-index | Five elevations, named sticky/dropdown/modal/toast levels | Data tables stay opaque |

Tokens live in `frontend/src/styles/tokens.css`, with Tailwind v4 `@theme inline` mappings. Existing institution `--brand` and `--accent` remain separate from product chrome, preserving administrator branding and printed cards. Existing fonts and administrator font preferences are retained. Bangla fallbacks remain available; font stylesheets now load without blocking the initial document.

## What changed and why

| Area | Implementation | Preserved contract |
|---|---|---|
| Public home | Navy hero, original book/cap poster and procedural WebGL enhancement, cyan CTAs, lazy campus highlights, actual program filtering, new illustration covers | Existing public admission/course API, slugs and enrollment destinations |
| Navigation | Glass desktop header, responsive drawer, keyboard search palette (Ctrl/Cmd+K), account shortcuts, role-aware live pill with server-clock countdown | Existing navigation routes, logout, language, theme and test deep links |
| Student | Urgent live-test spotlight before welcome, actual course/test statistics, five-item mobile bottom nav, polished workspace/results via shared styles | Enrollment guards, attempt timers/submission, stored results and notification routing |
| Teacher | Teal spotlight, solid grading surfaces, sticky actions, accessible creation dialog, staged TSV/JSON import with validation preview | Existing editable question shape and draft → questions → options → link → publish sequence |
| Head teacher | Violet oversight spotlight and academic workspace accents | Existing assignment-based head-teacher guard and backend scopes |
| Admin | Amber/navy control center, refreshed tables/forms/chrome, retained real KPI feeds | Application, payment verification, settings, messaging and institution operations |
| Offline marks | Enter/arrows/Tab navigation, atomic Excel TSV validation, absent/pending support, maximum checks, opt-in debounced autosave, snapshot-aware draft clearing and unsaved-view confirmation | Same save_grid payload grouping, subject/paper selection, online score sync, calculation and publication engine |
| Profile | Overview, Personal info, Security, Devices and Preferences; local avatar crop and owner-only upload; system/light/dark and reduced-motion preference | Existing account identity and student academic/enrollment feed; no role/email escalation via profile API |
| Gallery / recovery | Shared accessible lightbox, lazy dimensioned images, illustrated shared empty/error states and offline indicator | Existing gallery endpoint and content |
| Print | Solid institution-colored result renderer remains independent of glass and scene CSS | Existing A4 cards, QR/public verification, snapshot totals/GPA/positions |

The first public render uses native CSS for small chrome transitions. The full Framer Motion boundary is deferred for non-home routes; learning and staff workflows retain their animation system. Section animations and welcome waves remain decorative. No React state updates occur per animation frame.

## Component kit and imagery

`frontend/src/components/ui/index.jsx` provides composable glass tiers/cards/toolbars; buttons; labelled fields; selects/comboboxes; checkbox/radio/switch; password input; existing sanitized Quill editor; cards/statistics; status badges; keyboard tabs; accordions; modal/drawer/confirm; sidebar/topbar; dropdown/tooltip/toast; alert/retry/empty/skeleton; timeline/progress/ring/countdown; pagination/stepper; file selection/progress; chart frame; responsive table/data-grid; breadcrumbs and print wrapper. Core props have JSDoc contracts; native form semantics and the existing shared focus-trapped Modal are reused.

The `/dev/ui` route exists only in Vite development. Its examples include Bangla fields, statuses, rich editor, modal/focus behavior, dark mode, progress, tables and recovery. Dense academic grids remain horizontally scrollable with their controls intact; the new general-purpose table primitive becomes labelled cards at narrow widths.

26 original SVG assets are delivered under `frontend/public/images/campus/`, including hero, covers, role welcomes, empty/error states, waiting/payment art and print ornament. Every vector is below 6KB. A callable image generator was unavailable during this turn, so the brief's SVG fallback was used. Raster AVIF/WebP/PNG duplicates would be larger and are unnecessary for these vector assets. Exact regeneration descriptions and sizes are in `image-manifest.md`; `frontend/scripts/generate-campus-assets.cjs` regenerates the family. Existing user photographs are not replaced.

## Wave and 3D budget

- `LiveWaveBackground` starts with an SVG poster and defers its Canvas 2D renderer until idle. Mobile uses the poster. Desktop uses bounded geometry and a ≤1.5 pixel ratio, pauses offscreen or when the tab is hidden, and respects motion overrides, data saving and low-core/low-memory devices.
- `HeroScene` imports the already-installed `three128` after idle. Geometry is procedural; no GLB asset download. It pauses offscreen/hidden, clamps DPR, handles unavailable/lost WebGL with the poster and disposes its resources/listeners on unmount. Mobile and low-power users retain the complete static composition.
- Direct Three.js was chosen over adding R3F/drei because the scene needs no React-driven object graph. The existing Three chunk is about 154KB gzip, loaded outside the initial bundle. Refraction was optional and was omitted to protect readability and GPU cost.
- Glass is limited to chrome and highlights; rows, long lists and marksheets do not receive backdrop filters. Higher contrast/transparency preferences force opaque surfaces.

## ITJiggasha adaptations

| Pattern | Decision |
|---|---|
| Motion timings, confirmation/focus patterns, mobile navigation | Adapted to existing React/Django routes and shared Modal |
| Avatar crop | Adapted locally with preview/zoom/position and Django multipart ownership checks |
| Bulk question import | Adapted stage → validate → editable draft → existing publication |
| Analytics | Existing actual student activity and staff KPI feeds retained; chart frame added without synthetic metrics |
| Practice/bookmarks/progress/history | Existing student modules retained and reskinned |
| Attempt snapshots | Existing backend result/publication snapshots retained; historical attempts are not rewritten |
| Presence | A five-minute security activity stamp is not a real-time learner-presence feed. A new staff presence counter was skipped rather than mislabel session counts or expose learners outside assigned course scopes. |
| Question reports/global administrative event log | New moderation/event-storage workflows skipped; existing feedback, rechecks, result audit history and own sign-in history remain available. |
| KaTeX/Prism/Markdown replacement | Skipped: stored Quill HTML and sanitization are the existing content contract. |

## Additive backend/API changes

Migration `accounts.0005_device_sessions` adds UserSession and SessionPolicy. It has been applied to the local development database. Deployments must apply the migration before serving the updated authentication code.

| Endpoint | Method | Scope / behavior |
|---|---|---|
| /api/v1/auth/me/sessions/ | GET | Own active managed devices and own recent masked sign-ins only |
| Same | POST | Authenticated legacy-token upgrade using an own valid refresh token; returns a managed pair |
| Same?others=true | DELETE | Revokes other managed sessions and preexisting unmanaged JWTs; current managed session survives |
| /api/v1/auth/me/sessions/:uuid/ | DELETE | Owner-scoped revocation; invalidates both access and refresh |
| /api/v1/auth/me/profile/ | PATCH | Only own first_name, last_name and phone |
| /api/v1/auth/me/password/ | POST | Current-password verification, server password validation, device sign-out |
| /api/v1/auth/me/avatar/ | POST multipart | Own validated image; JPEG/PNG/WebP, size/dimension limits |

Login response keys are unchanged; tokens gain an opaque `sid`. Existing JWTs continue working until explicitly revoked and can upgrade on the Devices tab. Legacy clients cannot enumerate historical bearer tokens as devices; the UI states that limitation, and signing out all other devices also rejects old unmanaged tokens. Device metadata never stores raw tokens or raw IPs. Access checks update activity at most once per five minutes. Concurrent legacy upgrades are coalesced by the frontend.

Device records inactive for 90 days are removed on subsequent login. Run `python manage.py purge_device_sessions` daily in the deployment scheduler for global retention of abandoned records; no scheduler or recurring job was created silently. Approximate geolocation and two-step verification are not fabricated or added.

## Verification evidence

| Check | Evidence |
|---|---|
| Pre-change browser baseline | 29 fixture-based checks passed |
| Baseline backend domains | 149 accounts/assessments/custom/multipaper tests passed on isolated SQLite; 200-student calculation reported 0.531s / 19 queries |
| Session implementation | 11 new security tests passed; full 17-account suite then passed, including existing account permission tests |
| Domain validation | 17 checks passed: paste matrices, absent/zero/max/overflow/online locks, Bangla import, malformed input and escaped markup |
| Component guide | 5 browser checks passed: select/Bangla labeling, keyboard tabs, dialog Escape/focus return, light/dark, reduced transparency and contrast |
| Build | Production build passes; final artifact/evidence paths below |
| Lint | Task-scoped ESLint command passes. The repository had no lint script at baseline; this does not claim a cleanup of all legacy source. |
| Academic print | Existing renderer and verified snapshot contract retained; no result calculation/print logic changed |

Browser acceptance, screenshots and Lighthouse JSON are in `qa-artifacts/campus/`. Browser cases use explicit synthetic API interception. Live-money transactions, carrier delivery and destructive academic corrections were not executed. Payment review and existing transports are protected without claiming a new production payment or SMS delivery.

### Performance measurements

Previous accepted design: main JS about 306KB gzip. First v2 production build: about 248KB. Further route/analytics splitting and chrome work reduce it further; final sizes and Lighthouse scores are recorded in the JSON artifacts. The Three scene is a separate ~154KB gzip chunk; Canvas renderer is a small separate chunk. Font loading is nonblocking and analytics begins after engagement or a delayed timer.

First mobile Lighthouse run scored performance 47, accessibility 100, best practices 96, CLS 0. A subsequent run after font/mobile-wave changes scored performance 51, accessibility 100, best practices 96; LCP improved from 5.5s to 4.6s. These runs motivated further animation-runtime splitting. Lab results are not real-user INP; no field INP claim is made. Unmet final budgets, if any, are listed explicitly in the final acceptance note rather than marked passed by assumption.

## Packages and files

Runtime packages added/removed: none. Existing Three.js, Framer Motion, Lucide, Quill, React Query and Django JWT are reused. Development-only additions: ESLint, @eslint/js and eslint-plugin-react (158 transitive packages installed, zero production-bundle cost), to add the missing lint gate. Lighthouse was run through a temporary npm execution environment, not added as a production dependency.

New source: styles/tokens.css, styles/campus.css, motion/presets.js; components/ui/index.jsx; components/profile/*; components/experience/{HeroScene,LiveWaveBackground,LiveTestSpotlight,StudentBottomNav,ConnectivityNotice,QuestionImport,SearchPalette,ChromeMotion,MotionBoundary}.jsx; hooks/useMarkGrid.js; services/{markGrid,questionImport,sessionApi}.js; pages/dev/StyleGuide.jsx; pages/HomeSections.jsx; routes/AdminRoutes.jsx; public/images/campus/*.

Updated integrations: index.html; main.jsx; App.jsx; common/{LearningHomeHero,EmptyState,ErrorBoundary,StudentProfile,ThemeToggle,LanguageSwitcher,motionVariants}; layout/{Header,Footer,RoleDashboardShell}; Home; SearchPage; GalleryPages; StudentDashboardView; StudentProfilePage; TeacherBuilders; AcademicAssessmentMarks; theme/ThemeProvider; routes/AppRoutes. Tooling: package/package-lock, eslint.config.mjs, verification scripts and asset/route preparation scripts. Backend: accounts models/serializers/views/urls, session modules/migration/tests/retention command and core authentication.

## Rollout and remaining limits

1. Apply the additive accounts migration before updated API code.
2. Build frontend; preview role flows and review `qa-artifacts/campus`.
3. Run the documented daily retention command in the deployment's scheduler.
4. Existing users can visit Devices to upgrade their current legacy session; future logins are managed automatically.
5. The repository started with extensive unrelated uncommitted work. Phase commits contain the audit, tokens, sessions, new primitives and illustrations. Integration edits in already-dirty files remain reviewable in the shared working tree; unrelated backend/domain changes and deleted files were not swept into redesign commits.

The complete wish list includes capabilities beyond a visual upgrade. New global presence/moderation/event systems were deliberately not fabricated. Exact production gateway/SMS outcomes and real-user performance remain external verification work. Static fallback is a supported experience, including mobile, low power and reduced motion.

## Latest public-surface update

The public gallery now has live search, featured filtering, result counts, richer metadata, and a shared lightbox path. The hero is full-width with square corners and a larger responsive wave mesh; the footer carries the same mesh language. Theme preferences now support Campus blue, Heritage green/yellow/white, and Sunrise terracotta/gold palettes, persisted per user alongside light/dark and motion preferences. These controls are available from the shared theme toggle and are applied through document-level tokens.

## Recommendations

Prioritize a real-time student progress surface, teacher intervention queue, and assessment result delivery timeline. These are bounded additions to existing contracts: they can reuse current enrollments, marks, notifications, and session ownership while keeping publication and payment authorization on the backend. Add presence and moderation only after the product has explicit retention rules and role permissions. Before production rollout, run Lighthouse on the deployed origin with real media, add field telemetry for LCP/INP/CLS, and split the remaining large editor/three chunks by route.
