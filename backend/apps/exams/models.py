from django.db import models
from apps.core.models import OrganizationScopedModel


class GradeScale(OrganizationScopedModel):
    name = models.CharField(max_length=120)
    min_mark = models.DecimalField(max_digits=6, decimal_places=2)
    max_mark = models.DecimalField(max_digits=6, decimal_places=2)
    grade = models.CharField(max_length=10)
    gpa = models.DecimalField(max_digits=4, decimal_places=2)
    is_fail = models.BooleanField(default=False)

    class Meta:
        ordering = ("-min_mark",)


class Exam(OrganizationScopedModel):
    name = models.CharField(max_length=180)
    session = models.ForeignKey("academic.AcademicSession", on_delete=models.CASCADE)
    academic_class = models.ForeignKey("academic.AcademicClass", on_delete=models.CASCADE)
    starts_on = models.DateField(null=True, blank=True)
    ends_on = models.DateField(null=True, blank=True)
    published = models.BooleanField(default=False)


class ExamSubject(OrganizationScopedModel):
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name="subjects")
    subject = models.ForeignKey("academic.Subject", on_delete=models.CASCADE)
    written_marks = models.DecimalField(max_digits=7, decimal_places=2, default=0)
    practical_marks = models.DecimalField(max_digits=7, decimal_places=2, default=0)
    assessment_marks = models.DecimalField(max_digits=7, decimal_places=2, default=0)
    pass_marks = models.DecimalField(max_digits=7, decimal_places=2, default=0)

    @property
    def total_marks(self):
        return self.written_marks + self.practical_marks + self.assessment_marks


class StudentMark(OrganizationScopedModel):
    exam_subject = models.ForeignKey(ExamSubject, on_delete=models.CASCADE, related_name="marks")
    student = models.ForeignKey("people.Student", on_delete=models.CASCADE, related_name="marks")
    written_obtained = models.DecimalField(max_digits=7, decimal_places=2, default=0)
    practical_obtained = models.DecimalField(max_digits=7, decimal_places=2, default=0)
    assessment_obtained = models.DecimalField(max_digits=7, decimal_places=2, default=0)

    class Meta:
        unique_together = ("exam_subject", "student")

    @property
    def total_obtained(self):
        return self.written_obtained + self.practical_obtained + self.assessment_obtained


class ProcessedResult(OrganizationScopedModel):
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name="processed_results")
    student = models.ForeignKey("people.Student", on_delete=models.CASCADE)
    total_marks = models.DecimalField(max_digits=9, decimal_places=2)
    obtained_marks = models.DecimalField(max_digits=9, decimal_places=2)
    gpa = models.DecimalField(max_digits=4, decimal_places=2)
    grade = models.CharField(max_length=10)
    status = models.CharField(max_length=20, default="passed")
    position = models.PositiveIntegerField(null=True, blank=True)
    published = models.BooleanField(default=False)

    class Meta:
        unique_together = ("exam", "student")


class GrandExamConfiguration(OrganizationScopedModel):
    name = models.CharField(max_length=180)
    session = models.ForeignKey("academic.AcademicSession", on_delete=models.CASCADE)
    academic_class = models.ForeignKey("academic.AcademicClass", on_delete=models.CASCADE)
    exams = models.ManyToManyField(Exam, through="GrandExamWeight")
    promotion_rule = models.JSONField(default=dict, blank=True)


class GrandExamWeight(models.Model):
    configuration = models.ForeignKey(GrandExamConfiguration, on_delete=models.CASCADE)
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE)
    weight_percentage = models.DecimalField(max_digits=5, decimal_places=2)


class GrandResult(OrganizationScopedModel):
    configuration = models.ForeignKey(GrandExamConfiguration, on_delete=models.CASCADE)
    student = models.ForeignKey("people.Student", on_delete=models.CASCADE)
    weighted_marks = models.DecimalField(max_digits=9, decimal_places=2)
    gpa = models.DecimalField(max_digits=4, decimal_places=2)
    grade = models.CharField(max_length=10)
    promoted = models.BooleanField(default=False)
    position = models.PositiveIntegerField(null=True, blank=True)

