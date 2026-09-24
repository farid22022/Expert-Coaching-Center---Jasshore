from django.db import models
from django.utils.text import slugify

from apps.core.models import OrganizationScopedModel


class CourseType(models.TextChoices):
    REGULAR = "regular", "Regular"
    ADMISSION = "admission", "Admission"


class CourseStatus(models.TextChoices):
    DRAFT = "draft", "Draft"
    PUBLISHED = "published", "Published"
    ADMISSION_OPEN = "admission_open", "Admission Open"
    ADMISSION_CLOSED = "admission_closed", "Admission Closed"
    RUNNING = "running", "Running"
    COMPLETED = "completed", "Completed"
    ARCHIVED = "archived", "Archived"


class AssignmentRole(models.TextChoices):
    HEAD_TEACHER = "head_teacher", "Head Teacher"
    SUBJECT_TEACHER = "subject_teacher", "Subject Teacher"
    ASSISTANT_TEACHER = "assistant_teacher", "Assistant Teacher"
    COORDINATOR = "coordinator", "Coordinator"


class AssignmentStatus(models.TextChoices):
    PENDING = "pending", "Pending teacher response"
    ACCEPTED = "accepted", "Accepted"
    DECLINED = "declined", "Declined"


class EnrollmentStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    ACTIVE = "active", "Active"
    COMPLETED = "completed", "Completed"
    CANCELLED = "cancelled", "Cancelled"
    EXPIRED = "expired", "Expired"
    SUSPENDED = "suspended", "Suspended"


class Course(OrganizationScopedModel):
    title = models.CharField(max_length=180)
    slug = models.SlugField(max_length=220, db_index=True)
    code = models.CharField(max_length=80, blank=True, db_index=True)
    description = models.TextField(blank=True)
    course_type = models.CharField(max_length=20, choices=CourseType.choices, default=CourseType.REGULAR)
    thumbnail = models.ImageField(upload_to="courses/thumbnails/", blank=True)
    admission_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    course_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    capacity = models.PositiveIntegerField(null=True, blank=True)
    session = models.ForeignKey("academic.AcademicSession", null=True, blank=True, on_delete=models.SET_NULL)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    enrollment_start = models.DateField(null=True, blank=True)
    enrollment_end = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=30, choices=CourseStatus.choices, default=CourseStatus.DRAFT)
    is_published = models.BooleanField(default=False, db_index=True)
    custom_content = models.JSONField(default=list, blank=True)
    admission_form_schema = models.JSONField(default=list, blank=True)

    class Meta:
        unique_together = ("organization", "slug")
        indexes = [
            models.Index(fields=["organization", "course_type", "status"]),
            models.Index(fields=["organization", "is_published"]),
        ]
        ordering = ("title",)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)[:220]
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class CourseSection(OrganizationScopedModel):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="sections")
    name = models.CharField(max_length=160)
    description = models.TextField(blank=True)
    head_teacher = models.ForeignKey(
        "people.Employee",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="headed_course_sections",
        limit_choices_to={"employee_type": "teacher"},
    )
    status = models.CharField(max_length=20, default="active", db_index=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ("course", "name")
        indexes = [models.Index(fields=["organization", "course", "status"])]
        ordering = ("order", "name")

    def __str__(self):
        return f"{self.course} - {self.name}"


class CourseSubject(OrganizationScopedModel):
    course_section = models.ForeignKey(CourseSection, on_delete=models.CASCADE, related_name="subjects")
    name = models.CharField(max_length=160)
    code = models.CharField(max_length=80, blank=True, db_index=True)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, default="active", db_index=True)

    class Meta:
        unique_together = ("course_section", "code")
        indexes = [models.Index(fields=["organization", "course_section", "status"])]
        ordering = ("order", "name")

    def __str__(self):
        return self.name


class TeacherAssignment(OrganizationScopedModel):
    teacher = models.ForeignKey(
        "people.Employee",
        on_delete=models.CASCADE,
        related_name="course_assignments",
        limit_choices_to={"employee_type": "teacher"},
    )
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="teacher_assignments")
    course_section = models.ForeignKey(CourseSection, null=True, blank=True, on_delete=models.CASCADE, related_name="teacher_assignments")
    subject = models.ForeignKey(CourseSubject, null=True, blank=True, on_delete=models.CASCADE, related_name="teacher_assignments")
    role = models.CharField(max_length=30, choices=AssignmentRole.choices, default=AssignmentRole.SUBJECT_TEACHER)
    permissions = models.JSONField(default=list, blank=True)
    assigned_at = models.DateTimeField(auto_now_add=True)
    assigned_by = models.ForeignKey("accounts.User", null=True, blank=True, on_delete=models.SET_NULL, related_name="teacher_assignments_made")
    is_active = models.BooleanField(default=True, db_index=True)
    assignment_status = models.CharField(max_length=20, choices=AssignmentStatus.choices, default=AssignmentStatus.ACCEPTED, db_index=True)
    responded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["teacher", "course", "course_section", "subject", "role"],
                name="unique_teacher_course_assignment",
            )
        ]
        indexes = [
            models.Index(fields=["organization", "teacher", "is_active"]),
            models.Index(fields=["organization", "course", "course_section"]),
        ]

    def __str__(self):
        return f"{self.teacher} - {self.course} ({self.role})"


class Enrollment(OrganizationScopedModel):
    student = models.ForeignKey("people.Student", on_delete=models.CASCADE, related_name="course_enrollments")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="enrollments")
    course_section = models.ForeignKey(CourseSection, null=True, blank=True, on_delete=models.SET_NULL, related_name="enrollments")
    application = models.ForeignKey("admissions.AdmissionApplication", null=True, blank=True, on_delete=models.SET_NULL, related_name="enrollments")
    payment = models.ForeignKey("finance.FeeCollection", null=True, blank=True, on_delete=models.SET_NULL, related_name="course_enrollments")
    enrollment_number = models.CharField(max_length=80, db_index=True)
    enrolled_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=EnrollmentStatus.choices, default=EnrollmentStatus.PENDING)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("organization", "enrollment_number")
        constraints = [
            models.UniqueConstraint(
                fields=["student", "course"],
                name="unique_student_course_enrollment",
            )
        ]
        indexes = [
            models.Index(fields=["organization", "student", "status"]),
            models.Index(fields=["organization", "course", "status"]),
        ]

    def __str__(self):
        return self.enrollment_number
