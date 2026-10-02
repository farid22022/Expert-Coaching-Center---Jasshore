from django.db import models
from apps.core.fields import HostedImageField
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
    thumbnail = HostedImageField(upload_to="courses/thumbnails/", blank=True)
    admission_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    course_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    capacity = models.PositiveIntegerField(null=True, blank=True)
    pass_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=40, help_text="Minimum overall course-result percentage to pass, unless a subject overrides it.")
    session = models.ForeignKey("academic.AcademicSession", null=True, blank=True, on_delete=models.SET_NULL)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    enrollment_start = models.DateField(null=True, blank=True)
    enrollment_end = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=30, choices=CourseStatus.choices, default=CourseStatus.DRAFT)
    is_published = models.BooleanField(default=False, db_index=True)
    custom_content = models.JSONField(default=list, blank=True)
    admission_form_schema = models.JSONField(default=list, blank=True)

    # Landing page fields
    short_description = models.TextField(blank=True)
    cover_image = HostedImageField(upload_to="courses/covers/", blank=True)
    hero_image = HostedImageField(upload_to="courses/hero/", blank=True)
    promo_video_url = models.URLField(blank=True)
    offer_fee = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    hero_badge = models.CharField(max_length=120, blank=True)
    hero_title = models.CharField(max_length=220, blank=True)
    hero_subtitle = models.CharField(max_length=400, blank=True)
    landing_page_enabled = models.BooleanField(default=True)
    landing_page = models.JSONField(default=dict, blank=True)
    meta_title = models.CharField(max_length=220, blank=True)
    meta_description = models.CharField(max_length=320, blank=True)

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


class AcademicStageType(models.TextChoices):
    SEMESTER = "semester", "Semester"
    TERM = "term", "Term"
    PHASE = "phase", "Phase"
    MODULE = "module", "Module"
    TRACK = "track", "Track"
    CUSTOM = "custom", "Custom"


class AcademicStageStatus(models.TextChoices):
    UPCOMING = "upcoming", "Upcoming"
    IN_PROGRESS = "in_progress", "In Progress"
    COMPLETED = "completed", "Completed"
    ARCHIVED = "archived", "Archived"


class AcademicStage(OrganizationScopedModel):
    """A sequential curriculum phase within one Course (e.g. "Phase 01 - Foundation").
    Deliberately separate from CourseSection, which is already used everywhere as a
    parallel batch/group concept (Enrollment.course_section, TeacherAssignment.course_section,
    test-visibility filtering) - repurposing it here would silently break that."""

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="academic_stages")
    name = models.CharField(max_length=160)
    display_label = models.CharField(max_length=60, blank=True, help_text='e.g. "Phase 01" - shown before the name if set.')
    stage_type = models.CharField(max_length=20, choices=AcademicStageType.choices, default=AcademicStageType.PHASE)
    order = models.PositiveIntegerField(default=0)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=AcademicStageStatus.choices, default=AcademicStageStatus.UPCOMING)

    class Meta:
        unique_together = ("course", "name")
        indexes = [models.Index(fields=["organization", "course", "order"])]
        ordering = ("order", "id")

    def __str__(self):
        return f"{self.course} - {self.name}"


class CourseSubject(OrganizationScopedModel):
    course_section = models.ForeignKey(CourseSection, on_delete=models.CASCADE, related_name="subjects")
    academic_stage = models.ForeignKey(AcademicStage, null=True, blank=True, on_delete=models.SET_NULL, related_name="subjects")
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


class SubjectWeek(OrganizationScopedModel):
    subject = models.ForeignKey(CourseSubject, on_delete=models.PROTECT, related_name="weeks")
    title = models.CharField(max_length=180)
    number = models.PositiveIntegerField(default=1)
    release_at = models.DateTimeField()
    is_published = models.BooleanField(default=False)

    class Meta:
        ordering = ("number", "id")
        constraints = [models.UniqueConstraint(fields=["subject", "number"], name="unique_subject_week_number")]


class CourseChapter(OrganizationScopedModel):
    week = models.ForeignKey(SubjectWeek, on_delete=models.PROTECT, related_name="chapters")
    title = models.CharField(max_length=180)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("order", "id")


class CourseSyllabusItem(OrganizationScopedModel):
    class ContentType(models.TextChoices):
        TEXT = "text", "Text"
        IMAGE = "image", "Image"
        VIDEO = "video", "Video"
        LINK = "link", "Link"
        FILE = "file", "File"

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="syllabus_items")
    course_section = models.ForeignKey(CourseSection, null=True, blank=True, on_delete=models.CASCADE, related_name="syllabus_items")
    subject = models.ForeignKey(CourseSubject, null=True, blank=True, on_delete=models.CASCADE, related_name="syllabus_items")
    title = models.CharField(max_length=180)
    summary = models.TextField(blank=True)
    content_type = models.CharField(max_length=20, choices=ContentType.choices, default=ContentType.TEXT)
    content = models.TextField(blank=True)
    url = models.URLField(blank=True)
    file = models.FileField(upload_to="courses/syllabus/", blank=True)
    custom_fields = models.JSONField(default=list, blank=True)
    order = models.PositiveIntegerField(default=0)
    is_public = models.BooleanField(default=True, db_index=True)

    class Meta:
        indexes = [
            models.Index(fields=["organization", "course", "is_public"]),
            models.Index(fields=["organization", "subject", "order"]),
        ]
        ordering = ("course_section__order", "subject__order", "order", "id")

    def __str__(self):
        return self.title


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
    featured_on_landing_page = models.BooleanField(default=True)
    landing_order = models.PositiveIntegerField(default=0)

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
