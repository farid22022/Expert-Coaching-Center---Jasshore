# MySQL → PostgreSQL (Neon) migration guide

## Old architecture
Django 5.1 + DRF → MySQL 8 (`expert_coaching`, utf8mb4) through PyMySQL (`install_as_MySQLdb`). Config from `DB_*` variables.

## New architecture
Django/DRF → PostgreSQL (`django.db.backends.postgresql`, psycopg 3) selected **only by `DATABASE_URL`**. Works unchanged against local PostgreSQL and Neon. If `DATABASE_URL` is empty the app still starts on the old MySQL settings, which is the rollback path until you decide to remove it.

| Piece | Where |
|---|---|
| URL parsing, SSL default for non-local hosts, `CONN_MAX_AGE`, health checks | `backend/config/settings.py` (`_database_from_url`) |
| Dependencies | `backend/requirements.txt`: `psycopg[binary]`, `cryptography`, `requests` added; `PyMySQL` kept until final cutover |
| Data copy + verification | `python manage.py migrate_mysql_to_postgres` |
| Smoke check | `backend/scripts/pg_smoke_check.py` |

## Environment variables

```
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
DB_CONN_MAX_AGE=30
APP_CONFIG_ENCRYPTION_KEY=<random secret>
IMGBB_API_KEY=            # optional fallback
# migration only:
LEGACY_MYSQL_NAME= LEGACY_MYSQL_USER= LEGACY_MYSQL_PASSWORD= LEGACY_MYSQL_HOST= LEGACY_MYSQL_PORT=
```

Never put these in the frontend, in `VITE_*`, or in Git (`backend/.env` is git-ignored; `.env.example` has placeholders only).

### Neon notes
* Use the connection string from the Neon console. `sslmode=require` is added automatically for non-local hosts if missing; `channel_binding=require` in the URL is passed through.
* **Pooled vs direct:** use the **direct** (non-`-pooler`) host for `migrate` and `migrate_mysql_to_postgres` (long transactions, `SET CONSTRAINTS`). For runtime web traffic either works; with the `-pooler` (PgBouncer transaction mode) host set `DB_CONN_MAX_AGE=0` or keep 30 — server-side cursors are not used by this project.
* `CONN_HEALTH_CHECKS=True` drops connections Neon closed while the compute was suspended (cold start can add ~1 s to the first request).
* Pick the Neon region closest to the app server; measure before blaming the database.
* Manage the DB with the Neon SQL Editor, pgAdmin, DBeaver or `psql` (phpMyAdmin cannot).

## Migration process (what was actually done and how to repeat it)

1. **Backup (read-only).** `mysqldump --single-transaction --routines --triggers --default-character-set=utf8mb4 expert_coaching > db_backups/mysql_backup_before_postgres.sql`. The original MySQL DB is never modified.
2. **Schema.** Create an empty PostgreSQL DB (Neon branch) and run `python manage.py migrate`. All existing migrations ran unmodified (no `RunSQL`, no vendor SQL). History is preserved; nothing was reset.
3. **Data.** With both `DATABASE_URL` and `LEGACY_MYSQL_*` set:
   ```
   python manage.py migrate_mysql_to_postgres --dry-run                 # counts only
   python manage.py migrate_mysql_to_postgres --wipe-target             # copy (single transaction)
   python manage.py migrate_mysql_to_postgres --verify --report ../MYSQL_TO_POSTGRES_VALIDATION.md
   ```
   * Walks every managed model (incl. auto M2M tables) in FK-dependency order; one transaction with `SET CONSTRAINTS ALL DEFERRED`.
   * Copies PKs, FK ids, password hashes and `created_at/updated_at` verbatim (`auto_now*` is switched off during the copy).
   * Replaces `ContentType`/`auth_permission` rows created by `migrate` with the legacy rows so every FK keeps pointing at the same id.
   * Resets all identity sequences afterwards.
   * Restartable: without `--wipe-target` it only inserts missing PKs. Tables that did not exist in MySQL (new `integrations_*`) are skipped.
   * `--verify` compares every column of every row (datetimes normalised to UTC, Decimals, JSON, text incl. Bangla) and checks that no FK dangles.
4. **Compatibility fixes** found by running the whole test suite on PostgreSQL (see the implementation report).
5. **Smoke check:** `python scripts/pg_smoke_check.py` (sequences ahead of max(id), logins incl. wrong-case email, Unicode round trip).

## Validation results (local PostgreSQL 16 instance, copy of the live MySQL data)
See [MYSQL_TO_POSTGRES_VALIDATION.md](MYSQL_TO_POSTGRES_VALIDATION.md): per-model counts, every row compared, 0 dangling FKs. 129 identity sequences all ahead of `max(id)`. Password hashes are byte-identical (checked row-by-row; login succeeds with the original passwords). Full Django suite (96 tests) green on PostgreSQL.

## Production cutover
1. Create the Neon project/branch (direct URL for the migration). Set `APP_CONFIG_ENCRYPTION_KEY` on the server.
2. Put the app in maintenance mode / stop writes to MySQL (it is a live database).
3. Take a fresh `mysqldump` (step 1) and record counts (`MYSQL_DATA_COUNTS_BEFORE_MIGRATION.md` is a snapshot, not the final).
4. `DATABASE_URL=<neon direct> python manage.py migrate`.
5. Run `migrate_mysql_to_postgres --wipe-target` then `--verify`. Stop if either reports a problem.
6. `python scripts/pg_smoke_check.py`, then log in as Admin, Head Teacher, Teacher, Student and open a payment receipt, a result and a Bangla page.
7. Switch the server env to `DATABASE_URL=<neon pooled or direct>`, remove `DB_*` and `LEGACY_MYSQL_*` from production, restart, run `manage.py check --deploy`.
8. Keep the MySQL server and the dump untouched for the rollback window (suggest ≥ 2 weeks).
9. Only then: remove `PyMySQL` from `requirements.txt` and the MySQL fallback block from `settings.py`.

## Rollback
Before step 7 nothing changed for users — just stop. After cutover: unset `DATABASE_URL` (the app returns to MySQL). Any rows written to PostgreSQL after cutover are **not** copied back; either accept losing them or replay manually from Neon (use point-in-time restore/branch to export). Hence the write-freeze in step 2 and a short, supervised window.

## Backups on Neon
Use Neon's branching / point-in-time restore plus periodic `pg_dump` to storage you control.
