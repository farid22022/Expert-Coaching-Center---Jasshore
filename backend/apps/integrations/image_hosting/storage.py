"""Storage for ImageFields: new images go to ImgBB (when available); legacy local images keep working.

The stored value is the public image URL (it fits in the ImageField's varchar), so existing
serializers that read `field.url` keep working unchanged, for both old `media/...` paths and URLs.
"""
import re

from django.core.files.storage import FileSystemStorage
from rest_framework.exceptions import APIException

from . import imgbb
from .validation import ImageValidationError, prepare_image

URL_RE = re.compile(r"^https?://", re.I)


def is_remote(name):
    return bool(name) and bool(URL_RE.match(str(name)))


class ImageUploadFailed(APIException):
    status_code = 502
    default_detail = "Image upload failed. Please retry."
    default_code = "image_upload_failed"


def looks_like_image(content):
    """Cheap magic-number sniff (reads 12 bytes) so videos/PDFs are never sent to ImgBB."""
    if not hasattr(content, "read"):
        return False
    if hasattr(content, "seek"):
        content.seek(0)
    head = content.read(12) or b""
    if hasattr(content, "seek"):
        content.seek(0)
    return head[:3] == b"\xff\xd8\xff" or head[:8] == b"\x89PNG\r\n\x1a\n" or head[:6] in (b"GIF87a", b"GIF89a") or (head[:4] == b"RIFF" and head[8:12] == b"WEBP")


class HostedImageStorage(FileSystemStorage):
    """`sniff=True` is for mixed FileFields (e.g. gallery photos *and* videos): only content that
    really is an image goes to ImgBB; everything else stays in local file storage."""

    def __init__(self, *args, sniff=False, **kwargs):
        self.sniff = sniff
        super().__init__(*args, **kwargs)

    def save(self, name, content, max_length=None):
        if self.sniff and not looks_like_image(content):
            return super().save(name, content, max_length=max_length)
        # Local fallback only when hosting is simply not set up, so existing flows keep working.
        if not imgbb.is_available() and not _hosting_is_broken():
            return super().save(name, content, max_length=max_length)
        if hasattr(content, "seek"):
            content.seek(0)
        raw = content.read()
        try:
            prepared = prepare_image(raw, context=None)
        except ImageValidationError as exc:
            raise ImageUploadFailed(str(exc)) from None
        try:
            hosted = imgbb.upload_image(prepared.data, _safe_name(name, prepared.extension))
        except imgbb.ImageHostingError as exc:
            err = ImageUploadFailed(exc.user_message)
            err.status_code = exc.status_code
            raise err from None
        _record_asset(hosted, name, prepared)
        if len(hosted.url) > (max_length or 100):
            raise ImageUploadFailed("Image upload failed. Please retry.")
        return hosted.url

    def url(self, name):
        return name if is_remote(name) else super().url(name)

    def exists(self, name):
        return True if is_remote(name) else super().exists(name)

    def delete(self, name):
        if not is_remote(name):  # remote images are never deleted by us
            super().delete(name)

    def size(self, name):
        return 0 if is_remote(name) else super().size(name)

    def path(self, name):
        if is_remote(name):
            raise NotImplementedError("Remote images have no local path.")
        return super().path(name)

    def open(self, name, mode="rb"):
        if is_remote(name):
            raise NotImplementedError("Remote images must be fetched by URL.")
        return super().open(name, mode)

    def get_available_name(self, name, max_length=None):
        return name if is_remote(name) else super().get_available_name(name, max_length=max_length)


def _hosting_is_broken():
    """True if an admin enabled hosting but it cannot work (so we must not silently go local)."""
    row = imgbb.get_setting_row()
    return bool(row and row.enabled and row.has_key)


def _safe_name(name, ext):
    stem = re.sub(r"[^A-Za-z0-9_-]+", "-", str(name).rsplit("/", 1)[-1].rsplit(".", 1)[0]).strip("-")[:24] or "image"
    return f"{stem}.{ext}"


def _record_asset(hosted, original_name, prepared, user=None, context=""):
    from apps.integrations.crypto import encrypt_secret
    from apps.integrations.models import MediaAsset

    try:
        enc = encrypt_secret(hosted.delete_url) if hosted.delete_url else ""
    except Exception:
        enc = ""
    return MediaAsset.objects.create(
        provider=hosted.provider, url=hosted.url, display_url=hosted.display_url, thumbnail_url=hosted.thumbnail_url,
        provider_asset_id=hosted.provider_image_id, encrypted_delete_url=enc, original_name=str(original_name)[:255],
        mime_type=prepared.mime_type, size=hosted.size or len(prepared.data), width=hosted.width, height=hosted.height,
        uploaded_by=user, context=context,
    )
