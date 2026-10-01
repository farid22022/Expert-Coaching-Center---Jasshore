from django.db.models import Q
from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from apps.core.viewsets import OrganizationScopedModelViewSet
from apps.people.models import Employee
from .models import SubjectWeek, CourseChapter, TeacherAssignment
from .services import ensure_head_teacher_of_course


class WeekSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source="subject.name", read_only=True)

    class Meta:
        model = SubjectWeek
        fields = "__all__"
        read_only_fields = ("organization", "created_by", "updated_by")


class ChapterSerializer(serializers.ModelSerializer):
    subject = serializers.IntegerField(source="week.subject_id", read_only=True)
    week_title = serializers.CharField(source="week.title", read_only=True)

    class Meta:
        model = CourseChapter
        fields = "__all__"
        read_only_fields = ("organization", "created_by", "updated_by")


class CurriculumViewSet(OrganizationScopedModelViewSet):
    permission_classes = [IsAuthenticated]
    pagination_class = None
    subject_path = "subject"
    ordering = ("id",)

    def _teacher(self):
        return Employee.objects.filter(organization=self.request.user.organization, email=self.request.user.email, employee_type="teacher").first()

    def get_queryset(self):
        qs = super().get_queryset().filter(organization=self.request.user.organization)
        if self.request.user.is_staff or self.request.user.is_superuser:
            return qs
        teacher = self._teacher()
        if not teacher:
            return qs.none()
        scope = Q(pk__in=[])
        for assignment in TeacherAssignment.objects.filter(organization=self.request.user.organization, teacher=teacher, is_active=True, assignment_status="accepted"):
            match = {f"{self.subject_path}__course_section__course_id": assignment.course_id}
            if assignment.role != "head_teacher":
                if assignment.subject_id:
                    match[f"{self.subject_path}_id"] = assignment.subject_id
                elif assignment.course_section_id:
                    match[f"{self.subject_path}__course_section_id"] = assignment.course_section_id
            scope |= Q(**match)
        return qs.filter(scope)

    def _validate_scope(self, serializer):
        field = "subject" if self.subject_path == "subject" else "week"
        parent = serializer.validated_data.get(field) or getattr(serializer.instance, field, None)
        subject = parent if field == "subject" else parent.subject
        if parent.organization_id != self.request.user.organization_id or subject.organization_id != self.request.user.organization_id:
            raise ValidationError({field: "Choose a record in your organization."})
        if not (self.request.user.is_staff or self.request.user.is_superuser):
            ensure_head_teacher_of_course(self._teacher(), self.request.user.organization, subject.course_section.course_id)
        if serializer.instance and getattr(serializer.instance, f"{field}_id") != parent.id:
            raise ValidationError({field: "Create a new record to move curriculum between subjects or weeks."})

    def perform_create(self, serializer):
        self._validate_scope(serializer)
        super().perform_create(serializer)

    def perform_update(self, serializer):
        self._validate_scope(serializer)
        serializer.save(organization=self.request.user.organization, updated_by=self.request.user)

    def perform_destroy(self, instance):
        # Archiving a week preserves the chapter links and students' history.
        raise PermissionDenied("Keep curriculum history: unpublish the week instead of deleting it.")


class SubjectWeekViewSet(CurriculumViewSet):
    queryset = SubjectWeek.objects.select_related("subject__course_section")
    serializer_class = WeekSerializer
    filterset_fields = ("subject",)
    ordering = ("number", "id")


class CourseChapterViewSet(CurriculumViewSet):
    queryset = CourseChapter.objects.select_related("week__subject__course_section")
    serializer_class = ChapterSerializer
    subject_path = "week__subject"
    filterset_fields = ("week", "week__subject")
    ordering = ("order", "id")
