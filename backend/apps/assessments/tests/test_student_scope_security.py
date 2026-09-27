from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase

from apps.accounts.models import Permission, Role
from apps.assessments.models import (
    Assessment,
    AssessmentAttempt,
    AssignmentSubmission,
    ContentReviewStatus,
    Question,
    QuestionOption,
)
from apps.courses.models import Course, CourseSection, CourseSubject, Enrollment
from apps.organizations.models import Organization
from apps.people.models import Student


class StudentCannotReachAdminAssessmentSurfaceTests(APITestCase):
    """
    Regression test for a confirmed, exploitable authorization gap: the seeded `student`
    Role held `assessment.view`/`course.view` permissions, and AssessmentAdminViewSet's
    "no teacher record -> fall back to a coarse role-permission check, and if it passes
    return the whole org queryset" logic let ANY student read the full org-wide MCQ
    answer key (QuestionOption.is_correct), every student's attempts/scores, and every
    student's assignment submissions/feedback via the teacher-admin endpoints instead of
    the intended /student/... endpoints. This proves a plain student gets nothing from
    the admin surface, while their own /student/... endpoints keep working correctly.
    """

    def setUp(self):
        self.organization = Organization.objects.create(name="E2E_TEST Student Scope Org", code="e2e-test-student-scope-org")
        student_role = Role.objects.create(organization=self.organization, name="Student", code="scope-student")
        for code in ("assessment.view", "course.view"):
            permission = Permission.objects.get_or_create(code=code, defaults={"name": code, "module": code.split(".")[0]})[0]
            student_role.permissions.add(permission)

        User = get_user_model()
        self.student_user = User.objects.create_user(username="scope_student2", email="scope.student2@example.com", password="2633123", organization=self.organization)
        self.student_user.roles.add(student_role)
        self.other_student_user = User.objects.create_user(username="other_student2", email="other.student2@example.com", password="2633123", organization=self.organization)

        self.course = Course.objects.create(organization=self.organization, title="HSC Science 2027", slug="hsc-science-student-scope-test", status="running", is_published=True)
        self.section = CourseSection.objects.create(organization=self.organization, course=self.course, name="Science")
        self.subject = CourseSubject.objects.create(organization=self.organization, course_section=self.section, name="Physics", code="PHY-SST")

        self.student = Student.objects.create(organization=self.organization, student_id="SST-STU-001", full_name="Scope Student", email=self.student_user.email)
        self.other_student = Student.objects.create(organization=self.organization, student_id="SST-STU-002", full_name="Other Student", email=self.other_student_user.email)
        Enrollment.objects.create(organization=self.organization, student=self.student, course=self.course, course_section=self.section, enrollment_number="SST-ENR-001", status="active")
        Enrollment.objects.create(organization=self.organization, student=self.other_student, course=self.course, course_section=self.section, enrollment_number="SST-ENR-002", status="active")

        self.question = Question.objects.create(organization=self.organization, course=self.course, course_section=self.section, subject=self.subject, text="What is g?", marks=1)
        self.correct_option = QuestionOption.objects.create(organization=self.organization, question=self.question, text="9.8", is_correct=True, order=0)

        self.assessment = Assessment.objects.create(
            organization=self.organization, title="Physics Chapter 1 MCQ", assessment_type="mcq", course=self.course, course_section=self.section, subject=self.subject,
            status="published", review_status=ContentReviewStatus.APPROVED,
            starts_at=timezone.now() - timezone.timedelta(days=1), ends_at=timezone.now() + timezone.timedelta(days=1),
        )
        self.other_attempt = AssessmentAttempt.objects.create(organization=self.organization, assessment=self.assessment, student=self.other_student, status="submitted", score=1, total_marks=1)
        self.own_attempt = AssessmentAttempt.objects.create(organization=self.organization, assessment=self.assessment, student=self.student, status="submitted", score=1, total_marks=1)

        self.file_assessment = Assessment.objects.create(
            organization=self.organization, title="Physics Lab Report", assessment_type="assignment", course=self.course, course_section=self.section, subject=self.subject,
            status="published", review_status=ContentReviewStatus.APPROVED,
            starts_at=timezone.now() - timezone.timedelta(days=1), ends_at=timezone.now() + timezone.timedelta(days=1),
        )
        self.other_submission = AssignmentSubmission.objects.create(organization=self.organization, assessment=self.file_assessment, student=self.other_student, status="submitted", total_marks=100)

    def login(self, user):
        response = self.client.post("/api/v1/auth/login/", {"email": user.email, "password": "2633123"}, format="json")
        self.assertEqual(response.status_code, 200, response.data)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

    def test_student_cannot_list_or_read_answer_key_via_admin_options_endpoint(self):
        self.login(self.student_user)
        # AssessmentAdminViewSet.check_permissions now hard-denies any non-staff/non-teacher
        # caller before the queryset is even built, so this is a flat 403 (not a 200 with an
        # empty list, and not a 404) - stricter than "no data" and correct.
        listed = self.client.get("/api/v1/assessments/options/")
        self.assertEqual(listed.status_code, 403, listed.data)
        retrieved = self.client.get(f"/api/v1/assessments/options/{self.correct_option.id}/")
        self.assertEqual(retrieved.status_code, 403, retrieved.data)

    def test_student_cannot_list_questions_via_admin_endpoint(self):
        self.login(self.student_user)
        listed = self.client.get("/api/v1/assessments/questions/")
        self.assertEqual(listed.status_code, 403, listed.data)

    def test_student_cannot_read_another_students_attempt_via_admin_endpoint(self):
        self.login(self.student_user)
        listed = self.client.get("/api/v1/assessments/attempts/")
        self.assertEqual(listed.status_code, 403, listed.data)
        retrieved = self.client.get(f"/api/v1/assessments/attempts/{self.other_attempt.id}/")
        self.assertEqual(retrieved.status_code, 403, retrieved.data)

    def test_student_cannot_read_another_students_submission_via_admin_endpoint(self):
        self.login(self.student_user)
        retrieved = self.client.get(f"/api/v1/assessments/submissions/{self.other_submission.id}/")
        self.assertEqual(retrieved.status_code, 403, retrieved.data)

    def test_student_history_only_returns_own_attempts_not_email_matched_across_org(self):
        self.login(self.student_user)
        history = self.client.get("/api/v1/assessments/student/assessments/history/")
        self.assertEqual(history.status_code, 200, history.data)
        attempt_ids = [row["id"] for row in history.data["attempts"]]
        self.assertIn(self.own_attempt.id, attempt_ids)
        self.assertNotIn(self.other_attempt.id, attempt_ids)

    def test_student_dashboard_results_only_returns_own_attempts(self):
        self.login(self.student_user)
        dashboard = self.client.get("/api/v1/assessments/student/assessments/dashboard/")
        self.assertEqual(dashboard.status_code, 200, dashboard.data)
        result_ids = [row["id"] for row in dashboard.data["results"]]
        self.assertIn(self.own_attempt.id, result_ids)
        self.assertNotIn(self.other_attempt.id, result_ids)

    def test_student_own_student_facing_endpoints_still_work(self):
        """Positive control: the fix must not break the intended student flow."""
        self.login(self.student_user)
        materials = self.client.get("/api/v1/assessments/student/assessments/materials/")
        self.assertEqual(materials.status_code, 200, materials.data)
        listed = self.client.get("/api/v1/assessments/student/assessments/")
        self.assertEqual(listed.status_code, 200, listed.data)
        self.assertIn(self.assessment.id, [row["id"] for row in listed.data["results"]])
