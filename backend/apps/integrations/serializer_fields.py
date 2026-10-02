import re

from rest_framework import serializers

# Hosts we accept as already-uploaded images (returned by our own upload endpoint).
HOSTED_URL_RE = re.compile(r"^https://(i\.ibb\.co|ibb\.co)/[\w./%~+-]+$")


class HostedImageSerializerField(serializers.ImageField):
    """Accepts a multipart image file (as before) OR the public URL of an image that was
    already uploaded through /api/v1/uploads/images/."""

    def to_internal_value(self, data):
        if isinstance(data, str) and not data.strip():
            return ""  # clearing the image
        if isinstance(data, str) and data.strip():
            value = data.strip()
            if HOSTED_URL_RE.match(value) and len(value) <= 100:
                return value
            if value.startswith(("http://", "https://")):
                raise serializers.ValidationError("Only images uploaded through the platform can be linked.")
        return super().to_internal_value(data)
