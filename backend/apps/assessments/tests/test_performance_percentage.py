from django.test import TestCase
from apps.organizations.models import Organization
from apps.people.models import Student
from apps.courses.models import Course
from apps.assessments.models import Assessment, AssessmentAttempt
from apps.assessments.services import AssessmentService


class PerformancePercentageTests(TestCase):
    def setUp(self):
        self.org = Organization.objects.create(name="Audit", code="audit-percent")
        self.student = Student.objects.create(organization=self.org, student_id="AUDIT-PERCENT", full_name="Test learner")
        self.course = Course.objects.create(organization=self.org, title="Audit", slug="audit-percent")

    def attempt(self, score, total, status="submitted"):
        assessment = Assessment.objects.create(organization=self.org, course=self.course, title="Audit test")
        return AssessmentAttempt.objects.create(organization=self.org, student=self.student, assessment=assessment, score=score, total_marks=total, status=status)

    def test_percentage_normalizes_different_totals_and_keeps_raw_contract(self):
        self.attempt(19, 20)
        self.attempt(25, 50)
        with self.assertNumQueries(3):
            result = AssessmentService.student_performance(self.student)
        self.assertAlmostEqual(result["average_percentage"], 72.5)
        self.assertEqual(result["average_score"], 22)
        self.assertEqual(result["total_score"], 44)
        self.assertEqual(result["attempt_count"], 2)

    def test_empty_and_zero_total_and_in_progress_are_safe(self):
        self.assertEqual(AssessmentService.student_performance(self.student)["average_percentage"], 0)
        self.attempt(0, 0)
        self.attempt(19, 20)
        self.attempt(0, 20, "in_progress")
        result = AssessmentService.student_performance(self.student)
        self.assertAlmostEqual(result["average_percentage"], 95)
        self.assertEqual(result["attempt_count"], 2)
