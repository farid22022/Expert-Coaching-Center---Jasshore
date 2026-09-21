from django.contrib import admin

from apps.core.admin_utils import OrganizationScopedAdmin, mark_status, status_badge
from .models import EmployeePayroll, LeaveApplication, LeaveType, PayrollStructure, SalaryRecord


@admin.register(PayrollStructure)
class PayrollStructureAdmin(OrganizationScopedAdmin):
    list_display = ("title", "designation", "basic", "medical_percentage", "house_percentage", "conveyance_percentage", "tax_percentage")
    search_fields = ("title", "designation__name", "notes")
    list_filter = ("organization", "designation")


@admin.register(EmployeePayroll)
class EmployeePayrollAdmin(OrganizationScopedAdmin):
    list_display = ("employee", "structure", "active_from", "active_to", "is_active", "organization")
    search_fields = ("employee__employee_id", "employee__full_name", "structure__title")
    list_filter = ("organization", "structure", "is_active", "active_from", "active_to")


@admin.register(SalaryRecord)
class SalaryRecordAdmin(OrganizationScopedAdmin):
    list_display = ("employee", "period_month", "period_year", "gross", "net", status_badge, "paid_at")
    search_fields = ("employee__employee_id", "employee__full_name", "status")
    list_filter = ("organization", "period_year", "period_month", "status", "paid_at")
    readonly_fields = ("paid_at", "created_at", "updated_at")
    actions = (mark_status("approved", "Approved"), mark_status("pending", "Pending"))


@admin.register(LeaveType)
class LeaveTypeAdmin(OrganizationScopedAdmin):
    list_display = ("name", "max_days", "organization")
    search_fields = ("name",)
    list_filter = ("organization",)


@admin.register(LeaveApplication)
class LeaveApplicationAdmin(OrganizationScopedAdmin):
    list_display = ("employee", "leave_type", "from_date", "to_date", "total_days", status_badge, "approved_by")
    search_fields = ("employee__employee_id", "employee__full_name", "reason", "remarks", "status")
    list_filter = ("organization", "leave_type", "status", "from_date", "to_date")
    actions = (mark_status("approved", "Approved"), mark_status("rejected", "Rejected"), mark_status("pending", "Pending"))

    def save_model(self, request, obj, form, change):
        if obj.status == "approved" and not obj.approved_by_id:
            obj.approved_by = request.user
        super().save_model(request, obj, form, change)

