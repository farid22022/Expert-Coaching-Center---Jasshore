from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from apps.admissions.models import AdmissionApplication
from apps.courses.models import Course, CourseStatus
from apps.organizations.models import Organization


class ProtectedDeleteAndStatsTests(APITestCase):
    def setUp(self):
        self.org = Organization.objects.create(name="Perf Org", code="perf-org")
        self.admin = get_user_model().objects.create_superuser(
            email="perf-admin@example.com", username="perf-admin", password="x-Test-12345", organization=self.org
        )
        self.client.force_authenticate(self.admin)
        self.course = Course.objects.create(organization=self.org, title="Protected", slug="protected", course_type="admission")
        AdmissionApplication.objects.create(
            organization=self.org, application_no="A-1", course=self.course, applicant_name="Applicant", applicant_phone="01700000000"
        )

    def test_delete_course_with_applications_returns_409_not_500(self):
        response = self.client.delete(f"/api/v1/courses/courses/{self.course.id}/")
        self.assertEqual(response.status_code, 409)
        body = response.json()
        self.assertEqual(body["code"], "RESOURCE_IN_USE")
        self.assertEqual(body["action"], "archive")
        self.assertIn("admission", body["detail"].lower())
        self.assertNotIn("Traceback", str(body))
        self.assertTrue(Course.objects.filter(pk=self.course.pk).exists())
        self.assertEqual(AdmissionApplication.objects.count(), 1)

    def test_archive_keeps_historical_application(self):
        response = self.client.patch(f"/api/v1/courses/courses/{self.course.id}/", {"status": CourseStatus.ARCHIVED}, format="json")
        self.assertEqual(response.status_code, 200)
        self.course.refresh_from_db()
        self.assertEqual(self.course.status, "archived")
        self.assertEqual(AdmissionApplication.objects.filter(course=self.course).count(), 1)

    def test_admin_stats_single_query_and_counts(self):
        with self.assertNumQueries(1):
            response = self.client.get("/api/v1/dashboard/admin-stats/")
        data = response.json()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data["applications"], 1)
        self.assertEqual(data["pending_applications"], 1)
        self.assertEqual(data["courses"], 1)
        self.assertEqual(data["admissions"], 1)

    def test_admin_stats_requires_authentication(self):
        self.client.force_authenticate(None)
        self.assertEqual(self.client.get("/api/v1/dashboard/admin-stats/").status_code, 401)
