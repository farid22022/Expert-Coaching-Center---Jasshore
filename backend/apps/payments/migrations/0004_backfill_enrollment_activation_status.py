from django.db import migrations
from django.utils import timezone


def backfill_activation_status(apps, schema_editor):
    Payment = apps.get_model("payments", "AdmissionPaymentTransaction")
    Enrollment = apps.get_model("courses", "Enrollment")
    for payment in Payment.objects.filter(status="completed", enrollment_activation_status="not_started").iterator():
        is_active = Enrollment.objects.filter(application_id=payment.application_id, status="active").exists()
        Payment.objects.filter(pk=payment.pk).update(
            enrollment_activation_status="active" if is_active else "failed",
            enrollment_failure_message="" if is_active else "Verified payment requires enrollment reconciliation.",
            enrollment_activated_at=(payment.completed_at or timezone.now()) if is_active else None,
        )


class Migration(migrations.Migration):
    dependencies = [
        ("courses", "0011_subjectweek_coursechapter_and_more"),
        ("payments", "0003_admissionpaymenttransaction_enrollment_activated_at_and_more"),
    ]

    operations = [migrations.RunPython(backfill_activation_status, migrations.RunPython.noop)]
