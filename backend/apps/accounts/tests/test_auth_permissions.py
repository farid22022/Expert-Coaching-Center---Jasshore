from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from apps.accounts.models import Permission, Role
from apps.organizations.models import Organization


class AuthPermissionApiTests(APITestCase):
    def setUp(self):
        self.organization = Organization.objects.create(
            name="E2E_TEST Organization",
            code="e2e-test-org",
        )
        self.student_view = Permission.objects.create(
            code="student.view",
            name="Student View",
            module="student",
        )
        self.role = Role.objects.create(
            organization=self.organization,
            name="E2E_TEST Institute Admin",
            code="e2e-test-admin",
        )
        self.role.permissions.add(self.student_view)
        self.User = get_user_model()

    def create_user(self, email, with_role=False):
        user = self.User.objects.create_user(
            username=email.split("@")[0],
            email=email,
            password="2633123",
            organization=self.organization,
        )
        if with_role:
            user.roles.add(self.role)
        return user

    def login(self, email):
        response = self.client.post(
            "/api/v1/auth/login/",
            {"email": email, "password": "2633123"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")
        return response

    def test_public_register_creates_login_capable_user(self):
        response = self.client.post(
            "/api/v1/auth/register/",
            {
                "name": "E2E_TEST Student",
                "email": "e2e_test_register@example.com",
                "phone": "01000000000",
                "password": "2633123",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)

        login = self.client.post(
            "/api/v1/auth/login/",
            {"email": "e2e_test_register@example.com", "password": "2633123"},
            format="json",
        )
        self.assertEqual(login.status_code, 200)
        self.assertIn("access", login.data)

    def test_plain_authenticated_user_is_denied_student_admin_api(self):
        self.create_user("e2e_test_plain_api@example.com")
        self.login("e2e_test_plain_api@example.com")

        response = self.client.get("/api/v1/people/students/")
        self.assertEqual(response.status_code, 403)

    def test_role_permission_allows_student_admin_api(self):
        self.create_user("e2e_test_role_api@example.com", with_role=True)
        login = self.login("e2e_test_role_api@example.com")

        self.assertEqual(login.data["user"]["role_codes"], ["e2e-test-admin"])
        response = self.client.get("/api/v1/people/students/")
        self.assertEqual(response.status_code, 200)
