from django.test import TestCase

from apps.admissions.services import AdmissionService
from apps.organizations.models import Organization


class AdmissionApplicationNumberTests(TestCase):
    def test_application_number_has_expected_prefix(self):
        organization = Organization.objects.create(
            name="Expert Coaching Center",
            code="expert-test",
        )

        value = AdmissionService.generate_application_no(organization.id)

        self.assertTrue(value.startswith("APP"))
        self.assertTrue(value.endswith("00001"))

