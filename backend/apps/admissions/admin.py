from django.contrib import admin

from apps.core.admin_utils import OrganizationScopedAdmin, mark_status, status_badge
from .models import (
    AdmissionApplication,
    AdmissionExam,
    AdmissionExamMark,
    AdmissionPayment,
    AdmissionResult,
    ApplicantDocument,
)


class ApplicantDocumentInline(admin.TabularInline):
    model = ApplicantDocument
    extra = 0
    raw_id_fields = ("organization", "created_by", "updated_by")
    fields = ("organization", "title", "file")


class AdmissionPaymentInline(admin.TabularInline):
    model = AdmissionPayment
    extra = 0
    raw_id_fields = ("organization", "created_by", "updated_by")
    readonly_fields = ("paid_at",)
    fields = ("organization", "amount", "method", "reference", "status", "paid_at")


@admin.register(AdmissionApplication)
class AdmissionApplicationAdmin(OrganizationScopedAdmin):
    list_display = ("application_no", "applicant_name", "applicant_phone", "session", "academic_class", status_badge, "created_at")
    search_fields = ("application_no", "applicant_name", "applicant_phone", "applicant_email", "guardian_name", "guardian_phone")
    list_filter = ("organization", "session", "academic_class", "group", "shift", "status", "created_at")
    inlines = (ApplicantDocumentInline, AdmissionPaymentInline)
    actions = (
        mark_status("approved", "Approved"),
        mark_status("rejected", "Rejected"),
        mark_status("pending", "Pending"),
    )


@admin.register(ApplicantDocument)
class ApplicantDocumentAdmin(OrganizationScopedAdmin):
    list_display = ("application", "title", "organization", "created_at")
    search_fields = ("application__application_no", "application__applicant_name", "title")
    list_filter = ("organization", "created_at")


@admin.register(AdmissionPayment)
class AdmissionPaymentAdmin(OrganizationScopedAdmin):
    list_display = ("application", "amount", "method", "reference", "status", "paid_at")
    search_fields = ("application__application_no", "application__applicant_name", "reference", "method")
    list_filter = ("organization", "status", "method", "paid_at")
    readonly_fields = ("paid_at",)


@admin.register(AdmissionExam)
class AdmissionExamAdmin(OrganizationScopedAdmin):
    list_display = ("name", "session", "academic_class", "exam_date", "total_marks", "pass_marks", "organization")
    search_fields = ("name", "session__name", "academic_class__name")
    list_filter = ("organization", "session", "academic_class", "exam_date")


@admin.register(AdmissionExamMark)
class AdmissionExamMarkAdmin(OrganizationScopedAdmin):
    list_display = ("exam", "application", "obtained_marks", "organization")
    search_fields = ("exam__name", "application__application_no", "application__applicant_name")
    list_filter = ("organization", "exam")


@admin.register(AdmissionResult)
class AdmissionResultAdmin(OrganizationScopedAdmin):
    list_display = ("exam", "application", "obtained_marks", "position", "is_selected", "processed_at")
    search_fields = ("exam__name", "application__application_no", "application__applicant_name")
    list_filter = ("organization", "exam", "is_selected", "processed_at")
    readonly_fields = ("processed_at",)
