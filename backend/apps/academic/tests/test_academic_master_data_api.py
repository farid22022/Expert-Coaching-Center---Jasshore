from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from apps.accounts.models import Permission, Role
from apps.academic.models import (
    AcademicClass,
    AcademicSession,
    Building,
    Classroom,
    CombinedSubject,
    Floor,
    Section,
    Shift,
    StudentCategory,
    StudentGroup,
    Subject,
    Syllabus,
)
from apps.organizations.models import Organization


class AcademicMasterDataApiTests(APITestCase):
    def setUp(self):
        self.organization = Organization.objects.create(
            name="E2E_TEST Academic Master Organization",
            code="e2e-test-academic-master-org",
        )
        self.role = Role.objects.create(
            organization=self.organization,
            name="E2E_TEST Academic Master Admin",
            code="e2e-test-academic-master-admin",
        )
        for action in ("view", "create", "edit", "delete"):
            permission = Permission.objects.get_or_create(
                code=f"academic.{action}",
                defaults={"name": f"Academic {action.title()}", "module": "academic"},
            )[0]
            self.role.permissions.add(permission)

        User = get_user_model()
        self.user = User.objects.create_user(
            username="e2e_academic_master_admin",
            email="e2e_academic_master_admin@example.com",
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
        self.assertEqual(response.status_code, 200, response.data)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

    def post_ok(self, url, payload):
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(response.data["organization"], self.organization.id)
        return response.data

    def test_academic_master_data_crud_endpoints_use_authenticated_organization(self):
        self.login()

        session = self.post_ok(
            "/api/v1/academic/sessions/",
            {"name": "E2E_TEST 2027", "is_active": True},
        )
        academic_class = self.post_ok(
            "/api/v1/academic/classes/",
            {"name": "E2E_TEST Class 9", "sorting": 9, "group_required": True},
        )
        shift = self.post_ok(
            "/api/v1/academic/shifts/",
            {"name": "E2E_TEST Morning", "sorting": 1},
        )
        group = self.post_ok(
            "/api/v1/academic/student-groups/",
            {"name": "E2E_TEST Science"},
        )
        category = self.post_ok(
            "/api/v1/academic/student-categories/",
            {"name": "E2E_TEST Regular"},
        )
        section = self.post_ok(
            "/api/v1/academic/sections/",
            {
                "academic_class": academic_class["id"],
                "shift": shift["id"],
                "name": "E2E_TEST A",
            },
        )
        subject = self.post_ok(
            "/api/v1/academic/subjects/",
            {
                "academic_class": academic_class["id"],
                "session": session["id"],
                "groups": [group["id"]],
                "code": "E2E-MATH",
                "name": "E2E Mathematics",
                "category": "Regular",
            },
        )
        combined_subject = self.post_ok(
            "/api/v1/academic/combined-subjects/",
            {
                "academic_class": academic_class["id"],
                "name": "E2E Science Combine",
                "subjects": [subject["id"]],
            },
        )
        building = self.post_ok(
            "/api/v1/academic/buildings/",
            {"name": "E2E Building", "full_name": "E2E Academic Building"},
        )
        floor = self.post_ok(
            "/api/v1/academic/floors/",
            {"building": building["id"], "name": "E2E Floor", "full_name": "E2E Floor One"},
        )
        classroom = self.post_ok(
            "/api/v1/academic/classrooms/",
            {
                "building": building["id"],
                "floor": floor["id"],
                "room_no": "E2E-101",
                "full_name": "E2E Room 101",
            },
        )
        syllabus = self.post_ok(
            "/api/v1/academic/syllabus/",
            {
                "session": session["id"],
                "title": "E2E Syllabus",
                "description": "E2E syllabus description",
            },
        )

        response = self.client.patch(
            f"/api/v1/academic/classes/{academic_class['id']}/",
            {"name": "E2E_TEST Class Nine"},
            format="json",
        )
        self.assertEqual(response.status_code, 200, response.data)

        response = self.client.delete(f"/api/v1/academic/student-categories/{category['id']}/")
        self.assertEqual(response.status_code, 204, response.data if hasattr(response, "data") else None)

        self.assertTrue(AcademicSession.objects.filter(id=session["id"], organization=self.organization).exists())
        self.assertTrue(AcademicClass.objects.filter(name="E2E_TEST Class Nine", organization=self.organization).exists())
        self.assertTrue(Shift.objects.filter(id=shift["id"], organization=self.organization).exists())
        self.assertFalse(StudentCategory.objects.filter(id=category["id"]).exists())
        self.assertTrue(StudentGroup.objects.filter(id=group["id"], organization=self.organization).exists())
        self.assertTrue(Section.objects.filter(id=section["id"], organization=self.organization).exists())
        self.assertTrue(Subject.objects.filter(id=subject["id"], organization=self.organization).exists())
        self.assertTrue(CombinedSubject.objects.filter(id=combined_subject["id"], organization=self.organization).exists())
        self.assertTrue(Building.objects.filter(id=building["id"], organization=self.organization).exists())
        self.assertTrue(Floor.objects.filter(id=floor["id"], organization=self.organization).exists())
        self.assertTrue(Classroom.objects.filter(id=classroom["id"], organization=self.organization).exists())
        self.assertTrue(Syllabus.objects.filter(id=syllabus["id"], organization=self.organization).exists())
