from decimal import Decimal
from django.test import TestCase

from apps.hr.models import PayrollStructure


class PayrollCalculationTests(TestCase):
    def test_payroll_structure_calculates_percentages(self):
        payroll = PayrollStructure(
            basic=Decimal("10000.00"),
            medical_percentage=Decimal("10.00"),
            house_percentage=Decimal("20.00"),
            conveyance_percentage=Decimal("5.00"),
            tax_percentage=Decimal("2.00"),
        )

        calculated = payroll.calculate()

        self.assertEqual(calculated["medical_amount"], Decimal("1000.00"))
        self.assertEqual(calculated["house_amount"], Decimal("2000.00"))
        self.assertEqual(calculated["conveyance_amount"], Decimal("500.00"))
        self.assertEqual(calculated["tax_amount"], Decimal("200.00"))
        self.assertEqual(calculated["gross"], Decimal("13500.00"))
        self.assertEqual(calculated["net"], Decimal("13300.00"))

