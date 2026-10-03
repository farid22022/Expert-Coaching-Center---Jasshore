# Performance Optimization Baseline (measured 2026-10-03)

Probe: `backend/scripts/measure_perf.py` (Django APIClient, real Neon DB, GET only, `force_authenticate`).

## Environment
- Backend: Python 3.12.7, Django 5.1, DRF 3.15, psycopg 3 · Frontend: React 19 / Vite 7 / axios
- Database: PostgreSQL 18.6 on Neon, **pooled endpoint** (`-pooler`), region **us-east-2**, `sslmode=require`
- React Query: **not installed** (frontend uses `useApiResource` + hand-written `useEffect` loaders)
- App location: developer PC (Bangladesh) -> internet -> Neon us-east-2

## DB configuration (before)
- `DATABASE_URL` -> pooled host; `DATABASE_URL_UNPOOLED` also present
- `CONN_MAX_AGE=30` (env `DB_CONN_MAX_AGE`), `CONN_HEALTH_CHECKS=True`, SSL required, connect_timeout=10

## Network vs database (Phase 2)
| Measure | Value |
|---|---|
| `SELECT 1` round trip on warm connection | **~300 ms** |
| New connection (TLS + auth) | **~1.96 s** |
Conclusion: PostgreSQL is not slow; each *query* costs one WAN round trip. Latency = (#queries x ~0.3 s) + connect when pool is cold. Only reducing queries/requests and reusing connections helps.

## Baseline per endpoint
| Endpoint | SQL queries | Time | Size |
|---|---:|---:|---:|
| auth/me (admin) | 1 | 860 ms (cold conn) | 0.2 KB |
| applications ?page_size=200 | 2 | 1155 ms | 30.9 KB |
| people/employees teacher ?page_size=100 | 2 | 672 ms | 9.6 KB |
| courses/teacher-assignments ?page_size=200 | 2 | 719 ms | 19.5 KB |
| **courses/courses ?page_size=100** | **23** | **6474 ms** | 22.1 KB |
| student auth/me | 1 | 290 ms | 0.3 KB |
| **student/assessments ?page_size=100** | **5** | **2302 ms** | 0.1 KB |
| sms/notifications ?page_size=5 | 2 | 619 ms | 1.1 KB |

## Frontend request counts
Admin pages call `useAdminData()` (4 requests, 100-200 rows each, just to show counts) on every mount, in 6 components, with no shared cache.
