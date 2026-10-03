import django_filters
import json

from django.db import transaction
from django.utils import timezone
from rest_framework import permissions
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from apps.core.permissions import HasActionPermission
from apps.core.responses import success_response
from apps.core.viewsets import OrganizationScopedModelViewSet
from . import models, serializers
from .services import AdmissionService


class AdmissionApplicationFilter(django_filters.FilterSet):
    status__in = django_filters.BaseInFilter(field_name="status", lookup_expr="in")

    class Meta:
        model = models.AdmissionApplication
        fields = ("course", "session", "academic_class", "group", "shift", "status")


class AdmissionApplicationViewSet(OrganizationScopedModelViewSet):
    queryset = models.AdmissionApplication.objects.select_related("applicant", "course", "session", "academic_class", "group", "shift", "reviewed_by", "approved_student")
    serializer_class = serializers.AdmissionApplicationSerializer
    permission_classes = [HasActionPermission]
    permission_module = "application"
    search_fields = ("application_no", "applicant_name", "applicant_phone")
    filterset_class = AdmissionApplicationFilter

    def get_permissions(self):
        if self.action == "create":
            return [permissions.AllowAny()]
        return [HasActionPermission()]

    def get_serializer(self, *args, **kwargs):
        # The shared scoped helper assumes an authenticated user. Public
        # applications derive their organization from the selected course.
        if self.action == "create" and not self.request.user.is_authenticated:
            return super(OrganizationScopedModelViewSet, self).get_serializer(*args, **kwargs)
        return super().get_serializer(*args, **kwargs)

    def perform_create(self, serializer):
        course = serializer.validated_data.get("course")
        user = self.request.user if self.request.user.is_authenticated else None
        organization = course.organization if course else self.get_request_organization()
        app_no = AdmissionService.generate_application_no(organization.id, admission_program=bool(course))
        application = serializer.save(
            organization=organization,
            application_no=app_no,
            applicant=user,
            status=models.ApplicationStatus.PENDING,
            submitted_at=timezone.now(),
            created_by=user,
            updated_by=user,
        )
        labels = self.request.data.get("document_labels", "[]")
        try:
            labels = labels if isinstance(labels, list) else json.loads(labels)
        except (TypeError, ValueError):
            labels = []
        for index, uploaded_file in enumerate(self.request.FILES.getlist("documents")):
            models.ApplicantDocument.objects.create(
                organization=organization,
                application=application,
                title=(labels[index] if index < len(labels) else uploaded_file.name)[:180],
                file=uploaded_file,
                created_by=user,
                updated_by=user,
            )

    @action(detail=True, methods=["post"])
    def under_review(self, request, pk=None):
        application = self.get_object()
        if application.status not in {models.ApplicationStatus.PENDING, models.ApplicationStatus.UNDER_REVIEW}:
            raise ValidationError("Only pending applications can be marked under review.")
        application.status = models.ApplicationStatus.UNDER_REVIEW
        application.reviewed_at = timezone.now()
        application.reviewed_by = request.user
        application.updated_by = request.user
        application.save(update_fields=["status", "reviewed_at", "reviewed_by", "updated_by", "updated_at"])
        return success_response(self.get_serializer(application).data, "Application marked under review.")

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        try:
            student, enrollment = AdmissionService.approve_application(self.get_object(), request.user)
        except ValueError as error:
            raise ValidationError(str(error))
        return success_response({"student_id": student.id if student else None, "enrollment_id": enrollment.id if enrollment else None, "payment_required": enrollment is None}, "Application approved. Complete payment to activate this admission." if enrollment is None else "Application approved and enrollment activated.")

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        reason = request.data.get("reason") or request.data.get("remarks")
        if not reason:
            raise ValidationError({"reason": "A rejection reason is required."})
        with transaction.atomic():
            application = models.AdmissionApplication.objects.select_for_update().get(pk=self.get_object().pk)
            if application.status not in {models.ApplicationStatus.PENDING, models.ApplicationStatus.UNDER_REVIEW}:
                raise ValidationError("Only pending or under-review applications can be rejected.")
            application.status = models.ApplicationStatus.REJECTED
            application.rejection_reason = reason
            application.remarks = reason
            application.rejected_at = timezone.now()
            application.reviewed_at = timezone.now()
            application.reviewed_by = request.user
            application.updated_by = request.user
            application.save(update_fields=["status", "rejection_reason", "remarks", "rejected_at", "reviewed_at", "reviewed_by", "updated_by", "updated_at"])
        return success_response(self.get_serializer(application).data, "Application rejected.")


class ApplicantDocumentViewSet(OrganizationScopedModelViewSet):
    queryset = models.ApplicantDocument.objects.select_related("application")
    serializer_class = serializers.ApplicantDocumentSerializer
    permission_classes = [HasActionPermission]
    permission_module = "application"
    filterset_fields = ("application",)


class AdmissionPaymentViewSet(OrganizationScopedModelViewSet):
    queryset = models.AdmissionPayment.objects.select_related("application")
    serializer_class = serializers.AdmissionPaymentSerializer
    permission_classes = [HasActionPermission]
    permission_module = "application"
    filterset_fields = ("application", "status", "method")


class AdmissionExamViewSet(OrganizationScopedModelViewSet):
    queryset = models.AdmissionExam.objects.select_related("session", "academic_class")
    serializer_class = serializers.AdmissionExamSerializer
    permission_classes = [HasActionPermission]
    permission_module = "application"
    filterset_fields = ("session", "academic_class")

    @action(detail=True, methods=["post"])
    def process_result(self, request, pk=None):
        results = AdmissionService.process_exam_result(self.get_object())
        return success_response({"processed": len(results)}, "Admission result processed.")


class AdmissionExamMarkViewSet(OrganizationScopedModelViewSet):
    queryset = models.AdmissionExamMark.objects.select_related("exam", "application")
    serializer_class = serializers.AdmissionExamMarkSerializer
    permission_classes = [HasActionPermission]
    permission_module = "application"
    filterset_fields = ("exam", "application")


class AdmissionResultViewSet(OrganizationScopedModelViewSet):
    queryset = models.AdmissionResult.objects.select_related("exam", "application")
    serializer_class = serializers.AdmissionResultSerializer
    permission_classes = [HasActionPermission]
    permission_module = "application"
    filterset_fields = ("exam", "is_selected")
