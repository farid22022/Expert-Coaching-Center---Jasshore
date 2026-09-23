from django.utils import timezone
from django.db.models import Q
from rest_framework import status
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle

from apps.core.permissions import HasActionPermission
from apps.core.responses import success_response
from apps.core.viewsets import OrganizationScopedModelViewSet
from apps.people.models import Student
from apps.courses.models import CourseSubject, TeacherAssignment
from apps.people.models import Employee
from . import models, serializers
from .services import AssessmentService


class AssessmentAdminViewSet(OrganizationScopedModelViewSet):
    permission_classes = [HasActionPermission]
    permission_module = "assessment"

    def _teacher(self):
        return Employee.objects.filter(
            organization=self.get_request_organization(),
            email=self.request.user.email,
            employee_type="teacher",
        ).first()

    def perform_create(self, serializer):
        teacher = self._teacher()
        extra = {"created_by": self.request.user, "updated_by": self.request.user}
        if teacher and hasattr(serializer.Meta.model, "created_by_teacher"):
            extra["created_by_teacher"] = teacher
        serializer.save(organization=self.get_request_organization(), **extra)

    def get_queryset(self):
        queryset = super().get_queryset()
        teacher = self._teacher()
        if teacher and not self.request.user.is_staff and not self.request.user.is_superuser and hasattr(queryset.model, "created_by_teacher"):
            assigned_courses = TeacherAssignment.objects.filter(
                organization=teacher.organization, teacher=teacher, is_active=True
            ).values_list("course_id", flat=True)
            return queryset.filter(created_by_teacher=teacher) | queryset.filter(course_id__in=assigned_courses)
        return queryset


class CourseMaterialViewSet(AssessmentAdminViewSet):
    queryset = models.CourseMaterial.objects.select_related("course", "course_section", "subject", "created_by_teacher")
    serializer_class = serializers.CourseMaterialSerializer
    search_fields = ("title", "description", "course__title", "subject__name")
    filterset_fields = ("course", "course_section", "subject", "material_type", "is_published")


class QuestionViewSet(AssessmentAdminViewSet):
    queryset = models.Question.objects.select_related("course", "course_section", "subject", "created_by_teacher").prefetch_related("options")
    serializer_class = serializers.QuestionSerializer
    search_fields = ("text", "course__title", "subject__name")
    filterset_fields = ("course", "course_section", "subject", "created_by_teacher", "question_type", "status")


class QuestionOptionViewSet(AssessmentAdminViewSet):
    queryset = models.QuestionOption.objects.select_related("question")
    serializer_class = serializers.QuestionOptionSerializer
    filterset_fields = ("question", "is_correct")


class AssessmentViewSet(AssessmentAdminViewSet):
    queryset = models.Assessment.objects.select_related("course", "course_section", "subject", "created_by_teacher")
    serializer_class = serializers.AssessmentSerializer
    search_fields = ("title", "course__title", "subject__name")
    filterset_fields = ("assessment_type", "course", "course_section", "subject", "status")

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        assessment = self.get_object()
        assessment.status = models.AssessmentStatus.PUBLISHED
        assessment.published_at = timezone.now()
        assessment.updated_by = request.user
        assessment.save(update_fields=["status", "published_at", "updated_by", "updated_at"])
        return success_response(self.get_serializer(assessment).data, "Assessment published.")


class AssessmentQuestionViewSet(AssessmentAdminViewSet):
    queryset = models.AssessmentQuestion.objects.select_related("assessment", "question")
    serializer_class = serializers.AssessmentQuestionSerializer
    filterset_fields = ("assessment", "question")


class AttemptViewSet(AssessmentAdminViewSet):
    queryset = models.AssessmentAttempt.objects.select_related("assessment", "student")
    serializer_class = serializers.AssessmentAttemptSerializer
    filterset_fields = ("assessment", "student", "status")


class AssignmentSubmissionViewSet(AssessmentAdminViewSet):
    queryset = models.AssignmentSubmission.objects.select_related("assessment", "student", "evaluated_by").prefetch_related("attachments")
    serializer_class = serializers.AssignmentSubmissionSerializer
    filterset_fields = ("assessment", "student", "status", "evaluated_by")

    @action(detail=True, methods=["post"])
    def evaluate(self, request, pk=None):
        teacher = Employee.objects.filter(organization=request.user.organization, email=request.user.email, employee_type="teacher").first()
        if not teacher and not request.user.is_staff and not request.user.is_superuser:
            return Response({"detail": "Teacher record not found."}, status=status.HTTP_403_FORBIDDEN)
        submission = AssessmentService.evaluate_submission(
            self.get_object(),
            teacher,
            request.data.get("marks_obtained", 0),
            request.data.get("feedback", ""),
            request.user,
        )
        return Response(self.get_serializer(submission).data)


class SubmissionAttachmentViewSet(AssessmentAdminViewSet):
    queryset = models.SubmissionAttachment.objects.select_related("submission")
    serializer_class = serializers.SubmissionAttachmentSerializer
    filterset_fields = ("submission", "content_type")


class StudentAssessmentViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = serializers.AssessmentSerializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "assessment_submit"

    def get_queryset(self):
        user = self.request.user
        student = Student.objects.filter(organization=user.organization, email=user.email).first()
        if not student:
            return models.Assessment.objects.none()
        enrolled_course_ids = student.course_enrollments.filter(status="active").values_list("course_id", flat=True)
        return models.Assessment.objects.filter(
            organization=user.organization,
            course_id__in=enrolled_course_ids,
        ).select_related("course", "course_section", "subject")

    @action(detail=False, methods=["get"])
    def materials(self, request):
        queryset = self.get_queryset()
        materials = models.CourseMaterial.objects.filter(
            organization=request.user.organization,
            course_id__in=queryset.values_list("course_id", flat=True),
            is_published=True,
        ).select_related("course", "course_section", "subject", "created_by_teacher")
        return Response(serializers.CourseMaterialSerializer(materials, many=True).data)

    @action(detail=True, methods=["post"])
    def start(self, request, pk=None):
        student = Student.objects.filter(organization=request.user.organization, email=request.user.email).first()
        if not student:
            return Response({"detail": "Student record not found."}, status=404)
        attempt = AssessmentService.start_attempt(self.get_object(), student, request.user)
        return Response(serializers.StudentAttemptSerializer(attempt, context={"request": request}).data)

    @action(detail=True, methods=["post"])
    def answer(self, request, pk=None):
        attempt = models.AssessmentAttempt.objects.get(id=request.data.get("attempt"), assessment=self.get_object())
        question = models.Question.objects.get(id=request.data.get("question"))
        answer = AssessmentService.save_answer(attempt, question, request.data.get("selected_options", []), request.user)
        return Response(serializers.StudentAnswerSerializer(answer).data)

    @action(detail=True, methods=["post"])
    def submit(self, request, pk=None):
        attempt = models.AssessmentAttempt.objects.get(id=request.data.get("attempt"), assessment=self.get_object())
        attempt = AssessmentService.submit_attempt(attempt, request.user)
        return Response(serializers.AssessmentAttemptSerializer(attempt).data)

    @action(detail=False, methods=["get"])
    def dashboard(self, request):
        queryset = self.get_queryset()
        now = timezone.now()
        available = queryset.filter(
            status__in=[models.AssessmentStatus.PUBLISHED, models.AssessmentStatus.SCHEDULED, models.AssessmentStatus.LIVE]
        ).filter(
            Q(starts_at__isnull=True) | Q(starts_at__lte=now),
            Q(ends_at__isnull=True) | Q(ends_at__gte=now),
        )
        data = {
            "upcoming_tests": queryset.filter(starts_at__gt=now).count(),
            "live_tests": [serializers.AssessmentSerializer(item).data for item in available[:10]],
            "results": serializers.AssessmentAttemptSerializer(
                models.AssessmentAttempt.objects.filter(student__email=request.user.email).exclude(status=models.AttemptStatus.IN_PROGRESS)[:10],
                many=True,
            ).data,
        }
        return Response(data)

    @action(detail=True, methods=["post"])
    def submit_assignment(self, request, pk=None):
        student = Student.objects.filter(organization=request.user.organization, email=request.user.email).first()
        if not student:
            return Response({"detail": "Student record not found."}, status=404)
        submission = AssessmentService.submit_assignment(self.get_object(), student, request.FILES.getlist("files"), request.user)
        return Response(serializers.AssignmentSubmissionSerializer(submission).data)

    @action(detail=False, methods=["get"])
    def performance(self, request):
        student = Student.objects.filter(organization=request.user.organization, email=request.user.email).first()
        if not student:
            return Response({"detail": "Student record not found."}, status=404)
        return Response(AssessmentService.student_performance(student))

    @action(detail=False, methods=["get"])
    def history(self, request):
        attempts = models.AssessmentAttempt.objects.filter(student__email=request.user.email).exclude(status=models.AttemptStatus.IN_PROGRESS)
        submissions = models.AssignmentSubmission.objects.filter(student__email=request.user.email)
        return Response({
            "attempts": serializers.AssessmentAttemptSerializer(attempts, many=True).data,
            "submissions": serializers.AssignmentSubmissionSerializer(submissions, many=True).data,
        })


class AnalyticsViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=["get"])
    def teacher(self, request):
        teacher = Employee.objects.filter(organization=request.user.organization, email=request.user.email, employee_type="teacher").first()
        if not teacher:
            return Response({"detail": "Teacher record not found."}, status=404)
        return Response(AssessmentService.teacher_analytics(teacher))

    @action(detail=False, methods=["get"], url_path="subject/(?P<subject_id>[^/.]+)")
    def subject(self, request, subject_id=None):
        subject = CourseSubject.objects.get(organization=request.user.organization, id=subject_id)
        return Response(AssessmentService.subject_performance(subject))
