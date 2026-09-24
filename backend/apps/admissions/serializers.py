import json

from rest_framework import serializers
from . import models
from apps.courses.models import Course, CourseStatus


def serializer_for(model):
    return type(f"{model.__name__}Serializer", (serializers.ModelSerializer,), {"Meta": type("Meta", (), {"model": model, "fields": "__all__"})})


class AdmissionApplicationSerializer(serializers.ModelSerializer):
    form_data = serializers.JSONField(required=False, default=dict)
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

    def validate(self, attrs):
        course = attrs.get("course") or getattr(self.instance, "course", None)
        is_public_submission = not self.context["request"].user.is_authenticated
        if not course and is_public_submission:
            raise serializers.ValidationError({"course": "Choose an admission program."})
        if course and (course.course_type != "admission" or not course.is_published or course.status != CourseStatus.ADMISSION_OPEN):
            raise serializers.ValidationError({"course": "This admission program is not open for applications."})
        if not course:
            return attrs

        form_data = attrs.get("form_data") or {}
        if isinstance(form_data, str):
            try:
                form_data = json.loads(form_data)
            except json.JSONDecodeError:
                raise serializers.ValidationError({"form_data": "The submitted form data is invalid."})
        document_labels = self.context["request"].data.get("document_labels", "[]")
        try:
            document_labels = document_labels if isinstance(document_labels, list) else json.loads(document_labels)
        except (TypeError, json.JSONDecodeError):
            document_labels = []
        for section in course.admission_form_schema or []:
            for field in section.get("fields", []):
                has_value = str(form_data.get(field.get("name"), "")).strip()
                has_file = field.get("name") in document_labels and bool(self.context["request"].FILES.getlist("documents"))
                if field.get("required") and not has_value and not has_file:
                    raise serializers.ValidationError({"form_data": f"{field.get('label') or 'A required field'} is required."})
        attrs["form_data"] = form_data

        applicant = self.context["request"].user if self.context["request"].user.is_authenticated else None
        email = attrs.get("applicant_email") or getattr(self.instance, "applicant_email", "")
        active_statuses = [models.ApplicationStatus.PENDING, models.ApplicationStatus.UNDER_REVIEW, models.ApplicationStatus.APPROVED]
        existing = models.AdmissionApplication.objects.filter(course=course, status__in=active_statuses)
        if applicant:
            existing = existing.filter(applicant=applicant)
        elif email:
            existing = existing.filter(applicant_email__iexact=email)
        else:
            existing = existing.filter(applicant_phone=attrs.get("applicant_phone", ""))
        if self.instance:
            existing = existing.exclude(pk=self.instance.pk)
        if existing.exists():
            raise serializers.ValidationError({"non_field_errors": [f"You already have an active application for {course.title}."]})
        return attrs


ApplicantDocumentSerializer = serializer_for(models.ApplicantDocument)
AdmissionPaymentSerializer = serializer_for(models.AdmissionPayment)
AdmissionExamSerializer = serializer_for(models.AdmissionExam)
AdmissionExamMarkSerializer = serializer_for(models.AdmissionExamMark)
AdmissionResultSerializer = serializer_for(models.AdmissionResult)
