from decimal import Decimal
from django.test import TestCase

from apps.exams.models import GradeScale
from apps.exams.services import ResultService
from apps.organizations.models import Organization


class ResultServiceTests(TestCase):
    def test_grade_lookup_uses_percentage_range(self):
        organization = Organization.objects.create(
            name="Expert Coaching Center",
            code="expert-result-test",
        )
        GradeScale.objects.create(
            organization=organization,
            name="A+",
            min_mark=Decimal("80"),
            max_mark=Decimal("100"),
            grade="A+",
            gpa=Decimal("5.00"),
        )

        grade = ResultService.grade_for(organization, Decimal("88"))

        self.assertEqual(grade.grade, "A+")

