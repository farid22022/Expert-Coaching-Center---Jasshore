import re

from django.conf import settings
from django.db import transaction
from rest_framework import status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.audit.models import AuditLog

from .crypto import EncryptionNotConfigured, encrypt_secret
from .image_hosting import imgbb
from .image_hosting.storage import _record_asset
from .image_hosting.validation import CONTEXT_RULES, ImageValidationError, prepare_image, rule_for
from .models import IntegrationSetting

KEY_RE = re.compile(r"^[A-Za-z0-9_-]{16,128}$")


class IsSuperuser(BasePermission):
    """Integration secrets are restricted to the highly privileged administrator (superuser)."""

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.is_active and user.is_superuser)


def _audit(request, action, row, **extra):
    # Never log the key itself.
    AuditLog.objects.create(
        organization=getattr(request.user, "organization", None), user=request.user, action=action,
        entity="IntegrationSetting", record_id=str(row.pk), ip_address=request.META.get("REMOTE_ADDR") or None,
        new_values={"provider": row.provider, "enabled": row.enabled, **extra},
    )


def _encryption_ready():
    try:
        encrypt_secret("probe")
        return True
    except EncryptionNotConfigured:
        return False


def _env_key():
    return (getattr(settings, "IMGBB_API_KEY", "") or "").strip()


def _status_payload(row):
    configured = bool(row and row.has_key)
    if configured:
        masked = f"••••••••••••{row.key_last4}" if row.key_last4 else "Configured ✓"
    else:
        masked = ""
    return {
        "provider": "imgbb",
        "configured": configured,
        "enabled": bool(row.enabled) if row else False,
        "masked_key": masked,
        "env_fallback_available": bool(_env_key()),
        "uploads_available": imgbb.is_available(),
        "encryption_ready": _encryption_ready(),
        "updated_at": row.updated_at if row else None,
    }


class ImgBBSettingsView(APIView):
    """GET status, PUT/PATCH save or replace the key / toggle enabled, DELETE remove the key.
    Superuser only. The key is write-only: it is never returned by any endpoint."""

    permission_classes = [IsSuperuser]
    parser_classes = [JSONParser]

    def get(self, request):
        return Response(_status_payload(imgbb.get_setting_row()))

    @transaction.atomic
    def put(self, request):
        row, _ = IntegrationSetting.objects.select_for_update().get_or_create(provider="imgbb")
        api_key = request.data.get("api_key")
        has_new_key = api_key not in (None, "")
        had_key = row.has_key
        was_enabled = row.enabled
        if has_new_key:
            api_key = str(api_key).strip()
            if not KEY_RE.match(api_key):
                return Response({"detail": "The API key format looks invalid."}, status=status.HTTP_400_BAD_REQUEST)
            try:
                row.encrypted_api_key = encrypt_secret(api_key)
            except EncryptionNotConfigured:
                return Response(
                    {"detail": "The server encryption key (APP_CONFIG_ENCRYPTION_KEY) is not configured, so the API key cannot be stored."},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )
            row.key_last4 = api_key[-4:]
        if "enabled" in request.data:
            row.enabled = bool(request.data.get("enabled"))
        elif has_new_key:
            row.enabled = True
        if row.enabled and not row.has_key and not _env_key():
            transaction.set_rollback(True)
            return Response({"detail": "Add an API key before enabling ImgBB."}, status=status.HTTP_400_BAD_REQUEST)
        row.updated_by = request.user
        row.save()
        if has_new_key:
            _audit(request, "imgbb.api_key_replaced" if had_key else "imgbb.api_key_configured", row)
        if row.enabled != was_enabled:
            _audit(request, "imgbb.enabled" if row.enabled else "imgbb.disabled", row)
        return Response(_status_payload(row))

    patch = put

    @transaction.atomic
    def delete(self, request):
        row = imgbb.get_setting_row()
        if row and row.has_key:
            row.encrypted_api_key = ""
            row.key_last4 = ""
            row.enabled = False
            row.updated_by = request.user
            row.save()
            _audit(request, "imgbb.api_key_removed", row)
        return Response(_status_payload(row))


class ImgBBTestView(APIView):
    """Verify a candidate key (in the body) or the effective one with a self-expiring 1px image."""

    permission_classes = [IsSuperuser]
    parser_classes = [JSONParser]

    def post(self, request):
        candidate = str(request.data.get("api_key") or "").strip() or None
        if candidate and not KEY_RE.match(candidate):
            return Response({"ok": False, "detail": "The API key format looks invalid."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            imgbb.test_credentials(candidate)
        except imgbb.ImageHostingError as exc:
            return Response({"ok": False, "detail": exc.user_message})
        row = imgbb.get_setting_row()
        if row:
            _audit(request, "imgbb.connection_tested", row, ok=True)
        return Response({"ok": True, "detail": "Connection successful."})


def _is_student_only(user):
    return (not user.is_superuser and not user.is_staff and hasattr(user, "student_profile")
            and not hasattr(user, "teacher_profile"))


class ImageUploadView(APIView):
    """POST multipart `image` (+ optional `context`) -> normalised public image metadata."""

    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        context = (request.data.get("context") or "general").strip()
        if context not in CONTEXT_RULES:
            return Response({"detail": "Unknown upload context."}, status=status.HTTP_400_BAD_REQUEST)
        rule = rule_for(context)
        if rule.staff_only and _is_student_only(request.user):
            return Response({"detail": "You do not have permission to upload this kind of image."}, status=status.HTTP_403_FORBIDDEN)
        upload = request.FILES.get("image")
        if upload is None:
            return Response({"detail": "No image was provided."}, status=status.HTTP_400_BAD_REQUEST)
        if upload.size > rule.max_bytes:
            return Response(
                {"detail": f"Image is too large. Maximum size is {rule.max_bytes // (1024 * 1024)} MB."},
                status=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            )
        try:
            imgbb.resolve_api_key()  # fail fast, before processing, when hosting is unavailable
            prepared = prepare_image(upload.read(), context)
            hosted = imgbb.upload_image(prepared.data, f"upload.{prepared.extension}")
        except ImageValidationError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except imgbb.ImageHostingError as exc:
            return Response({"detail": exc.user_message}, status=exc.status_code)
        _record_asset(hosted, upload.name, prepared, user=request.user, context=context)
        return Response(hosted.public_dict(), status=status.HTTP_201_CREATED)
