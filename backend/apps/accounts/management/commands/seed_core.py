from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from apps.accounts.models import Permission, Role
from apps.academic.models import AcademicSession, AcademicClass, Shift
from apps.organizations.models import Organization
from apps.people.models import Department, Designation, Employee, Student


PERMISSIONS = [
    "student.view", "student.create", "student.edit", "student.delete",
    "employee.view", "employee.create", "employee.edit", "employee.delete",
    "academic.view", "academic.create", "academic.edit", "academic.delete",
    "application.view", "application.create", "application.edit", "application.delete",
    "application.approve", "application.reject", "application.process",
    "result.view", "result.process", "result.publish",
    "payroll.view", "payroll.create", "payroll.update", "payroll.delete",
    "sms.view", "sms.send", "sms.configure",
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

        student_role, _ = Role.objects.get_or_create(
            organization=org,
            code="student",
            defaults={"name": "Student", "is_system": True},
        )
        teacher_role, _ = Role.objects.get_or_create(
            organization=org,
            code="teacher",
            defaults={"name": "Teacher", "is_system": True},
        )
        parent_role, _ = Role.objects.get_or_create(
            organization=org,
            code="parent",
            defaults={"name": "Parent / Guardian", "is_system": True},
        )

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

        department, _ = Department.objects.get_or_create(
            organization=org,
            name="Academic",
            defaults={"created_by": admin, "updated_by": admin},
        )
        teacher_designation, _ = Designation.objects.get_or_create(
            organization=org,
            name="Teacher",
            defaults={"created_by": admin, "updated_by": admin},
        )

        demo_password = "2633123"

        for index in range(1, 11):
            email = f"test.student{index:02d}@gmail.com"
            user, _ = User.objects.get_or_create(
                email=email,
                defaults={
                    "username": email,
                    "first_name": "Test",
                    "last_name": f"Student {index:02d}",
                    "phone": f"0171000{index:04d}",
                    "organization": org,
                    "is_active": True,
                },
            )
            user.organization = org
            user.set_password(demo_password)
            user.save()
            user.roles.set([student_role])

            Student.objects.get_or_create(
                organization=org,
                student_id=f"STU-{index:03d}",
                defaults={
                    "full_name": f"Test Student {index:02d}",
                    "phone": user.phone,
                    "email": email,
                    "session": session,
                    "created_by": admin,
                    "updated_by": admin,
                },
            )

        for index in range(1, 11):
            email = f"test.teacher{index:02d}@gmail.com"
            user, _ = User.objects.get_or_create(
                email=email,
                defaults={
                    "username": email,
                    "first_name": "Test",
                    "last_name": f"Teacher {index:02d}",
                    "phone": f"0181000{index:04d}",
                    "organization": org,
                    "is_active": True,
                },
            )
            user.organization = org
            user.set_password(demo_password)
            user.save()
            user.roles.set([teacher_role])

            Employee.objects.get_or_create(
                organization=org,
                employee_id=f"TCH-{index:03d}",
                defaults={
                    "full_name": f"Test Teacher {index:02d}",
                    "employee_type": "teacher",
                    "department": department,
                    "designation": teacher_designation,
                    "phone": user.phone,
                    "email": email,
                    "created_by": admin,
                    "updated_by": admin,
                },
            )

        self.stdout.write(self.style.SUCCESS(f"Seed complete for {org.name}. Active session: {session.name}"))
        self.stdout.write(self.style.SUCCESS(f"Demo students: test.student01@gmail.com ... test.student10@gmail.com / password: {demo_password}"))
        self.stdout.write(self.style.SUCCESS(f"Demo teachers: test.teacher01@gmail.com ... test.teacher10@gmail.com / password: {demo_password}"))
