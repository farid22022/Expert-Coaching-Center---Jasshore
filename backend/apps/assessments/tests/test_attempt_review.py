from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase

from apps.accounts.models import Role
from apps.assessments.models import Assessment, AssessmentQuestion, ContentReviewStatus, Question, QuestionOption
from apps.courses.models import Course, CourseSection, CourseSubject, Enrollment
from apps.organizations.models import Organization
from apps.people.models import Student

PASSWORD = "2633123"


class AttemptReviewTests(APITestCase):
    def setUp(self):
        self.org = Organization.objects.create(name="Review Org", code="review-org")
        User = get_user_model()
        role = Role.objects.create(organization=self.org, name="Student", code="review-student")
        self.course = Course.objects.create(organization=self.org, title="Course", slug="review-course", status="running", is_published=True)
        self.section = CourseSection.objects.create(organization=self.org, course=self.course, name="Science")
        self.subject = CourseSubject.objects.create(organization=self.org, course_section=self.section, name="Physics", code="PHY-R")

        def student(key):
            user = User.objects.create_user(username=f"rev_{key}", email=f"{key}@example.com", password=PASSWORD, organization=self.org)
            user.roles.add(role)
            record = Student.objects.create(organization=self.org, student_id=f"REV-{key}", full_name=key, email=user.email)
            Enrollment.objects.create(organization=self.org, student=record, course=self.course, course_section=self.section, enrollment_number=f"E-{key}", status="active")
            return user

        self.alice = student("alice")
        self.bob = student("bob")

    def make_test(self, **overrides):
        values = dict(
            organization=self.org, title="Mechanics MCQ", assessment_type="mcq", course=self.course, course_section=self.section,
            subject=self.subject, status="published", review_status=ContentReviewStatus.APPROVED,
            timing_mode="practice", duration_minutes=20,
        )
        values.update(overrides)
        assessment = Assessment.objects.create(**values)
        self.questions = []
        for order, (text, right, wrong, why) in enumerate([("SI unit of force?", "Newton", "Joule", "F = ma, measured in newtons."), ("SI unit of energy?", "Joule", "Watt", "Work done is energy.")], start=1):
            question = Question.objects.create(organization=self.org, course=self.course, course_section=self.section, subject=self.subject, text=text, explanation=why)
            good = QuestionOption.objects.create(organization=self.org, question=question, text=right, is_correct=True, order=1)
            bad = QuestionOption.objects.create(organization=self.org, question=question, text=wrong, is_correct=False, order=2)
            AssessmentQuestion.objects.create(organization=self.org, assessment=assessment, question=question, order=order, marks=1)
            self.questions.append((question, good, bad))
        return assessment

    def login(self, user):
        response = self.client.post("/api/v1/auth/login/", {"email": user.email, "password": PASSWORD}, format="json")
        self.assertEqual(response.status_code, 200, response.data)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

    def take(self, assessment, user, picks):
        """picks: list of option ids per question (None = leave unanswered)."""
        self.login(user)
        base = f"/api/v1/assessments/student/assessments/{assessment.id}"
        attempt = self.client.post(f"{base}/start/")
        self.assertEqual(attempt.status_code, 200, attempt.data)
        for (question, _good, _bad), option in zip(self.questions, picks):
            if option is not None:
                response = self.client.post(f"{base}/answer/", {"attempt": attempt.data["id"], "question": question.id, "selected_options": [option]}, format="json")
                self.assertEqual(response.status_code, 200, response.data)
        response = self.client.post(f"{base}/submit/", {"attempt": attempt.data["id"]}, format="json")
        self.assertEqual(response.status_code, 200, response.data)

    def review(self, assessment):
        return self.client.get(f"/api/v1/assessments/student/assessments/{assessment.id}/review/")

    def test_review_shows_own_answer_correct_answer_and_explanation(self):
        assessment = self.make_test()
        (_q1, good1, _bad1), (_q2, _good2, bad2) = self.questions
        self.take(assessment, self.alice, [good1.id, bad2.id])  # first right, second wrong
        response = self.review(assessment)
        self.assertEqual(response.status_code, 200, response.data)
        data = response.json()
        self.assertTrue(data["answers_released"])
        self.assertEqual(data["summary"], {"total": 2, "correct": 1, "incorrect": 1, "answered": 2, "unanswered": 0})
        first, second = data["questions"]
        self.assertEqual(first["result"], "correct")
        self.assertEqual(first["explanation"], "F = ma, measured in newtons.")
        self.assertEqual([o["text"] for o in first["options"] if o["selected"]], ["Newton"])
        self.assertEqual(second["result"], "incorrect")
        self.assertEqual([o["text"] for o in second["options"] if o["selected"]], ["Watt"])
        self.assertEqual([o["text"] for o in second["options"] if o["is_correct"]], ["Joule"])
        self.assertEqual(second["explanation"], "Work done is energy.")

    def test_unanswered_question_is_reported(self):
        assessment = self.make_test()
        self.take(assessment, self.alice, [self.questions[0][1].id, None])
        data = self.review(assessment).json()
        self.assertEqual(data["summary"]["unanswered"], 1)
        self.assertEqual(data["questions"][1]["result"], "unanswered")

    def test_review_query_count_is_bounded(self):
        from django.db import connection
        from django.test.utils import CaptureQueriesContext

        assessment = self.make_test()
        self.take(assessment, self.alice, [self.questions[0][1].id, self.questions[1][2].id])
        with CaptureQueriesContext(connection) as captured:
            self.assertEqual(self.review(assessment).status_code, 200)
        # Auth + student + assessment + attempt + links + options + answers + selections: independent of question count.
        self.assertLessEqual(len(captured), 12, [q["sql"][:90] for q in captured.captured_queries])

    def test_answers_hidden_while_live_window_is_open(self):
        now = timezone.now()
        assessment = self.make_test(timing_mode="live", starts_at=now - timedelta(minutes=5), ends_at=now + timedelta(hours=1))
        self.take(assessment, self.alice, [self.questions[0][1].id, self.questions[1][2].id])
        data = self.review(assessment).json()
        self.assertFalse(data["answers_released"])
        self.assertFalse(data["explanations_released"])
        self.assertIsNotNone(data["release_at"])
        self.assertEqual(data["summary"]["correct"] + data["summary"]["incorrect"], 0, "correctness must not leak")
        for question in data["questions"]:
            self.assertIsNone(question["explanation"])
            self.assertEqual(question["result"], "answered")
            self.assertTrue(all(option["is_correct"] is None for option in question["options"]))
        self.assertEqual([o["text"] for o in data["questions"][0]["options"] if o["selected"]], ["Newton"])

    def test_teacher_flags_release_answers_and_explanations_independently_while_live(self):
        now = timezone.now()
        assessment = self.make_test(timing_mode="live", starts_at=now - timedelta(minutes=5), ends_at=now + timedelta(hours=1),
                                    show_correct_answers=True, show_explanations=False)
        self.take(assessment, self.alice, [self.questions[0][1].id, self.questions[1][2].id])
        data = self.review(assessment).json()
        self.assertTrue(data["answers_released"])
        self.assertFalse(data["explanations_released"])
        self.assertEqual([q["result"] for q in data["questions"]], ["correct", "incorrect"])
        self.assertTrue(all(q["explanation"] is None for q in data["questions"]))

        assessment.show_explanations = True
        assessment.save(update_fields=["show_explanations"])
        data = self.review(assessment).json()
        self.assertTrue(data["explanations_released"])
        self.assertEqual(data["questions"][0]["explanation"], "F = ma, measured in newtons.")

    def test_closed_window_shows_everything_even_without_teacher_flags(self):
        now = timezone.now()
        assessment = self.make_test(timing_mode="live", starts_at=now - timedelta(hours=2), ends_at=now + timedelta(seconds=30), duration_minutes=1)
        self.take(assessment, self.alice, [self.questions[0][1].id, self.questions[1][2].id])
        Assessment.objects.filter(pk=assessment.pk).update(ends_at=now - timedelta(minutes=1))
        data = self.review(assessment).json()
        self.assertTrue(data["answers_released"] and data["explanations_released"])
        self.assertEqual(data["summary"]["correct"], 1)
        self.assertEqual(data["questions"][1]["explanation"], "Work done is energy.")

    def test_cannot_review_before_submitting(self):
        assessment = self.make_test()
        self.login(self.alice)
        self.client.post(f"/api/v1/assessments/student/assessments/{assessment.id}/start/")
        self.assertEqual(self.review(assessment).status_code, 409)

    def test_student_without_attempt_gets_nothing_and_never_sees_another_students_answers(self):
        assessment = self.make_test()
        self.take(assessment, self.alice, [self.questions[0][1].id, self.questions[1][1].id])
        self.login(self.bob)  # enrolled, never attempted
        self.assertEqual(self.review(assessment).status_code, 409)

    def test_requires_authentication(self):
        assessment = self.make_test()
        self.client.credentials()
        self.assertEqual(self.review(assessment).status_code, 401)


class TargetedAssessmentVisibilityTests(APITestCase):
    """A test targeted at one student must not appear in another student's course content."""

    # Share the fixtures/helpers without inheriting (and re-running) the review tests.
    setUp = AttemptReviewTests.setUp
    make_test = AttemptReviewTests.make_test
    login = AttemptReviewTests.login

    def content_assessment_ids(self, user):
        self.login(user)
        enrollment = Enrollment.objects.get(student__email=user.email)
        response = self.client.get(f"/api/v1/courses/student/dashboard/{enrollment.id}/content/")
        self.assertEqual(response.status_code, 200, response.content[:200])
        return {row["id"] for row in response.json()["assessments"]}

    def test_targeted_test_hidden_from_other_students_but_visible_to_target(self):
        from apps.people.models import Student

        assessment = self.make_test(timing_mode="practice")
        assessment.allowed_students.add(Student.objects.get(email=self.alice.email))
        self.assertIn(assessment.id, self.content_assessment_ids(self.alice))
        self.assertNotIn(assessment.id, self.content_assessment_ids(self.bob))

    def test_untargeted_test_visible_to_every_enrolled_student(self):
        assessment = self.make_test(timing_mode="practice")
        self.assertIn(assessment.id, self.content_assessment_ids(self.alice))
        self.assertIn(assessment.id, self.content_assessment_ids(self.bob))
