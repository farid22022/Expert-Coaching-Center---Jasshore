from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("", views.AdmissionApplicationViewSet)
router.register("documents", views.ApplicantDocumentViewSet)
router.register("payments", views.AdmissionPaymentViewSet)
router.register("exams", views.AdmissionExamViewSet)
router.register("marks", views.AdmissionExamMarkViewSet)
router.register("results", views.AdmissionResultViewSet)

urlpatterns = router.urls

