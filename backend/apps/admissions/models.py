from django.db import models
from apps.core.fields import HostedImageField
from apps.core.models import OrganizationScopedModel


class ApplicationStatus(models.TextChoices):
    DRAFT = "draft", "Draft"
    PENDING = "pending", "Pending"
    UNDER_REVIEW = "under_review", "Under review"
    APPROVED = "approved", "Approved"
    REJECTED = "rejected", "Rejected"
    CANCELLED = "cancelled", "Cancelled"


class AdmissionApplication(OrganizationScopedModel):
    application_no = models.CharField(max_length=80, db_index=True)
    applicant = models.ForeignKey("accounts.User", null=True, blank=True, on_delete=models.SET_NULL, related_name="admission_applications")
    course = models.ForeignKey("courses.Course", null=True, blank=True, on_delete=models.PROTECT, related_name="admission_applications")
    session = models.ForeignKey("academic.AcademicSession", null=True, blank=True, on_delete=models.PROTECT)
    academic_class = models.ForeignKey("academic.AcademicClass", null=True, blank=True, on_delete=models.PROTECT)
    group = models.ForeignKey("academic.StudentGroup", null=True, blank=True, on_delete=models.SET_NULL)
    shift = models.ForeignKey("academic.Shift", null=True, blank=True, on_delete=models.SET_NULL)
    applicant_name = models.CharField(max_length=180)
    applicant_phone = models.CharField(max_length=50, db_index=True)
    applicant_email = models.EmailField(blank=True)
    applicant_name_bn = models.CharField(max_length=180, blank=True)
    gender = models.CharField(max_length=20, blank=True)
    religion = models.CharField(max_length=80, blank=True)
    blood_group = models.CharField(max_length=20, blank=True)
    birth_certificate_no = models.CharField(max_length=100, blank=True)
    student_uid = models.CharField(max_length=100, blank=True)
    address = models.TextField(blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    guardian_name = models.CharField(max_length=180, blank=True)
    guardian_phone = models.CharField(max_length=50, blank=True)
    father_name = models.CharField(max_length=180, blank=True)
    father_name_bn = models.CharField(max_length=180, blank=True)
    father_phone = models.CharField(max_length=50, blank=True)
    father_nid = models.CharField(max_length=100, blank=True)
    father_profession = models.CharField(max_length=120, blank=True)
    mother_name = models.CharField(max_length=180, blank=True)
    mother_name_bn = models.CharField(max_length=180, blank=True)
    mother_phone = models.CharField(max_length=50, blank=True)
    mother_nid = models.CharField(max_length=100, blank=True)
    mother_profession = models.CharField(max_length=120, blank=True)
    guardian_relation = models.CharField(max_length=80, blank=True)
    previous_institute = models.CharField(max_length=255, blank=True)
    photo = HostedImageField(upload_to="admissions/photos/", blank=True)
    payment_status = models.CharField(max_length=30, default="pending", db_index=True)
    payment_reference = models.CharField(max_length=120, blank=True)
    status = models.CharField(max_length=20, choices=ApplicationStatus.choices, default=ApplicationStatus.PENDING, db_index=True)
    approved_student = models.ForeignKey("people.Student", null=True, blank=True, on_delete=models.SET_NULL)
    remarks = models.TextField(blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey("accounts.User", null=True, blank=True, on_delete=models.SET_NULL, related_name="reviewed_admission_applications")
    approved_at = models.DateTimeField(null=True, blank=True)
    rejected_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    form_data = models.JSONField(default=dict, blank=True)

    class Meta:
        unique_together = ("organization", "application_no")
        indexes = [
            models.Index(fields=["organization", "status", "session", "academic_class"]),
            models.Index(fields=["organization", "course", "status"]),
        ]


class ApplicantDocument(OrganizationScopedModel):
    application = models.ForeignKey(AdmissionApplication, on_delete=models.CASCADE, related_name="documents")
    title = models.CharField(max_length=180)
    file = models.FileField(upload_to="admissions/documents/")


class AdmissionPayment(OrganizationScopedModel):
    application = models.ForeignKey(AdmissionApplication, on_delete=models.CASCADE, related_name="payments")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    method = models.CharField(max_length=80, blank=True)
    reference = models.CharField(max_length=120, blank=True, db_index=True)
    status = models.CharField(max_length=20, default="pending", db_index=True)
    paid_at = models.DateTimeField(null=True, blank=True)


class AdmissionExam(OrganizationScopedModel):
    name = models.CharField(max_length=180)
    session = models.ForeignKey("academic.AcademicSession", on_delete=models.CASCADE)
    academic_class = models.ForeignKey("academic.AcademicClass", on_delete=models.CASCADE)
    exam_date = models.DateField(null=True, blank=True)
    total_marks = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    pass_marks = models.DecimalField(max_digits=8, decimal_places=2, default=0)


class AdmissionExamMark(OrganizationScopedModel):
    exam = models.ForeignKey(AdmissionExam, on_delete=models.CASCADE, related_name="marks")
    application = models.ForeignKey(AdmissionApplication, on_delete=models.CASCADE, related_name="exam_marks")
    obtained_marks = models.DecimalField(max_digits=8, decimal_places=2)

    class Meta:
        unique_together = ("exam", "application")


class AdmissionResult(OrganizationScopedModel):
    exam = models.ForeignKey(AdmissionExam, on_delete=models.CASCADE, related_name="results")
    application = models.ForeignKey(AdmissionApplication, on_delete=models.CASCADE)
    obtained_marks = models.DecimalField(max_digits=8, decimal_places=2)
    position = models.PositiveIntegerField(null=True, blank=True)
    is_selected = models.BooleanField(default=False)
    processed_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("exam", "application")

