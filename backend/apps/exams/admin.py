from django.contrib import admin

from apps.core.admin_utils import OrganizationScopedAdmin
from .models import (
    Exam,
    ExamSubject,
    GradeScale,
    GrandExamConfiguration,
    GrandExamWeight,
    GrandResult,
    ProcessedResult,
    StudentMark,
)


class ExamSubjectInline(admin.TabularInline):
    model = ExamSubject
    extra = 0
    raw_id_fields = ("organization", "subject", "created_by", "updated_by")
    fields = ("organization", "subject", "written_marks", "practical_marks", "assessment_marks", "pass_marks")


class GrandExamWeightInline(admin.TabularInline):
    model = GrandExamWeight
    extra = 0
    raw_id_fields = ("exam",)


@admin.register(GradeScale)
class GradeScaleAdmin(OrganizationScopedAdmin):
    list_display = ("name", "min_mark", "max_mark", "grade", "gpa", "is_fail", "organization")
    search_fields = ("name", "grade")
    list_filter = ("organization", "grade", "is_fail")


@admin.register(Exam)
class ExamAdmin(OrganizationScopedAdmin):
    list_display = ("name", "session", "academic_class", "starts_on", "ends_on", "published", "organization")
    search_fields = ("name", "session__name", "academic_class__name")
    list_filter = ("organization", "session", "academic_class", "published", "starts_on")
    inlines = (ExamSubjectInline,)
    actions = ("publish_exams", "unpublish_exams")

    @admin.action(description="Publish selected exams")
    def publish_exams(self, request, queryset):
        queryset.update(published=True)

    @admin.action(description="Unpublish selected exams")
    def unpublish_exams(self, request, queryset):
        queryset.update(published=False)


@admin.register(ExamSubject)
class ExamSubjectAdmin(OrganizationScopedAdmin):
    list_display = ("exam", "subject", "written_marks", "practical_marks", "assessment_marks", "pass_marks", "total_marks")
    search_fields = ("exam__name", "subject__name", "subject__code")
    list_filter = ("organization", "exam", "subject")


@admin.register(StudentMark)
class StudentMarkAdmin(OrganizationScopedAdmin):
    list_display = ("exam_subject", "student", "written_obtained", "practical_obtained", "assessment_obtained", "total_obtained")
    search_fields = ("exam_subject__exam__name", "exam_subject__subject__name", "student__student_id", "student__full_name")
    list_filter = ("organization", "exam_subject__exam", "exam_subject__subject")


@admin.register(ProcessedResult)
class ProcessedResultAdmin(OrganizationScopedAdmin):
    list_display = ("exam", "student", "obtained_marks", "total_marks", "gpa", "grade", "status", "position", "published")
    search_fields = ("exam__name", "student__student_id", "student__full_name", "grade", "status")
    list_filter = ("organization", "exam", "grade", "status", "published")
    actions = ("publish_results", "unpublish_results")

    @admin.action(description="Publish selected results")
    def publish_results(self, request, queryset):
        queryset.update(published=True)

    @admin.action(description="Unpublish selected results")
    def unpublish_results(self, request, queryset):
        queryset.update(published=False)


@admin.register(GrandExamConfiguration)
class GrandExamConfigurationAdmin(OrganizationScopedAdmin):
    list_display = ("name", "session", "academic_class", "organization")
    search_fields = ("name", "session__name", "academic_class__name")
    list_filter = ("organization", "session", "academic_class")
    inlines = (GrandExamWeightInline,)


@admin.register(GrandExamWeight)
class GrandExamWeightAdmin(admin.ModelAdmin):
    list_display = ("configuration", "exam", "weight_percentage")
    search_fields = ("configuration__name", "exam__name")
    raw_id_fields = ("configuration", "exam")


@admin.register(GrandResult)
class GrandResultAdmin(OrganizationScopedAdmin):
    list_display = ("configuration", "student", "weighted_marks", "gpa", "grade", "promoted", "position")
    search_fields = ("configuration__name", "student__student_id", "student__full_name", "grade")
    list_filter = ("organization", "configuration", "grade", "promoted")

