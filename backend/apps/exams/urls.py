from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("grades", views.GradeScaleViewSet)
router.register("exams", views.ExamViewSet)
router.register("exam-subjects", views.ExamSubjectViewSet)
router.register("marks", views.StudentMarkViewSet)
router.register("results", views.ProcessedResultViewSet)
router.register("grand-configurations", views.GrandExamConfigurationViewSet)
router.register("grand-results", views.GrandResultViewSet)

urlpatterns = router.urls

