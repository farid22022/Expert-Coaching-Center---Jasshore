from apps.core.permissions import HasActionPermission
from apps.core.viewsets import OrganizationScopedModelViewSet
from . import models, serializers


class BaseAcademicViewSet(OrganizationScopedModelViewSet):
    permission_classes = [HasActionPermission]
    search_fields = ("name",)


class AcademicSessionViewSet(BaseAcademicViewSet):
    queryset = models.AcademicSession.objects.all()
    serializer_class = serializers.AcademicSessionSerializer
    filterset_fields = ("is_active",)


class ShiftViewSet(BaseAcademicViewSet):
    queryset = models.Shift.objects.all()
    serializer_class = serializers.ShiftSerializer


class StudentGroupViewSet(BaseAcademicViewSet):
    queryset = models.StudentGroup.objects.all()
    serializer_class = serializers.StudentGroupSerializer


class StudentCategoryViewSet(BaseAcademicViewSet):
    queryset = models.StudentCategory.objects.all()
    serializer_class = serializers.StudentCategorySerializer


class AcademicClassViewSet(BaseAcademicViewSet):
    queryset = models.AcademicClass.objects.all()
    serializer_class = serializers.AcademicClassSerializer


class SectionViewSet(BaseAcademicViewSet):
    queryset = models.Section.objects.select_related("academic_class", "shift")
    serializer_class = serializers.SectionSerializer
    filterset_fields = ("academic_class", "shift")


class SubjectViewSet(BaseAcademicViewSet):
    queryset = models.Subject.objects.select_related("academic_class", "session").prefetch_related("groups")
    serializer_class = serializers.SubjectSerializer
    search_fields = ("name", "code")
    filterset_fields = ("academic_class", "session", "category")


class CombinedSubjectViewSet(BaseAcademicViewSet):
    queryset = models.CombinedSubject.objects.prefetch_related("subjects")
    serializer_class = serializers.CombinedSubjectSerializer


class BuildingViewSet(BaseAcademicViewSet):
    queryset = models.Building.objects.all()
    serializer_class = serializers.BuildingSerializer


class FloorViewSet(BaseAcademicViewSet):
    queryset = models.Floor.objects.select_related("building")
    serializer_class = serializers.FloorSerializer
    filterset_fields = ("building",)


class ClassroomViewSet(BaseAcademicViewSet):
    queryset = models.Classroom.objects.select_related("building", "floor")
    serializer_class = serializers.ClassroomSerializer
    search_fields = ("room_no", "full_name")
    filterset_fields = ("building", "floor")


class ClassTeacherAssignmentViewSet(BaseAcademicViewSet):
    queryset = models.ClassTeacherAssignment.objects.select_related("teacher", "academic_class", "section", "session")
    serializer_class = serializers.ClassTeacherAssignmentSerializer
    filterset_fields = ("teacher", "academic_class", "section", "session")


class SyllabusViewSet(BaseAcademicViewSet):
    queryset = models.Syllabus.objects.select_related("session")
    serializer_class = serializers.SyllabusSerializer
    search_fields = ("title", "description")
    filterset_fields = ("session",)


class ClassRoutineViewSet(BaseAcademicViewSet):
    queryset = models.ClassRoutine.objects.select_related("session", "academic_class", "section", "shift", "subject", "teacher", "classroom")
    serializer_class = serializers.ClassRoutineSerializer
    filterset_fields = ("session", "academic_class", "section", "shift", "teacher", "weekday", "status")

