from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from apps.accounts.models import Permission, Role
from apps.academic.models import AcademicSession, AcademicClass, Shift
from apps.organizations.models import Organization


PERMISSIONS = [
    "student.view", "student.create", "student.edit", "student.delete",
    "employee.view", "employee.create", "employee.edit", "employee.delete",
    "academic.view", "academic.create", "academic.edit", "academic.delete",
    "application.view", "application.approve", "application.reject",
    "result.view", "result.process", "result.publish",
    "payroll.view", "payroll.create", "payroll.update", "payroll.delete",
    "sms.send", "sms.configure",
    "report.view",
]


class Command(BaseCommand):
    help = "Seed organization, permissions, admin role, and demo admin user."

    def handle(self, *args, **options):
        org, _ = Organization.objects.get_or_create(
            code="expert-jashore",
            defaults={
                "name": "Expert Coaching Center",
                "email": "expertjashore@gmail.com",
                "phone": "01719486254",
                "address": "Stadium Road, Jashore",
                "established_year": 2017,
            },
        )

        permission_objs = []
        for code in PERMISSIONS:
            module = code.split(".", 1)[0]
            permission, _ = Permission.objects.get_or_create(
                code=code,
                defaults={"name": code.replace(".", " ").title(), "module": module},
            )
            permission_objs.append(permission)

        role, _ = Role.objects.get_or_create(
            organization=org,
            code="institute-admin",
            defaults={"name": "Institute Admin", "is_system": True},
        )
        role.permissions.set(permission_objs)

        User = get_user_model()
        admin, created = User.objects.get_or_create(
            email="expertjashore@gmail.com",
            defaults={
                "username": "expertjashore",
                "organization": org,
                "is_staff": True,
                "is_active": True,
            },
        )
        if created:
            admin.set_password("change-this-password")
            admin.save()
        admin.roles.add(role)

        session, _ = AcademicSession.objects.get_or_create(
            organization=org,
            name="2026",
            defaults={"is_active": True, "created_by": admin, "updated_by": admin},
        )
        AcademicClass.objects.get_or_create(
            organization=org,
            name="SSC",
            defaults={"sorting": 1, "group_required": True, "created_by": admin, "updated_by": admin},
        )
        Shift.objects.get_or_create(
            organization=org,
            name="Morning",
            defaults={"created_by": admin, "updated_by": admin},
        )

        self.stdout.write(self.style.SUCCESS(f"Seed complete for {org.name}. Active session: {session.name}"))

