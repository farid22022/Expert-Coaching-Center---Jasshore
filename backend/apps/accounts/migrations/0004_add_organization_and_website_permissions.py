from django.db import migrations


NEW_PERMISSION_CODES = [
    "organization.view", "organization.create", "organization.edit", "organization.delete",
    "website.view", "website.create", "website.edit", "website.delete",
]


def add_permissions_to_admin_roles(apps, schema_editor):
    """OrganizationViewSet had no permission_module - any authenticated user, including
    a plain student, could CRUD the Organization record (now fixed with
    permission_module="organization"). The new website.* Banner/SuccessStory/
    RenownedTeacher CRUD also needs seeding. This migration backfills the Permission
    rows and grants them to existing institute-admin roles, since re-running seed_core
    isn't guaranteed on an existing deployment.
    """
    Permission = apps.get_model("accounts", "Permission")
    Role = apps.get_model("accounts", "Role")

    permission_objs = []
    for code in NEW_PERMISSION_CODES:
        module = code.split(".", 1)[0]
        permission, _ = Permission.objects.get_or_create(
            code=code, defaults={"name": code.replace(".", " ").title(), "module": module},
        )
        permission_objs.append(permission)

    for role in Role.objects.filter(code="institute-admin"):
        role.permissions.add(*permission_objs)


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0003_add_user_management_permissions"),
    ]

    operations = [
        migrations.RunPython(add_permissions_to_admin_roles, noop_reverse),
    ]
