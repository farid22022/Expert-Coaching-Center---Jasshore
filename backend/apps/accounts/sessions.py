import ipaddress
import re
from datetime import datetime, timedelta, timezone as dt_timezone

from django.utils import timezone
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken

from .session_models import SessionPolicy, UserSession


def mask_ip(value):
    try:
        address = ipaddress.ip_address(value)
        if address.version == 4:
            return ".".join(str(address).split(".")[:3]) + ".xxx"
        return str(ipaddress.ip_network(f"{address}/48", strict=False))
    except (ValueError, TypeError):
        return "Unavailable"


def device_details(request):
    agent = request.META.get("HTTP_USER_AGENT", "")[:1000]
    browser = "Unknown browser"
    for name, pattern in [("Edge", r"Edg(?:A|iOS)?/([\d.]+)"), ("Firefox", r"(?:Firefox|FxiOS)/([\d.]+)"), ("Chrome", r"(?:Chrome|CriOS)/([\d.]+)"), ("Safari", r"Version/([\d.]+).*Safari")]:
        found = re.search(pattern, agent)
        if found:
            browser = f"{name} {found.group(1)[:20]}"
            break
    os = next((name for fragment, name in [("Android", "Android"), ("iPhone", "iOS"), ("iPad", "iPadOS"), ("Windows", "Windows"), ("Macintosh", "macOS"), ("Linux", "Linux")] if fragment in agent), "Unknown OS")
    device_type = "tablet" if "iPad" in agent or ("Android" in agent and "Mobile" not in agent) else "mobile" if "Mobile" in agent or "iPhone" in agent else "desktop"
    # Only use the server's address. Untrusted X-Forwarded-For is never accepted here.
    return {"browser": browser, "os": os, "device_type": device_type, "masked_ip": mask_ip(request.META.get("REMOTE_ADDR"))}


def create_session(user, request, legacy_access_jti=""):
    refresh = RefreshToken.for_user(user)
    session = UserSession.objects.create(user=user, expires_at=datetime.fromtimestamp(refresh["exp"], tz=dt_timezone.utc), legacy_access_jti=legacy_access_jti, **device_details(request))
    refresh["sid"] = str(session.id)
    # Retain at most 90 days of device metadata, including revoked/expired sessions.
    UserSession.objects.filter(user=user, last_active_at__lt=timezone.now() - timedelta(days=90)).delete()
    return session, refresh


def validate_session(token, user_id, *, touch=False):
    """Called by both access authentication and refresh. Existing tokens keep working until explicitly revoked."""
    sid = token.get("sid")
    session = None
    if sid:
        try:
            session = UserSession.objects.filter(pk=sid, user_id=user_id).first()
        except (ValueError, TypeError):
            session = None
        if not session or session.revoked_at or session.expires_at <= timezone.now():
            raise AuthenticationFailed("This device session has ended. Sign in again.")
    else:
        session = UserSession.objects.filter(user_id=user_id, legacy_access_jti=token.get("jti", "")).exclude(legacy_access_jti="").first()
        cutoff = SessionPolicy.objects.filter(user_id=user_id).values_list("legacy_revoked_before", flat=True).first()
        if session and session.revoked_at or cutoff and token.get("iat", 0) <= cutoff.timestamp():
            raise AuthenticationFailed("This session has ended. Sign in again.")
    if touch and session:
        UserSession.objects.filter(pk=session.pk, last_active_at__lt=timezone.now() - timedelta(minutes=5)).update(last_active_at=timezone.now())
    return session


def session_payload(session, current_id):
    return {"id": str(session.id), "browser": session.browser, "os": session.os, "device_type": session.device_type, "masked_ip": session.masked_ip, "created_at": session.created_at, "last_active_at": session.last_active_at, "is_current": str(session.id) == str(current_id)}
