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


class TimingMode(models.TextChoices):
    PRACTICE = "practice", "Practice / Anytime"
    LIVE = "live", "Fixed-time Live"
    SCHEDULED = "scheduled", "Scheduled"
    INDIVIDUAL = "individual", "Individual Timed"


class Difficulty(models.TextChoices):
    EASY = "easy", "Easy"
    MEDIUM = "medium", "Medium"
    HARD = "hard", "Hard"


class AssessmentStatus(models.TextChoices):
    DRAFT = "draft", "Draft"
    PUBLISHED = "published", "Published"
    SCHEDULED = "scheduled", "Scheduled"
    LIVE = "live", "Live"
    CLOSED = "closed", "Closed"
    ARCHIVED = "archived", "Archived"


class ContentReviewStatus(models.TextChoices):
    DRAFT = "draft", "Draft"
    PENDING = "pending", "Awaiting head teacher review"
    APPROVED = "approved", "Approved"
    REJECTED = "rejected", "Changes requested"


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
    topic = models.CharField(max_length=180, blank=True, db_index=True)
    created_by_teacher = models.ForeignKey("people.Employee", null=True, blank=True, on_delete=models.SET_NULL, related_name="questions")
    text = models.TextField()
    explanation = models.TextField(blank=True)
    question_type = models.CharField(max_length=20, choices=QuestionType.choices, default=QuestionType.SINGLE)
    image = models.ImageField(upload_to="assessments/questions/", blank=True)
    diagram = models.ImageField(upload_to="assessments/diagrams/", blank=True)
    attachment = models.FileField(upload_to="assessments/question-files/", blank=True)
    marks = models.DecimalField(max_digits=6, decimal_places=2, default=1)
    negative_marks = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    difficulty = models.CharField(max_length=20, choices=Difficulty.choices, default=Difficulty.MEDIUM)
    tags = models.JSONField(default=list, blank=True)
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
    topic = models.CharField(max_length=180, blank=True, db_index=True)
    created_by_teacher = models.ForeignKey("people.Employee", null=True, blank=True, on_delete=models.SET_NULL, related_name="study_materials")
    title = models.CharField(max_length=180)
    description = models.TextField(blank=True)
    material_type = models.CharField(max_length=20, choices=MaterialType.choices, default=MaterialType.NOTE)
    url = models.URLField(blank=True)
    file = models.FileField(upload_to="assessments/materials/", blank=True)
    is_published = models.BooleanField(default=False, db_index=True)
    publish_at = models.DateTimeField(null=True, blank=True, db_index=True)
    status = models.CharField(max_length=20, default="published", db_index=True)
    review_status = models.CharField(max_length=20, choices=ContentReviewStatus.choices, default=ContentReviewStatus.DRAFT, db_index=True)
    reviewed_by = models.ForeignKey("people.Employee", null=True, blank=True, on_delete=models.SET_NULL, related_name="reviewed_study_materials")
    reviewed_at = models.DateTimeField(null=True, blank=True)
    review_note = models.TextField(blank=True)

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
    topic = models.CharField(max_length=180, blank=True, db_index=True)
    created_by_teacher = models.ForeignKey("people.Employee", null=True, blank=True, on_delete=models.SET_NULL, related_name="assessments")
    instructions = models.TextField(blank=True)
    description = models.TextField(blank=True)
    timing_mode = models.CharField(max_length=20, choices=TimingMode.choices, default=TimingMode.PRACTICE)
    duration_minutes = models.PositiveIntegerField(default=20)
    starts_at = models.DateTimeField(null=True, blank=True, db_index=True)
    ends_at = models.DateTimeField(null=True, blank=True, db_index=True)
    publish_at = models.DateTimeField(null=True, blank=True, db_index=True)
    status = models.CharField(max_length=20, choices=AssessmentStatus.choices, default=AssessmentStatus.DRAFT, db_index=True)
    review_status = models.CharField(max_length=20, choices=ContentReviewStatus.choices, default=ContentReviewStatus.DRAFT, db_index=True)
    reviewed_by = models.ForeignKey("people.Employee", null=True, blank=True, on_delete=models.SET_NULL, related_name="reviewed_assessments")
    reviewed_at = models.DateTimeField(null=True, blank=True)
    review_note = models.TextField(blank=True)
    published_at = models.DateTimeField(null=True, blank=True)
    allow_late_join = models.BooleanField(default=False)
    late_deadline = models.DateTimeField(null=True, blank=True)
    max_file_size_mb = models.PositiveIntegerField(default=10)
    allowed_file_types = models.JSONField(default=list, blank=True)
    question_file = models.FileField(upload_to="assessments/test-files/", blank=True)
    question_image = models.ImageField(upload_to="assessments/test-images/", blank=True)
    supporting_file = models.FileField(upload_to="assessments/supporting-files/", blank=True)
    attempts_allowed = models.PositiveIntegerField(default=1, help_text="Use 0 for unlimited.")
    shuffle_questions = models.BooleanField(default=False)
    shuffle_options = models.BooleanField(default=False)
    show_result_immediately = models.BooleanField(default=False)
    show_correct_answers = models.BooleanField(default=False)
    show_explanations = models.BooleanField(default=False)
    allow_review_before_submit = models.BooleanField(default=True)
    passing_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=40)
    allowed_students = models.ManyToManyField("people.Student", blank=True, related_name="assigned_assessments")

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


class MaterialView(OrganizationScopedModel):
    """Marks that a student has opened a CourseMaterial - the minimal signal needed
    to count materials (not just assessments) toward real course completion."""

    student = models.ForeignKey("people.Student", on_delete=models.CASCADE, related_name="material_views")
    material = models.ForeignKey(CourseMaterial, on_delete=models.CASCADE, related_name="views")
    viewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("student", "material")
        indexes = [models.Index(fields=["organization", "student", "material"])]


class InterventionType(models.TextChoices):
    EXTRA_PRACTICE = "extra_practice", "Extra Practice"
    REVISION = "revision", "Revision Required"
    MEETING = "meeting", "Teacher Meeting"
    GUARDIAN_CONTACT = "guardian_contact", "Guardian Contact"
    RETEST = "retest", "Retest"
    ASSIGNMENT_RECOVERY = "assignment_recovery", "Assignment Recovery"
    STUDY_PLAN = "study_plan", "Study Plan"


class InterventionStatus(models.TextChoices):
    OPEN = "open", "Open"
    IN_PROGRESS = "in_progress", "In Progress"
    COMPLETED = "completed", "Completed"
    PARTIALLY_COMPLETED = "partially_completed", "Partially Completed"
    NOT_COMPLETED = "not_completed", "Not Completed"


class StudentIntervention(OrganizationScopedModel):
    """A teacher-created academic action for one student - the "INTERVENE" step.
    `before_score`/`after_score` are optional, factual data points (e.g. recovery-test
    scores) for the teacher to compare - never an automated causal claim (see spec)."""

    student = models.ForeignKey("people.Student", on_delete=models.CASCADE, related_name="interventions")
    subject = models.ForeignKey("courses.CourseSubject", null=True, blank=True, on_delete=models.SET_NULL, related_name="interventions")
    created_by_teacher = models.ForeignKey("people.Employee", on_delete=models.CASCADE, related_name="created_interventions")
    intervention_type = models.CharField(max_length=30, choices=InterventionType.choices)
    reason = models.TextField()
    action_note = models.TextField(blank=True)
    linked_practice_assessment = models.ForeignKey(Assessment, null=True, blank=True, on_delete=models.SET_NULL, related_name="interventions")
    deadline = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=25, choices=InterventionStatus.choices, default=InterventionStatus.OPEN)
    before_score = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    after_score = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["organization", "student", "status"]),
            models.Index(fields=["organization", "created_by_teacher"]),
        ]


class StudentFeedback(OrganizationScopedModel):
    """Academic feedback a teacher sends to a student - always visible to the student
    (unlike TeacherPrivateNote). One row per (student, send action)."""

    student = models.ForeignKey("people.Student", on_delete=models.CASCADE, related_name="feedback_received")
    subject = models.ForeignKey("courses.CourseSubject", null=True, blank=True, on_delete=models.SET_NULL, related_name="feedback")
    created_by_teacher = models.ForeignKey("people.Employee", on_delete=models.CASCADE, related_name="feedback_sent")
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["organization", "student", "-created_at"])]


class TeacherPrivateNote(OrganizationScopedModel):
    """Private teacher observations about a student - teacher/head-teacher only.
    Never included in any student-facing serializer or view."""

    student = models.ForeignKey("people.Student", on_delete=models.CASCADE, related_name="private_notes")
    created_by_teacher = models.ForeignKey("people.Employee", on_delete=models.CASCADE, related_name="private_notes_written")
    note = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["organization", "student", "-created_at"])]


class StudentBookmark(OrganizationScopedModel):
    """Self-service - a student bookmarking a question for later review/practice.
    No teacher-side dependency."""

    student = models.ForeignKey("people.Student", on_delete=models.CASCADE, related_name="bookmarks")
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="bookmarked_by")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("student", "question")
        ordering = ["-created_at"]


class ComponentType(models.TextChoices):
    QUIZ = "quiz", "Quiz"
    ASSIGNMENT = "assignment", "Assignment"
    ATTENDANCE = "attendance", "Attendance"
    MODEL_TEST = "model_test", "Model Test"
    FINAL = "final", "Final"
    CUSTOM = "custom", "Custom"


class ComponentSourceType(models.TextChoices):
    AUTO_TEST = "auto_test", "Auto - Online Test"
    AUTO_ASSIGNMENT = "auto_assignment", "Auto - Assignment"
    MANUAL = "manual", "Manual Entry"


class AggregationRule(models.TextChoices):
    SUM_ALL = "sum_all", "Sum All"
    AVERAGE = "average", "Average"
    BEST_N = "best_n", "Best N"
    LATEST = "latest", "Latest"


class AssessmentComponent(OrganizationScopedModel):
    """One weighted grading component of a course-subject's assessment scheme
    (e.g. "Quiz 10%", "Final 25%") - the scheme itself is just this component list,
    not a separate wrapper entity. `source_assessments` is an explicit, deterministic
    pick of which Assessment rows feed this component (spec's own §9/§11: no fuzzy
    auto-matching by topic/tag)."""

    course_subject = models.ForeignKey("courses.CourseSubject", on_delete=models.CASCADE, related_name="assessment_components")
    name = models.CharField(max_length=120)
    code = models.CharField(max_length=40, blank=True)
    component_type = models.CharField(max_length=20, choices=ComponentType.choices, default=ComponentType.CUSTOM)
    total_marks = models.DecimalField(max_digits=7, decimal_places=2, default=100)
    weight_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    order = models.PositiveIntegerField(default=0)
    is_required = models.BooleanField(default=True)
    is_visible_to_student = models.BooleanField(default=True)
    include_in_final_grade = models.BooleanField(default=True)
    status = models.CharField(max_length=20, default="active")
    source_type = models.CharField(max_length=20, choices=ComponentSourceType.choices, default=ComponentSourceType.MANUAL)
    aggregation_rule = models.CharField(max_length=20, choices=AggregationRule.choices, default=AggregationRule.SUM_ALL)
    best_n_count = models.PositiveIntegerField(null=True, blank=True)
    source_assessments = models.ManyToManyField(Assessment, blank=True, related_name="feeds_components")

    class Meta:
        unique_together = ("course_subject", "code")
        ordering = ("order", "id")

    def __str__(self):
        return f"{self.course_subject} - {self.name}"


class CourseGradeScale(OrganizationScopedModel):
    """Course-scoped grade scale - deliberately distinct from apps.exams.GradeScale,
    which is tied to the unrelated academic_class/session school-exam pipeline."""

    course = models.ForeignKey("courses.Course", on_delete=models.CASCADE, related_name="grade_scales")
    name = models.CharField(max_length=120, default="Default Grade Scale")
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("-is_active", "name")

    def __str__(self):
        return f"{self.course} - {self.name}"


class CourseGradeScaleItem(OrganizationScopedModel):
    grade_scale = models.ForeignKey(CourseGradeScale, on_delete=models.CASCADE, related_name="items")
    min_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    max_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    grade = models.CharField(max_length=10)
    grade_point = models.DecimalField(max_digits=4, decimal_places=2)
    is_fail = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("-min_percentage",)


class CourseResultStatus(models.TextChoices):
    DRAFT = "draft", "Draft"
    CALCULATED = "calculated", "Calculated"
    PUBLISHED = "published", "Published"
    LOCKED = "locked", "Locked"


class ComponentDataStatus(models.TextChoices):
    NOT_ATTEMPTED = "not_attempted", "Not Attempted"
    MISSING = "missing", "Missing"
    NOT_GRADED = "not_graded", "Not Graded"
    EXCUSED = "excused", "Excused"
    COMPLETE = "complete", "Complete"


class StudentCourseResult(OrganizationScopedModel):
    """The authoritative, calculated result for one student in one course-subject.
    Never written to directly from React - only via services.calculate_course_result /
    publish_course_result, so teacher and student always see the identical number."""

    enrollment = models.ForeignKey("courses.Enrollment", on_delete=models.CASCADE, related_name="course_results")
    course_subject = models.ForeignKey("courses.CourseSubject", on_delete=models.CASCADE, related_name="student_results")
    status = models.CharField(max_length=20, choices=CourseResultStatus.choices, default=CourseResultStatus.DRAFT)
    total_percentage = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    grade = models.CharField(max_length=10, blank=True)
    grade_point = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    pass_status = models.CharField(max_length=20, blank=True)
    teacher_comment = models.TextField(blank=True)
    calculated_at = models.DateTimeField(null=True, blank=True)
    published_at = models.DateTimeField(null=True, blank=True)
    published_by = models.ForeignKey("people.Employee", null=True, blank=True, on_delete=models.SET_NULL, related_name="published_course_results")
    locked_at = models.DateTimeField(null=True, blank=True)
    updated_reason = models.CharField(max_length=255, blank=True)

    class Meta:
        unique_together = ("enrollment", "course_subject")
        indexes = [models.Index(fields=["organization", "course_subject", "status"])]

    def __str__(self):
        return f"{self.enrollment} - {self.course_subject}"


class StudentComponentResult(OrganizationScopedModel):
    course_result = models.ForeignKey(StudentCourseResult, on_delete=models.CASCADE, related_name="component_results")
    component = models.ForeignKey(AssessmentComponent, on_delete=models.CASCADE, related_name="student_results")
    raw_obtained = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    raw_total = models.DecimalField(max_digits=7, decimal_places=2, default=0)
    weighted_score = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    data_status = models.CharField(max_length=20, choices=ComponentDataStatus.choices, default=ComponentDataStatus.NOT_ATTEMPTED)
    is_manual = models.BooleanField(default=False)
    manual_comment = models.TextField(blank=True)
    updated_by_teacher = models.ForeignKey("people.Employee", null=True, blank=True, on_delete=models.SET_NULL, related_name="manually_graded_components")

    class Meta:
        unique_together = ("course_result", "component")


class CourseRating(OrganizationScopedModel):
    student = models.ForeignKey("people.Student", on_delete=models.CASCADE, related_name="course_ratings")
    enrollment = models.ForeignKey("courses.Enrollment", on_delete=models.CASCADE, related_name="course_ratings")
    course_subject = models.ForeignKey("courses.CourseSubject", on_delete=models.CASCADE, related_name="ratings")
    rating = models.PositiveSmallIntegerField()
    feedback_text = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("student", "enrollment", "course_subject")
