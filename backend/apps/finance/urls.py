from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("fee-categories", views.FeeCategoryViewSet)
router.register("fee-structures", views.FeeStructureViewSet)
router.register("student-fees", views.StudentFeeViewSet)
router.register("transactions", views.PaymentTransactionViewSet)
router.register("fee-collections", views.FeeCollectionViewSet)
router.register("expense-categories", views.ExpenseCategoryViewSet)
router.register("expenses", views.ExpenseViewSet)
router.register("income-categories", views.IncomeCategoryViewSet)
router.register("income", views.IncomeViewSet)

urlpatterns = router.urls

