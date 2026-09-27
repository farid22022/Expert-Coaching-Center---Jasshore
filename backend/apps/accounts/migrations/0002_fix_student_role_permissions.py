from django.db import migrations


def strip_overbroad_student_permissions(apps, schema_editor):
    """Remove assessment.view/course.view from any existing student Role.

    These were granted by an earlier seed_core run and, combined with the "no teacher
    record -> fall back to organization-wide access" bug in AssessmentAdminViewSet/
    CourseViewSet (fixed alongside this migration), let students reach the MCQ answer
    key and other students' attempts/submissions/enrollments. Students don't need any
    admin-surface permission - their dedicated /student/... endpoints only require
    IsAuthenticated + their own Enrollment.
    """
    Role = apps.get_model("accounts", "Role")
    for role in Role.objects.filter(code="student"):
        role.permissions.remove(*role.permissions.filter(code__in=["assessment.view", "course.view"]))


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(strip_overbroad_student_permissions, noop_reverse),
    ]
