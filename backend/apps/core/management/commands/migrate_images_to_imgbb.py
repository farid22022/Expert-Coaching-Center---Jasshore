"""Optionally move existing local images to ImgBB.

    python manage.py migrate_images_to_imgbb --dry-run [--report ../EXISTING_IMAGE_MIGRATION_PLAN.md]
    python manage.py migrate_images_to_imgbb [--limit 20]

Only image columns (HostedImageField) are touched; PDFs/videos/documents are never moved.
Restartable: rows already holding a URL are skipped, and each row is updated as soon as its
upload succeeds. Local files are left on disk (nothing is deleted).
"""
import os

from django.apps import apps
from django.conf import settings
from django.core.management import BaseCommand, CommandError

from apps.core.fields import HostedImageField
from apps.integrations.image_hosting import imgbb
from apps.integrations.image_hosting.storage import URL_RE, _record_asset, _safe_name
from apps.integrations.image_hosting.validation import ImageValidationError, prepare_image


class Command(BaseCommand):
    help = "Plan or perform migration of existing local images to ImgBB (never deletes local files)."

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true")
        parser.add_argument("--limit", type=int, default=0, help="Max uploads in this run (0 = all).")
        parser.add_argument("--report", default="", help="Write the plan as markdown to this path.")

    def _targets(self):
        for model in apps.get_models():
            for field in model._meta.concrete_fields:
                if isinstance(field, HostedImageField):
                    yield model, field

    def handle(self, *args, **opts):
        plan = []
        for model, field in self._targets():
            for pk, name in model._base_manager.exclude(**{field.name: ""}).values_list("pk", field.name):
                if not name:
                    continue
                name = str(name)
                if URL_RE.match(name):
                    action, exists = "already hosted - skip", "n/a"
                else:
                    path = os.path.join(settings.MEDIA_ROOT, name)
                    exists = os.path.isfile(path)
                    action = "upload to ImgBB" if exists else "file missing - review manually"
                plan.append((model._meta.label, field.name, pk, name, settings.MEDIA_URL + name if not URL_RE.match(name) else name, exists, action))

        todo = [p for p in plan if p[6] == "upload to ImgBB"]
        self.stdout.write(f"{len(plan)} image values, {len(todo)} eligible for upload.")
        if opts["report"]:
            lines = ["# Existing image migration plan", "", "| Model | Field | Record | Current path | Current URL | File exists | Recommended action |", "|---|---|---|---|---|---|---|"]
            lines += [f"| {a} | {b} | {c} | `{d}` | {e} | {f} | {g} |" for a, b, c, d, e, f, g in plan]
            with open(opts["report"], "w", encoding="utf-8") as fh:
                fh.write("\n".join(lines) + "\n")
            self.stdout.write(f"Plan written to {opts['report']}")
        if opts["dry_run"]:
            return
        if not imgbb.is_available():
            raise CommandError("Image hosting is not configured/enabled; nothing uploaded.")

        done = failed = 0
        for label, fname, pk, name, _url, _exists, _action in todo:
            if opts["limit"] and done >= opts["limit"]:
                break
            model = apps.get_model(label)
            try:
                with open(os.path.join(settings.MEDIA_ROOT, name), "rb") as fh:
                    prepared = prepare_image(fh.read())
                hosted = imgbb.upload_image(prepared.data, _safe_name(name, prepared.extension))
                if len(hosted.url) > model._meta.get_field(fname).max_length:
                    raise imgbb.ImageHostingError("URL too long for column")
                _record_asset(hosted, name, prepared, context="migration")
                # Re-check just before writing so a concurrent edit is not overwritten.
                model._base_manager.filter(pk=pk, **{fname: name}).update(**{fname: hosted.url})
                done += 1
                self.stdout.write(f"  migrated {label}#{pk}.{fname}")
            except (OSError, ImageValidationError, imgbb.ImageHostingError) as exc:
                failed += 1
                self.stderr.write(f"  FAILED {label}#{pk}.{fname}: {getattr(exc, 'user_message', exc)}")
        self.stdout.write(self.style.SUCCESS(f"Done: {done} migrated, {failed} failed. Re-run to retry failures."))
