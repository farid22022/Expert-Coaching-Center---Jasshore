from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from apps.accounts.models import Permission, Role
from apps.organizations.models import Organization
from apps.people.models import Employee
from apps.courses.models import Course, TeacherAssignment

class HeadTeacherWriteTests(APITestCase):
    def setUp(self):
        self.org = Organization.objects.create(name="Audit scope", code="audit-head-write")
        self.user = get_user_model().objects.create_user(username="audithead", email="audithead@example.com", organization=self.org)
        self.teacher = Employee.objects.create(organization=self.org, employee_id="AUDIT-HEAD", full_name="Audit Head", email=self.user.email, employee_type="teacher")
        self.owned = Course.objects.create(organization=self.org, title="Owned", slug="audit-owned")
        self.other = Course.objects.create(organization=self.org, title="Other", slug="audit-other")
        TeacherAssignment.objects.create(organization=self.org, teacher=self.teacher, course=self.owned, role="head_teacher", assignment_status="accepted", is_active=True)
        self.client.force_authenticate(self.user)

    def test_head_teacher_creates_only_in_assigned_admission_without_global_grants(self):
        url = "/api/v1/courses/sections/"
        own = self.client.post(url, {"course": self.owned.id, "name": "Audit section"})
        self.assertEqual(own.status_code, 201, own.data)
        denied = self.client.post(url, {"course": self.other.id, "name": "Forbidden"})
        self.assertEqual(denied.status_code, 403, denied.data)

    def test_coarse_course_grant_does_not_bypass_head_scope(self):
        role = Role.objects.create(organization=self.org, name="Teacher", code="audit-teacher")
        permission = Permission.objects.create(code="course.create", name="Create course", module="course")
        role.permissions.add(permission)
        self.user.roles.add(role)
        denied = self.client.post("/api/v1/courses/sections/", {"course": self.other.id, "name": "Forbidden"})
        self.assertEqual(denied.status_code, 403, denied.data)
