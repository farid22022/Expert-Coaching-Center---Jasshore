from apps.core.permissions import HasActionPermission
from apps.core.viewsets import OrganizationScopedModelViewSet
from . import models, serializers


class FinanceViewSet(OrganizationScopedModelViewSet):
    permission_classes = [HasActionPermission]
    permission_module = "payroll"


class FeeCategoryViewSet(FinanceViewSet):
    queryset = models.FeeCategory.objects.all()
    serializer_class = serializers.FeeCategorySerializer
    search_fields = ("name",)


class FeeStructureViewSet(FinanceViewSet):
    queryset = models.FeeStructure.objects.select_related("category", "session", "academic_class")
    serializer_class = serializers.FeeStructureSerializer
    filterset_fields = ("category", "session", "academic_class")


class StudentFeeViewSet(FinanceViewSet):
    queryset = models.StudentFee.objects.select_related("student", "structure")
    serializer_class = serializers.StudentFeeSerializer
    filterset_fields = ("student", "status")


class PaymentTransactionViewSet(FinanceViewSet):
    queryset = models.PaymentTransaction.objects.all()
    serializer_class = serializers.PaymentTransactionSerializer
    search_fields = ("reference",)
    filterset_fields = ("status", "method")


class FeeCollectionViewSet(FinanceViewSet):
    queryset = models.FeeCollection.objects.select_related("student", "transaction")
    serializer_class = serializers.FeeCollectionSerializer
    filterset_fields = ("student",)


class ExpenseCategoryViewSet(FinanceViewSet):
    queryset = models.ExpenseCategory.objects.all()
    serializer_class = serializers.ExpenseCategorySerializer
    search_fields = ("name",)


class ExpenseViewSet(FinanceViewSet):
    queryset = models.Expense.objects.select_related("category")
    serializer_class = serializers.ExpenseSerializer
    filterset_fields = ("category", "expense_date")


class IncomeCategoryViewSet(FinanceViewSet):
    queryset = models.IncomeCategory.objects.all()
    serializer_class = serializers.IncomeCategorySerializer
    search_fields = ("name",)


class IncomeViewSet(FinanceViewSet):
    queryset = models.Income.objects.select_related("category")
    serializer_class = serializers.IncomeSerializer
    filterset_fields = ("category", "income_date")
