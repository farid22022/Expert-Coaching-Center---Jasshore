from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from apps.accounts.models import Permission, Role
from apps.academic.models import AcademicSession, Subject
from apps.organizations.models import Organization


class SubjectApiTests(APITestCase):
    def setUp(self):
        self.organization = Organization.objects.create(
            name="E2E_TEST Academic Organization",
            code="e2e-test-academic-org",
        )
        self.role = Role.objects.create(
            organization=self.organization,
            name="E2E_TEST Academic Admin",
            code="e2e-test-academic-admin",
        )
        for action in ("view", "create", "edit", "delete"):
            permission = Permission.objects.create(
                code=f"academic.{action}",
                name=f"Academic {action.title()}",
                module="academic",
            )
            self.role.permissions.add(permission)

        self.User = get_user_model()
        self.user = self.User.objects.create_user(
            username="e2e_subject_admin",
            email="e2e_subject_admin@example.com",
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

    def test_subject_create_uses_authenticated_users_organization(self):
        self.login()
        session = AcademicSession.objects.create(
            organization=self.organization,
            name="E2E_TEST Session",
        )

        response = self.client.post(
            "/api/v1/academic/subjects/",
            {"code": "E2E-SUBJECT", "name": "E2E Subject", "session": session.id},
            format="json",
        )

        self.assertEqual(response.status_code, 201, response.data)
        subject = Subject.objects.get(code="E2E-SUBJECT")
        self.assertEqual(subject.organization, self.organization)
        self.assertEqual(response.data["organization"], self.organization.id)
