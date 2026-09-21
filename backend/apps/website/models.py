from django.db import models
from apps.core.models import OrganizationScopedModel


class ContentCategory(OrganizationScopedModel):
    type = models.CharField(max_length=40, db_index=True)
    name = models.CharField(max_length=160)
    slug = models.SlugField(max_length=180)


class ContentItem(OrganizationScopedModel):
    category = models.ForeignKey(ContentCategory, null=True, blank=True, on_delete=models.SET_NULL)
    type = models.CharField(max_length=40, db_index=True)
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280)
    summary = models.TextField(blank=True)
    body = models.TextField(blank=True)
    image = models.ImageField(upload_to="website/content/", blank=True)
    published = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)


class GalleryItem(OrganizationScopedModel):
    type = models.CharField(max_length=20, default="photo")
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to="website/gallery/", blank=True)
    url = models.URLField(blank=True)
    published = models.BooleanField(default=True)


class WebsiteSetting(OrganizationScopedModel):
    key = models.CharField(max_length=120)
    value = models.JSONField(default=dict, blank=True)

    class Meta:
        unique_together = ("organization", "key")

