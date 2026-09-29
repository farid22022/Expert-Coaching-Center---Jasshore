import json
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from apps.organizations.models import Organization
from apps.courses.models import Course
from apps.admissions.models import AdmissionApplication


class AdmissionFormPersistenceTests(APITestCase):
    def setUp(self):
        self.org = Organization.objects.create(name="Form persistence test", code="form-persistence")
        self.admin = get_user_model().objects.create_user(username="form-admin", email="form-admin@example.com", organization=self.org, is_staff=True, is_superuser=True)
        self.course = Course.objects.create(organization=self.org, title="Form test admission", slug="form-test-admission", course_type="admission", status="admission_open", is_published=True)
        self.url = f"/api/v1/courses/courses/{self.course.pk}/"
        self.schema = [{"id":"personal", "title":"Personal details", "fields":[
            {"id":"name", "label":"Full name", "name":"full-name", "type":"text", "required":True},
            {"id":"phone", "label":"Phone", "name":"phone", "type":"tel", "required":True},
        ]}]

    def save_form(self, format="json"):
        self.client.force_authenticate(self.admin)
        payload = {"admission_form_schema": json.dumps(self.schema) if format == "multipart" else self.schema}
        response = self.client.patch(self.url, payload, format=format)
        self.assertEqual(response.status_code, 200, response.data)
        self.course.refresh_from_db()
        self.assertEqual(len(self.course.admission_form_schema[0]["fields"]), 2)
        return self.course.admission_form_schema

    def test_saved_form_survives_reload_and_is_available_to_public_applicants(self):
        saved = self.save_form()
        reloaded = self.client.get(self.url)
        self.assertEqual(reloaded.data["admission_form_schema"], saved)
        self.client.force_authenticate(None)
        public = self.client.get("/api/v1/courses/courses/public-admissions/form-test-admission/")
        self.assertEqual(public.status_code, 200, public.data)
        self.assertEqual(public.data["data"]["admission_form_schema"], saved)
        payload = {"course":self.course.pk, "applicant_name":"Test Applicant", "applicant_phone":"01700000001", "form_data":{"full-name":"Test Applicant"}}
        missing = self.client.post("/api/v1/admissions/", payload, format="json")
        self.assertEqual(missing.status_code, 400, missing.data)
        payload["form_data"]["phone"] = "01700000001"
        submitted = self.client.post("/api/v1/admissions/", payload, format="json")
        self.assertEqual(submitted.status_code, 201, submitted.data)
        self.assertEqual(AdmissionApplication.objects.get(course=self.course).form_data, payload["form_data"])

    def test_multipart_form_save_preserves_fields(self):
        self.save_form(format="multipart")

    def test_invalid_edit_cannot_erase_previously_saved_form(self):
        saved = self.save_form()
        for schema in [[{"title":"Name", "fields":[{"label":""}]}], [{"title":"Phone","fields":[]}], [{"title":"Details","fields":[{"label":"Batch","type":"select","options":[]}]}]]:
            with self.subTest(schema=schema):
                response = self.client.patch(self.url, {"admission_form_schema":schema}, format="json")
                self.assertEqual(response.status_code, 400, response.data)
                self.course.refresh_from_db()
                self.assertEqual(self.course.admission_form_schema, saved)
