from django.db import models
from apps.core.models import OrganizationScopedModel, StatusChoices


class AcademicSession(OrganizationScopedModel):
    name = models.CharField(max_length=80)
    starts_on = models.DateField(null=True, blank=True)
    ends_on = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ("organization", "name")
        indexes = [models.Index(fields=["organization", "is_active"])]

    def __str__(self):
        return self.name


class Shift(OrganizationScopedModel):
    name = models.CharField(max_length=120)
    start_time = models.TimeField(null=True, blank=True)
    late_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    sorting = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ("organization", "name")


class StudentGroup(OrganizationScopedModel):
    name = models.CharField(max_length=120)

    class Meta:
        unique_together = ("organization", "name")


class StudentCategory(OrganizationScopedModel):
    name = models.CharField(max_length=120)

    class Meta:
        unique_together = ("organization", "name")


class AcademicClass(OrganizationScopedModel):
    name = models.CharField(max_length=120)
    sorting = models.PositiveIntegerField(default=0)
    group_required = models.BooleanField(default=False)

    class Meta:
        unique_together = ("organization", "name")
        ordering = ("sorting", "name")


class Section(OrganizationScopedModel):
    academic_class = models.ForeignKey(AcademicClass, on_delete=models.CASCADE, related_name="sections")
    shift = models.ForeignKey(Shift, null=True, blank=True, on_delete=models.SET_NULL, related_name="sections")
    name = models.CharField(max_length=120)

    class Meta:
        unique_together = ("organization", "academic_class", "shift", "name")


class Subject(OrganizationScopedModel):
    academic_class = models.ForeignKey(AcademicClass, null=True, blank=True, on_delete=models.SET_NULL, related_name="subjects")
    groups = models.ManyToManyField(StudentGroup, blank=True, related_name="subjects")
    code = models.CharField(max_length=50, db_index=True)
    name = models.CharField(max_length=180)
    category = models.CharField(max_length=80, blank=True)
    session = models.ForeignKey(AcademicSession, null=True, blank=True, on_delete=models.SET_NULL)

    class Meta:
        unique_together = ("organization", "code", "session")
        indexes = [models.Index(fields=["organization", "code"])]


class CombinedSubject(OrganizationScopedModel):
    academic_class = models.ForeignKey(AcademicClass, on_delete=models.CASCADE, related_name="combined_subjects")
    name = models.CharField(max_length=180)
    subjects = models.ManyToManyField(Subject, related_name="combined_in")


class Building(OrganizationScopedModel):
    name = models.CharField(max_length=180)
    full_name = models.CharField(max_length=255, blank=True)

    class Meta:
        unique_together = ("organization", "name")


class Floor(OrganizationScopedModel):
    building = models.ForeignKey(Building, on_delete=models.CASCADE, related_name="floors")
    name = models.CharField(max_length=120)
    full_name = models.CharField(max_length=255, blank=True)

    class Meta:
        unique_together = ("building", "name")


class Classroom(OrganizationScopedModel):
    building = models.ForeignKey(Building, on_delete=models.CASCADE, related_name="classrooms")
    floor = models.ForeignKey(Floor, null=True, blank=True, on_delete=models.SET_NULL, related_name="classrooms")
    room_no = models.CharField(max_length=80)
    full_name = models.CharField(max_length=255, blank=True)

    class Meta:
        unique_together = ("organization", "building", "room_no")


class ClassTeacherAssignment(OrganizationScopedModel):
    teacher = models.ForeignKey("people.Employee", on_delete=models.CASCADE, related_name="class_teacher_assignments")
    academic_class = models.ForeignKey(AcademicClass, on_delete=models.CASCADE)
    section = models.ForeignKey(Section, null=True, blank=True, on_delete=models.SET_NULL)
    session = models.ForeignKey(AcademicSession, on_delete=models.CASCADE)

    class Meta:
        unique_together = ("organization", "teacher", "academic_class", "section", "session")


class Syllabus(OrganizationScopedModel):
    session = models.ForeignKey(AcademicSession, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to="academic/syllabus/", blank=True)
    description = models.TextField(blank=True)


class ClassRoutine(OrganizationScopedModel):
    session = models.ForeignKey(AcademicSession, on_delete=models.CASCADE)
    academic_class = models.ForeignKey(AcademicClass, on_delete=models.CASCADE)
    section = models.ForeignKey(Section, null=True, blank=True, on_delete=models.SET_NULL)
    shift = models.ForeignKey(Shift, null=True, blank=True, on_delete=models.SET_NULL)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    teacher = models.ForeignKey("people.Employee", null=True, blank=True, on_delete=models.SET_NULL)
    classroom = models.ForeignKey(Classroom, null=True, blank=True, on_delete=models.SET_NULL)
    weekday = models.CharField(max_length=20)
    starts_at = models.TimeField()
    ends_at = models.TimeField()
    status = models.CharField(max_length=20, choices=StatusChoices.choices, default=StatusChoices.ACTIVE)

    class Meta:
        indexes = [models.Index(fields=["organization", "session", "academic_class", "weekday"])]

