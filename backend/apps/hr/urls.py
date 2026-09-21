from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("payroll-structures", views.PayrollStructureViewSet)
router.register("employee-payroll", views.EmployeePayrollViewSet)
router.register("salary-records", views.SalaryRecordViewSet)
router.register("leave-types", views.LeaveTypeViewSet)
router.register("leave-applications", views.LeaveApplicationViewSet)

urlpatterns = router.urls

