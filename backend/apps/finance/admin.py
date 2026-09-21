from django.contrib import admin

from apps.core.admin_utils import OrganizationScopedAdmin
from .models import (
    Expense,
    ExpenseCategory,
    FeeCategory,
    FeeCollection,
    FeeStructure,
    Income,
    IncomeCategory,
    PaymentTransaction,
    StudentFee,
)


@admin.register(FeeCategory)
class FeeCategoryAdmin(OrganizationScopedAdmin):
    list_display = ("name", "organization", "created_at")
    search_fields = ("name", "description", "organization__name")
    list_filter = ("organization", "created_at")


@admin.register(FeeStructure)
class FeeStructureAdmin(OrganizationScopedAdmin):
    list_display = ("category", "session", "academic_class", "amount", "due_date", "organization")
    search_fields = ("category__name", "session__name", "academic_class__name")
    list_filter = ("organization", "category", "session", "academic_class", "due_date")


@admin.register(StudentFee)
class StudentFeeAdmin(OrganizationScopedAdmin):
    list_display = ("student", "structure", "amount", "waiver_amount", "paid_amount", "status", "organization")
    search_fields = ("student__student_id", "student__full_name", "structure__category__name", "status")
    list_filter = ("organization", "structure__category", "status")


@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(OrganizationScopedAdmin):
    list_display = ("reference", "amount", "method", "status", "paid_at", "organization")
    search_fields = ("reference", "method", "status")
    list_filter = ("organization", "status", "method", "paid_at")
    readonly_fields = ("paid_at", "created_at", "updated_at")


@admin.register(FeeCollection)
class FeeCollectionAdmin(OrganizationScopedAdmin):
    list_display = ("student", "transaction", "total_amount", "discount_amount", "paid_amount", "organization", "created_at")
    search_fields = ("student__student_id", "student__full_name", "transaction__reference", "note")
    list_filter = ("organization", "created_at")


@admin.register(ExpenseCategory, IncomeCategory)
class FinanceCategoryAdmin(OrganizationScopedAdmin):
    list_display = ("name", "organization", "created_at")
    search_fields = ("name", "organization__name")
    list_filter = ("organization", "created_at")


@admin.register(Expense)
class ExpenseAdmin(OrganizationScopedAdmin):
    list_display = ("title", "category", "amount", "expense_date", "organization")
    search_fields = ("title", "category__name", "note")
    list_filter = ("organization", "category", "expense_date")


@admin.register(Income)
class IncomeAdmin(OrganizationScopedAdmin):
    list_display = ("title", "category", "amount", "income_date", "organization")
    search_fields = ("title", "category__name", "note")
    list_filter = ("organization", "category", "income_date")
