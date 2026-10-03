# Performance Before / After (measured 2026-10-03)

Probe scripts: `backend/scripts/measure_perf.py` (per-endpoint queries/time/size), `backend/scripts/bench_threads.py`
(threaded DB benchmark), `backend/scripts/show_queries.py` (prints the SQL of one request).
Environment: dev PC (Bangladesh) -> Neon pooled endpoint, us-east-2. `SELECT 1` round trip is **~270-390 ms**, so
**timings swing +/-50% between runs; SQL query counts are the reliable metric.** Time ranges below are min-max over
the runs I did.

## Backend: SQL queries and time

| Endpoint | Queries before | Queries after | Time before | Time after (range) |
|---|---:|---:|---:|---:|
| `GET /courses/courses/?page_size=100` | **23** | **9** | 6474 ms | 2863-5617 ms |
| `GET /assessments/student/assessments/?page_size=100` | **5** | **3** | 2302 ms | 1068 ms (one run; 4376 ms on a noisy run) |
| Admin dashboard counters (was 4 parallel list downloads of 100+100+200+200 rows; total of 23+2+2+2 queries) | **29** | **1** (`GET /dashboard/admin-stats/`) | 6474 ms (slowest of the 4 parallel calls) | 690 ms |
| Admin dashboard "pending applications" (was 200 rows filtered in browser) | 2 (200 rows, 30.9 KB) | 2 (5 rows, 1.5 KB) | 1155 ms | 543-2715 ms (network noise) |
| `auth/me`, applications list, employees list, teacher-assignments | 1-2 | 1-2 (already optimal) | - | unchanged |

## Database connection (the dominant cost)

| Measure | Before | After |
|---|---:|---:|
| New connection to Neon | 1,959-2,611 ms | **257 ms** (pooled) |
| 10 parallel requests (1 trivial query each, new thread per request like `runserver`), avg | **5,210-5,665 ms** (max 7,373) | **723 ms** steady state (1,168 ms in the first, warm-up round); max 1,036 |
| Errors in that benchmark | 0 | 0 |
| Dev log: `Database unavailable` 503s + `Broken pipe` during one dashboard load | many | **none** |

## Frontend: HTTP requests (browser, student dashboard, dev/StrictMode)

| Item | Before | After |
|---|---:|---:|
| `GET /sms/notifications/unread_count/` per dashboard load | 4+ | **1** |
| `GET /auth/me/` per dashboard load | 4+ | **1-2** (30 s token-keyed share) |
| `GET /assessments/student/assessments/?page_size=100` (dashboard "Upcoming tests" + Tests page, own timers) | 1 per component + focus refetches | **1 shared cache entry** (one 60 s poll) |
| Admin dashboard | 5 (me + 4 lists) | 3 (me + stats + 5 pending rows) |
| Admin pages sharing `useAdminData` | each page refetched all 4 lists on every mount | each page fetches only what it renders; repeat visits served from cache for 30 s |

Not measured (so not claimed): admin UI request counts in a browser (no admin test credentials exist in the project
fixtures; verified through API tests instead), production-build request counts (dev StrictMode doubles effects; the
dashboard's other ~9 calls are still doubled in dev).

## Rapid-navigation / Broken pipe test
5 hard page navigations in ~3 s: 6 `Broken pipe` lines, **0 application errors, 0 5xx**, final page rendered correctly.
These are the browser cancelling in-flight requests on a hard navigation (client disconnects), not application failures.
