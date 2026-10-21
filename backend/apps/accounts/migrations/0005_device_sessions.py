import uuid
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [("accounts", "0004_add_organization_and_website_permissions")]
    operations = [
        migrations.CreateModel(name="UserSession", fields=[
            ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
            ("browser", models.CharField(default="Unknown browser", max_length=80)),
            ("os", models.CharField(default="Unknown OS", max_length=80)),
            ("device_type", models.CharField(default="desktop", max_length=12)),
            ("masked_ip", models.CharField(blank=True, max_length=80)),
            ("legacy_access_jti", models.CharField(blank=True, db_index=True, max_length=255)),
            ("created_at", models.DateTimeField(auto_now_add=True)),
            ("last_active_at", models.DateTimeField(auto_now_add=True, db_index=True)),
            ("expires_at", models.DateTimeField()),
            ("revoked_at", models.DateTimeField(blank=True, null=True)),
            ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="device_sessions", to=settings.AUTH_USER_MODEL)),
        ], options={"ordering": ("-last_active_at",)}),
        migrations.CreateModel(name="SessionPolicy", fields=[
            ("user", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, primary_key=True, serialize=False, to=settings.AUTH_USER_MODEL)),
            ("legacy_revoked_before", models.DateTimeField(blank=True, null=True)),
        ]),
    ]
