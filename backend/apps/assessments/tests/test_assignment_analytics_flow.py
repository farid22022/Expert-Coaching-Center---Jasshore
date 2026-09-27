from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils import timezone
from rest_framework.test import APITestCase

from apps.accounts.models import Permission, Role
from apps.assessments.models import Assessment, AssignmentSubmission, ContentReviewStatus
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
            review_status=ContentReviewStatus.APPROVED,
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


class TeacherCreatedContentVisibilityTests(APITestCase):
    def setUp(self):
        self.organization = Organization.objects.create(name="E2E_TEST Teacher Content Org", code="e2e-test-teacher-content-org")
        User = get_user_model()
        teacher_role = Role.objects.create(organization=self.organization, name="Teacher No Admin Permissions", code="teacher-no-admin-perms")
        student_role = Role.objects.create(organization=self.organization, name="Student", code="content-student")

        self.teacher_user = User.objects.create_user(username="content_teacher", email="content.teacher@example.com", password="2633123", organization=self.organization)
        self.teacher_user.roles.add(teacher_role)
        self.head_user = User.objects.create_user(username="content_head", email="content.head@example.com", password="2633123", organization=self.organization)
        self.head_user.roles.add(teacher_role)
        self.student_user = User.objects.create_user(username="content_student", email="content.student@example.com", password="2633123", organization=self.organization)
        self.student_user.roles.add(student_role)

        department = Department.objects.create(organization=self.organization, name="Academic")
        designation = Designation.objects.create(organization=self.organization, name="Teacher")
        self.teacher = Employee.objects.create(organization=self.organization, employee_id="CNT-TCH-001", full_name="Content Teacher", employee_type="teacher", email=self.teacher_user.email, department=department, designation=designation)
        self.head_teacher = Employee.objects.create(organization=self.organization, employee_id="CNT-HEAD-001", full_name="Content Head", employee_type="teacher", email=self.head_user.email, department=department, designation=designation)
        self.student = Student.objects.create(organization=self.organization, student_id="CNT-STU-001", full_name="Content Student", email=self.student_user.email)
        self.course = Course.objects.create(organization=self.organization, title="GST Admission", slug="gst-admission-content", course_type="admission", status="running", is_published=True)
        self.section = CourseSection.objects.create(organization=self.organization, course=self.course, name="A Unit", head_teacher=self.head_teacher)
        self.subject = CourseSubject.objects.create(organization=self.organization, course_section=self.section, name="Physics", code="PHY-CNT")
        Enrollment.objects.create(organization=self.organization, student=self.student, course=self.course, course_section=self.section, enrollment_number="CNT-ENR-001", status="active")
        TeacherAssignment.objects.create(organization=self.organization, teacher=self.head_teacher, course=self.course, course_section=self.section, role="head_teacher", assignment_status="accepted", is_active=True)
        TeacherAssignment.objects.create(organization=self.organization, teacher=self.teacher, course=self.course, course_section=self.section, subject=self.subject, role="subject_teacher", assignment_status="accepted", is_active=True)

    def login(self, user):
        response = self.client.post("/api/v1/auth/login/", {"email": user.email, "password": "2633123"}, format="json")
        self.assertEqual(response.status_code, 200, response.data)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

    def test_assigned_teacher_content_is_reviewed_then_visible_to_student_notice_board(self):
        self.login(self.teacher_user)
        assessment = self.client.post(
            "/api/v1/assessments/assessments/",
            {
                "title": "Physics Chapter 1 MCQ",
                "assessment_type": "mcq",
                "course": self.course.id,
                "course_section": self.section.id,
                "subject": self.subject.id,
                "duration_minutes": 20,
                "status": "published",
            },
            format="json",
        )
        self.assertEqual(assessment.status_code, 201, assessment.data)
        self.assertEqual(assessment.data["review_status"], ContentReviewStatus.PENDING)

        material = self.client.post(
            "/api/v1/assessments/materials/",
            {
                "title": "Physics Notes",
                "course": self.course.id,
                "course_section": self.section.id,
                "subject": self.subject.id,
                "material_type": "note",
                "description": "Chapter notes",
                "is_published": True,
            },
            format="json",
        )
        self.assertEqual(material.status_code, 201, material.data)
        self.assertEqual(material.data["review_status"], ContentReviewStatus.PENDING)

        self.login(self.head_user)
        approved_assessment = self.client.post(f"/api/v1/assessments/assessments/{assessment.data['id']}/review/", {"decision": "approve"}, format="json")
        approved_material = self.client.post(f"/api/v1/assessments/materials/{material.data['id']}/review/", {"decision": "approve"}, format="json")
        self.assertEqual(approved_assessment.status_code, 200, approved_assessment.data)
        self.assertEqual(approved_material.status_code, 200, approved_material.data)

        self.login(self.student_user)
        content = self.client.get(f"/api/v1/courses/student/dashboard/{self.student.course_enrollments.first().id}/content/")
        self.assertEqual(content.status_code, 200, content.data)
        self.assertEqual(content.data["assessments"][0]["title"], "Physics Chapter 1 MCQ")
        self.assertEqual(content.data["materials"][0]["title"], "Physics Notes")
        self.assertTrue(any(notice["kind"] == "MCQ / test" for notice in content.data["notices"]))
        self.assertTrue(any(notice["kind"] == "Study material" for notice in content.data["notices"]))
