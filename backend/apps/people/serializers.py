from rest_framework import serializers
from . import models


def serializer_for(model):
    return type(f"{model.__name__}Serializer", (serializers.ModelSerializer,), {"Meta": type("Meta", (), {"model": model, "fields": "__all__"})})


GuardianSerializer = serializer_for(models.Guardian)
StudentSerializer = serializer_for(models.Student)
StudentAddressSerializer = serializer_for(models.StudentAddress)
StudentDocumentSerializer = serializer_for(models.StudentDocument)
StudentStatusHistorySerializer = serializer_for(models.StudentStatusHistory)
DepartmentSerializer = serializer_for(models.Department)
DesignationSerializer = serializer_for(models.Designation)
EmployeeSerializer = serializer_for(models.Employee)

