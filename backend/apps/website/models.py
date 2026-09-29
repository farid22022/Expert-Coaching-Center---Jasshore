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


class Banner(OrganizationScopedModel):
    title = models.CharField(max_length=200, blank=True)
    subtitle = models.CharField(max_length=255, blank=True)
    image = models.ImageField(upload_to="website/banners/", blank=True)
    link_url = models.URLField(blank=True)
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("display_order", "id")

    def __str__(self):
        return self.title or f"Banner #{self.pk}"


class SuccessStory(OrganizationScopedModel):
    name = models.CharField(max_length=200)
    outcome = models.CharField(max_length=255, blank=True)
    quote = models.TextField(blank=True)
    photo = models.ImageField(upload_to="website/success-stories/", blank=True)
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("display_order", "id")

    def __str__(self):
        return self.name


class RenownedTeacher(OrganizationScopedModel):
    name = models.CharField(max_length=200)
    designation = models.CharField(max_length=200, blank=True)
    subject = models.CharField(max_length=120, blank=True)
    image = models.ImageField(upload_to="website/teachers/", blank=True)
    bio = models.TextField(blank=True)
    years_experience = models.PositiveIntegerField(default=0)
    badge = models.CharField(max_length=80, blank=True)
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("display_order", "id")

    def __str__(self):
        return self.name

