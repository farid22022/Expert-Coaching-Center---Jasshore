from rest_framework.decorators import action
from rest_framework import permissions
from django.utils import timezone
from apps.core.permissions import HasActionPermission
from apps.core.responses import success_response
from apps.core.viewsets import OrganizationScopedModelViewSet
from . import models, serializers
from .services import SmsService


class MessagingViewSet(OrganizationScopedModelViewSet):
    permission_classes = [HasActionPermission]
    permission_module = "sms"


class ContactCategoryViewSet(MessagingViewSet):
    queryset = models.ContactCategory.objects.all()
    serializer_class = serializers.ContactCategorySerializer
    search_fields = ("name",)


class ContactViewSet(MessagingViewSet):
    queryset = models.Contact.objects.select_related("category")
    serializer_class = serializers.ContactSerializer
    search_fields = ("name", "phone", "email")
    filterset_fields = ("category",)


class SmsProviderViewSet(MessagingViewSet):
    queryset = models.SmsProvider.objects.all()
    serializer_class = serializers.SmsProviderSerializer
    search_fields = ("name", "sender_id")
    filterset_fields = ("is_active",)


class SmsTemplateViewSet(MessagingViewSet):
    queryset = models.SmsTemplate.objects.all()
    serializer_class = serializers.SmsTemplateSerializer
    search_fields = ("title", "body")


class SmsCampaignViewSet(MessagingViewSet):
    queryset = models.SmsCampaign.objects.select_related("template")
    serializer_class = serializers.SmsCampaignSerializer
    search_fields = ("title", "message")
    filterset_fields = ("status",)

    @action(detail=True, methods=["post"])
    def queue(self, request, pk=None):
        count = SmsService.queue_campaign(self.get_object(), request.user)
        return success_response({"queued": count}, "SMS campaign queued.")


class SmsRecipientViewSet(MessagingViewSet):
    queryset = models.SmsRecipient.objects.select_related("campaign")
    serializer_class = serializers.SmsRecipientSerializer
    filterset_fields = ("campaign",)


class SmsLogViewSet(MessagingViewSet):
    queryset = models.SmsLog.objects.select_related("campaign", "provider")
    serializer_class = serializers.SmsLogSerializer
    search_fields = ("recipient_phone", "message")
    filterset_fields = ("campaign", "provider", "status")


class EmailTemplateViewSet(MessagingViewSet):
    queryset = models.EmailTemplate.objects.all()
    serializer_class = serializers.EmailTemplateSerializer


class EmailLogViewSet(MessagingViewSet):
    queryset = models.EmailLog.objects.all()
    serializer_class = serializers.EmailLogSerializer
    filterset_fields = ("status",)


class NotificationViewSet(OrganizationScopedModelViewSet):
    serializer_class = serializers.NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ("title", "body", "notification_type")
    filterset_fields = ("is_read", "notification_type")

    def get_queryset(self):
        return models.Notification.objects.filter(
            organization=self.request.user.organization,
            recipient=self.request.user,
        )

    @action(detail=True, methods=["post"])
    def read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.read_at = timezone.now()
        notification.updated_by = request.user
        notification.save(update_fields=["is_read", "read_at", "updated_by", "updated_at"])
        return success_response(self.get_serializer(notification).data, "Notification marked as read.")

    @action(detail=False, methods=["post"])
    def read_all(self, request):
        count = self.get_queryset().filter(is_read=False).update(is_read=True, read_at=timezone.now(), updated_by=request.user)
        return success_response({"updated": count}, "Notifications marked as read.")

    @action(detail=False, methods=["get"])
    def unread_count(self, request):
        return success_response({"unread": self.get_queryset().filter(is_read=False).count()})
