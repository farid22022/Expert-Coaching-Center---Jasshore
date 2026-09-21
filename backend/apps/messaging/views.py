from rest_framework.decorators import action
from apps.core.permissions import HasActionPermission
from apps.core.responses import success_response
from apps.core.viewsets import OrganizationScopedModelViewSet
from . import models, serializers
from .services import SmsService


class MessagingViewSet(OrganizationScopedModelViewSet):
    permission_classes = [HasActionPermission]


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

