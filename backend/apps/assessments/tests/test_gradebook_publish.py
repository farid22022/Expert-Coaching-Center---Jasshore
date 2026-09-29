from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase

from apps.assessments import models as assessment_models
from apps.assessments.services import calculate_course_result, publish_course_result
from apps.courses.models import Course, CourseSection, CourseSubject, Enrollment, EnrollmentStatus
from apps.organizations.models import Organization
from apps.people.models import Student


class GradebookPublishRegressionTests(TestCase):
    """Recalculating a subject's results must never silently un-publish an
    already-published student. `calculate` loops over every active enrollment in the
    course, so this previously fired every time a teacher recalculated for ANY reason
    (e.g. syncing one student's freshly-graded assignment)."""

    def setUp(self):
        self.organization = Organization.objects.create(name="E2E_TEST Organization", code="e2e-test-gradebook-org")
        self.User = get_user_model()
        self.user = self.User.objects.create_user(
            username="e2e_test_gradebook_user", email="e2e_test_gradebook_user@example.com",
            password="2633123", organization=self.organization,
        )
        course = Course.objects.create(organization=self.organization, title="E2E_TEST Course", slug="e2e-test-course")
        section = CourseSection.objects.create(organization=self.organization, course=course, name="E2E_TEST Section")
        self.subject = CourseSubject.objects.create(organization=self.organization, course_section=section, name="E2E_TEST Subject", code="E2E")
        student = Student.objects.create(organization=self.organization, student_id="E2E-STU-01", full_name="E2E_TEST Student")
        self.enrollment = Enrollment.objects.create(
            organization=self.organization, student=student, course=course,
            enrollment_number="E2E-ENR-01", status=EnrollmentStatus.ACTIVE,
        )
        assessment_models.AssessmentComponent.objects.create(
            organization=self.organization, course_subject=self.subject, name="Final", code="FINAL",
            component_type="final", total_marks=Decimal("100"), weight_percentage=Decimal("100"),
            source_type="manual", status="active",
        )
        component = assessment_models.AssessmentComponent.objects.get(course_subject=self.subject)
        self.course_result = calculate_course_result(self.enrollment, self.subject, user=self.user)
        assessment_models.StudentComponentResult.objects.filter(course_result=self.course_result, component=component).update(
            raw_obtained=Decimal("80"), raw_total=Decimal("100"), weighted_score=Decimal("80.00"),
            data_status=assessment_models.ComponentDataStatus.COMPLETE, is_manual=True,
        )
        self.course_result = calculate_course_result(self.enrollment, self.subject, user=self.user)

    def test_recalculate_after_publish_keeps_result_published(self):
        published = publish_course_result(self.course_result, self.user)
        self.assertEqual(published.status, assessment_models.CourseResultStatus.PUBLISHED)

        recalculated = calculate_course_result(self.enrollment, self.subject, user=self.user)

        self.assertEqual(recalculated.status, assessment_models.CourseResultStatus.PUBLISHED)
        self.assertEqual(recalculated.total_percentage, Decimal("80.00"))

    def test_calculate_before_publish_still_sets_calculated(self):
        self.assertEqual(self.course_result.status, assessment_models.CourseResultStatus.CALCULATED)
