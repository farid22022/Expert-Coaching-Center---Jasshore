from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("organizations", "0001_initial"),
        ("people", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="StudentProfile",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("is_deleted", models.BooleanField(db_index=True, default=False)),
                ("deleted_at", models.DateTimeField(blank=True, null=True)),
                ("full_name", models.CharField(max_length=180)),
                ("gender", models.CharField(blank=True, choices=[("male", "Male"), ("female", "Female"), ("other", "Other")], max_length=20)),
                ("date_of_birth", models.DateField(blank=True, null=True)),
                ("phone", models.CharField(blank=True, db_index=True, max_length=50)),
                ("email", models.EmailField(blank=True, max_length=254)),
                ("photo", models.ImageField(blank=True, upload_to="student-profiles/photos/")),
                ("guardian_name", models.CharField(blank=True, max_length=180)),
                ("guardian_phone", models.CharField(blank=True, max_length=50)),
                ("present_address", models.TextField(blank=True)),
                ("permanent_address", models.TextField(blank=True)),
                ("previous_education", models.CharField(blank=True, max_length=255)),
                ("institution", models.CharField(blank=True, max_length=255)),
                ("emergency_contact", models.CharField(blank=True, max_length=80)),
                ("created_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="created_studentprofiles", to=settings.AUTH_USER_MODEL)),
                ("organization", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="studentprofiles", to="organizations.organization")),
                ("updated_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="updated_studentprofiles", to=settings.AUTH_USER_MODEL)),
                ("user", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="student_profile", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "indexes": [models.Index(fields=["organization", "phone"], name="people_stude_organiz_9ba493_idx")],
            },
        ),
    ]
