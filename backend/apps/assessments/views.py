from django.utils import timezone
from django.db.models import Q
from rest_framework import status
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle

from apps.core.permissions import HasActionPermission
from apps.core.responses import success_response
from apps.core.viewsets import OrganizationScopedModelViewSet
from apps.people.models import Student
from apps.courses.models import CourseSubject, EnrollmentStatus, TeacherAssignment
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

    def _is_head_teacher(self, teacher, course_id, section_id=None):
        assignments = TeacherAssignment.objects.filter(
            organization=teacher.organization,
            teacher=teacher,
            course_id=course_id,
            role="head_teacher",
            is_active=True,
            assignment_status="accepted",
        )
        return assignments.filter(Q(course_section__isnull=True) | Q(course_section_id=section_id)).exists()

    def _ensure_scope(self, teacher, course_id, section_id=None, subject_id=None):
        if not teacher:
            raise PermissionDenied("A teacher profile is required for academic content.")
        if self._is_head_teacher(teacher, course_id, section_id):
            return True
        assignments = TeacherAssignment.objects.filter(
            organization=teacher.organization,
            teacher=teacher,
            course_id=course_id,
            is_active=True,
            assignment_status="accepted",
        )
        if section_id:
            assignments = assignments.filter(Q(course_section__isnull=True) | Q(course_section_id=section_id))
        if subject_id:
            assignments = assignments.filter(Q(subject__isnull=True) | Q(subject_id=subject_id))
        if not assignments.exists():
            raise PermissionDenied("You are not assigned to this admission subject.")
        return False

    def perform_create(self, serializer):
        teacher = self._teacher()
        if not hasattr(serializer.Meta.model, "course"):
            serializer.save(
                organization=self.get_request_organization(),
                created_by=self.request.user,
                updated_by=self.request.user,
            )
            return
        values = serializer.validated_data
        course_id = values["course"].id
        section_id = values.get("course_section").id if values.get("course_section") else None
        subject_id = values.get("subject").id if values.get("subject") else None
        is_head = self._ensure_scope(teacher, course_id, section_id, subject_id)
        extra = {"created_by": self.request.user, "updated_by": self.request.user}
        if teacher and hasattr(serializer.Meta.model, "created_by_teacher"):
            extra["created_by_teacher"] = teacher
        if hasattr(serializer.Meta.model, "review_status"):
            extra["review_status"] = "approved" if is_head else "pending"
            if serializer.Meta.model is models.CourseMaterial:
                extra.update({"is_published": is_head, "status": "published" if is_head else "draft"})
            elif serializer.Meta.model is models.Assessment and not is_head:
                extra["status"] = "draft"
        serializer.save(organization=self.get_request_organization(), **extra)

    def perform_update(self, serializer):
        teacher = self._teacher()
        instance = self.get_object()
        if not hasattr(serializer.Meta.model, "course"):
            serializer.save(updated_by=self.request.user)
            return
        is_head = self._ensure_scope(teacher, instance.course_id, instance.course_section_id, instance.subject_id)
        if not is_head and instance.created_by_teacher_id != teacher.id:
            raise PermissionDenied("Only the content owner or head teacher can edit this content.")
        extra = {"updated_by": self.request.user}
        if hasattr(serializer.Meta.model, "review_status") and not is_head:
            extra["review_status"] = "pending"
            if serializer.Meta.model is models.CourseMaterial:
                extra.update({"is_published": False, "status": "draft"})
            elif serializer.Meta.model is models.Assessment:
                extra["status"] = "draft"
        serializer.save(**extra)

    def get_queryset(self):
        queryset = super().get_queryset()
        teacher = self._teacher()
        if teacher and not self.request.user.is_staff and not self.request.user.is_superuser and hasattr(queryset.model, "created_by_teacher"):
            head_course_ids = TeacherAssignment.objects.filter(
                organization=teacher.organization, teacher=teacher, role="head_teacher", is_active=True, assignment_status="accepted"
            ).values_list("course_id", flat=True)
            return queryset.filter(Q(created_by_teacher=teacher) | Q(course_id__in=head_course_ids))
        return queryset

    @action(detail=True, methods=["post"])
    def review(self, request, pk=None):
        item = self.get_object()
        if not isinstance(item, (models.CourseMaterial, models.Assessment)):
            return Response({"detail": "Only materials and assessments require head teacher review."}, status=status.HTTP_400_BAD_REQUEST)
        teacher = self._teacher()
        if not teacher or not self._is_head_teacher(teacher, item.course_id, item.course_section_id):
            return Response({"detail": "Only the head teacher can review this content."}, status=status.HTTP_403_FORBIDDEN)
        decision = request.data.get("decision")
        if decision not in {"approve", "reject"}:
            return Response({"detail": "Decision must be approve or reject."}, status=status.HTTP_400_BAD_REQUEST)
        item.review_status = "approved" if decision == "approve" else "rejected"
        item.reviewed_by = teacher
        item.reviewed_at = timezone.now()
        item.review_note = request.data.get("note", "")
        item.updated_by = request.user
        if decision == "approve":
            if isinstance(item, models.CourseMaterial):
                item.is_published = True
                item.status = "published"
            elif isinstance(item, models.Assessment):
                item.status = request.data.get("publish_status", "published")
                item.published_at = timezone.now()
        elif isinstance(item, models.CourseMaterial):
            item.is_published = False
            item.status = "draft"
        item.save()
        return Response(self.get_serializer(item).data)


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
        teacher = self._teacher()
        if not teacher or not self._is_head_teacher(teacher, assessment.course_id, assessment.course_section_id):
            return Response({"detail": "Head teacher approval is required before publishing."}, status=status.HTTP_403_FORBIDDEN)
        assessment.review_status = "approved"
        assessment.reviewed_by = teacher
        assessment.reviewed_at = timezone.now()
        assessment.status = models.AssessmentStatus.PUBLISHED
        assessment.published_at = timezone.now()
        assessment.updated_by = request.user
        assessment.save(update_fields=["status", "review_status", "reviewed_by", "reviewed_at", "published_at", "updated_by", "updated_at"])
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
        now = timezone.now()
        return models.Assessment.objects.filter(
            organization=user.organization,
            course_id__in=enrolled_course_ids,
            status__in=[models.AssessmentStatus.PUBLISHED, models.AssessmentStatus.SCHEDULED, models.AssessmentStatus.LIVE],
            review_status=models.ContentReviewStatus.APPROVED,
        ).filter(
            Q(publish_at__isnull=True) | Q(publish_at__lte=now),
        ).select_related("course", "course_section", "subject")

    @action(detail=False, methods=["get"])
    def materials(self, request):
        student = Student.objects.filter(organization=request.user.organization, email=request.user.email).first()
        if not student:
            return Response([])
        enrolled_course_ids = student.course_enrollments.filter(status=EnrollmentStatus.ACTIVE).values_list("course_id", flat=True)
        materials = models.CourseMaterial.objects.filter(
            organization=request.user.organization,
            course_id__in=enrolled_course_ids,
            is_published=True,
            status="published",
            review_status=models.ContentReviewStatus.APPROVED,
        ).filter(
            Q(publish_at__isnull=True) | Q(publish_at__lte=timezone.now()),
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
