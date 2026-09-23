from django.db import models
from apps.core.models import OrganizationScopedModel


class ContactCategory(OrganizationScopedModel):
    name = models.CharField(max_length=160)


class Contact(OrganizationScopedModel):
    category = models.ForeignKey(ContactCategory, null=True, blank=True, on_delete=models.SET_NULL, related_name="contacts")
    name = models.CharField(max_length=180)
    phone = models.CharField(max_length=50, db_index=True)
    email = models.EmailField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)


class SmsProvider(OrganizationScopedModel):
    name = models.CharField(max_length=160)
    base_url = models.URLField(blank=True)
    sender_id = models.CharField(max_length=80, blank=True)
    api_key_encrypted = models.TextField(blank=True)
    is_active = models.BooleanField(default=False)
    config = models.JSONField(default=dict, blank=True)


class SmsTemplate(OrganizationScopedModel):
    title = models.CharField(max_length=180)
    body = models.TextField()
    variables = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)


class SmsCampaign(OrganizationScopedModel):
    title = models.CharField(max_length=180)
    template = models.ForeignKey(SmsTemplate, null=True, blank=True, on_delete=models.SET_NULL)
    message = models.TextField()
    status = models.CharField(max_length=20, default="draft")
    scheduled_at = models.DateTimeField(null=True, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)


class SmsRecipient(OrganizationScopedModel):
    campaign = models.ForeignKey(SmsCampaign, on_delete=models.CASCADE, related_name="recipients")
    phone = models.CharField(max_length=50)
    name = models.CharField(max_length=180, blank=True)
    payload = models.JSONField(default=dict, blank=True)


class SmsLog(OrganizationScopedModel):
    campaign = models.ForeignKey(SmsCampaign, null=True, blank=True, on_delete=models.SET_NULL, related_name="logs")
    provider = models.ForeignKey(SmsProvider, null=True, blank=True, on_delete=models.SET_NULL)
    recipient_phone = models.CharField(max_length=50, db_index=True)
    message = models.TextField()
    status = models.CharField(max_length=20, default="queued", db_index=True)
    provider_response = models.JSONField(default=dict, blank=True)
    cost = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)


class EmailTemplate(OrganizationScopedModel):
    title = models.CharField(max_length=180)
    subject = models.CharField(max_length=255)
    body = models.TextField()
    variables = models.JSONField(default=list, blank=True)


class EmailLog(OrganizationScopedModel):
    recipient_email = models.EmailField()
    subject = models.CharField(max_length=255)
    body = models.TextField()
    status = models.CharField(max_length=20, default="queued")
    provider_response = models.JSONField(default=dict, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)


class Notification(OrganizationScopedModel):
    recipient = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=180)
    body = models.TextField(blank=True)
    notification_type = models.CharField(max_length=80, default="general", db_index=True)
    target_url = models.CharField(max_length=255, blank=True)
    is_read = models.BooleanField(default=False, db_index=True)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [models.Index(fields=["organization", "recipient", "is_read"])]
        ordering = ("-created_at",)
