from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("guardians", views.GuardianViewSet)
router.register("students", views.StudentViewSet)
router.register("student-addresses", views.StudentAddressViewSet)
router.register("student-documents", views.StudentDocumentViewSet)
router.register("student-status-history", views.StudentStatusHistoryViewSet)
router.register("departments", views.DepartmentViewSet)
router.register("designations", views.DesignationViewSet)
router.register("employees", views.EmployeeViewSet)

urlpatterns = router.urls

