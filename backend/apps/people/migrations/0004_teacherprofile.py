from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("people", "0003_rename_people_stude_organiz_9ba493_idx_people_stud_organiz_315030_idx_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="TeacherProfile",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("is_deleted", models.BooleanField(db_index=True, default=False)),
                ("deleted_at", models.DateTimeField(blank=True, null=True)),
                ("gender", models.CharField(blank=True, choices=[("male", "Male"), ("female", "Female"), ("other", "Other")], max_length=20)),
                ("qualification", models.CharField(blank=True, max_length=255)),
                ("specialization", models.CharField(blank=True, max_length=255)),
                ("bio", models.TextField(blank=True)),
                ("invitation_token_hash", models.CharField(blank=True, max_length=255)),
                ("invitation_expires_at", models.DateTimeField(blank=True, null=True)),
                ("employee", models.OneToOneField(on_delete=django.db.models.deletion.PROTECT, related_name="teacher_profile", to="people.employee")),
                ("organization", models.ForeignKey(db_index=True, on_delete=django.db.models.deletion.PROTECT, related_name="teacherprofiles", to="organizations.organization")),
                ("updated_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="updated_teacherprofiles", to=settings.AUTH_USER_MODEL)),
                ("created_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="created_teacherprofiles", to=settings.AUTH_USER_MODEL)),
                ("user", models.OneToOneField(on_delete=django.db.models.deletion.PROTECT, related_name="teacher_profile", to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddIndex(model_name="teacherprofile", index=models.Index(fields=["organization", "specialization"], name="people_teac_organiz_b0530a_idx")),
    ]
