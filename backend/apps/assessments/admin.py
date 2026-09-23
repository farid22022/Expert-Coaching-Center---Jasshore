from django.contrib import admin

from apps.core.admin_utils import OrganizationScopedAdmin
from .models import Assessment, AssessmentAttempt, AssessmentQuestion, Question, QuestionOption, StudentAnswer


class QuestionOptionInline(admin.TabularInline):
    model = QuestionOption
    extra = 2


@admin.register(Question)
class QuestionAdmin(OrganizationScopedAdmin):
    list_display = ("id", "course", "subject", "question_type", "marks", "status")
    search_fields = ("text", "course__title", "subject__name")
    list_filter = ("organization", "course", "subject", "question_type", "status")
    inlines = (QuestionOptionInline,)


@admin.register(Assessment)
class AssessmentAdmin(OrganizationScopedAdmin):
    list_display = ("title", "assessment_type", "course", "subject", "status", "starts_at", "ends_at")
    search_fields = ("title", "course__title", "subject__name")
    list_filter = ("organization", "assessment_type", "course", "status")


@admin.register(AssessmentQuestion)
class AssessmentQuestionAdmin(OrganizationScopedAdmin):
    list_display = ("assessment", "question", "order", "marks")


@admin.register(AssessmentAttempt)
class AssessmentAttemptAdmin(OrganizationScopedAdmin):
    list_display = ("assessment", "student", "status", "score", "total_marks", "submitted_at")
    list_filter = ("organization", "assessment", "status")


@admin.register(StudentAnswer)
class StudentAnswerAdmin(OrganizationScopedAdmin):
    list_display = ("attempt", "question", "is_correct", "marks_obtained")

