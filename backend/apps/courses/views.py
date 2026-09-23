from django.db.models import Q
from django.utils import timezone
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.core.permissions import HasActionPermission
from apps.core.responses import success_response
from apps.core.viewsets import OrganizationScopedModelViewSet
from . import models, serializers


class CourseViewSet(OrganizationScopedModelViewSet):
    queryset = models.Course.objects.select_related("session").prefetch_related(
        "sections",
        "sections__subjects",
        "teacher_assignments__teacher",
    )
    serializer_class = serializers.CourseSerializer
    permission_classes = [HasActionPermission]
    permission_module = "course"
    search_fields = ("title", "code", "description")
    filterset_fields = ("course_type", "status", "is_published", "session")

    def _public_admission_queryset(self):
        return self.queryset.filter(
            is_published=True,
            status__in=[
                models.CourseStatus.PUBLISHED,
                models.CourseStatus.ADMISSION_OPEN,
                models.CourseStatus.RUNNING,
            ],
        ).filter(
            Q(course_type=models.CourseType.ADMISSION) |
            Q(status=models.CourseStatus.ADMISSION_OPEN)
        ).order_by("-created_at", "title")

    @action(
        detail=False,
        methods=["get"],
        url_path="public-admissions",
        permission_classes=[permissions.AllowAny],
        authentication_classes=[],
    )
    def public_admissions(self, request):
        serializer = self.get_serializer(self._public_admission_queryset(), many=True)
        return success_response(serializer.data, "Admission cards loaded.")

    @action(
        detail=False,
        methods=["get"],
        url_path=r"public-admissions/(?P<identifier>[^/.]+)",
        permission_classes=[permissions.AllowAny],
        authentication_classes=[],
    )
    def public_admission_detail(self, request, identifier=None):
        queryset = self._public_admission_queryset()
        lookup = Q(slug=identifier)
        if str(identifier).isdigit():
            lookup |= Q(pk=int(identifier))
        course = queryset.filter(lookup).first()
        if not course:
            return Response({"detail": "Admission card not found."}, status=404)
        return success_response(self.get_serializer(course).data, "Admission card loaded.")


class CourseSectionViewSet(OrganizationScopedModelViewSet):
    queryset = models.CourseSection.objects.select_related("course", "head_teacher")
    serializer_class = serializers.CourseSectionSerializer
    permission_classes = [HasActionPermission]
    permission_module = "course"
    search_fields = ("name", "description", "course__title")
    filterset_fields = ("course", "head_teacher", "status")


class CourseSubjectViewSet(OrganizationScopedModelViewSet):
    queryset = models.CourseSubject.objects.select_related("course_section", "course_section__course")
    serializer_class = serializers.CourseSubjectSerializer
    permission_classes = [HasActionPermission]
    permission_module = "course"
    search_fields = ("name", "code", "description", "course_section__name", "course_section__course__title")
    filterset_fields = ("course_section", "status")


class TeacherAssignmentViewSet(OrganizationScopedModelViewSet):
    queryset = models.TeacherAssignment.objects.select_related("teacher", "course", "course_section", "subject")
    serializer_class = serializers.TeacherAssignmentSerializer
    permission_classes = [HasActionPermission]
    permission_module = "course"
    search_fields = ("teacher__full_name", "teacher__employee_id", "course__title", "subject__name")
    filterset_fields = ("teacher", "course", "course_section", "subject", "role", "is_active")

    def perform_create(self, serializer):
        serializer.save(
            organization=self.get_request_organization(),
            created_by=self.request.user,
            updated_by=self.request.user,
            assigned_by=self.request.user,
        )


class EnrollmentViewSet(OrganizationScopedModelViewSet):
    queryset = models.Enrollment.objects.select_related("student", "course", "course_section", "application", "payment")
    serializer_class = serializers.EnrollmentSerializer
    permission_classes = [HasActionPermission]
    permission_module = "course"
    search_fields = ("enrollment_number", "student__full_name", "student__student_id", "course__title")
    filterset_fields = ("student", "course", "course_section", "status")

    @action(detail=True, methods=["post"])
    def activate(self, request, pk=None):
        enrollment = self.get_object()
        enrollment.status = models.EnrollmentStatus.ACTIVE
        enrollment.enrolled_at = enrollment.enrolled_at or timezone.now()
        enrollment.updated_by = request.user
        enrollment.save(update_fields=["status", "enrolled_at", "updated_by", "updated_at"])
        return success_response(self.get_serializer(enrollment).data, "Enrollment activated.")


class TeacherDashboardViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def _assignments(self, request):
        return models.TeacherAssignment.objects.filter(
            organization=request.user.organization,
            teacher__email=request.user.email,
            is_active=True,
        ).select_related("course", "course_section", "subject", "teacher")

    def list(self, request):
        assignments = self._assignments(request)
        courses = {item.course_id: item.course for item in assignments}
        sections = {item.course_section_id: item.course_section for item in assignments if item.course_section_id}
        subjects = {item.subject_id: item.subject for item in assignments if item.subject_id}
        students = models.Enrollment.objects.filter(
            organization=request.user.organization,
            course_id__in=courses.keys(),
            status=models.EnrollmentStatus.ACTIVE,
        ).select_related("student").values(
            "student_id", "student__student_id", "student__full_name", "student__email", "course_id"
        )
        return Response({
            "assigned_courses": serializers.CourseSerializer(courses.values(), many=True).data,
            "assigned_sections": serializers.CourseSectionSerializer(sections.values(), many=True).data,
            "assigned_subjects": serializers.CourseSubjectSerializer(subjects.values(), many=True).data,
            "assignments": serializers.TeacherAssignmentSerializer(assignments, many=True).data,
            "students": list(students),
            "is_head_teacher": assignments.filter(role=models.AssignmentRole.HEAD_TEACHER).exists(),
        })
