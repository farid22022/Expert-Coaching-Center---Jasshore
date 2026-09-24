from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from apps.accounts.models import Permission, Role
from apps.academic.models import AcademicClass, AcademicSession
from apps.admissions.models import AdmissionResult
from apps.courses.models import Course, Enrollment, EnrollmentStatus
from apps.organizations.models import Organization
from apps.people.models import Student


class AdmissionLifecycleApiTests(APITestCase):
    def setUp(self):
        self.organization = Organization.objects.create(
            name="E2E_TEST Admission Organization",
            code="e2e-test-admission-org",
        )
        self.session = AcademicSession.objects.create(
            organization=self.organization,
            name="2026",
        )
        self.academic_class = AcademicClass.objects.create(
            organization=self.organization,
            name="SSC",
        )
        self.role = Role.objects.create(
            organization=self.organization,
            name="E2E_TEST Admission Admin",
            code="e2e-test-admission-admin",
        )
        for action in ("view", "create", "edit", "delete", "approve", "reject", "process"):
            permission = Permission.objects.create(
                code=f"application.{action}",
                name=f"Application {action.title()}",
                module="application",
            )
            self.role.permissions.add(permission)

        User = get_user_model()
        self.user = User.objects.create_user(
            username="e2e_admission_admin",
            email="e2e_admission_admin@example.com",
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

    def test_application_exam_mark_result_and_approval_flow(self):
        self.login()

        application_response = self.client.post(
            "/api/v1/applications/",
            {
                "session": self.session.id,
                "academic_class": self.academic_class.id,
                "applicant_name": "E2E Applicant",
                "applicant_phone": "01700000002",
                "guardian_name": "E2E Guardian",
                "guardian_phone": "01700000003",
            },
            format="json",
        )
        self.assertEqual(application_response.status_code, 201, application_response.data)
        application_id = application_response.data["id"]

        exam_response = self.client.post(
            "/api/v1/applications/exams/",
            {
                "name": "E2E Admission Exam",
                "session": self.session.id,
                "academic_class": self.academic_class.id,
                "total_marks": "100.00",
                "pass_marks": "40.00",
            },
            format="json",
        )
        self.assertEqual(exam_response.status_code, 201, exam_response.data)
        exam_id = exam_response.data["id"]

        mark_response = self.client.post(
            "/api/v1/applications/marks/",
            {
                "exam": exam_id,
                "application": application_id,
                "obtained_marks": "81.00",
            },
            format="json",
        )
        self.assertEqual(mark_response.status_code, 201, mark_response.data)

        process_response = self.client.post(f"/api/v1/applications/exams/{exam_id}/process_result/")
        self.assertEqual(process_response.status_code, 200, process_response.data)
        self.assertEqual(AdmissionResult.objects.filter(exam_id=exam_id).count(), 1)

        approve_response = self.client.post(f"/api/v1/applications/{application_id}/approve/")
        self.assertEqual(approve_response.status_code, 200, approve_response.data)
        self.assertTrue(Student.objects.filter(admission_no=application_response.data["application_no"]).exists())

    def test_public_admission_creates_one_approved_enrollment(self):
        course = Course.objects.create(
            organization=self.organization,
            title="E2E Medical Admission",
            slug="e2e-medical-admission",
            course_type="admission",
            status="admission_open",
            is_published=True,
        )
        payload = {
            "course": course.id,
            "applicant_name": "Public Applicant",
            "applicant_phone": "01700000004",
            "applicant_email": "public-applicant@example.com",
        }
        application_response = self.client.post("/api/v1/admissions/", payload, format="json")
        self.assertEqual(application_response.status_code, 201, application_response.data)
        application_id = application_response.data["id"]
        self.assertTrue(application_response.data["application_no"].startswith("ADM-"))

        duplicate_response = self.client.post("/api/v1/admissions/", payload, format="json")
        self.assertEqual(duplicate_response.status_code, 400, duplicate_response.data)

        self.login()
        first_approval = self.client.post(f"/api/v1/admissions/{application_id}/approve/")
        second_approval = self.client.post(f"/api/v1/admissions/{application_id}/approve/")
        self.assertEqual(first_approval.status_code, 200, first_approval.data)
        self.assertEqual(second_approval.status_code, 200, second_approval.data)
        self.assertEqual(
            Enrollment.objects.filter(course=course, status=EnrollmentStatus.ACTIVE).count(),
            1,
        )
