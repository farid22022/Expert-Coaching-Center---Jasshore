from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase

from apps.accounts.models import Permission, Role
from apps.assessments.models import Assessment, AssessmentQuestion, Question, QuestionOption
from apps.courses.models import Course, CourseSection, CourseSubject, Enrollment
from apps.organizations.models import Organization
from apps.people.models import Student


class LiveMcqFlowTests(APITestCase):
    def setUp(self):
        self.organization = Organization.objects.create(name="E2E_TEST MCQ Org", code="e2e-test-mcq-org")
        role = Role.objects.create(organization=self.organization, name="Student", code="student")
        for code in ("assessment.view", "course.view"):
            role.permissions.add(Permission.objects.get_or_create(code=code, defaults={"name": code, "module": code.split(".")[0]})[0])

        User = get_user_model()
        self.user = User.objects.create_user(
            username="mcq_student",
            email="mcq.student@example.com",
            password="2633123",
            organization=self.organization,
        )
        self.user.roles.add(role)
        self.student = Student.objects.create(
            organization=self.organization,
            student_id="MCQ-STU-001",
            full_name="MCQ Student",
            email=self.user.email,
        )
        self.course = Course.objects.create(
            organization=self.organization,
            title="SSC 2027",
            slug="ssc-2027-mcq",
            status="running",
            is_published=True,
        )
        self.section = CourseSection.objects.create(organization=self.organization, course=self.course, name="Science")
        self.subject = CourseSubject.objects.create(organization=self.organization, course_section=self.section, name="Physics", code="PHY")
        Enrollment.objects.create(
            organization=self.organization,
            student=self.student,
            course=self.course,
            course_section=self.section,
            enrollment_number="MCQ-ENR-001",
            status="active",
        )
        self.assessment = Assessment.objects.create(
            organization=self.organization,
            title="Physics Live MCQ",
            course=self.course,
            course_section=self.section,
            subject=self.subject,
            status="live",
            starts_at=timezone.now() - timezone.timedelta(minutes=5),
            ends_at=timezone.now() + timezone.timedelta(minutes=30),
            duration_minutes=20,
        )
        question = Question.objects.create(
            organization=self.organization,
            course=self.course,
            course_section=self.section,
            subject=self.subject,
            text="What is SI unit of force?",
        )
        wrong = QuestionOption.objects.create(organization=self.organization, question=question, text="Joule", is_correct=False)
        correct = QuestionOption.objects.create(organization=self.organization, question=question, text="Newton", is_correct=True)
        self.correct_option_id = correct.id
        self.wrong_option_id = wrong.id
        AssessmentQuestion.objects.create(organization=self.organization, assessment=self.assessment, question=question, marks=1)

    def login(self):
        response = self.client.post("/api/v1/auth/login/", {"email": self.user.email, "password": "2633123"}, format="json")
        self.assertEqual(response.status_code, 200, response.data)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

    def test_student_mcq_does_not_leak_correct_answer_and_auto_scores_submission(self):
        self.login()

        start = self.client.post(f"/api/v1/assessments/student/assessments/{self.assessment.id}/start/", {}, format="json")
        self.assertEqual(start.status_code, 200, start.data)
        option_payload = start.data["questions"][0]["options"][0]
        self.assertNotIn("is_correct", option_payload)

        attempt_id = start.data["id"]
        question_id = start.data["questions"][0]["id"]
        answer = self.client.post(
            f"/api/v1/assessments/student/assessments/{self.assessment.id}/answer/",
            {"attempt": attempt_id, "question": question_id, "selected_options": [self.correct_option_id]},
            format="json",
        )
        self.assertEqual(answer.status_code, 200, answer.data)

        submit = self.client.post(
            f"/api/v1/assessments/student/assessments/{self.assessment.id}/submit/",
            {"attempt": attempt_id},
            format="json",
        )
        self.assertEqual(submit.status_code, 200, submit.data)
        self.assertEqual(submit.data["status"], "submitted")
        self.assertEqual(str(submit.data["score"]), "1.00")
