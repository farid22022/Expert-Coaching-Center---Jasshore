from rest_framework.decorators import action
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.db.models import Q
from django.utils import timezone
from apps.core.permissions import HasActionPermission
from apps.core.responses import success_response
from apps.core.viewsets import OrganizationScopedModelViewSet
from apps.courses.models import EnrollmentStatus, TeacherAssignment, AssignmentRole, AssignmentStatus
from apps.people.models import Employee, Student
from . import models, serializers
from .services import SmsService


class MessagingViewSet(OrganizationScopedModelViewSet):
    permission_classes = [HasActionPermission]
    permission_module = "sms"


class ContactCategoryViewSet(MessagingViewSet):
    queryset = models.ContactCategory.objects.all()
    serializer_class = serializers.ContactCategorySerializer
    search_fields = ("name",)


class ContactViewSet(MessagingViewSet):
    queryset = models.Contact.objects.select_related("category")
    serializer_class = serializers.ContactSerializer
    search_fields = ("name", "phone", "email")
    filterset_fields = ("category",)


class SmsProviderViewSet(MessagingViewSet):
    queryset = models.SmsProvider.objects.all()
    serializer_class = serializers.SmsProviderSerializer
    search_fields = ("name", "sender_id")
    filterset_fields = ("is_active",)


class SmsTemplateViewSet(MessagingViewSet):
    queryset = models.SmsTemplate.objects.all()
    serializer_class = serializers.SmsTemplateSerializer
    search_fields = ("title", "body")


class SmsCampaignViewSet(MessagingViewSet):
    queryset = models.SmsCampaign.objects.select_related("template")
    serializer_class = serializers.SmsCampaignSerializer
    search_fields = ("title", "message")
    filterset_fields = ("status",)

    @action(detail=True, methods=["post"])
    def queue(self, request, pk=None):
        count = SmsService.queue_campaign(self.get_object(), request.user)
        return success_response({"queued": count}, "SMS campaign queued.")


class SmsRecipientViewSet(MessagingViewSet):
    queryset = models.SmsRecipient.objects.select_related("campaign")
    serializer_class = serializers.SmsRecipientSerializer
    filterset_fields = ("campaign",)


class SmsLogViewSet(MessagingViewSet):
    queryset = models.SmsLog.objects.select_related("campaign", "provider")
    serializer_class = serializers.SmsLogSerializer
    search_fields = ("recipient_phone", "message")
    filterset_fields = ("campaign", "provider", "status")


class EmailTemplateViewSet(MessagingViewSet):
    queryset = models.EmailTemplate.objects.all()
    serializer_class = serializers.EmailTemplateSerializer


class EmailLogViewSet(MessagingViewSet):
    queryset = models.EmailLog.objects.all()
    serializer_class = serializers.EmailLogSerializer
    filterset_fields = ("status",)


class NotificationViewSet(OrganizationScopedModelViewSet):
    serializer_class = serializers.NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ("title", "body", "notification_type")
    filterset_fields = ("is_read", "notification_type")

    def get_queryset(self):
        return models.Notification.objects.filter(
            organization=self.request.user.organization,
            recipient=self.request.user,
        )

    @action(detail=True, methods=["post"])
    def read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.read_at = timezone.now()
        notification.updated_by = request.user
        notification.save(update_fields=["is_read", "read_at", "updated_by", "updated_at"])
        return success_response(self.get_serializer(notification).data, "Notification marked as read.")

    @action(detail=False, methods=["post"])
    def read_all(self, request):
        count = self.get_queryset().filter(is_read=False).update(is_read=True, read_at=timezone.now(), updated_by=request.user)
        return success_response({"updated": count}, "Notifications marked as read.")

    @action(detail=False, methods=["get"])
    def unread_count(self, request):
        return success_response({"unread": self.get_queryset().filter(is_read=False).count()})


class NoticeViewSet(OrganizationScopedModelViewSet):
    queryset = models.Notice.objects.select_related("course", "course_section", "subject", "created_by_teacher")
    serializer_class = serializers.NoticeSerializer
    permission_classes = [permissions.IsAuthenticated]
    permission_module = "sms"
    search_fields = ("title", "summary", "body", "category", "course__title")
    filterset_fields = ("course", "course_section", "subject", "is_public", "is_published", "category")

    def _teacher(self):
        return Employee.objects.filter(
            organization=self.get_request_organization(),
            email=self.request.user.email,
            employee_type="teacher",
        ).first()

    def _teacher_course_filter(self, teacher):
        assignments = TeacherAssignment.objects.filter(
            organization=teacher.organization,
            teacher=teacher,
            is_active=True,
            assignment_status=AssignmentStatus.ACCEPTED,
        )
        course_ids = assignments.values_list("course_id", flat=True)
        subject_ids = assignments.exclude(subject__isnull=True).values_list("subject_id", flat=True)
        return Q(course_id__in=course_ids) & (Q(subject__isnull=True) | Q(subject_id__in=subject_ids))

    def _has_sms_permission(self):
        return self.request.user.is_staff or self.request.user.is_superuser or HasActionPermission().has_permission(self.request, self)

    def _ensure_teacher_scope(self, course_id, section_id=None, subject_id=None):
        if self._has_sms_permission():
            return None
        teacher = self._teacher()
        if not teacher:
            raise PermissionDenied("A teacher profile is required to manage notices.")
        assignments = TeacherAssignment.objects.filter(
            organization=teacher.organization,
            teacher=teacher,
            course_id=course_id,
            is_active=True,
            assignment_status=AssignmentStatus.ACCEPTED,
        )
        if section_id:
            assignments = assignments.filter(Q(course_section__isnull=True) | Q(course_section_id=section_id))
        if subject_id:
            assignments = assignments.filter(Q(role=AssignmentRole.HEAD_TEACHER) | Q(subject__isnull=True) | Q(subject_id=subject_id))
        if not assignments.exists():
            raise PermissionDenied("You are not assigned to manage notices for this admission.")
        return teacher

    def get_queryset(self):
        queryset = super().get_queryset()
        teacher = self._teacher()
        if teacher and not self.request.user.is_staff and not self.request.user.is_superuser:
            return queryset.filter(self._teacher_course_filter(teacher))
        if not self._has_sms_permission():
            return queryset.none()
        return queryset

    def perform_create(self, serializer):
        values = serializer.validated_data
        teacher = self._ensure_teacher_scope(
            values.get("course").id if values.get("course") else None,
            values.get("course_section").id if values.get("course_section") else None,
            values.get("subject").id if values.get("subject") else None,
        )
        extra = {"organization": self.get_request_organization(), "created_by": self.request.user, "updated_by": self.request.user}
        if teacher:
            extra["created_by_teacher"] = teacher
        serializer.save(**extra)

    def perform_update(self, serializer):
        instance = self.get_object()
        values = serializer.validated_data
        course = values.get("course") or instance.course
        section = values.get("course_section", instance.course_section)
        subject = values.get("subject", instance.subject)
        self._ensure_teacher_scope(course.id if course else None, section.id if section else None, subject.id if subject else None)
        serializer.save(updated_by=self.request.user)

    @action(detail=False, methods=["get"], permission_classes=[permissions.AllowAny], authentication_classes=[])
    def public(self, request):
        now = timezone.now()
        queryset = models.Notice.objects.filter(
            is_public=True,
            is_published=True,
        ).filter(
            Q(publish_at__isnull=True) | Q(publish_at__lte=now),
            Q(expires_at__isnull=True) | Q(expires_at__gte=now),
        ).select_related("course", "course_section", "subject", "created_by_teacher")
        return Response(serializers.NoticeSerializer(queryset[:50], many=True).data)

    @action(detail=False, methods=["get"])
    def student(self, request):
        student = Student.objects.filter(organization=request.user.organization, email=request.user.email).first()
        if not student:
            return Response([])
        enrollments = student.course_enrollments.filter(status=EnrollmentStatus.ACTIVE)
        course_ids = enrollments.values_list("course_id", flat=True)
        section_ids = enrollments.values_list("course_section_id", flat=True)
        now = timezone.now()
        queryset = self.queryset.filter(
            organization=request.user.organization,
            is_published=True,
            course_id__in=course_ids,
        ).filter(
            Q(course_section__isnull=True) | Q(course_section_id__in=section_ids),
            Q(publish_at__isnull=True) | Q(publish_at__lte=now),
            Q(expires_at__isnull=True) | Q(expires_at__gte=now),
        )
        return Response(serializers.NoticeSerializer(queryset[:50], many=True).data)
