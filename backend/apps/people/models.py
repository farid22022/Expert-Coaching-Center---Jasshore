from django.db import models
from apps.core.models import OrganizationScopedModel, StatusChoices


class PersonGender(models.TextChoices):
    MALE = "male", "Male"
    FEMALE = "female", "Female"
    OTHER = "other", "Other"


class Guardian(OrganizationScopedModel):
    name = models.CharField(max_length=180)
    relation = models.CharField(max_length=80)
    phone = models.CharField(max_length=50, db_index=True)
    email = models.EmailField(blank=True)
    nid = models.CharField(max_length=80, blank=True)
    occupation = models.CharField(max_length=120, blank=True)
    address = models.TextField(blank=True)

    def __str__(self):
        return self.name


class StudentProfile(OrganizationScopedModel):
    user = models.OneToOneField("accounts.User", on_delete=models.CASCADE, related_name="student_profile")
    full_name = models.CharField(max_length=180)
    gender = models.CharField(max_length=20, choices=PersonGender.choices, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    phone = models.CharField(max_length=50, blank=True, db_index=True)
    email = models.EmailField(blank=True)
    photo = models.ImageField(upload_to="student-profiles/photos/", blank=True)
    guardian_name = models.CharField(max_length=180, blank=True)
    guardian_phone = models.CharField(max_length=50, blank=True)
    present_address = models.TextField(blank=True)
    permanent_address = models.TextField(blank=True)
    previous_education = models.CharField(max_length=255, blank=True)
    institution = models.CharField(max_length=255, blank=True)
    emergency_contact = models.CharField(max_length=80, blank=True)

    class Meta:
        indexes = [models.Index(fields=["organization", "phone"])]

    def __str__(self):
        return self.full_name


class Student(OrganizationScopedModel):
    student_id = models.CharField(max_length=80, db_index=True)
    admission_no = models.CharField(max_length=80, blank=True, db_index=True)
    roll = models.CharField(max_length=50, blank=True, db_index=True)
    registration_no = models.CharField(max_length=80, blank=True, db_index=True)
    full_name = models.CharField(max_length=180)
    full_name_bn = models.CharField(max_length=180, blank=True)
    gender = models.CharField(max_length=20, choices=PersonGender.choices, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    phone = models.CharField(max_length=50, blank=True, db_index=True)
    email = models.EmailField(blank=True)
    photo = models.ImageField(upload_to="students/photos/", blank=True)
    session = models.ForeignKey("academic.AcademicSession", null=True, blank=True, on_delete=models.SET_NULL)
    academic_class = models.ForeignKey("academic.AcademicClass", null=True, blank=True, on_delete=models.SET_NULL)
    section = models.ForeignKey("academic.Section", null=True, blank=True, on_delete=models.SET_NULL)
    group = models.ForeignKey("academic.StudentGroup", null=True, blank=True, on_delete=models.SET_NULL)
    shift = models.ForeignKey("academic.Shift", null=True, blank=True, on_delete=models.SET_NULL)
    category = models.ForeignKey("academic.StudentCategory", null=True, blank=True, on_delete=models.SET_NULL)
    guardians = models.ManyToManyField(Guardian, through="StudentGuardian", related_name="students")
    status = models.CharField(max_length=20, choices=StatusChoices.choices, default=StatusChoices.ACTIVE)
    rfid = models.CharField(max_length=120, blank=True, db_index=True)

    class Meta:
        unique_together = ("organization", "student_id")
        indexes = [
            models.Index(fields=["organization", "session", "academic_class", "section"]),
            models.Index(fields=["organization", "status"]),
        ]

    def __str__(self):
        return self.full_name


class StudentGuardian(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    guardian = models.ForeignKey(Guardian, on_delete=models.CASCADE)
    is_primary = models.BooleanField(default=False)

    class Meta:
        unique_together = ("student", "guardian")


class StudentAddress(OrganizationScopedModel):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="addresses")
    address_type = models.CharField(max_length=40, default="present")
    address = models.TextField()
    district = models.CharField(max_length=120, blank=True)
    upazila = models.CharField(max_length=120, blank=True)
    post_office = models.CharField(max_length=120, blank=True)


class StudentDocument(OrganizationScopedModel):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="documents")
    title = models.CharField(max_length=180)
    document_type = models.CharField(max_length=80)
    file = models.FileField(upload_to="students/documents/")


class StudentStatusHistory(OrganizationScopedModel):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="status_history")
    old_status = models.CharField(max_length=20, blank=True)
    new_status = models.CharField(max_length=20)
    reason = models.TextField(blank=True)


class Department(OrganizationScopedModel):
    name = models.CharField(max_length=120)

    class Meta:
        unique_together = ("organization", "name")


class Designation(OrganizationScopedModel):
    name = models.CharField(max_length=120)

    class Meta:
        unique_together = ("organization", "name")


class Employee(OrganizationScopedModel):
    employee_id = models.CharField(max_length=80, db_index=True)
    full_name = models.CharField(max_length=180)
    employee_type = models.CharField(max_length=40, default="employee", db_index=True)
    department = models.ForeignKey(Department, null=True, blank=True, on_delete=models.SET_NULL)
    designation = models.ForeignKey(Designation, null=True, blank=True, on_delete=models.SET_NULL)
    phone = models.CharField(max_length=50, blank=True, db_index=True)
    email = models.EmailField(blank=True)
    joining_date = models.DateField(null=True, blank=True)
    photo = models.ImageField(upload_to="employees/photos/", blank=True)
    rfid = models.CharField(max_length=120, blank=True, db_index=True)
    status = models.CharField(max_length=20, choices=StatusChoices.choices, default=StatusChoices.ACTIVE)

    class Meta:
        unique_together = ("organization", "employee_id")
        indexes = [models.Index(fields=["organization", "employee_type", "status"])]

    @property
    def is_teacher(self):
        return self.employee_type == "teacher"


class TeacherProfile(OrganizationScopedModel):
    """Teacher-specific professional data, kept separate from the shared employee record."""
    user = models.OneToOneField("accounts.User", on_delete=models.PROTECT, related_name="teacher_profile")
    employee = models.OneToOneField(Employee, on_delete=models.PROTECT, related_name="teacher_profile")
    gender = models.CharField(max_length=20, choices=PersonGender.choices, blank=True)
    qualification = models.CharField(max_length=255, blank=True)
    specialization = models.CharField(max_length=255, blank=True)
    bio = models.TextField(blank=True)
    invitation_token_hash = models.CharField(max_length=255, blank=True)
    invitation_expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [models.Index(fields=["organization", "specialization"])]

    def __str__(self):
        return self.employee.full_name
