from rest_framework.decorators import action
from apps.core.permissions import HasActionPermission
from apps.core.responses import success_response
from apps.core.viewsets import OrganizationScopedModelViewSet
from . import models, serializers
from .services import ResultService


class ExamBaseViewSet(OrganizationScopedModelViewSet):
    permission_classes = [HasActionPermission]
    permission_module = "result"


class GradeScaleViewSet(ExamBaseViewSet):
    queryset = models.GradeScale.objects.all()
    serializer_class = serializers.GradeScaleSerializer


class ExamViewSet(ExamBaseViewSet):
    queryset = models.Exam.objects.select_related("session", "academic_class")
    serializer_class = serializers.ExamSerializer
    filterset_fields = ("session", "academic_class", "published")
    search_fields = ("name",)

    @action(detail=True, methods=["post"])
    def process(self, request, pk=None):
        results = ResultService.process_exam(self.get_object())
        return success_response({"processed": len(results)}, "Result processed.")

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        exam = self.get_object()
        exam.published = True
        exam.save(update_fields=["published", "updated_at"])
        exam.processed_results.update(published=True)
        return success_response(message="Result published.")


class ExamSubjectViewSet(ExamBaseViewSet):
    queryset = models.ExamSubject.objects.select_related("exam", "subject")
    serializer_class = serializers.ExamSubjectSerializer
    filterset_fields = ("exam", "subject")


class StudentMarkViewSet(ExamBaseViewSet):
    queryset = models.StudentMark.objects.select_related("exam_subject", "student")
    serializer_class = serializers.StudentMarkSerializer
    filterset_fields = ("exam_subject", "student")


class ProcessedResultViewSet(ExamBaseViewSet):
    queryset = models.ProcessedResult.objects.select_related("exam", "student")
    serializer_class = serializers.ProcessedResultSerializer
    filterset_fields = ("exam", "student", "status", "published")


class GrandExamConfigurationViewSet(ExamBaseViewSet):
    queryset = models.GrandExamConfiguration.objects.select_related("session", "academic_class").prefetch_related("exams")
    serializer_class = serializers.GrandExamConfigurationSerializer


class GrandResultViewSet(ExamBaseViewSet):
    queryset = models.GrandResult.objects.select_related("configuration", "student")
    serializer_class = serializers.GrandResultSerializer
    filterset_fields = ("configuration", "student", "promoted")
