from decimal import Decimal
from django.db import models
from apps.core.models import OrganizationScopedModel


class PayrollStructure(OrganizationScopedModel):
    title = models.CharField(max_length=180)
    designation = models.ForeignKey("people.Designation", null=True, blank=True, on_delete=models.SET_NULL)
    basic = models.DecimalField(max_digits=12, decimal_places=2)
    medical_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    house_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    conveyance_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    tax_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    notes = models.TextField(blank=True)

    def calculate(self):
        basic = self.basic or Decimal("0")
        medical = basic * self.medical_percentage / Decimal("100")
        house = basic * self.house_percentage / Decimal("100")
        conveyance = basic * self.conveyance_percentage / Decimal("100")
        tax = basic * self.tax_percentage / Decimal("100")
        gross = basic + medical + house + conveyance
        net = gross - tax
        return {
            "medical_amount": medical,
            "house_amount": house,
            "conveyance_amount": conveyance,
            "tax_amount": tax,
            "gross": gross,
            "net": net,
        }


class EmployeePayroll(OrganizationScopedModel):
    employee = models.ForeignKey("people.Employee", on_delete=models.CASCADE, related_name="payroll_assignments")
    structure = models.ForeignKey(PayrollStructure, on_delete=models.PROTECT)
    active_from = models.DateField()
    active_to = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)


class SalaryRecord(OrganizationScopedModel):
    employee = models.ForeignKey("people.Employee", on_delete=models.PROTECT, related_name="salary_records")
    payroll_structure = models.ForeignKey(PayrollStructure, on_delete=models.PROTECT)
    period_month = models.PositiveSmallIntegerField()
    period_year = models.PositiveIntegerField()
    basic = models.DecimalField(max_digits=12, decimal_places=2)
    medical_amount = models.DecimalField(max_digits=12, decimal_places=2)
    house_amount = models.DecimalField(max_digits=12, decimal_places=2)
    conveyance_amount = models.DecimalField(max_digits=12, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2)
    gross = models.DecimalField(max_digits=12, decimal_places=2)
    net = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, default="pending")
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("organization", "employee", "period_month", "period_year")


class LeaveType(OrganizationScopedModel):
    name = models.CharField(max_length=120)
    max_days = models.PositiveIntegerField(default=0)


class LeaveApplication(OrganizationScopedModel):
    employee = models.ForeignKey("people.Employee", on_delete=models.CASCADE, related_name="leave_applications")
    leave_type = models.ForeignKey(LeaveType, null=True, blank=True, on_delete=models.SET_NULL)
    from_date = models.DateField()
    to_date = models.DateField()
    total_days = models.PositiveIntegerField(default=0)
    reason = models.TextField(blank=True)
    status = models.CharField(max_length=20, default="pending")
    approved_by = models.ForeignKey("accounts.User", null=True, blank=True, on_delete=models.SET_NULL, related_name="approved_leaves")
    remarks = models.TextField(blank=True)

