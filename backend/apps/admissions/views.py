from rest_framework.decorators import action
from apps.core.permissions import HasActionPermission
from apps.core.responses import success_response
from apps.core.viewsets import OrganizationScopedModelViewSet
from . import models, serializers
from .services import AdmissionService


class AdmissionApplicationViewSet(OrganizationScopedModelViewSet):
    queryset = models.AdmissionApplication.objects.select_related("session", "academic_class", "group", "shift")
    serializer_class = serializers.AdmissionApplicationSerializer
    permission_classes = [HasActionPermission]
    permission_module = "application"
    search_fields = ("application_no", "applicant_name", "applicant_phone")
    filterset_fields = ("session", "academic_class", "group", "shift", "status")

    def perform_create(self, serializer):
        app_no = AdmissionService.generate_application_no(self.request.user.organization_id)
        serializer.save(
            organization=self.request.user.organization,
            application_no=app_no,
            created_by=self.request.user,
            updated_by=self.request.user,
        )

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        student = AdmissionService.approve_application(self.get_object(), request.user)
        return success_response({"student_id": student.id}, "Application approved.")

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        application = self.get_object()
        application.status = "rejected"
        application.remarks = request.data.get("remarks", application.remarks)
        application.updated_by = request.user
        application.save(update_fields=["status", "remarks", "updated_by", "updated_at"])
        return success_response(message="Application rejected.")


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
