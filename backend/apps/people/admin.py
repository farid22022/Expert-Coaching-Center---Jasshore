from django.contrib import admin

from apps.core.admin_utils import OrganizationScopedAdmin, activate, deactivate, mark_status, status_badge
from .models import (
    Department,
    Designation,
    Employee,
    Guardian,
    Student,
    StudentAddress,
    StudentDocument,
    StudentGuardian,
    StudentStatusHistory,
)


class StudentGuardianInline(admin.TabularInline):
    model = StudentGuardian
    extra = 0
    raw_id_fields = ("guardian",)


class StudentAddressInline(admin.TabularInline):
    model = StudentAddress
    extra = 0
    raw_id_fields = ("organization", "created_by", "updated_by")
    fields = ("organization", "address_type", "address", "district", "upazila", "post_office")


class StudentDocumentInline(admin.TabularInline):
    model = StudentDocument
    extra = 0
    raw_id_fields = ("organization", "created_by", "updated_by")
    fields = ("organization", "title", "document_type", "file")


@admin.register(Guardian)
class GuardianAdmin(OrganizationScopedAdmin):
    list_display = ("name", "relation", "phone", "email", "occupation", "organization")
    search_fields = ("name", "phone", "email", "nid", "occupation", "address")
    list_filter = ("organization", "relation")


@admin.register(Student)
class StudentAdmin(OrganizationScopedAdmin):
    list_display = (
        "student_id",
        "full_name",
        "roll",
        "registration_no",
        "academic_class",
        "section",
        "phone",
        status_badge,
    )
    search_fields = ("student_id", "admission_no", "roll", "registration_no", "full_name", "full_name_bn", "phone", "email", "rfid")
    list_filter = ("organization", "session", "academic_class", "section", "group", "shift", "category", "gender", "status")
    raw_id_fields = (
        "organization",
        "session",
        "academic_class",
        "section",
        "group",
        "shift",
        "category",
        "created_by",
        "updated_by",
    )
    inlines = (StudentGuardianInline, StudentAddressInline, StudentDocumentInline)
    actions = (activate, deactivate, mark_status("approved", "Approved"))


@admin.register(StudentGuardian)
class StudentGuardianAdmin(admin.ModelAdmin):
    list_display = ("student", "guardian", "is_primary")
    search_fields = ("student__student_id", "student__full_name", "guardian__name", "guardian__phone")
    list_filter = ("is_primary",)
    raw_id_fields = ("student", "guardian")
    list_select_related = ("student", "guardian")


@admin.register(StudentAddress)
class StudentAddressAdmin(OrganizationScopedAdmin):
    list_display = ("student", "address_type", "district", "upazila", "organization")
    search_fields = ("student__student_id", "student__full_name", "address", "district", "upazila", "post_office")
    list_filter = ("organization", "address_type", "district", "upazila")


@admin.register(StudentDocument)
class StudentDocumentAdmin(OrganizationScopedAdmin):
    list_display = ("student", "title", "document_type", "organization", "created_at")
    search_fields = ("student__student_id", "student__full_name", "title", "document_type")
    list_filter = ("organization", "document_type", "created_at")


@admin.register(StudentStatusHistory)
class StudentStatusHistoryAdmin(OrganizationScopedAdmin):
    list_display = ("student", "old_status", "new_status", "reason", "created_at")
    search_fields = ("student__student_id", "student__full_name", "old_status", "new_status", "reason")
    list_filter = ("organization", "old_status", "new_status", "created_at")
    readonly_fields = ("created_at", "updated_at")


@admin.register(Department, Designation)
class PeopleNameAdmin(OrganizationScopedAdmin):
    list_display = ("name", "organization", "created_at")
    search_fields = ("name", "organization__name")
    list_filter = ("organization", "created_at")


@admin.register(Employee)
class EmployeeAdmin(OrganizationScopedAdmin):
    list_display = ("employee_id", "full_name", "employee_type", "department", "designation", "phone", status_badge)
    search_fields = ("employee_id", "full_name", "phone", "email", "rfid", "department__name", "designation__name")
    list_filter = ("organization", "employee_type", "department", "designation", "status", "joining_date")
    actions = (activate, deactivate, mark_status("approved", "Approved"))

