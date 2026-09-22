from rest_framework import serializers
from . import models


def serializer_for(model):
    return type(f"{model.__name__}Serializer", (serializers.ModelSerializer,), {"Meta": type("Meta", (), {"model": model, "fields": "__all__"})})


class AdmissionApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.AdmissionApplication
        fields = "__all__"
        read_only_fields = (
            "organization",
            "application_no",
            "approved_student",
            "created_by",
            "updated_by",
            "created_at",
            "updated_at",
            "is_deleted",
            "deleted_at",
        )


ApplicantDocumentSerializer = serializer_for(models.ApplicantDocument)
AdmissionPaymentSerializer = serializer_for(models.AdmissionPayment)
AdmissionExamSerializer = serializer_for(models.AdmissionExam)
AdmissionExamMarkSerializer = serializer_for(models.AdmissionExamMark)
AdmissionResultSerializer = serializer_for(models.AdmissionResult)
