# PostgreSQL / Neon + ImgBB implementation report

Date: 2026-10-02. **Status: implemented and verified against a local PostgreSQL 16 copy of the live MySQL data. NOT yet cut over to Neon and NOT yet tested with a real, valid ImgBB key** (neither credential was available — see "Blocked / not done").

## 1. Previous architecture
Django 5.1/DRF → MySQL 8.0.39 (`expert_coaching`, utf8mb4) via PyMySQL; images stored in `backend/media/`.

## 2. New architecture
Django/DRF → PostgreSQL selected by `DATABASE_URL` (psycopg 3, SSL default for remote hosts, `CONN_MAX_AGE`, health checks). Images → Django → ImgBB (server-side key) → public URL stored in the existing column. PDFs/videos/documents stay on local file storage. With `DATABASE_URL` empty the app still runs on MySQL (rollback path). The live `.env` was **not** changed, so your running dev app (:8000, MySQL) is unaffected.

## 3. Data migrated (local PostgreSQL 16, throwaway instance)
127 tables / all rows copied by `migrate_mysql_to_postgres`; 0 count mismatches, every row compared column-by-column (incl. 10 Bangla/non-ASCII text values, timestamps, password hashes), 0 dangling FKs, 129 sequences reset. Details: `MYSQL_TO_POSTGRES_VALIDATION.md`, baseline `MYSQL_DATA_COUNTS_BEFORE_MIGRATION.md`.

## 4. Migration issues fixed
* `select_for_update()` + `select_related()` on nullable FKs → `of=("self",)` (11 payment/admission tests failed on PostgreSQL before this).
* Case-insensitive email login (was an accident of MySQL collation) → `CaseInsensitiveEmailBackend`.
* ContentType/permission id mismatch, `auto_now` overwrite, sequence reset, wipe ordering with new FK tables → handled in the migration command.
* Raw SQL / `RunSQL` / vendor SQL: none existed.

## 5–6. Neon configuration and exact environment variables
```
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require   # Neon string
DB_CONN_MAX_AGE=30
APP_CONFIG_ENCRYPTION_KEY=<python -c "import secrets;print(secrets.token_urlsafe(48))">
IMGBB_API_KEY=            # optional fallback
LEGACY_MYSQL_NAME/USER/PASSWORD/HOST/PORT   # only while running migrate_mysql_to_postgres
```
Use the direct (non-pooler) Neon host for `migrate`/the data copy.

## 7–8. ImgBB architecture and Admin setup
See `IMGBB_INTEGRATION.md`. Admin → **Integrations** (`/admin/dashboard/integrations`): superuser only; AES/HMAC (Fernet) encrypted at rest, master key in server env, masked display, Test connection, enable/disable/remove, audit trail without secrets.

## 9. Image fields/pages migrated
Admission card/cover/hero (new `<ImageUploader>` in the Admission editor). All other `ImageField`s (user avatar, applicant/student/teacher photos, org logo/favicon, question/option/test images, website banners/stories/teachers/content) and gallery photos (`GalleryItem.file`, image-sniffed; videos stay local) are hosted transparently through the model fields, so their existing upload forms keep working unchanged. Not converted on purpose: study materials, assignment submissions, attachments, syllabus/documents (PDF/video/paid content).

## 10. Security protections
Key never reaches React (verified: not in localStorage/sessionStorage, DOM, any API response, resource URLs or the production bundle; only the env-var *name* appears in help text); sent to ImgBB in the POST body, not the URL; Django-enforced superuser-only (verified 403 for institute-admin staff, teacher, anonymous); real image decoding, per-context size limits, EXIF stripping; ImgBB delete URLs encrypted/never returned; DB outages return a generic 503 (no host/credentials/stack trace); `DATABASE_URL` is not referenced anywhere in frontend source or bundle.

## 11. Files changed
Backend: `config/settings.py`, `config/urls.py`, `requirements.txt`, `.env.example`; models of `accounts, admissions, assessments, courses, organizations, people, website` (field class only); `payments/services.py`, `admissions/services.py` (`of=("self",)`); `core/exceptions.py`; new `core/fields.py`, `accounts/backends.py`, `core/management/commands/{migrate_mysql_to_postgres,migrate_images_to_imgbb}.py`, `integrations/**`, `scripts/{pg_smoke_check,run_pg_dev}.py`. Frontend: `components/common/ImageUploader.jsx`, `pages/admin/Dashboard/website/IntegrationsPage.jsx`, `AdminPortalPages.jsx` (admission images), `DashboardSidebar.jsx`, `AppRoutes.jsx`, i18n (en/bn) `nav.integrations`, `run_pg_dev.cjs`. Misc: `.gitignore` (db_backups, dev URL), `.claude/launch.json` (PostgreSQL verification servers :8001/:5174), docs.

## 12. Models changed
New: `IntegrationSetting`, `MediaAsset`. Existing image columns changed to `HostedImageField`/`HostedMediaField`, which deconstruct as plain `ImageField`/`FileField` → **zero schema change** (`makemigrations --check` clean).

## 13. Migrations created
`integrations/0001_initial` only. No existing migration edited/reset. 86 migrations applied on PostgreSQL, 0 pending.

## 14. Dependencies
Added `psycopg[binary]>=3.2`, `cryptography>=43`, `requests>=2.32`. `PyMySQL` **kept** until you finalise the cutover (also needed by the migration command).

## 15–16. Tests performed and passed
* Full Django suite on **PostgreSQL**: 98 tests OK (payments incl. exactly-one-enrollment/duplicate callback/mock agreement, admissions lifecycle, assessments/MCQ/assignments/results, courses, hr, new integration tests).
* 15 integration tests on SQLite: permissions (403 for non-superuser), encryption + no key in any response or audit log, not-configured/invalid-key/disabled/env-fallback flows, oversize + fake image rejection, model-field → URL storage, legacy local URLs, URL-field validation, gallery photo vs video/pdf routing, DB outage handler.
* Real HTTP against the PostgreSQL-backed API: role access, key save/mask/test/remove/disable; the real ImgBB endpoint rejected a dummy key and the app returned the safe "rejected the configured API key" message; "not configured" and "disabled" messages verified.
* UI (browser, PostgreSQL backend): admin login, Integrations page render (dark theme), save key → "Configured ✓ ••••7X7P", no key leakage.
* Logins on PostgreSQL: Admin, Teacher, Head Teacher, Student succeed (also with differently-cased email); wrong password 401; hashes byte-identical.
* Bangla/emoji/HTML round trip on PostgreSQL; timestamps compared in the row-by-row verification.
* Frontend production build succeeds; `makemigrations --check` clean; `manage.py check` clean.
* Local latency (PostgreSQL on the same machine, dev server): list endpoints ~100–330 ms median; login ~2 s dominated by PBKDF2 (870k iterations), not the database.

## 17. Tests failed / blocked / not done
* **Neon**: no Neon connection string was available → SSL, pooler, region and real latency are untested. Run steps in `MYSQL_TO_POSTGRES_NEON_MIGRATION.md`.
* **Real ImgBB upload** (valid key): not testable → success path (URL returned, image shown after refresh, key rotation) verified only with mocked ImgBB responses. Please run the "Test connection" button and one real upload once you add your key.
* The full browser role walkthrough of Phase 53 (create admission → payment → enrollment → grading in the UI) was **not re-run by hand in the browser** on PostgreSQL; the equivalent flows are covered by the 98 automated tests (payments, enrollment, MCQ attempts, submissions, grading, notifications) on PostgreSQL.
* Two stored accounts in `tested_profiles_credentials.txt` (E2E head teacher/student) have stale passwords — identical on MySQL, unrelated to the migration.
* Student-side `ImageUploader`s for profile photos were not added (those forms still post files to the model, which hosts them).
* Old local images (6 rows, `EXISTING_IMAGE_MIGRATION_PLAN.md`) were not uploaded (as requested).
* Physical "PostgreSQL stopped" test: simulated through the handler unit test only.

## 18. Remaining production risks
1. Neon untested (cold starts after suspend, pooler mode).
2. Unordered paginated querysets (`User`, `Role`, `Assessment`) may paginate inconsistently on PostgreSQL – add explicit ordering.
3. Other unique text columns become case-sensitive on PostgreSQL (e.g. usernames/codes) – only email login was compensated.
4. NULL ordering differs (NULLs last ascending).
5. MySQL is live: data written after the final copy is not migrated – freeze writes at cutover.
6. `check --deploy` still reports hardening items (HSTS, SSL redirect, secure cookies, DEBUG) that depend on your production env; none are database related.
7. ImgBB images are public and cannot be deleted through the API; ImgBB is a third-party SPOF for images (existing images fall back to nothing if ImgBB removes them).
8. `GalleryItem.file` is not a URL column; the hosted URL lives in the file field value (works, but not a separate `*_url` field).

## 19. Production cutover steps
Follow `MYSQL_TO_POSTGRES_NEON_MIGRATION.md` → "Production cutover" (backup, freeze, `migrate`, `migrate_mysql_to_postgres --wipe-target`, `--verify`, `pg_smoke_check`, switch env, `check --deploy`, keep MySQL for rollback).

## 20. Rollback
Unset `DATABASE_URL` and restart (app returns to MySQL, which is untouched). Writes made on PostgreSQL after cutover are not copied back. Restore from `db_backups/mysql_backup_before_postgres.sql` only if MySQL itself is lost.

## Cutover checklist
- [x] MySQL backup created
- [x] MySQL counts recorded
- [x] Schema migrations succeed on PostgreSQL
- [x] Data migration succeeds, counts match, relationships validated
- [x] Authentication works, hashes preserved (Admin / Head Teacher / Teacher / Student)
- [x] Payments, enrollment, MCQ, assignments, results, notifications pass on PostgreSQL (automated)
- [x] Bangla text and timestamps preserved
- [x] ImgBB key encrypted, never reaches React; Admin can configure/replace/test (test with an invalid key verified)
- [x] Production build succeeds
- [ ] Neon DATABASE_URL configured and SSL connection verified
- [ ] Real ImgBB upload verified; existing images re-checked in the browser after cutover
- [ ] Final write-frozen copy against the production MySQL
