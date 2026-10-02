from django.conf import settings
from django.db import models


class IntegrationSetting(models.Model):
    """Admin-managed third-party integration. The API key is stored encrypted only."""

    PROVIDER_IMGBB = "imgbb"
    PROVIDER_CHOICES = [(PROVIDER_IMGBB, "ImgBB (image hosting)")]

    provider = models.CharField(max_length=40, unique=True, choices=PROVIDER_CHOICES)
    enabled = models.BooleanField(default=False)
    encrypted_api_key = models.TextField(blank=True)
    key_last4 = models.CharField(max_length=4, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="+")

    def __str__(self):
        return self.provider

    @property
    def has_key(self):
        return bool(self.encrypted_api_key)


class MediaAsset(models.Model):
    """Record of an image hosted externally (provider-normalised metadata)."""

    provider = models.CharField(max_length=40, db_index=True)
    url = models.URLField(max_length=500)
    display_url = models.URLField(max_length=500, blank=True)
    thumbnail_url = models.URLField(max_length=500, blank=True)
    provider_asset_id = models.CharField(max_length=120, blank=True, db_index=True)
    # Provider deletion link is a secret capability: encrypted, never serialized.
    encrypted_delete_url = models.TextField(blank=True)
    original_name = models.CharField(max_length=255, blank=True)
    mime_type = models.CharField(max_length=80, blank=True)
    size = models.PositiveIntegerField(null=True, blank=True)
    width = models.PositiveIntegerField(null=True, blank=True)
    height = models.PositiveIntegerField(null=True, blank=True)
    context = models.CharField(max_length=60, blank=True)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="+")
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ("-created_at",)
