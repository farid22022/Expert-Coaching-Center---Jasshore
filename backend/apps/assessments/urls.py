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
router.register("interventions", views.StudentInterventionViewSet, basename="student-intervention")
router.register("feedback", views.StudentFeedbackViewSet, basename="student-feedback")
router.register("teacher-notes", views.TeacherPrivateNoteViewSet, basename="teacher-private-note")
router.register("student/assessments", views.StudentAssessmentViewSet, basename="student-assessment")
router.register("student/bookmarks", views.StudentBookmarkViewSet, basename="student-bookmark")
router.register("assessment-components", views.AssessmentComponentViewSet, basename="assessment-component")
router.register("course-grade-scales", views.CourseGradeScaleViewSet, basename="course-grade-scale")
router.register("course-grade-scale-items", views.CourseGradeScaleItemViewSet, basename="course-grade-scale-item")
router.register("student/course-ratings", views.CourseRatingViewSet, basename="course-rating")
router.register("gradebook", views.GradebookViewSet, basename="gradebook")

urlpatterns = router.urls
