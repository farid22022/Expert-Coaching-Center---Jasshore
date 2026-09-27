from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from rest_framework.test import APITestCase

from apps.accounts.models import Permission, Role
from apps.courses.models import Course, CourseSection, CourseSubject, Enrollment, TeacherAssignment
from apps.organizations.models import Organization
from apps.people.models import Department, Designation, Employee, Student, StudentProfile


class Phase1FoundationTests(APITestCase):
    def setUp(self):
        self.organization = Organization.objects.create(
            name="E2E_TEST Course Foundation",
            code="e2e-test-course-foundation",
        )
        self.role = Role.objects.create(
            organization=self.organization,
            name="E2E_TEST Course Admin",
            code="e2e-test-course-admin",
        )
        for module in ("course", "student", "employee"):
            for action in ("view", "create", "edit", "delete"):
                permission = Permission.objects.get_or_create(
                    code=f"{module}.{action}",
                    defaults={"name": f"{module} {action}", "module": module},
                )[0]
                self.role.permissions.add(permission)

        User = get_user_model()
        self.admin_user = User.objects.create_user(
            username="e2e_course_admin",
            email="e2e_course_admin@example.com",
            password="2633123",
            organization=self.organization,
        )
        self.admin_user.roles.add(self.role)

    def login(self):
        response = self.client.post(
            "/api/v1/auth/login/",
            {"email": self.admin_user.email, "password": "2633123"},
            format="json",
        )
        self.assertEqual(response.status_code, 200, response.data)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

    def test_student_registration_creates_profile_but_not_enrollment(self):
        student_role = Role.objects.create(
            organization=self.organization,
            name="Student",
            code="student",
            is_system=True,
        )

        response = self.client.post(
            "/api/v1/auth/register/",
            {
                "name": "E2E Student",
                "email": "e2e.student.foundation@example.com",
                "phone": "01711000000",
                "password": "2633123",
                "role": student_role.code,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201, response.data)
        profile = StudentProfile.objects.get(email="e2e.student.foundation@example.com")
        self.assertEqual(profile.full_name, "E2E Student")
        self.assertFalse(Student.objects.filter(email=profile.email).exists())
        self.assertFalse(Enrollment.objects.filter(student__email=profile.email).exists())

    def test_course_structure_teacher_assignment_and_duplicate_enrollment_rule(self):
        self.login()
        department = Department.objects.create(organization=self.organization, name="Academic")
        designation = Designation.objects.create(organization=self.organization, name="Teacher")
        teacher = Employee.objects.create(
            organization=self.organization,
            employee_id="TCH-E2E-001",
            full_name="E2E Teacher",
            employee_type="teacher",
            department=department,
            designation=designation,
        )
        student = Student.objects.create(
            organization=self.organization,
            student_id="STU-E2E-001",
            full_name="E2E Enrolled Student",
            phone="01722000000",
        )

        course_response = self.client.post(
            "/api/v1/courses/courses/",
            {
                "title": "SSC 2027",
                "slug": "ssc-2027",
                "course_type": "regular",
                "status": "admission_open",
                "is_published": True,
                "course_fee": "5000.00",
            },
            format="json",
        )
        self.assertEqual(course_response.status_code, 201, course_response.data)
        course_id = course_response.data["id"]

        section_response = self.client.post(
            "/api/v1/courses/sections/",
            {"course": course_id, "name": "Science", "head_teacher": teacher.id, "status": "active"},
            format="json",
        )
        self.assertEqual(section_response.status_code, 201, section_response.data)
        section_id = section_response.data["id"]

        subject_response = self.client.post(
            "/api/v1/courses/subjects/",
            {"course_section": section_id, "name": "Physics", "code": "PHY", "status": "active"},
            format="json",
        )
        self.assertEqual(subject_response.status_code, 201, subject_response.data)
        subject_id = subject_response.data["id"]

        assignment_response = self.client.post(
            "/api/v1/courses/teacher-assignments/",
            {
                "teacher": teacher.id,
                "course": course_id,
                "course_section": section_id,
                "subject": subject_id,
                "role": "subject_teacher",
                "permissions": ["assessment.create", "assessment.edit"],
            },
            format="json",
        )
        self.assertEqual(assignment_response.status_code, 201, assignment_response.data)

        enrollment_response = self.client.post(
            "/api/v1/courses/enrollments/",
            {
                "student": student.id,
                "course": course_id,
                "course_section": section_id,
                "enrollment_number": "ENR-E2E-001",
                "status": "active",
            },
            format="json",
        )
        self.assertEqual(enrollment_response.status_code, 201, enrollment_response.data)

        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Enrollment.objects.create(
                    organization=self.organization,
                    student=student,
                    course_id=course_id,
                    course_section_id=section_id,
                    enrollment_number="ENR-E2E-002",
                    status="active",
                )

        self.assertTrue(Course.objects.filter(id=course_id).exists())
        self.assertTrue(CourseSection.objects.filter(id=section_id).exists())
        self.assertTrue(CourseSubject.objects.filter(id=subject_id).exists())
        self.assertTrue(
            TeacherAssignment.objects.filter(
                teacher=teacher,
                course_id=course_id,
                course_section_id=section_id,
                subject__isnull=True,
                role="head_teacher",
                assignment_status="accepted",
                is_active=True,
            ).exists()
        )
        self.assertTrue(TeacherAssignment.objects.filter(teacher=teacher, subject_id=subject_id).exists())

    def test_admin_can_assign_program_head_teacher_for_admission_course(self):
        self.login()
        department = Department.objects.create(organization=self.organization, name="Admission")
        designation = Designation.objects.create(organization=self.organization, name="Head Teacher")
        teacher = Employee.objects.create(
            organization=self.organization,
            employee_id="TCH-E2E-HEAD",
            full_name="E2E Admission Head",
            employee_type="teacher",
            department=department,
            designation=designation,
        )
        course = Course.objects.create(
            organization=self.organization,
            title="Medical Admission 2027",
            slug="medical-admission-2027",
            course_type="admission",
            status="admission_open",
            is_published=True,
        )

        response = self.client.post(
            "/api/v1/courses/teacher-assignments/",
            {
                "teacher": teacher.id,
                "course": course.id,
                "course_section": None,
                "subject": None,
                "role": "head_teacher",
                "assignment_status": "accepted",
                "is_active": True,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201, response.data)
        self.assertTrue(
            TeacherAssignment.objects.filter(
                teacher=teacher,
                course=course,
                course_section__isnull=True,
                subject__isnull=True,
                role="head_teacher",
                assignment_status="accepted",
                is_active=True,
            ).exists()
        )

    def test_admin_can_create_admission_card_without_manual_slug(self):
        self.login()

        response = self.client.post(
            "/api/v1/courses/courses/",
            {
                "title": "Class 9 Admission 2027",
                "course_type": "admission",
                "status": "admission_open",
                "is_published": True,
                "admission_fee": "1200.00",
                "course_fee": "5000.00",
                "capacity": 100,
                "enrollment_start": "2026-09-22",
                "enrollment_end": "2026-10-22",
                "description": "Admission card for Class 9.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(response.data["slug"], "class-9-admission-2027")
        self.assertEqual(response.data["course_type"], "admission")

    def test_superuser_without_organization_can_create_admission_card(self):
        User = get_user_model()
        superuser = User.objects.create_superuser(
            username="course_superuser",
            email="course.superuser@example.com",
            password="2633123",
        )
        login_response = self.client.post(
            "/api/v1/auth/login/",
            {"email": superuser.email, "password": "2633123"},
            format="json",
        )
        self.assertEqual(login_response.status_code, 200, login_response.data)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login_response.data['access']}")

        response = self.client.post(
            "/api/v1/courses/courses/",
            {
                "title": "Superuser Admission Card",
                "course_type": "admission",
                "status": "admission_open",
                "is_published": True,
                "admission_fee": "1000.00",
                "course_fee": "4000.00",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(response.data["organization"], Organization.objects.get(code="expert-jashore").id)
