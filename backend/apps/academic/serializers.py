from rest_framework import serializers
from . import models


class DynamicFieldsModelSerializer(serializers.ModelSerializer):
    class Meta:
        fields = "__all__"


def serializer_for(model):
    return type(f"{model.__name__}Serializer", (DynamicFieldsModelSerializer,), {"Meta": type("Meta", (), {"model": model, "fields": "__all__"})})


AcademicSessionSerializer = serializer_for(models.AcademicSession)
ShiftSerializer = serializer_for(models.Shift)
StudentGroupSerializer = serializer_for(models.StudentGroup)
StudentCategorySerializer = serializer_for(models.StudentCategory)
AcademicClassSerializer = serializer_for(models.AcademicClass)
SectionSerializer = serializer_for(models.Section)
SubjectSerializer = serializer_for(models.Subject)
CombinedSubjectSerializer = serializer_for(models.CombinedSubject)
BuildingSerializer = serializer_for(models.Building)
FloorSerializer = serializer_for(models.Floor)
ClassroomSerializer = serializer_for(models.Classroom)
ClassTeacherAssignmentSerializer = serializer_for(models.ClassTeacherAssignment)
SyllabusSerializer = serializer_for(models.Syllabus)
ClassRoutineSerializer = serializer_for(models.ClassRoutine)

