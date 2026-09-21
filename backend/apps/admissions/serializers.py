from rest_framework import serializers
from . import models


def serializer_for(model):
    return type(f"{model.__name__}Serializer", (serializers.ModelSerializer,), {"Meta": type("Meta", (), {"model": model, "fields": "__all__"})})


AdmissionApplicationSerializer = serializer_for(models.AdmissionApplication)
ApplicantDocumentSerializer = serializer_for(models.ApplicantDocument)
AdmissionPaymentSerializer = serializer_for(models.AdmissionPayment)
AdmissionExamSerializer = serializer_for(models.AdmissionExam)
AdmissionExamMarkSerializer = serializer_for(models.AdmissionExamMark)
AdmissionResultSerializer = serializer_for(models.AdmissionResult)

