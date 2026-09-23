from rest_framework import serializers
from django.utils.text import slugify
from uuid import uuid4
import json

from . import models


class CourseSerializer(serializers.ModelSerializer):
    slug = serializers.CharField(required=False, allow_blank=True)
    teacher_names = serializers.SerializerMethodField()
    subject_names = serializers.SerializerMethodField()
    section_names = serializers.SerializerMethodField()

    class Meta:
        model = models.Course
        fields = "__all__"
        validators = []

    def get_teacher_names(self, obj):
        teachers = []
        for assignment in getattr(obj, "teacher_assignments", []).all():
            name = getattr(assignment.teacher, "full_name", "") or getattr(assignment.teacher, "email", "")
            if name and name not in teachers:
                teachers.append(name)
        return teachers

    def get_subject_names(self, obj):
        subjects = []
        sections = getattr(obj, "sections", None)
        if not sections:
            return subjects
        for section in sections.all():
            for subject in section.subjects.all():
                if subject.name and subject.name not in subjects:
                    subjects.append(subject.name)
        return subjects

    def get_section_names(self, obj):
        sections = []
        for section in getattr(obj, "sections", []).all():
            if section.name and section.name not in sections:
                sections.append(section.name)
        return sections

    def validate_slug(self, value):
        if not value:
            return ""
        return slugify(value.strip())[:220]

    def validate_custom_content(self, value):
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                raise serializers.ValidationError("Custom content must be valid JSON.")
        if not isinstance(value, list):
            raise serializers.ValidationError("Custom content must be a list.")
        cleaned = []
        for item in value:
            if not isinstance(item, dict):
                continue
            cleaned.append({
                "type": str(item.get("type") or "text")[:40],
                "label": str(item.get("label") or "")[:180],
                "value": str(item.get("value") or ""),
                "url": str(item.get("url") or "")[:500],
            })
        return cleaned

    def validate_admission_form_schema(self, value):
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                raise serializers.ValidationError("Admission form schema must be valid JSON.")
        if not isinstance(value, list):
            raise serializers.ValidationError("Admission form schema must be a list.")

        cleaned_sections = []
        for section in value:
            if not isinstance(section, dict):
                continue
            fields = []
            for field in section.get("fields", []):
                if not isinstance(field, dict):
                    continue
                label = str(field.get("label") or "").strip()
                if not label:
                    continue
                fields.append({
                    "label": label[:180],
                    "name": str(field.get("name") or slugify(label) or f"field-{uuid4().hex[:6]}")[:180],
                    "type": str(field.get("type") or "text")[:40],
                    "placeholder": str(field.get("placeholder") or "")[:240],
                    "required": bool(field.get("required", False)),
                    "options": [str(option)[:180] for option in field.get("options", []) if str(option).strip()],
                })
            title = str(section.get("title") or "").strip()
            if title and fields:
                cleaned_sections.append({"title": title[:180], "fields": fields})
        return cleaned_sections

    def validate(self, attrs):
        title = attrs.get("title") or getattr(self.instance, "title", "")
        slug = attrs.get("slug") or getattr(self.instance, "slug", "")
        organization = attrs.get("organization") or getattr(self.instance, "organization", None)

        if not slug and title:
            slug = slugify(title)[:220]
        if not slug:
            slug = f"course-{uuid4().hex[:8]}"

        if slug and organization:
            base_slug = slug
            queryset = models.Course.objects.filter(organization=organization, slug=slug)
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)
            counter = 2
            while queryset.exists():
                suffix = f"-{counter}"
                slug = f"{base_slug[:220 - len(suffix)]}{suffix}"
                queryset = models.Course.objects.filter(organization=organization, slug=slug)
                if self.instance:
                    queryset = queryset.exclude(pk=self.instance.pk)
                counter += 1
            attrs["slug"] = slug

        return attrs


class CourseSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.CourseSection
        fields = "__all__"


class CourseSubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.CourseSubject
        fields = "__all__"


class TeacherAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.TeacherAssignment
        fields = "__all__"
        read_only_fields = ("assigned_by", "assigned_at")


class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Enrollment
        fields = "__all__"

