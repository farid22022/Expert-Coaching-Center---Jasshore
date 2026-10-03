from django.core.management.base import BaseCommand

from apps.assessments.publication import TestPublicationService


class Command(BaseCommand):
    help = "Deliver publish notifications for tests whose publish_at has passed (idempotent; safe to run from cron)."

    def handle(self, *args, **options):
        created = TestPublicationService.deliver_due()
        self.stdout.write(f"Created {created} notification(s).")
