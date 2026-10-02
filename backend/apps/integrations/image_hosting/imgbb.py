"""Server-side ImgBB client. The API key never leaves the backend.

Key priority:
1. Admin-configured (encrypted) key, when the integration row exists and is enabled.
2. IMGBB_API_KEY from the server environment, only when no admin row exists
   (an explicit admin "disable" is a kill-switch and also blocks the env fallback).
3. Otherwise image hosting is unavailable (ImageHostingNotConfigured).
"""
import io
import logging
from dataclasses import dataclass, field
from typing import Optional

import requests
from django.conf import settings

from apps.integrations.crypto import DecryptionFailed, EncryptionNotConfigured, decrypt_secret

logger = logging.getLogger(__name__)

IMGBB_ENDPOINT = "https://api.imgbb.com/1/upload"
PROVIDER = "imgbb"

# 1x1 transparent PNG used for the connection test (uploaded with a 60s expiry).
_TEST_PNG = bytes.fromhex(
    "89504e470d0a1a0a0000000d4948445200000001000000010806000000"
    "1f15c4890000000d49444154789c6360000002000001e221bc330000000049454e44ae426082"
)


class ImageHostingError(Exception):
    """Base error. `user_message` is always safe to show to users."""

    status_code = 502
    user_message = "Image upload failed. Please retry."

    def __init__(self, user_message=None):
        super().__init__(user_message or self.user_message)
        if user_message:
            self.user_message = user_message


class ImageHostingNotConfigured(ImageHostingError):
    status_code = 503
    user_message = "Image hosting is not configured. Please contact an administrator."


class ImageHostingDisabled(ImageHostingError):
    status_code = 503
    user_message = "Image hosting is currently disabled by an administrator."


class ImageHostingInvalidKey(ImageHostingError):
    status_code = 502
    user_message = "Image hosting rejected the configured API key. An administrator must update it."


class ImageHostingRateLimited(ImageHostingError):
    status_code = 429
    user_message = "Image hosting is busy. Please retry in a moment."


class ImageHostingUnavailable(ImageHostingError):
    status_code = 502
    user_message = "Image hosting is temporarily unavailable. Please retry."


class ImageHostingRejected(ImageHostingError):
    status_code = 400
    user_message = "The image was rejected by the image host."


@dataclass
class HostedImage:
    provider: str = PROVIDER
    url: str = ""
    display_url: str = ""
    thumbnail_url: str = ""
    provider_image_id: str = ""
    width: Optional[int] = None
    height: Optional[int] = None
    size: Optional[int] = None
    mime_type: str = ""
    # Server-only: never include in API responses.
    delete_url: str = field(default="", repr=False)

    def public_dict(self):
        data = {
            "provider": self.provider, "url": self.url, "display_url": self.display_url,
            "thumbnail_url": self.thumbnail_url, "provider_image_id": self.provider_image_id,
            "width": self.width, "height": self.height, "size": self.size,
        }
        return {k: v for k, v in data.items() if v not in (None, "")}


def get_setting_row():
    from apps.integrations.models import IntegrationSetting

    return IntegrationSetting.objects.filter(provider=PROVIDER).first()


def resolve_api_key():
    """Return the key to use, or raise a user-safe ImageHostingError."""
    row = get_setting_row()
    if row is not None:
        if not row.enabled:
            raise ImageHostingDisabled()
        if row.has_key:
            try:
                return decrypt_secret(row.encrypted_api_key)
            except (DecryptionFailed, EncryptionNotConfigured):
                logger.error("ImgBB key could not be decrypted; check APP_CONFIG_ENCRYPTION_KEY.")
                raise ImageHostingNotConfigured("Image hosting is misconfigured. Please contact an administrator.") from None
    env_key = (getattr(settings, "IMGBB_API_KEY", "") or "").strip()
    if env_key:
        return env_key
    raise ImageHostingNotConfigured()


def is_available():
    try:
        resolve_api_key()
        return True
    except ImageHostingError:
        return False


def _normalise(payload):
    data = (payload or {}).get("data") or {}
    url = data.get("url") or (data.get("image") or {}).get("url") or ""
    if not url.startswith("https://") and not url.startswith("http://"):
        raise ImageHostingUnavailable("Image host returned an invalid response. Please retry.")
    thumb = (data.get("thumb") or {}).get("url") or ""
    def _int(v):
        try:
            return int(v)
        except (TypeError, ValueError):
            return None
    return HostedImage(
        url=url, display_url=data.get("display_url") or url, thumbnail_url=thumb,
        provider_image_id=str(data.get("id") or ""), width=_int(data.get("width")),
        height=_int(data.get("height")), size=_int(data.get("size")),
        mime_type=(data.get("image") or {}).get("mime") or "", delete_url=data.get("delete_url") or "",
    )


def _post(api_key, data: bytes, filename, expiration=None):
    form = {"key": api_key}
    if expiration:
        form["expiration"] = str(int(expiration))
    try:
        resp = requests.post(
            IMGBB_ENDPOINT, data=form, files={"image": (filename, io.BytesIO(data))},
            timeout=getattr(settings, "IMGBB_TIMEOUT_SECONDS", 20),
        )
    except requests.Timeout:
        raise ImageHostingUnavailable("Image hosting timed out. Please retry.") from None
    except requests.RequestException:
        raise ImageHostingUnavailable() from None
    try:
        payload = resp.json()
    except ValueError:
        payload = None
    if resp.status_code == 429:
        raise ImageHostingRateLimited()
    if resp.status_code >= 500:
        raise ImageHostingUnavailable()
    if resp.status_code != 200 or not isinstance(payload, dict) or not payload.get("success", False):
        message = ((payload or {}).get("error") or {}).get("message", "") if isinstance(payload, dict) else ""
        if "key" in message.lower() or resp.status_code in (401, 403):
            raise ImageHostingInvalidKey()
        logger.warning("ImgBB rejected upload: status=%s", resp.status_code)
        raise ImageHostingRejected()
    return _normalise(payload)


def upload_image(data: bytes, name="image", expiration=None) -> HostedImage:
    """Upload already-validated image bytes to ImgBB and return normalised metadata."""
    return _post(resolve_api_key(), data, name, expiration)


def test_credentials(api_key=None):
    """Verify the key with a tiny self-expiring image (ImgBB has no verify endpoint)."""
    _post(api_key or resolve_api_key(), _TEST_PNG, "connection-test.png", expiration=60)
    return True


def delete_image(*_args, **_kwargs):
    """ImgBB offers no authenticated delete API (only a private delete_url web link),
    so server-side deletion is intentionally unsupported."""
    raise NotImplementedError("ImgBB does not provide an API for deleting images.")
