from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import apps.assessments.validators


class Migration(migrations.Migration):
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("assessments", "0001_initial"),
        ("organizations", "0001_initial"),
        ("people", "0002_studentprofile"),
    ]

    operations = [
        migrations.CreateModel(
            name="AssignmentSubmission",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("is_deleted", models.BooleanField(db_index=True, default=False)),
                ("deleted_at", models.DateTimeField(blank=True, null=True)),
                ("submitted_at", models.DateTimeField(blank=True, null=True)),
                ("status", models.CharField(choices=[("draft", "Draft"), ("submitted", "Submitted"), ("evaluated", "Evaluated"), ("returned", "Returned")], default="submitted", max_length=20)),
                ("marks_obtained", models.DecimalField(blank=True, decimal_places=2, max_digits=8, null=True)),
                ("total_marks", models.DecimalField(decimal_places=2, default=0, max_digits=8)),
                ("feedback", models.TextField(blank=True)),
                ("evaluated_at", models.DateTimeField(blank=True, null=True)),
                ("assessment", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="assignment_submissions", to="assessments.assessment")),
                ("created_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="created_assignmentsubmissions", to=settings.AUTH_USER_MODEL)),
                ("evaluated_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="evaluated_submissions", to="people.employee")),
                ("organization", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="assignmentsubmissions", to="organizations.organization")),
                ("student", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="assignment_submissions", to="people.student")),
                ("updated_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="updated_assignmentsubmissions", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "unique_together": {("assessment", "student")},
                "indexes": [
                    models.Index(fields=["organization", "student", "status"], name="assessments_organiz_d38546_idx"),
                    models.Index(fields=["organization", "assessment", "status"], name="assessments_organiz_e187c8_idx"),
                ],
            },
        ),
        migrations.CreateModel(
            name="SubmissionAttachment",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("is_deleted", models.BooleanField(db_index=True, default=False)),
                ("deleted_at", models.DateTimeField(blank=True, null=True)),
                ("file", models.FileField(upload_to="assessments/submissions/", validators=[apps.assessments.validators.validate_submission_file])),
                ("original_name", models.CharField(blank=True, max_length=255)),
                ("content_type", models.CharField(blank=True, max_length=120)),
                ("size", models.PositiveIntegerField(default=0)),
                ("created_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="created_submissionattachments", to=settings.AUTH_USER_MODEL)),
                ("organization", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="submissionattachments", to="organizations.organization")),
                ("submission", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="attachments", to="assessments.assignmentsubmission")),
                ("updated_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="updated_submissionattachments", to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
