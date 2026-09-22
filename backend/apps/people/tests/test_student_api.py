from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from apps.accounts.models import Permission, Role
from apps.organizations.models import Organization
from apps.people.models import Student


class StudentApiTests(APITestCase):
    def setUp(self):
        self.organization = Organization.objects.create(
            name="E2E_TEST Student Organization",
            code="e2e-test-student-org",
        )
        self.role = Role.objects.create(
            organization=self.organization,
            name="E2E_TEST Student Admin",
            code="e2e-test-student-admin",
        )
        for action in ("view", "create", "edit", "delete"):
            permission = Permission.objects.create(
                code=f"student.{action}",
                name=f"Student {action.title()}",
                module="student",
            )
            self.role.permissions.add(permission)

        self.User = get_user_model()
        self.user = self.User.objects.create_user(
            username="e2e_student_admin",
            email="e2e_student_admin@example.com",
            password="2633123",
            organization=self.organization,
        )
        self.user.roles.add(self.role)

    def login(self):
        response = self.client.post(
            "/api/v1/auth/login/",
            {"email": self.user.email, "password": "2633123"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

    def test_student_create_list_search_and_delete(self):
        self.login()

        create_response = self.client.post(
            "/api/v1/people/students/",
            {
                "student_id": "E2E-STU-001",
                "full_name": "E2E Student One",
                "gender": "male",
                "phone": "01700000001",
                "email": "e2e.student.one@example.com",
                "status": "active",
            },
            format="json",
        )
        self.assertEqual(create_response.status_code, 201, create_response.data)
        self.assertEqual(create_response.data["organization"], self.organization.id)

        list_response = self.client.get("/api/v1/people/students/", {"search": "E2E-STU-001"})
        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(list_response.data["results"][0]["student_id"], "E2E-STU-001")

        student_id = create_response.data["id"]
        delete_response = self.client.delete(f"/api/v1/people/students/{student_id}/")
        self.assertEqual(delete_response.status_code, 204)
        self.assertFalse(Student.objects.filter(student_id="E2E-STU-001").exists())
