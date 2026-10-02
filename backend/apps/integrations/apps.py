from django.apps import AppConfig


class IntegrationsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.integrations"

    def ready(self):
        # Let ModelSerializers accept an already-hosted image URL for HostedImageField.
        from rest_framework.serializers import ModelSerializer

        from apps.core.fields import HostedImageField
        from .serializer_fields import HostedImageSerializerField

        ModelSerializer.serializer_field_mapping[HostedImageField] = HostedImageSerializerField
