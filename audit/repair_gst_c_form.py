"""Restore only the two fields shown in the reported GST C Unit form.

Run with Django's shell from backend. Refuses to replace a nonempty schema.
"""
import json
from pathlib import Path
from django.db import transaction
from apps.courses.models import Course
from apps.courses.serializers import CourseSerializer

with transaction.atomic():
    course = Course.objects.select_for_update().get(pk=15, slug="gst-c-unit", title="GST C Unit")
    if course.admission_form_schema:
        print("No repair applied: this admission already has fields.")
    else:
        backup = Path("../audit/gst-c-form-before-repair.json")
        if not backup.exists():
            backup.write_text(json.dumps({"id":course.pk, "slug":course.slug, "admission_form_schema":course.admission_form_schema}, indent=2), encoding="utf-8")
        serializer = CourseSerializer(course, data={"admission_form_schema":[
            {"id":"gst-c-name", "title":"Name", "fields":[{"id":"gst-c-full-name", "label":"Full name", "name":"full-name", "type":"text", "required":True}]},
            {"id":"gst-c-phone", "title":"Phone", "fields":[{"id":"gst-c-phone-number", "label":"Phone", "name":"phone", "type":"tel", "required":True}]},
        ]}, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        print("GST C Unit restored: Full name and Phone application fields saved.")
