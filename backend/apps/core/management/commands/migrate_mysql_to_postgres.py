"""Copy every row from the legacy MySQL database into the PostgreSQL (default) database.

Run only with LEGACY_MYSQL_NAME (+ credentials) and DATABASE_URL set, after
`manage.py migrate` has built the PostgreSQL schema:

    python manage.py migrate_mysql_to_postgres --dry-run
    python manage.py migrate_mysql_to_postgres            # copy (restartable)
    python manage.py migrate_mysql_to_postgres --verify   # row-by-row comparison

Primary keys, foreign keys, password hashes and created_at/updated_at values are copied verbatim.
The legacy database is only ever read.
"""
import datetime
import decimal
import graphlib
import json
import time
import uuid

from django.apps import apps
from django.contrib.auth.models import Permission as AuthPermission
from django.contrib.contenttypes.models import ContentType
from django.core.management import BaseCommand, CommandError
from django.core.management.color import no_style
from django.db import connections, models, transaction

LEGACY = "legacy_mysql"
TARGET = "default"
# Created by post_migrate with fresh ids; replaced by the legacy rows so FKs keep pointing correctly.
REPLACE_FIRST = (AuthPermission, ContentType)
BATCH = 1000


def _norm(value):
    """Normalise values so MySQL- and PostgreSQL-read rows compare equal."""
    if isinstance(value, datetime.datetime):
        return value.astimezone(datetime.timezone.utc).replace(microsecond=value.microsecond).isoformat() if value.tzinfo else value.isoformat()
    if isinstance(value, decimal.Decimal):
        return format(value.normalize(), "f")
    if isinstance(value, uuid.UUID):
        return str(value)
    if isinstance(value, (dict, list)):
        return json.dumps(value, sort_keys=True, ensure_ascii=False)
    if isinstance(value, memoryview):
        return bytes(value).hex()
    if isinstance(value, bytes):
        return value.hex()
    return value


class Command(BaseCommand):
    help = "Migrate all data from legacy MySQL to PostgreSQL preserving ids, relations, hashes and timestamps."

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true", help="Only compare counts; write nothing.")
        parser.add_argument("--verify", action="store_true", help="Compare every row between both databases.")
        parser.add_argument("--wipe-target", action="store_true", help="Empty target tables first (use for a clean re-run).")
        parser.add_argument("--report", default="", help="Write a markdown count/validation report to this path.")

    # ------------------------------------------------------------------ helpers
    def _models(self, only_legacy=True):
        found = [m for m in apps.get_models(include_auto_created=True) if m._meta.managed and not m._meta.proxy]
        by_table = {m._meta.db_table: m for m in found}
        sorter = graphlib.TopologicalSorter()
        for model in found:
            deps = set()
            for f in model._meta.concrete_fields:
                if f.remote_field and f.remote_field.model is not model:
                    target = f.remote_field.model._meta
                    if target.db_table in by_table:
                        deps.add(target.db_table)
            sorter.add(model._meta.db_table, *deps)
        try:
            order = list(sorter.static_order())
        except graphlib.CycleError:
            order = sorted(by_table)
        # Tables created after the MySQL snapshot (e.g. integrations) have nothing to copy.
        legacy_tables = set(connections[LEGACY].introspection.table_names())
        return [by_table[t] for t in order if t in by_table and (t in legacy_tables or not only_legacy)]

    def _rows(self, model, using):
        names = [f.attname for f in model._meta.concrete_fields]
        return model._base_manager.using(using).order_by("pk").values(*names)

    # ------------------------------------------------------------------ main
    def handle(self, *args, **opts):
        if LEGACY not in connections.databases:
            raise CommandError("Set LEGACY_MYSQL_NAME/USER/PASSWORD/HOST/PORT to enable the legacy_mysql alias.")
        if connections[TARGET].vendor != "postgresql":
            raise CommandError("Default database must be PostgreSQL (set DATABASE_URL).")
        if connections[LEGACY].vendor != "mysql":
            raise CommandError("legacy_mysql must be a MySQL/MariaDB connection.")

        models_in_order = self._models()
        if opts["verify"]:
            return self._verify(models_in_order, opts["report"])
        if opts["dry_run"]:
            return self._counts(models_in_order, opts["report"], title="Dry run")

        started = time.time()
        copied = {}
        with transaction.atomic(using=TARGET):
            # Constraints are DEFERRABLE INITIALLY DEFERRED in PostgreSQL, so FK order inside this
            # one transaction cannot cause failures; they are validated at commit.
            with connections[TARGET].cursor() as cur:
                cur.execute("SET CONSTRAINTS ALL DEFERRED")
            if opts["wipe_target"]:
                # Includes tables that only exist on the new side (e.g. integrations_*) so FKs to users don't block.
                for model in reversed(self._models(only_legacy=False)):
                    model._base_manager.using(TARGET)._raw_delete(TARGET)
                self.stdout.write("Target tables emptied.")
            else:
                for model in REPLACE_FIRST:
                    model._base_manager.using(TARGET)._raw_delete(TARGET)

            # Preserve timestamps: bulk_create would otherwise overwrite auto_now/auto_now_add.
            saved_flags = []
            for model in models_in_order:
                for f in model._meta.concrete_fields:
                    if getattr(f, "auto_now", False) or getattr(f, "auto_now_add", False):
                        saved_flags.append((f, f.auto_now, f.auto_now_add))
                        f.auto_now = f.auto_now_add = False
            try:
                for model in models_in_order:
                    copied[model] = self._copy_model(model)
            finally:
                for f, a, b in saved_flags:
                    f.auto_now, f.auto_now_add = a, b

            self._reset_sequences(models_in_order)
        self.stdout.write(self.style.SUCCESS(f"Copy committed in {time.time() - started:.1f}s"))
        self._counts(models_in_order, opts["report"], title="After copy")

    def _copy_model(self, model):
        existing = set(model._base_manager.using(TARGET).values_list("pk", flat=True))
        fields = [f.attname for f in model._meta.concrete_fields]
        batch, added, skipped = [], 0, 0
        for row in self._rows(model, LEGACY).iterator(chunk_size=BATCH):
            if row[model._meta.pk.attname] in existing:
                skipped += 1
                continue
            batch.append(model(**{k: row[k] for k in fields}))
            if len(batch) >= BATCH:
                model._base_manager.using(TARGET).bulk_create(batch)
                added += len(batch)
                batch = []
        if batch:
            model._base_manager.using(TARGET).bulk_create(batch)
            added += len(batch)
        if added or skipped:
            self.stdout.write(f"  {model._meta.label:55} +{added:<6} (already present: {skipped})")
        return added

    def _reset_sequences(self, models_in_order):
        conn = connections[TARGET]
        sql = conn.ops.sequence_reset_sql(no_style(), [m for m in models_in_order if m._meta.pk.get_internal_type() in ("AutoField", "BigAutoField", "SmallAutoField")])
        with conn.cursor() as cur:
            for stmt in sql:
                cur.execute(stmt)
        self.stdout.write(f"Reset {len(sql)} PostgreSQL sequences.")

    # ------------------------------------------------------------------ reports
    def _counts(self, models_in_order, report_path, title):
        lines, bad = [], 0
        for model in models_in_order:
            src = model._base_manager.using(LEGACY).count()
            dst = model._base_manager.using(TARGET).count()
            ok = src == dst
            bad += not ok
            lines.append((model._meta.label, model._meta.db_table, src, dst, dst - src, "OK" if ok else "MISMATCH"))
        for label, _t, src, dst, diff, st in lines:
            if src or dst or st != "OK":
                self.stdout.write(f"  {label:55} mysql={src:<6} postgres={dst:<6} {st}")
        self.stdout.write(f"{title}: {len(lines)} tables, {bad} count mismatches.")
        if report_path:
            self._write_report(report_path, title, lines)
        return None

    def _write_report(self, path, title, lines, extra=""):
        out = [f"# MySQL to PostgreSQL validation ({title})", "", f"Generated: {datetime.datetime.now().isoformat(timespec='seconds')}", "",
               "| Model | Table | MySQL | PostgreSQL | Difference | Status |", "|---|---|---:|---:|---:|---|"]
        out += [f"| {a} | {b} | {c} | {d} | {e} | {f} |" for a, b, c, d, e, f in lines]
        if extra:
            out += ["", extra]
        with open(path, "w", encoding="utf-8") as fh:
            fh.write("\n".join(out) + "\n")

    def _verify(self, models_in_order, report_path):
        problems, lines, non_ascii = [], [], 0
        for model in models_in_order:
            src_rows = {r[model._meta.pk.attname]: r for r in self._rows(model, LEGACY)}
            dst_rows = {r[model._meta.pk.attname]: r for r in self._rows(model, TARGET)}
            mismatched = 0
            for pk, src in src_rows.items():
                dst = dst_rows.get(pk)
                if dst is None:
                    mismatched += 1
                    problems.append(f"{model._meta.label} pk={pk}: missing in PostgreSQL")
                    continue
                for key, value in src.items():
                    if isinstance(value, str) and any(ord(c) > 127 for c in value):
                        non_ascii += 1
                    if _norm(value) != _norm(dst[key]):
                        mismatched += 1
                        problems.append(f"{model._meta.label} pk={pk} field={key}: values differ")
                        break
            extra_rows = set(dst_rows) - set(src_rows)
            if extra_rows:
                problems.append(f"{model._meta.label}: {len(extra_rows)} extra rows in PostgreSQL")
            status = "OK" if not mismatched and not extra_rows and len(src_rows) == len(dst_rows) else "MISMATCH"
            lines.append((model._meta.label, model._meta.db_table, len(src_rows), len(dst_rows), len(dst_rows) - len(src_rows), status))
        # Relationship integrity on the target: every FK must resolve.
        for model in models_in_order:
            for f in model._meta.concrete_fields:
                if f.remote_field and f.remote_field.model in models_in_order:
                    target = f.remote_field.model
                    ids = target._base_manager.using(TARGET).values_list("pk", flat=True)
                    orphans = model._base_manager.using(TARGET).exclude(**{f.attname + "__isnull": True}).exclude(**{f.attname + "__in": ids}).count()
                    if orphans:
                        problems.append(f"{model._meta.label}.{f.name}: {orphans} dangling references")
        for p in problems[:50]:
            self.stdout.write(self.style.ERROR(p))
        self.stdout.write(f"Verified {len(lines)} tables row-by-row; non-ASCII (e.g. Bangla) text values compared: {non_ascii}; problems: {len(problems)}")
        if report_path:
            self._write_report(report_path, "Row-by-row verification", lines, extra=f"Non-ASCII text values compared exactly: {non_ascii}\n\nProblems: {len(problems)}")
        if problems:
            raise CommandError(f"Verification failed with {len(problems)} problem(s).")
        self.stdout.write(self.style.SUCCESS("Verification passed: all rows and relationships match."))
