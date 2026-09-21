from django.db import transaction
from .models import SalaryRecord


class PayrollService:
    @staticmethod
    @transaction.atomic
    def generate_salary(employee_payroll, month, year, user=None):
        structure = employee_payroll.structure
        amounts = structure.calculate()
        record, _created = SalaryRecord.objects.update_or_create(
            organization=employee_payroll.organization,
            employee=employee_payroll.employee,
            period_month=month,
            period_year=year,
            defaults={
                "payroll_structure": structure,
                "basic": structure.basic,
                "medical_amount": amounts["medical_amount"],
                "house_amount": amounts["house_amount"],
                "conveyance_amount": amounts["conveyance_amount"],
                "tax_amount": amounts["tax_amount"],
                "gross": amounts["gross"],
                "net": amounts["net"],
                "updated_by": user,
            },
        )
        return record

