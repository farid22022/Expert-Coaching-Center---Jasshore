from django.db import models
from django.utils import timezone

from apps.core.models import OrganizationScopedModel
from .validators import validate_submission_file


class QuestionType(models.TextChoices):
    SINGLE = "single", "Single Answer"
    MULTIPLE = "multiple", "Multiple Answer"


class AssessmentType(models.TextChoices):
    MCQ = "mcq", "MCQ"
    ASSIGNMENT = "assignment", "Assignment"
    EXAM = "exam", "Exam"


class MaterialType(models.TextChoices):
    NOTE = "note", "Note"
    LINK = "link", "Link"
    VIDEO = "video", "Video"
    FILE = "file", "File"


class AssessmentStatus(models.TextChoices):
    DRAFT = "draft", "Draft"
    PUBLISHED = "published", "Published"
    SCHEDULED = "scheduled", "Scheduled"
    LIVE = "live", "Live"
    CLOSED = "closed", "Closed"
    ARCHIVED = "archived", "Archived"


class AttemptStatus(models.TextChoices):
    IN_PROGRESS = "in_progress", "In Progress"
    SUBMITTED = "submitted", "Submitted"
    AUTO_SUBMITTED = "auto_submitted", "Auto Submitted"
    EXPIRED = "expired", "Expired"


class SubmissionStatus(models.TextChoices):
    DRAFT = "draft", "Draft"
    SUBMITTED = "submitted", "Submitted"
    EVALUATED = "evaluated", "Evaluated"
    RETURNED = "returned", "Returned"


class Question(OrganizationScopedModel):
    course = models.ForeignKey("courses.Course", on_delete=models.CASCADE, related_name="questions")
    course_section = models.ForeignKey("courses.CourseSection", null=True, blank=True, on_delete=models.SET_NULL, related_name="questions")
    subject = models.ForeignKey("courses.CourseSubject", null=True, blank=True, on_delete=models.SET_NULL, related_name="questions")
    chapter = models.CharField(max_length=180, blank=True, db_index=True)
    created_by_teacher = models.ForeignKey("people.Employee", null=True, blank=True, on_delete=models.SET_NULL, related_name="questions")
    text = models.TextField()
    explanation = models.TextField(blank=True)
    question_type = models.CharField(max_length=20, choices=QuestionType.choices, default=QuestionType.SINGLE)
    image = models.ImageField(upload_to="assessments/questions/", blank=True)
    diagram = models.ImageField(upload_to="assessments/diagrams/", blank=True)
    marks = models.DecimalField(max_digits=6, decimal_places=2, default=1)
    status = models.CharField(max_length=20, default="active", db_index=True)

    class Meta:
        indexes = [
            models.Index(fields=["organization", "course", "subject", "status"]),
            models.Index(fields=["organization", "created_by_teacher"]),
        ]

    def __str__(self):
        return self.text[:80]


class QuestionOption(OrganizationScopedModel):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="options")
    text = models.CharField(max_length=500)
    image = models.ImageField(upload_to="assessments/options/", blank=True)
    is_correct = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("order", "id")


class CourseMaterial(OrganizationScopedModel):
    course = models.ForeignKey("courses.Course", on_delete=models.CASCADE, related_name="study_materials")
    course_section = models.ForeignKey("courses.CourseSection", null=True, blank=True, on_delete=models.SET_NULL, related_name="study_materials")
    subject = models.ForeignKey("courses.CourseSubject", null=True, blank=True, on_delete=models.SET_NULL, related_name="study_materials")
    chapter = models.CharField(max_length=180, blank=True, db_index=True)
    created_by_teacher = models.ForeignKey("people.Employee", null=True, blank=True, on_delete=models.SET_NULL, related_name="study_materials")
    title = models.CharField(max_length=180)
    description = models.TextField(blank=True)
    material_type = models.CharField(max_length=20, choices=MaterialType.choices, default=MaterialType.NOTE)
    url = models.URLField(blank=True)
    file = models.FileField(upload_to="assessments/materials/", blank=True)
    is_published = models.BooleanField(default=True, db_index=True)

    class Meta:
        indexes = [
            models.Index(fields=["organization", "course", "is_published"]),
            models.Index(fields=["organization", "created_by_teacher"]),
        ]

    def __str__(self):
        return self.title


class Assessment(OrganizationScopedModel):
    title = models.CharField(max_length=180)
    assessment_type = models.CharField(max_length=20, choices=AssessmentType.choices, default=AssessmentType.MCQ)
    course = models.ForeignKey("courses.Course", on_delete=models.CASCADE, related_name="assessments")
    course_section = models.ForeignKey("courses.CourseSection", null=True, blank=True, on_delete=models.SET_NULL, related_name="assessments")
    subject = models.ForeignKey("courses.CourseSubject", null=True, blank=True, on_delete=models.SET_NULL, related_name="assessments")
    chapter = models.CharField(max_length=180, blank=True, db_index=True)
    created_by_teacher = models.ForeignKey("people.Employee", null=True, blank=True, on_delete=models.SET_NULL, related_name="assessments")
    instructions = models.TextField(blank=True)
    duration_minutes = models.PositiveIntegerField(default=20)
    starts_at = models.DateTimeField(null=True, blank=True, db_index=True)
    ends_at = models.DateTimeField(null=True, blank=True, db_index=True)
    status = models.CharField(max_length=20, choices=AssessmentStatus.choices, default=AssessmentStatus.DRAFT, db_index=True)
    published_at = models.DateTimeField(null=True, blank=True)
    allow_late_join = models.BooleanField(default=False)

    class Meta:
        indexes = [
            models.Index(fields=["organization", "course", "status"]),
            models.Index(fields=["organization", "starts_at", "ends_at"]),
        ]

    @property
    def is_live_now(self):
        now = timezone.now()
        if self.status not in {AssessmentStatus.PUBLISHED, AssessmentStatus.SCHEDULED, AssessmentStatus.LIVE}:
            return False
        if self.starts_at and now < self.starts_at:
            return False
        if self.ends_at and now > self.ends_at:
            return False
        return True


class AssessmentQuestion(OrganizationScopedModel):
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name="assessment_questions")
    question = models.ForeignKey(Question, on_delete=models.PROTECT, related_name="assessment_links")
    order = models.PositiveIntegerField(default=0)
    marks = models.DecimalField(max_digits=6, decimal_places=2, default=1)

    class Meta:
        unique_together = ("assessment", "question")
        ordering = ("order", "id")


class AssessmentAttempt(OrganizationScopedModel):
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name="attempts")
    student = models.ForeignKey("people.Student", on_delete=models.CASCADE, related_name="assessment_attempts")
    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=AttemptStatus.choices, default=AttemptStatus.IN_PROGRESS)
    score = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    total_marks = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    auto_submitted = models.BooleanField(default=False)

    class Meta:
        unique_together = ("assessment", "student")
        indexes = [models.Index(fields=["organization", "student", "status"])]

    @property
    def deadline(self):
        if self.assessment.ends_at:
            return min(self.started_at + timezone.timedelta(minutes=self.assessment.duration_minutes), self.assessment.ends_at)
        return self.started_at + timezone.timedelta(minutes=self.assessment.duration_minutes)


class StudentAnswer(OrganizationScopedModel):
    attempt = models.ForeignKey(AssessmentAttempt, on_delete=models.CASCADE, related_name="answers")
    question = models.ForeignKey(Question, on_delete=models.PROTECT)
    selected_options = models.ManyToManyField(QuestionOption, blank=True, related_name="student_answers")
    text_answer = models.TextField(blank=True)
    is_correct = models.BooleanField(default=False)
    marks_obtained = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    answered_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("attempt", "question")


class AssignmentSubmission(OrganizationScopedModel):
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name="assignment_submissions")
    student = models.ForeignKey("people.Student", on_delete=models.CASCADE, related_name="assignment_submissions")
    submitted_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=SubmissionStatus.choices, default=SubmissionStatus.SUBMITTED)
    marks_obtained = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    total_marks = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    feedback = models.TextField(blank=True)
    evaluated_by = models.ForeignKey("people.Employee", null=True, blank=True, on_delete=models.SET_NULL, related_name="evaluated_submissions")
    evaluated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("assessment", "student")
        indexes = [
            models.Index(fields=["organization", "student", "status"]),
            models.Index(fields=["organization", "assessment", "status"]),
        ]


class SubmissionAttachment(OrganizationScopedModel):
    submission = models.ForeignKey(AssignmentSubmission, on_delete=models.CASCADE, related_name="attachments")
    file = models.FileField(upload_to="assessments/submissions/", validators=[validate_submission_file])
    original_name = models.CharField(max_length=255, blank=True)
    content_type = models.CharField(max_length=120, blank=True)
    size = models.PositiveIntegerField(default=0)
