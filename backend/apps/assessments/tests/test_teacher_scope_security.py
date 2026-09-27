from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils import timezone
from rest_framework.test import APITestCase

from apps.accounts.models import Permission, Role
from apps.assessments.models import (
    Assessment,
    AssessmentQuestion,
    AssessmentAttempt,
    AssignmentSubmission,
    ContentReviewStatus,
    Question,
    QuestionOption,
    SubmissionAttachment,
)
from apps.courses.models import Course, CourseSection, CourseSubject, Enrollment, TeacherAssignment
from apps.organizations.models import Organization
from apps.people.models import Department, Designation, Employee, Student


class CrossSubjectTeacherIsolationTests(APITestCase):
    """
    Regression test for a confirmed object-level authorization gap: AssessmentAdminViewSet
    only scoped teachers to their own TeacherAssignment for models with a direct `course`
    field (Question/CourseMaterial/Assessment) or `created_by_teacher` field, so
    QuestionOption, AssessmentQuestion, AssessmentAttempt, AssignmentSubmission, and
    SubmissionAttachment fell through to organization-only scoping — any teacher in the org
    could read/write any other subject's answer keys, test-question links, student scores,
    and assignment submissions/files. This test proves a Physics-only teacher cannot reach
    Chemistry-subject records for any of those five models, while the Chemistry teacher can.
    """

    def setUp(self):
        self.organization = Organization.objects.create(name="E2E_TEST Scope Isolation Org", code="e2e-test-scope-isolation-org")
        teacher_role = Role.objects.create(organization=self.organization, name="Teacher", code="scope-teacher")
        for code in ("assessment.view", "assessment.create", "assessment.edit", "assessment.delete"):
            permission = Permission.objects.get_or_create(code=code, defaults={"name": code, "module": "assessment"})[0]
            teacher_role.permissions.add(permission)

        User = get_user_model()
        self.physics_user = User.objects.create_user(username="physics_teacher", email="physics.teacher@example.com", password="2633123", organization=self.organization)
        self.physics_user.roles.add(teacher_role)
        self.chem_user = User.objects.create_user(username="chem_teacher", email="chem.teacher@example.com", password="2633123", organization=self.organization)
        self.chem_user.roles.add(teacher_role)

        department = Department.objects.create(organization=self.organization, name="Academic")
        designation = Designation.objects.create(organization=self.organization, name="Teacher")
        self.physics_teacher = Employee.objects.create(organization=self.organization, employee_id="SCP-PHY-001", full_name="Physics Teacher", employee_type="teacher", email=self.physics_user.email, department=department, designation=designation)
        self.chem_teacher = Employee.objects.create(organization=self.organization, employee_id="SCP-CHM-001", full_name="Chemistry Teacher", employee_type="teacher", email=self.chem_user.email, department=department, designation=designation)

        self.course = Course.objects.create(organization=self.organization, title="HSC Science 2027", slug="hsc-science-scope-test", status="running", is_published=True)
        self.section = CourseSection.objects.create(organization=self.organization, course=self.course, name="Science")
        self.physics = CourseSubject.objects.create(organization=self.organization, course_section=self.section, name="Physics", code="PHY-SCP")
        self.chemistry = CourseSubject.objects.create(organization=self.organization, course_section=self.section, name="Chemistry", code="CHM-SCP")

        TeacherAssignment.objects.create(organization=self.organization, teacher=self.physics_teacher, course=self.course, course_section=self.section, subject=self.physics, role="subject_teacher", assignment_status="accepted", is_active=True)
        TeacherAssignment.objects.create(organization=self.organization, teacher=self.chem_teacher, course=self.course, course_section=self.section, subject=self.chemistry, role="subject_teacher", assignment_status="accepted", is_active=True)

        self.student_user = User.objects.create_user(username="scope_student", email="scope.student@example.com", password="2633123", organization=self.organization)
        self.student = Student.objects.create(organization=self.organization, student_id="SCP-STU-001", full_name="Scope Student", email=self.student_user.email)
        Enrollment.objects.create(organization=self.organization, student=self.student, course=self.course, course_section=self.section, enrollment_number="SCP-ENR-001", status="active")

        # Chemistry-owned content, created directly via ORM (as if created by the chem teacher).
        self.chem_question = Question.objects.create(organization=self.organization, course=self.course, course_section=self.section, subject=self.chemistry, created_by_teacher=self.chem_teacher, text="What is the atomic number of Oxygen?", marks=1)
        self.chem_option_correct = QuestionOption.objects.create(organization=self.organization, question=self.chem_question, text="8", is_correct=True, order=0)
        self.chem_option_wrong = QuestionOption.objects.create(organization=self.organization, question=self.chem_question, text="6", is_correct=False, order=1)

        self.chem_assessment = Assessment.objects.create(
            organization=self.organization, title="Chemistry Chapter 1 MCQ", assessment_type="mcq", course=self.course, course_section=self.section, subject=self.chemistry,
            created_by_teacher=self.chem_teacher, status="published", review_status=ContentReviewStatus.APPROVED,
            starts_at=timezone.now() - timezone.timedelta(days=1), ends_at=timezone.now() + timezone.timedelta(days=1),
        )
        self.chem_assessment_question = AssessmentQuestion.objects.create(organization=self.organization, assessment=self.chem_assessment, question=self.chem_question, order=1, marks=1)
        self.chem_attempt = AssessmentAttempt.objects.create(organization=self.organization, assessment=self.chem_assessment, student=self.student, status="submitted", score=1, total_marks=1)

        self.chem_file_assessment = Assessment.objects.create(
            organization=self.organization, title="Chemistry Lab Report", assessment_type="assignment", course=self.course, course_section=self.section, subject=self.chemistry,
            created_by_teacher=self.chem_teacher, status="published", review_status=ContentReviewStatus.APPROVED,
            starts_at=timezone.now() - timezone.timedelta(days=1), ends_at=timezone.now() + timezone.timedelta(days=1),
        )
        self.chem_submission = AssignmentSubmission.objects.create(organization=self.organization, assessment=self.chem_file_assessment, student=self.student, status="submitted", total_marks=100)
        self.chem_attachment = SubmissionAttachment.objects.create(organization=self.organization, submission=self.chem_submission, file=SimpleUploadedFile("lab.pdf", b"%PDF-1.4 demo", content_type="application/pdf"), original_name="lab.pdf", content_type="application/pdf", size=13)

    def login(self, user):
        response = self.client.post("/api/v1/auth/login/", {"email": user.email, "password": "2633123"}, format="json")
        self.assertEqual(response.status_code, 200, response.data)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

    def test_physics_teacher_cannot_list_or_read_chemistry_question_options(self):
        self.login(self.physics_user)
        listed = self.client.get("/api/v1/assessments/options/")
        self.assertEqual(listed.status_code, 200, listed.data)
        self.assertNotIn(self.chem_option_correct.id, [row["id"] for row in listed.data["results"]])

        retrieved = self.client.get(f"/api/v1/assessments/options/{self.chem_option_correct.id}/")
        self.assertEqual(retrieved.status_code, 404)

    def test_physics_teacher_cannot_edit_chemistry_answer_key(self):
        self.login(self.physics_user)
        patched = self.client.patch(f"/api/v1/assessments/options/{self.chem_option_wrong.id}/", {"is_correct": True}, format="json")
        self.assertIn(patched.status_code, (403, 404))
        self.chem_option_wrong.refresh_from_db()
        self.assertFalse(self.chem_option_wrong.is_correct)

    def test_physics_teacher_cannot_access_chemistry_assessment_question_link(self):
        self.login(self.physics_user)
        retrieved = self.client.get(f"/api/v1/assessments/assessment-questions/{self.chem_assessment_question.id}/")
        self.assertEqual(retrieved.status_code, 404)

    def test_physics_teacher_cannot_access_chemistry_student_attempt(self):
        self.login(self.physics_user)
        retrieved = self.client.get(f"/api/v1/assessments/attempts/{self.chem_attempt.id}/")
        self.assertEqual(retrieved.status_code, 404)
        patched = self.client.patch(f"/api/v1/assessments/attempts/{self.chem_attempt.id}/", {"score": "99.00"}, format="json")
        self.assertIn(patched.status_code, (403, 404))
        self.chem_attempt.refresh_from_db()
        self.assertEqual(str(self.chem_attempt.score), "1.00")

    def test_physics_teacher_cannot_grade_or_view_chemistry_submission(self):
        self.login(self.physics_user)
        retrieved = self.client.get(f"/api/v1/assessments/submissions/{self.chem_submission.id}/")
        self.assertEqual(retrieved.status_code, 404)
        graded = self.client.post(f"/api/v1/assessments/submissions/{self.chem_submission.id}/evaluate/", {"marks_obtained": "95.00"}, format="json")
        self.assertEqual(graded.status_code, 404)
        self.chem_submission.refresh_from_db()
        self.assertIsNone(self.chem_submission.marks_obtained)

    def test_physics_teacher_cannot_access_chemistry_submission_attachment(self):
        self.login(self.physics_user)
        retrieved = self.client.get(f"/api/v1/assessments/submission-attachments/{self.chem_attachment.id}/")
        self.assertEqual(retrieved.status_code, 404)

    def test_physics_teacher_cannot_view_chemistry_subject_analytics(self):
        self.login(self.physics_user)
        response = self.client.get(f"/api/v1/assessments/analytics/subject/{self.chemistry.id}/")
        self.assertEqual(response.status_code, 403)

    def test_chemistry_teacher_can_still_access_own_subject_records(self):
        """Positive control: the fix must not over-restrict the assigned teacher."""
        self.login(self.chem_user)
        self.assertEqual(self.client.get(f"/api/v1/assessments/options/{self.chem_option_correct.id}/").status_code, 200)
        self.assertEqual(self.client.get(f"/api/v1/assessments/assessment-questions/{self.chem_assessment_question.id}/").status_code, 200)
        self.assertEqual(self.client.get(f"/api/v1/assessments/attempts/{self.chem_attempt.id}/").status_code, 200)
        self.assertEqual(self.client.get(f"/api/v1/assessments/submissions/{self.chem_submission.id}/").status_code, 200)
        self.assertEqual(self.client.get(f"/api/v1/assessments/submission-attachments/{self.chem_attachment.id}/").status_code, 200)
        graded = self.client.post(f"/api/v1/assessments/submissions/{self.chem_submission.id}/evaluate/", {"marks_obtained": "95.00", "feedback": "Great work."}, format="json")
        self.assertEqual(graded.status_code, 200, graded.data)
        self.assertEqual(graded.data["status"], "evaluated")
        analytics = self.client.get(f"/api/v1/assessments/analytics/subject/{self.chemistry.id}/")
        self.assertEqual(analytics.status_code, 200, analytics.data)
