from rest_framework.decorators import action
from apps.core.permissions import HasActionPermission
from apps.core.responses import success_response
from apps.core.viewsets import OrganizationScopedModelViewSet
from . import models, serializers
from .services import PayrollService


class HrViewSet(OrganizationScopedModelViewSet):
    permission_classes = [HasActionPermission]
    permission_module = "payroll"


class PayrollStructureViewSet(HrViewSet):
    queryset = models.PayrollStructure.objects.select_related("designation")
    serializer_class = serializers.PayrollStructureSerializer
    search_fields = ("title", "designation__name")


class EmployeePayrollViewSet(HrViewSet):
    queryset = models.EmployeePayroll.objects.select_related("employee", "structure")
    serializer_class = serializers.EmployeePayrollSerializer
    filterset_fields = ("employee", "structure", "is_active")

    @action(detail=True, methods=["post"])
    def generate_salary(self, request, pk=None):
        record = PayrollService.generate_salary(
            self.get_object(),
            int(request.data["month"]),
            int(request.data["year"]),
            request.user,
        )
        return success_response(serializers.SalaryRecordSerializer(record).data, "Salary generated.")


class SalaryRecordViewSet(HrViewSet):
    queryset = models.SalaryRecord.objects.select_related("employee", "payroll_structure")
    serializer_class = serializers.SalaryRecordSerializer
    filterset_fields = ("employee", "period_month", "period_year", "status")


class LeaveTypeViewSet(HrViewSet):
    queryset = models.LeaveType.objects.all()
    serializer_class = serializers.LeaveTypeSerializer
    search_fields = ("name",)


class LeaveApplicationViewSet(HrViewSet):
    queryset = models.LeaveApplication.objects.select_related("employee", "leave_type", "approved_by")
    serializer_class = serializers.LeaveApplicationSerializer
    filterset_fields = ("employee", "leave_type", "status")

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        leave = self.get_object()
        leave.status = "approved"
        leave.approved_by = request.user
        leave.remarks = request.data.get("remarks", leave.remarks)
        leave.save(update_fields=["status", "approved_by", "remarks", "updated_at"])
        return success_response(message="Leave approved.")

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        leave = self.get_object()
        leave.status = "rejected"
        leave.approved_by = request.user
        leave.remarks = request.data.get("remarks", leave.remarks)
        leave.save(update_fields=["status", "approved_by", "remarks", "updated_at"])
        return success_response(message="Leave rejected.")
