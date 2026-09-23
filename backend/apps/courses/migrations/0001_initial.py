from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("academic", "0002_initial"),
        ("admissions", "0001_initial"),
        ("finance", "0001_initial"),
        ("organizations", "0001_initial"),
        ("people", "0002_studentprofile"),
    ]

    operations = [
        migrations.CreateModel(
            name="Course",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("is_deleted", models.BooleanField(db_index=True, default=False)),
                ("deleted_at", models.DateTimeField(blank=True, null=True)),
                ("title", models.CharField(max_length=180)),
                ("slug", models.SlugField(db_index=True, max_length=220)),
                ("code", models.CharField(blank=True, db_index=True, max_length=80)),
                ("description", models.TextField(blank=True)),
                ("course_type", models.CharField(choices=[("regular", "Regular"), ("admission", "Admission")], default="regular", max_length=20)),
                ("thumbnail", models.ImageField(blank=True, upload_to="courses/thumbnails/")),
                ("admission_fee", models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ("course_fee", models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ("capacity", models.PositiveIntegerField(blank=True, null=True)),
                ("start_date", models.DateField(blank=True, null=True)),
                ("end_date", models.DateField(blank=True, null=True)),
                ("enrollment_start", models.DateField(blank=True, null=True)),
                ("enrollment_end", models.DateField(blank=True, null=True)),
                ("status", models.CharField(choices=[("draft", "Draft"), ("published", "Published"), ("admission_open", "Admission Open"), ("admission_closed", "Admission Closed"), ("running", "Running"), ("completed", "Completed"), ("archived", "Archived")], default="draft", max_length=30)),
                ("is_published", models.BooleanField(db_index=True, default=False)),
                ("created_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="created_courses", to=settings.AUTH_USER_MODEL)),
                ("organization", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="courses", to="organizations.organization")),
                ("session", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to="academic.academicsession")),
                ("updated_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="updated_courses", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "ordering": ("title",),
                "unique_together": {("organization", "slug")},
                "indexes": [
                    models.Index(fields=["organization", "course_type", "status"], name="courses_cou_organiz_873b27_idx"),
                    models.Index(fields=["organization", "is_published"], name="courses_cou_organiz_67c7d6_idx"),
                ],
            },
        ),
        migrations.CreateModel(
            name="CourseSection",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("is_deleted", models.BooleanField(db_index=True, default=False)),
                ("deleted_at", models.DateTimeField(blank=True, null=True)),
                ("name", models.CharField(max_length=160)),
                ("description", models.TextField(blank=True)),
                ("status", models.CharField(db_index=True, default="active", max_length=20)),
                ("order", models.PositiveIntegerField(default=0)),
                ("course", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="sections", to="courses.course")),
                ("created_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="created_coursesections", to=settings.AUTH_USER_MODEL)),
                ("head_teacher", models.ForeignKey(blank=True, limit_choices_to={"employee_type": "teacher"}, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="headed_course_sections", to="people.employee")),
                ("organization", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="coursesections", to="organizations.organization")),
                ("updated_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="updated_coursesections", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "ordering": ("order", "name"),
                "unique_together": {("course", "name")},
                "indexes": [models.Index(fields=["organization", "course", "status"], name="courses_cou_organiz_cb0c72_idx")],
            },
        ),
        migrations.CreateModel(
            name="CourseSubject",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("is_deleted", models.BooleanField(db_index=True, default=False)),
                ("deleted_at", models.DateTimeField(blank=True, null=True)),
                ("name", models.CharField(max_length=160)),
                ("code", models.CharField(blank=True, db_index=True, max_length=80)),
                ("description", models.TextField(blank=True)),
                ("order", models.PositiveIntegerField(default=0)),
                ("status", models.CharField(db_index=True, default="active", max_length=20)),
                ("course_section", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="subjects", to="courses.coursesection")),
                ("created_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="created_coursesubjects", to=settings.AUTH_USER_MODEL)),
                ("organization", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="coursesubjects", to="organizations.organization")),
                ("updated_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="updated_coursesubjects", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "ordering": ("order", "name"),
                "unique_together": {("course_section", "code")},
                "indexes": [models.Index(fields=["organization", "course_section", "status"], name="courses_cou_organiz_9d1ab5_idx")],
            },
        ),
        migrations.CreateModel(
            name="Enrollment",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("is_deleted", models.BooleanField(db_index=True, default=False)),
                ("deleted_at", models.DateTimeField(blank=True, null=True)),
                ("enrollment_number", models.CharField(db_index=True, max_length=80)),
                ("enrolled_at", models.DateTimeField(blank=True, null=True)),
                ("status", models.CharField(choices=[("pending", "Pending"), ("active", "Active"), ("completed", "Completed"), ("cancelled", "Cancelled"), ("expired", "Expired"), ("suspended", "Suspended")], default="pending", max_length=20)),
                ("expires_at", models.DateTimeField(blank=True, null=True)),
                ("application", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="enrollments", to="admissions.admissionapplication")),
                ("course", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="enrollments", to="courses.course")),
                ("course_section", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="enrollments", to="courses.coursesection")),
                ("created_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="created_enrollments", to=settings.AUTH_USER_MODEL)),
                ("organization", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="enrollments", to="organizations.organization")),
                ("payment", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="course_enrollments", to="finance.feecollection")),
                ("student", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="course_enrollments", to="people.student")),
                ("updated_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="updated_enrollments", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "unique_together": {("organization", "enrollment_number")},
                "indexes": [
                    models.Index(fields=["organization", "student", "status"], name="courses_enr_organiz_d71a71_idx"),
                    models.Index(fields=["organization", "course", "status"], name="courses_enr_organiz_70c063_idx"),
                ],
            },
        ),
        migrations.CreateModel(
            name="TeacherAssignment",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("is_deleted", models.BooleanField(db_index=True, default=False)),
                ("deleted_at", models.DateTimeField(blank=True, null=True)),
                ("role", models.CharField(choices=[("head_teacher", "Head Teacher"), ("subject_teacher", "Subject Teacher"), ("assistant_teacher", "Assistant Teacher"), ("coordinator", "Coordinator")], default="subject_teacher", max_length=30)),
                ("permissions", models.JSONField(blank=True, default=list)),
                ("assigned_at", models.DateTimeField(auto_now_add=True)),
                ("is_active", models.BooleanField(db_index=True, default=True)),
                ("assigned_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="teacher_assignments_made", to=settings.AUTH_USER_MODEL)),
                ("course", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="teacher_assignments", to="courses.course")),
                ("course_section", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name="teacher_assignments", to="courses.coursesection")),
                ("created_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="created_teacherassignments", to=settings.AUTH_USER_MODEL)),
                ("organization", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="teacherassignments", to="organizations.organization")),
                ("subject", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name="teacher_assignments", to="courses.coursesubject")),
                ("teacher", models.ForeignKey(limit_choices_to={"employee_type": "teacher"}, on_delete=django.db.models.deletion.CASCADE, related_name="course_assignments", to="people.employee")),
                ("updated_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="updated_teacherassignments", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "indexes": [
                    models.Index(fields=["organization", "teacher", "is_active"], name="courses_tea_organiz_a0da2c_idx"),
                    models.Index(fields=["organization", "course", "course_section"], name="courses_tea_organiz_5e72b1_idx"),
                ],
                "constraints": [
                    models.UniqueConstraint(fields=("teacher", "course", "course_section", "subject", "role"), name="unique_teacher_course_assignment"),
                ],
            },
        ),
        migrations.AddConstraint(
            model_name="enrollment",
            constraint=models.UniqueConstraint(condition=models.Q(("status__in", ["pending", "active"])), fields=("student", "course"), name="unique_active_student_course_enrollment"),
        ),
    ]
