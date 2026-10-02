from django.db import models
from apps.core.fields import HostedImageField
from apps.core.models import TimeStampedModel


class Organization(TimeStampedModel):
    name = models.CharField(max_length=255)
    name_bn = models.CharField(max_length=255, blank=True)
    code = models.CharField(max_length=50, unique=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    address = models.TextField(blank=True)
    established_year = models.PositiveIntegerField(null=True, blank=True)
    logo = HostedImageField(upload_to="organizations/logos/", blank=True)
    favicon = HostedImageField(upload_to="organizations/favicons/", blank=True)
    theme_primary_color = models.CharField(max_length=7, blank=True)
    theme_accent_color = models.CharField(max_length=7, blank=True)
    theme_font_family = models.CharField(max_length=60, blank=True)
    theme_font_scale = models.CharField(max_length=10, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Branch(TimeStampedModel):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="branches")
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50)
    address = models.TextField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ("organization", "code")

    def __str__(self):
        return f"{self.organization} - {self.name}"

