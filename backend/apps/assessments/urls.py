from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("questions", views.QuestionViewSet)
router.register("options", views.QuestionOptionViewSet)
router.register("materials", views.CourseMaterialViewSet)
router.register("assessments", views.AssessmentViewSet)
router.register("assessment-questions", views.AssessmentQuestionViewSet)
router.register("attempts", views.AttemptViewSet)
router.register("submissions", views.AssignmentSubmissionViewSet)
router.register("submission-attachments", views.SubmissionAttachmentViewSet)
router.register("analytics", views.AnalyticsViewSet, basename="assessment-analytics")
router.register("student/assessments", views.StudentAssessmentViewSet, basename="student-assessment")

urlpatterns = router.urls
