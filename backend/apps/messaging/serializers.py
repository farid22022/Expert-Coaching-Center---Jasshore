from rest_framework import serializers
from . import models


def serializer_for(model):
    return type(f"{model.__name__}Serializer", (serializers.ModelSerializer,), {"Meta": type("Meta", (), {"model": model, "fields": "__all__"})})


ContactCategorySerializer = serializer_for(models.ContactCategory)
ContactSerializer = serializer_for(models.Contact)
SmsProviderSerializer = serializer_for(models.SmsProvider)
SmsTemplateSerializer = serializer_for(models.SmsTemplate)
SmsCampaignSerializer = serializer_for(models.SmsCampaign)
SmsRecipientSerializer = serializer_for(models.SmsRecipient)
SmsLogSerializer = serializer_for(models.SmsLog)
EmailTemplateSerializer = serializer_for(models.EmailTemplate)
EmailLogSerializer = serializer_for(models.EmailLog)

