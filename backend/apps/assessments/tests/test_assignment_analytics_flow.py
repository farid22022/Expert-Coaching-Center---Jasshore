from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils import timezone
from rest_framework.test import APITestCase

from apps.accounts.models import Permission, Role
from apps.assessments.models import Assessment, AssignmentSubmission
from apps.courses.models import Course, CourseSection, CourseSubject, Enrollment, TeacherAssignment
from apps.organizations.models import Organization
from apps.people.models import Department, Designation, Employee, Student


class AssignmentAnalyticsFlowTests(APITestCase):
    def setUp(self):
        self.organization = Organization.objects.create(name="E2E_TEST Assignment Org", code="e2e-test-assignment-org")
        role = Role.objects.create(organization=self.organization, name="Student", code="student")
        teacher_role = Role.objects.create(organization=self.organization, name="Teacher", code="teacher")
        for code in ("assessment.view", "assessment.create", "assessment.edit", "course.view"):
            permission = Permission.objects.get_or_create(code=code, defaults={"name": code, "module": code.split(".")[0]})[0]
            role.permissions.add(permission)
            teacher_role.permissions.add(permission)

        User = get_user_model()
        self.student_user = User.objects.create_user(username="assignment_student", email="assignment.student@example.com", password="2633123", organization=self.organization)
        self.student_user.roles.add(role)
        self.teacher_user = User.objects.create_user(username="assignment_teacher", email="assignment.teacher@example.com", password="2633123", organization=self.organization)
        self.teacher_user.roles.add(teacher_role)

        self.student = Student.objects.create(organization=self.organization, student_id="ASN-STU-001", full_name="Assignment Student", email=self.student_user.email)
        department = Department.objects.create(organization=self.organization, name="Academic")
        designation = Designation.objects.create(organization=self.organization, name="Teacher")
        self.teacher = Employee.objects.create(
            organization=self.organization,
            employee_id="ASN-TCH-001",
            full_name="Assignment Teacher",
            employee_type="teacher",
            email=self.teacher_user.email,
            department=department,
            designation=designation,
        )
        self.course = Course.objects.create(organization=self.organization, title="HSC 2027", slug="hsc-2027-assignment", status="running", is_published=True)
        self.section = CourseSection.objects.create(organization=self.organization, course=self.course, name="Science", head_teacher=self.teacher)
        self.subject = CourseSubject.objects.create(organization=self.organization, course_section=self.section, name="Physics", code="PHY-ASN")
        Enrollment.objects.create(organization=self.organization, student=self.student, course=self.course, course_section=self.section, enrollment_number="ASN-ENR-001", status="active")
        TeacherAssignment.objects.create(organization=self.organization, teacher=self.teacher, course=self.course, course_section=self.section, subject=self.subject, role="subject_teacher")
        self.assessment = Assessment.objects.create(
            organization=self.organization,
            title="Physics Assignment",
            assessment_type="assignment",
            course=self.course,
            course_section=self.section,
            subject=self.subject,
            created_by_teacher=self.teacher,
            status="published",
            starts_at=timezone.now() - timezone.timedelta(days=1),
            ends_at=timezone.now() + timezone.timedelta(days=1),
        )

    def login(self, user):
        response = self.client.post("/api/v1/auth/login/", {"email": user.email, "password": "2633123"}, format="json")
        self.assertEqual(response.status_code, 200, response.data)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

    def test_assignment_submission_validation_evaluation_and_analytics(self):
        self.login(self.student_user)
        invalid = SimpleUploadedFile("answer.exe", b"bad", content_type="application/octet-stream")
        rejected = self.client.post(
            f"/api/v1/assessments/student/assessments/{self.assessment.id}/submit_assignment/",
            {"files": [invalid]},
            format="multipart",
        )
        self.assertEqual(rejected.status_code, 400)

        pdf = SimpleUploadedFile("answer.pdf", b"%PDF-1.4 demo", content_type="application/pdf")
        submitted = self.client.post(
            f"/api/v1/assessments/student/assessments/{self.assessment.id}/submit_assignment/",
            {"files": [pdf]},
            format="multipart",
        )
        self.assertEqual(submitted.status_code, 200, submitted.data)
        submission_id = submitted.data["id"]
        self.assertEqual(submitted.data["status"], "submitted")
        self.assertEqual(len(submitted.data["attachments"]), 1)

        history = self.client.get("/api/v1/assessments/student/assessments/history/")
        self.assertEqual(history.status_code, 200, history.data)
        self.assertEqual(len(history.data["submissions"]), 1)

        self.login(self.teacher_user)
        evaluated = self.client.post(
            f"/api/v1/assessments/submissions/{submission_id}/evaluate/",
            {"marks_obtained": "88.00", "feedback": "Strong work."},
            format="json",
        )
        self.assertEqual(evaluated.status_code, 200, evaluated.data)
        self.assertEqual(evaluated.data["status"], "evaluated")
        self.assertEqual(evaluated.data["feedback"], "Strong work.")

        teacher_analytics = self.client.get("/api/v1/assessments/analytics/teacher/")
        self.assertEqual(teacher_analytics.status_code, 200, teacher_analytics.data)
        self.assertEqual(teacher_analytics.data["assessment_count"], 1)

        subject_analytics = self.client.get(f"/api/v1/assessments/analytics/subject/{self.subject.id}/")
        self.assertEqual(subject_analytics.status_code, 200, subject_analytics.data)
        self.assertEqual(subject_analytics.data["assessment_count"], 1)

        self.assertTrue(AssignmentSubmission.objects.filter(id=submission_id, marks_obtained="88.00").exists())
