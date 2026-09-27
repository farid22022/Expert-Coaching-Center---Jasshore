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
NotificationSerializer = serializer_for(models.Notification)


class NoticeSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source="course.title", read_only=True)
    section_name = serializers.CharField(source="course_section.name", read_only=True)
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    teacher_name = serializers.CharField(source="created_by_teacher.full_name", read_only=True)

    class Meta:
        model = models.Notice
        fields = "__all__"
