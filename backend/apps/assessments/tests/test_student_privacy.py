from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from apps.assessments.models import (
    Question,
    StudentBookmark,
    StudentFeedback,
    StudentIntervention,
    TeacherPrivateNote,
)
from apps.courses.models import Course, CourseSection, CourseSubject, Enrollment
from apps.organizations.models import Organization
from apps.people.models import Department, Designation, Employee, Student


class StudentPrivacyTests(APITestCase):
    """
    Spec §11/§50/§59: TeacherPrivateNote must never appear in any student-reachable
    response, and a student must never be able to read another student's
    feedback/intervention/bookmark by guessing/incrementing an ID.
    """

    def setUp(self):
        self.organization = Organization.objects.create(name="E2E_TEST Student Privacy Org", code="e2e-test-student-privacy-org")

        User = get_user_model()
        self.student_a_user = User.objects.create_user(username="privacy_student_a", email="privacy.student.a@example.com", password="2633123", organization=self.organization)
        self.student_b_user = User.objects.create_user(username="privacy_student_b", email="privacy.student.b@example.com", password="2633123", organization=self.organization)

        self.course = Course.objects.create(organization=self.organization, title="HSC Science Privacy", slug="hsc-science-privacy-test", status="running", is_published=True)
        self.section = CourseSection.objects.create(organization=self.organization, course=self.course, name="Science")
        self.subject = CourseSubject.objects.create(organization=self.organization, course_section=self.section, name="Physics", code="PHY-PRIV")

        self.student_a = Student.objects.create(organization=self.organization, student_id="PRIV-STU-A", full_name="Student A", email=self.student_a_user.email)
        self.student_b = Student.objects.create(organization=self.organization, student_id="PRIV-STU-B", full_name="Student B", email=self.student_b_user.email)
        Enrollment.objects.create(organization=self.organization, student=self.student_a, course=self.course, course_section=self.section, enrollment_number="PRIV-ENR-A", status="active")
        Enrollment.objects.create(organization=self.organization, student=self.student_b, course=self.course, course_section=self.section, enrollment_number="PRIV-ENR-B", status="active")

        self.question = Question.objects.create(organization=self.organization, course=self.course, course_section=self.section, subject=self.subject, text="What is g?", marks=1)

        department = Department.objects.create(organization=self.organization, name="Academic")
        designation = Designation.objects.create(organization=self.organization, name="Teacher")
        self.teacher = Employee.objects.create(organization=self.organization, employee_id="PRIV-TCH-001", full_name="Physics Teacher", employee_type="teacher", email="privacy.teacher@example.com", department=department, designation=designation)

        self.feedback_b = StudentFeedback.objects.create(organization=self.organization, student=self.student_b, subject=self.subject, created_by_teacher=self.teacher, body="Great work on Physics.")
        self.intervention_b = StudentIntervention.objects.create(
            organization=self.organization, student=self.student_b, subject=self.subject, created_by_teacher=self.teacher,
            intervention_type="extra_practice", reason="Needs more practice on Physics.",
        )
        self.bookmark_b = StudentBookmark.objects.create(organization=self.organization, student=self.student_b, question=self.question)
        self.private_note_b = TeacherPrivateNote.objects.create(organization=self.organization, student=self.student_b, created_by_teacher=self.teacher, note="Confidential: struggling emotionally, handle with care.")

    def login(self, user):
        response = self.client.post("/api/v1/auth/login/", {"email": user.email, "password": "2633123"}, format="json")
        self.assertEqual(response.status_code, 200, response.data)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

    def test_student_cannot_fetch_another_students_feedback_by_id(self):
        self.login(self.student_a_user)
        response = self.client.get(f"/api/v1/assessments/feedback/{self.feedback_b.id}/")
        self.assertIn(response.status_code, (403, 404), response.data)

    def test_student_own_feedback_endpoint_never_returns_another_students_row(self):
        self.login(self.student_a_user)
        response = self.client.get("/api/v1/assessments/student/assessments/feedback/")
        self.assertEqual(response.status_code, 200, response.data)
        self.assertNotIn(self.feedback_b.id, [row["id"] for row in response.data])

    def test_student_cannot_fetch_another_students_intervention_by_id(self):
        self.login(self.student_a_user)
        response = self.client.get(f"/api/v1/assessments/interventions/{self.intervention_b.id}/")
        self.assertIn(response.status_code, (403, 404), response.data)

    def test_student_own_actions_endpoint_never_returns_another_students_row(self):
        self.login(self.student_a_user)
        response = self.client.get("/api/v1/assessments/student/assessments/actions/")
        self.assertEqual(response.status_code, 200, response.data)
        self.assertNotIn(self.intervention_b.id, [row["id"] for row in response.data])

    def test_student_cannot_fetch_another_students_bookmark_by_id(self):
        self.login(self.student_a_user)
        response = self.client.get(f"/api/v1/assessments/student/bookmarks/{self.bookmark_b.id}/")
        self.assertIn(response.status_code, (403, 404), response.data)

    def test_student_cannot_delete_another_students_bookmark(self):
        self.login(self.student_a_user)
        response = self.client.delete(f"/api/v1/assessments/student/bookmarks/{self.bookmark_b.id}/")
        self.assertIn(response.status_code, (403, 404), response.data)
        self.assertTrue(StudentBookmark.objects.filter(id=self.bookmark_b.id).exists())

    def test_teacher_private_note_never_reachable_by_a_student_token(self):
        """No student-facing endpoint references TeacherPrivateNote at all - a student
        (no teacher/staff record) gets an empty list (no data leak, TeacherScopedStudentRecordViewSet.get_queryset
        degrades to queryset.none() rather than the org-wide set) and a flat deny on direct retrieve."""
        self.login(self.student_a_user)
        listed = self.client.get("/api/v1/assessments/teacher-notes/")
        self.assertEqual(listed.status_code, 200, listed.data)
        self.assertEqual(listed.data["results"], [])
        retrieved = self.client.get(f"/api/v1/assessments/teacher-notes/{self.private_note_b.id}/")
        self.assertIn(retrieved.status_code, (403, 404), retrieved.data)

    def test_teacher_private_note_fields_absent_from_every_student_facing_response(self):
        self.login(self.student_b_user)
        for url in (
            "/api/v1/assessments/student/assessments/actions/",
            "/api/v1/assessments/student/assessments/feedback/",
            "/api/v1/assessments/student/assessments/recommended/",
        ):
            response = self.client.get(url)
            self.assertEqual(response.status_code, 200, response.data)
            self.assertNotIn(self.private_note_b.note, str(response.data))
