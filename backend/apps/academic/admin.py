from django.contrib import admin

from apps.core.admin_utils import OrganizationScopedAdmin, activate, deactivate, mark_status, status_badge
from .models import (
    AcademicClass,
    AcademicSession,
    Building,
    ClassRoutine,
    ClassTeacherAssignment,
    Classroom,
    CombinedSubject,
    Floor,
    Section,
    Shift,
    StudentCategory,
    StudentGroup,
    Subject,
    Syllabus,
)


class SectionInline(admin.TabularInline):
    model = Section
    extra = 0
    raw_id_fields = ("organization", "shift", "created_by", "updated_by")
    fields = ("organization", "shift", "name")


class FloorInline(admin.TabularInline):
    model = Floor
    extra = 0
    raw_id_fields = ("organization", "created_by", "updated_by")
    fields = ("organization", "name", "full_name")


class ClassroomInline(admin.TabularInline):
    model = Classroom
    extra = 0
    raw_id_fields = ("organization", "floor", "created_by", "updated_by")
    fields = ("organization", "floor", "room_no", "full_name")


@admin.register(AcademicSession)
class AcademicSessionAdmin(OrganizationScopedAdmin):
    list_display = ("name", "organization", "starts_on", "ends_on", "is_active", "created_at")
    search_fields = ("name", "organization__name")
    list_filter = ("organization", "is_active", "starts_on", "ends_on")
    actions = (activate, deactivate)


@admin.register(AcademicClass)
class AcademicClassAdmin(OrganizationScopedAdmin):
    list_display = ("name", "organization", "sorting", "group_required")
    search_fields = ("name", "organization__name")
    list_filter = ("organization", "group_required")
    inlines = (SectionInline,)


@admin.register(Shift)
class ShiftAdmin(OrganizationScopedAdmin):
    list_display = ("name", "organization", "start_time", "late_time", "end_time", "sorting")
    search_fields = ("name", "organization__name")
    list_filter = ("organization",)


@admin.register(StudentGroup, StudentCategory)
class SimpleAcademicNameAdmin(OrganizationScopedAdmin):
    list_display = ("name", "organization", "created_at")
    search_fields = ("name", "organization__name")
    list_filter = ("organization", "created_at")


@admin.register(Section)
class SectionAdmin(OrganizationScopedAdmin):
    list_display = ("name", "academic_class", "shift", "organization")
    search_fields = ("name", "academic_class__name", "shift__name", "organization__name")
    list_filter = ("organization", "academic_class", "shift")
    raw_id_fields = ("organization", "academic_class", "shift", "created_by", "updated_by")


@admin.register(Subject)
class SubjectAdmin(OrganizationScopedAdmin):
    list_display = ("code", "name", "academic_class", "session", "category", "organization")
    search_fields = ("code", "name", "category", "academic_class__name", "session__name")
    list_filter = ("organization", "session", "academic_class", "category")
    filter_horizontal = ("groups",)
    raw_id_fields = ("organization", "academic_class", "session", "created_by", "updated_by")


@admin.register(CombinedSubject)
class CombinedSubjectAdmin(OrganizationScopedAdmin):
    list_display = ("name", "academic_class", "organization")
    search_fields = ("name", "academic_class__name", "subjects__name", "subjects__code")
    list_filter = ("organization", "academic_class")
    filter_horizontal = ("subjects",)


@admin.register(Building)
class BuildingAdmin(OrganizationScopedAdmin):
    list_display = ("name", "full_name", "organization")
    search_fields = ("name", "full_name", "organization__name")
    list_filter = ("organization",)
    inlines = (FloorInline, ClassroomInline)


@admin.register(Floor)
class FloorAdmin(OrganizationScopedAdmin):
    list_display = ("name", "full_name", "building", "organization")
    search_fields = ("name", "full_name", "building__name", "organization__name")
    list_filter = ("organization", "building")


@admin.register(Classroom)
class ClassroomAdmin(OrganizationScopedAdmin):
    list_display = ("room_no", "full_name", "building", "floor", "organization")
    search_fields = ("room_no", "full_name", "building__name", "floor__name")
    list_filter = ("organization", "building", "floor")


@admin.register(ClassTeacherAssignment)
class ClassTeacherAssignmentAdmin(OrganizationScopedAdmin):
    list_display = ("teacher", "academic_class", "section", "session", "organization")
    search_fields = ("teacher__full_name", "teacher__employee_id", "academic_class__name", "section__name", "session__name")
    list_filter = ("organization", "session", "academic_class", "section")


@admin.register(Syllabus)
class SyllabusAdmin(OrganizationScopedAdmin):
    list_display = ("title", "session", "organization", "created_at")
    search_fields = ("title", "description", "session__name")
    list_filter = ("organization", "session", "created_at")


@admin.register(ClassRoutine)
class ClassRoutineAdmin(OrganizationScopedAdmin):
    list_display = ("session", "academic_class", "section", "subject", "teacher", "weekday", "starts_at", "ends_at", status_badge)
    search_fields = ("academic_class__name", "section__name", "subject__name", "subject__code", "teacher__full_name", "weekday")
    list_filter = ("organization", "session", "academic_class", "section", "shift", "weekday", "status")
    actions = (mark_status("active", "Active"), mark_status("inactive", "Inactive"))

