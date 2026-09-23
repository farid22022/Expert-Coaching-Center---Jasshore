from django.contrib import admin

from apps.core.admin_utils import OrganizationScopedAdmin, activate, deactivate, status_badge
from .models import Course, CourseSection, CourseSubject, Enrollment, TeacherAssignment


@admin.register(Course)
class CourseAdmin(OrganizationScopedAdmin):
    list_display = ("title", "code", "course_type", "status", "is_published", "capacity", "organization")
    search_fields = ("title", "code", "description")
    list_filter = ("organization", "course_type", "status", "is_published")
    prepopulated_fields = {"slug": ("title",)}


@admin.register(CourseSection)
class CourseSectionAdmin(OrganizationScopedAdmin):
    list_display = ("course", "name", "head_teacher", "status", "order")
    search_fields = ("course__title", "name", "head_teacher__full_name")
    list_filter = ("organization", "course", "status")
    actions = (activate, deactivate)


@admin.register(CourseSubject)
class CourseSubjectAdmin(OrganizationScopedAdmin):
    list_display = ("course_section", "name", "code", "status", "order")
    search_fields = ("name", "code", "course_section__name", "course_section__course__title")
    list_filter = ("organization", "course_section", "status")


@admin.register(TeacherAssignment)
class TeacherAssignmentAdmin(OrganizationScopedAdmin):
    list_display = ("teacher", "course", "course_section", "subject", "role", "is_active")
    search_fields = ("teacher__full_name", "course__title", "course_section__name", "subject__name")
    list_filter = ("organization", "course", "role", "is_active")


@admin.register(Enrollment)
class EnrollmentAdmin(OrganizationScopedAdmin):
    list_display = ("enrollment_number", "student", "course", "course_section", status_badge, "enrolled_at")
    search_fields = ("enrollment_number", "student__full_name", "student__student_id", "course__title")
    list_filter = ("organization", "course", "status")
