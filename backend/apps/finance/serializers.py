from rest_framework import serializers
from . import models


def serializer_for(model):
    return type(f"{model.__name__}Serializer", (serializers.ModelSerializer,), {"Meta": type("Meta", (), {"model": model, "fields": "__all__"})})


FeeCategorySerializer = serializer_for(models.FeeCategory)
FeeStructureSerializer = serializer_for(models.FeeStructure)
StudentFeeSerializer = serializer_for(models.StudentFee)
PaymentTransactionSerializer = serializer_for(models.PaymentTransaction)
FeeCollectionSerializer = serializer_for(models.FeeCollection)
ExpenseCategorySerializer = serializer_for(models.ExpenseCategory)
ExpenseSerializer = serializer_for(models.Expense)
IncomeCategorySerializer = serializer_for(models.IncomeCategory)
IncomeSerializer = serializer_for(models.Income)

