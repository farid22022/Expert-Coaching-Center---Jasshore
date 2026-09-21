from rest_framework import serializers
from . import models


def serializer_for(model):
    return type(f"{model.__name__}Serializer", (serializers.ModelSerializer,), {"Meta": type("Meta", (), {"model": model, "fields": "__all__"})})


GradeScaleSerializer = serializer_for(models.GradeScale)
ExamSerializer = serializer_for(models.Exam)
ExamSubjectSerializer = serializer_for(models.ExamSubject)
StudentMarkSerializer = serializer_for(models.StudentMark)
ProcessedResultSerializer = serializer_for(models.ProcessedResult)
GrandExamConfigurationSerializer = serializer_for(models.GrandExamConfiguration)
GrandResultSerializer = serializer_for(models.GrandResult)

