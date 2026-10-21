from datetime import timedelta
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import permissions, serializers
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

from apps.core.responses import success_response
from .models import UserLoginHistory
from .serializers import UserSerializer
from .session_models import UserSession, SessionPolicy
from .sessions import create_session, session_payload, validate_session, mask_ip


class ManagedRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        try:
            token = RefreshToken(attrs["refresh"])
            validate_session(token, token["user_id"])
        except TokenError as exc:
            raise InvalidToken(str(exc)) from exc
        return super().validate(attrs)


@api_view(["GET", "POST", "DELETE"])
@permission_classes([permissions.IsAuthenticated])
def sessions_view(request):
    current = validate_session(request.auth, request.user.pk)
    if request.method == "POST":
        # Upgrade an already logged-in legacy client without pretending we can enumerate old JWTs.
        if current:
            return success_response({"managed": True})
        try:
            previous = RefreshToken(request.data.get("refresh", ""))
            if str(previous["user_id"]) != str(request.user.pk):
                raise InvalidToken("Refresh token does not belong to this account.")
            validate_session(previous, request.user.pk)
        except TokenError as exc:
            raise InvalidToken("Sign in again to manage this device.") from exc
        session, refresh = create_session(request.user, request, request.auth.get("jti", ""))
        previous.blacklist()
        return success_response({"managed": True, "access": str(refresh.access_token), "refresh": str(refresh)})
    if request.method == "DELETE":
        if request.query_params.get("others") != "true" or not current:
            raise serializers.ValidationError("Manage this device first, then choose sign out other devices.")
        now = timezone.now()
        UserSession.objects.filter(user=request.user, revoked_at__isnull=True).exclude(pk=current.pk).update(revoked_at=now)
        SessionPolicy.objects.update_or_create(user=request.user, defaults={"legacy_revoked_before": now})
        return success_response(message="Other device sessions signed out.")
    since = timezone.now() - timedelta(days=90)
    rows = UserSession.objects.filter(user=request.user, revoked_at__isnull=True, expires_at__gt=timezone.now(), last_active_at__gte=since)
    history = UserLoginHistory.objects.filter(user=request.user, created_at__gte=since)[:20]
    return success_response({"managed": bool(current), "sessions": [session_payload(row, current.pk if current else None) for row in rows], "sign_ins": [{"id": row.pk, "created_at": row.created_at, "masked_ip": mask_ip(row.ip_address)} for row in history]})


@api_view(["DELETE"])
@permission_classes([permissions.IsAuthenticated])
def session_detail_view(request, session_id):
    row = get_object_or_404(UserSession, pk=session_id, user=request.user)
    row.revoked_at = timezone.now()
    row.save(update_fields=["revoked_at"])
    return success_response(message="Device signed out.")


@api_view(["PATCH"])
@permission_classes([permissions.IsAuthenticated])
def personal_info_view(request):
    allowed = {"first_name", "last_name", "phone"}
    if set(request.data) - allowed:
        raise serializers.ValidationError("Only your name and phone can be updated here.")
    serializer = UserSerializer(request.user, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return success_response(serializer.data)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def change_password_view(request):
    if not request.user.check_password(request.data.get("current_password", "")):
        raise serializers.ValidationError({"current_password": "Current password is incorrect."})
    password = request.data.get("new_password", "")
    try:
        validate_password(password, user=request.user)
    except ValidationError as exc:
        raise serializers.ValidationError({"new_password": exc.messages}) from exc
    request.user.set_password(password)
    request.user.save(update_fields=["password"])
    UserSession.objects.filter(user=request.user, revoked_at__isnull=True).update(revoked_at=timezone.now())
    SessionPolicy.objects.update_or_create(user=request.user, defaults={"legacy_revoked_before": timezone.now()})
    return success_response(message="Password changed. Sign in again on your devices.")


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def avatar_view(request):
    class AvatarSerializer(serializers.Serializer):
        avatar = serializers.ImageField(max_length=255)
        def validate_avatar(self, value):
            if value.size > 2 * 1024 * 1024 or value.image.format not in {"JPEG", "PNG", "WEBP"}:
                raise serializers.ValidationError("Choose a JPEG, PNG or WebP image under 2 MB.")
            if value.image.width > 4096 or value.image.height > 4096:
                raise serializers.ValidationError("Maximum image dimensions are 4096 × 4096.")
            return value
    serializer = AvatarSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    request.user.avatar = serializer.validated_data["avatar"]
    request.user.save(update_fields=["avatar"])
    return success_response(UserSerializer(request.user).data)
