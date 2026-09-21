from rest_framework import serializers
from . import models


class PayrollStructureSerializer(serializers.ModelSerializer):
    calculated = serializers.SerializerMethodField()

    class Meta:
        model = models.PayrollStructure
        fields = "__all__"

    def get_calculated(self, obj):
        return obj.calculate()


def serializer_for(model):
    return type(f"{model.__name__}Serializer", (serializers.ModelSerializer,), {"Meta": type("Meta", (), {"model": model, "fields": "__all__"})})


EmployeePayrollSerializer = serializer_for(models.EmployeePayroll)
SalaryRecordSerializer = serializer_for(models.SalaryRecord)
LeaveTypeSerializer = serializer_for(models.LeaveType)
LeaveApplicationSerializer = serializer_for(models.LeaveApplication)

