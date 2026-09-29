from django.db import migrations


USER_PERMISSION_CODES = ["user.view", "user.create", "user.edit", "user.delete"]


def add_user_permissions_to_admin_roles(apps, schema_editor):
    """Create the new user.* permissions and grant them to existing institute-admin roles.

    UserViewSet/RoleViewSet/UserLoginHistoryViewSet had no `permission_module` set, so
    HasActionPermission.get_required_permission() returned None and let ANY authenticated
    user (including plain students) list every user account org-wide (emails, staff flags)
    and every Role's exact permission composition. Fixed alongside this migration by setting
    permission_module="user" on those ViewSets; this migration backfills the permission
    records and grants them to already-seeded institute-admin roles, since re-running
    seed_core isn't guaranteed on an existing deployment.
    """
    Permission = apps.get_model("accounts", "Permission")
    Role = apps.get_model("accounts", "Role")

    permission_objs = []
    for code in USER_PERMISSION_CODES:
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
        ("accounts", "0002_fix_student_role_permissions"),
    ]

    operations = [
        migrations.RunPython(add_user_permissions_to_admin_roles, noop_reverse),
    ]
