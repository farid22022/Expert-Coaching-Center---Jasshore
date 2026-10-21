import uuid
from django.conf import settings
from django.db import models


class UserSession(models.Model):
    """Opaque server-side session identity. Never stores access/refresh tokens or raw IPs."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="device_sessions")
    browser = models.CharField(max_length=80, default="Unknown browser")
    os = models.CharField(max_length=80, default="Unknown OS")
    device_type = models.CharField(max_length=12, default="desktop")
    masked_ip = models.CharField(max_length=80, blank=True)
    legacy_access_jti = models.CharField(max_length=255, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_active_at = models.DateTimeField(auto_now_add=True, db_index=True)
    expires_at = models.DateTimeField()
    revoked_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ("-last_active_at",)


class SessionPolicy(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, primary_key=True, on_delete=models.CASCADE)
    legacy_revoked_before = models.DateTimeField(null=True, blank=True)
