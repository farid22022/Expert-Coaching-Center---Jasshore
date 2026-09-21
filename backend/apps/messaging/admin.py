from django.contrib import admin

from apps.core.admin_utils import OrganizationScopedAdmin, SensitiveFieldsMixin, mark_status
from .models import (
    Contact,
    ContactCategory,
    EmailLog,
    EmailTemplate,
    SmsCampaign,
    SmsLog,
    SmsProvider,
    SmsRecipient,
    SmsTemplate,
)


class SmsRecipientInline(admin.TabularInline):
    model = SmsRecipient
    extra = 0
    raw_id_fields = ("organization", "created_by", "updated_by")
    fields = ("organization", "phone", "name", "payload")


@admin.register(ContactCategory)
class ContactCategoryAdmin(OrganizationScopedAdmin):
    list_display = ("name", "organization", "created_at")
    search_fields = ("name", "organization__name")
    list_filter = ("organization", "created_at")


@admin.register(Contact)
class ContactAdmin(OrganizationScopedAdmin):
    list_display = ("name", "phone", "email", "category", "organization")
    search_fields = ("name", "phone", "email", "category__name")
    list_filter = ("organization", "category", "created_at")


@admin.register(SmsProvider)
class SmsProviderAdmin(SensitiveFieldsMixin, OrganizationScopedAdmin):
    list_display = ("name", "base_url", "sender_id", "is_active", "organization")
    search_fields = ("name", "base_url", "sender_id")
    list_filter = ("organization", "is_active", "created_at")
    actions = ("activate_provider", "deactivate_provider")

    @admin.action(description="Activate selected SMS providers")
    def activate_provider(self, request, queryset):
        queryset.update(is_active=True)

    @admin.action(description="Deactivate selected SMS providers")
    def deactivate_provider(self, request, queryset):
        queryset.update(is_active=False)


@admin.register(SmsTemplate)
class SmsTemplateAdmin(OrganizationScopedAdmin):
    list_display = ("title", "is_active", "organization", "created_at")
    search_fields = ("title", "body")
    list_filter = ("organization", "is_active", "created_at")


@admin.register(SmsCampaign)
class SmsCampaignAdmin(OrganizationScopedAdmin):
    list_display = ("title", "template", "status", "scheduled_at", "sent_at", "organization")
    search_fields = ("title", "message", "template__title", "status")
    list_filter = ("organization", "template", "status", "scheduled_at", "sent_at")
    inlines = (SmsRecipientInline,)
    actions = (mark_status("draft", "Draft"), mark_status("queued", "Queued"))


@admin.register(SmsRecipient)
class SmsRecipientAdmin(OrganizationScopedAdmin):
    list_display = ("campaign", "phone", "name", "organization")
    search_fields = ("campaign__title", "phone", "name")
    list_filter = ("organization", "campaign")


@admin.register(SmsLog)
class SmsLogAdmin(OrganizationScopedAdmin):
    list_display = ("recipient_phone", "campaign", "provider", "status", "cost", "sent_at")
    search_fields = ("recipient_phone", "message", "campaign__title", "provider__name", "status")
    list_filter = ("organization", "provider", "status", "sent_at")
    readonly_fields = ("provider_response", "sent_at", "created_at", "updated_at")


@admin.register(EmailTemplate)
class EmailTemplateAdmin(OrganizationScopedAdmin):
    list_display = ("title", "subject", "organization", "created_at")
    search_fields = ("title", "subject", "body")
    list_filter = ("organization", "created_at")


@admin.register(EmailLog)
class EmailLogAdmin(OrganizationScopedAdmin):
    list_display = ("recipient_email", "subject", "status", "sent_at", "organization")
    search_fields = ("recipient_email", "subject", "body", "status")
    list_filter = ("organization", "status", "sent_at")
    readonly_fields = ("provider_response", "sent_at", "created_at", "updated_at")
