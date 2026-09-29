from django.contrib import admin

from apps.core.admin_utils import OrganizationScopedAdmin
from .models import Banner, ContentCategory, ContentItem, GalleryItem, RenownedTeacher, SuccessStory, WebsiteSetting


@admin.register(ContentCategory)
class ContentCategoryAdmin(OrganizationScopedAdmin):
    list_display = ("name", "slug", "type", "organization")
    search_fields = ("name", "slug", "type")
    list_filter = ("organization", "type")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(ContentItem)
class ContentItemAdmin(OrganizationScopedAdmin):
    list_display = ("title", "type", "category", "published", "published_at", "organization")
    search_fields = ("title", "slug", "summary", "body", "type", "category__name")
    list_filter = ("organization", "type", "category", "published", "published_at")
    prepopulated_fields = {"slug": ("title",)}
    actions = ("publish_items", "unpublish_items")

    @admin.action(description="Publish selected content")
    def publish_items(self, request, queryset):
        queryset.update(published=True)

    @admin.action(description="Unpublish selected content")
    def unpublish_items(self, request, queryset):
        queryset.update(published=False)


@admin.register(GalleryItem)
class GalleryItemAdmin(OrganizationScopedAdmin):
    list_display = ("title", "type", "published", "organization", "created_at")
    search_fields = ("title", "type", "url")
    list_filter = ("organization", "type", "published", "created_at")
    actions = ("publish_items", "unpublish_items")

    @admin.action(description="Publish selected gallery items")
    def publish_items(self, request, queryset):
        queryset.update(published=True)

    @admin.action(description="Unpublish selected gallery items")
    def unpublish_items(self, request, queryset):
        queryset.update(published=False)


@admin.register(WebsiteSetting)
class WebsiteSettingAdmin(OrganizationScopedAdmin):
    list_display = ("key", "organization", "updated_at")
    search_fields = ("key",)
    list_filter = ("organization", "updated_at")


@admin.register(Banner)
class BannerAdmin(OrganizationScopedAdmin):
    list_display = ("title", "display_order", "is_active", "organization")
    search_fields = ("title", "subtitle")
    list_filter = ("organization", "is_active")
    actions = ("activate_items", "deactivate_items")

    @admin.action(description="Activate selected banners")
    def activate_items(self, request, queryset):
        queryset.update(is_active=True)

    @admin.action(description="Deactivate selected banners")
    def deactivate_items(self, request, queryset):
        queryset.update(is_active=False)


@admin.register(SuccessStory)
class SuccessStoryAdmin(OrganizationScopedAdmin):
    list_display = ("name", "outcome", "display_order", "is_active", "organization")
    search_fields = ("name", "outcome", "quote")
    list_filter = ("organization", "is_active")
    actions = ("activate_items", "deactivate_items")

    @admin.action(description="Activate selected stories")
    def activate_items(self, request, queryset):
        queryset.update(is_active=True)

    @admin.action(description="Deactivate selected stories")
    def deactivate_items(self, request, queryset):
        queryset.update(is_active=False)


@admin.register(RenownedTeacher)
class RenownedTeacherAdmin(OrganizationScopedAdmin):
    list_display = ("name", "designation", "subject", "display_order", "is_active", "organization")
    search_fields = ("name", "designation", "subject")
    list_filter = ("organization", "is_active")
    actions = ("activate_items", "deactivate_items")

    @admin.action(description="Activate selected teachers")
    def activate_items(self, request, queryset):
        queryset.update(is_active=True)

    @admin.action(description="Deactivate selected teachers")
    def deactivate_items(self, request, queryset):
        queryset.update(is_active=False)
