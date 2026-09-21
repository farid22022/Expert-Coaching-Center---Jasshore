from django.db import models
from apps.core.models import OrganizationScopedModel


class FeeCategory(OrganizationScopedModel):
    name = models.CharField(max_length=160)
    description = models.TextField(blank=True)


class FeeStructure(OrganizationScopedModel):
    category = models.ForeignKey(FeeCategory, on_delete=models.CASCADE)
    session = models.ForeignKey("academic.AcademicSession", on_delete=models.CASCADE)
    academic_class = models.ForeignKey("academic.AcademicClass", on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    due_date = models.DateField(null=True, blank=True)


class StudentFee(OrganizationScopedModel):
    student = models.ForeignKey("people.Student", on_delete=models.CASCADE, related_name="fees")
    structure = models.ForeignKey(FeeStructure, on_delete=models.PROTECT)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    waiver_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=20, default="due")


class PaymentTransaction(OrganizationScopedModel):
    reference = models.CharField(max_length=120, db_index=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    method = models.CharField(max_length=80)
    status = models.CharField(max_length=20, default="pending", db_index=True)
    gateway_response = models.JSONField(default=dict, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)


class FeeCollection(OrganizationScopedModel):
    student = models.ForeignKey("people.Student", on_delete=models.PROTECT)
    transaction = models.ForeignKey(PaymentTransaction, null=True, blank=True, on_delete=models.SET_NULL)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2)
    note = models.TextField(blank=True)


class ExpenseCategory(OrganizationScopedModel):
    name = models.CharField(max_length=160)


class Expense(OrganizationScopedModel):
    category = models.ForeignKey(ExpenseCategory, on_delete=models.PROTECT)
    title = models.CharField(max_length=180)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    expense_date = models.DateField()
    note = models.TextField(blank=True)


class IncomeCategory(OrganizationScopedModel):
    name = models.CharField(max_length=160)


class Income(OrganizationScopedModel):
    category = models.ForeignKey(IncomeCategory, on_delete=models.PROTECT)
    title = models.CharField(max_length=180)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    income_date = models.DateField()
    note = models.TextField(blank=True)

