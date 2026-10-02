"""Validate and optimise uploaded images before they leave the server."""
import io
from dataclasses import dataclass

from PIL import Image, ImageOps, UnidentifiedImageError

ALLOWED_FORMATS = {
    "JPEG": ("image/jpeg", "jpg"),
    "PNG": ("image/png", "png"),
    "WEBP": ("image/webp", "webp"),
    "GIF": ("image/gif", "gif"),
}
MAX_PIXELS = 60_000_000
MB = 1024 * 1024


@dataclass(frozen=True)
class ContextRule:
    max_bytes: int
    max_dimension: int
    staff_only: bool = True


# Business limits per upload context (ImgBB itself allows 32 MB; we deliberately do not).
CONTEXT_RULES = {
    "avatar": ContextRule(5 * MB, 1024, staff_only=False),
    "profile": ContextRule(5 * MB, 1024, staff_only=False),
    "teacher_photo": ContextRule(5 * MB, 1024),
    "thumbnail": ContextRule(5 * MB, 640),
    "admission_cover": ContextRule(10 * MB, 1920),
    "course_cover": ContextRule(10 * MB, 1920),
    "subject_image": ContextRule(10 * MB, 1920),
    "lesson_image": ContextRule(10 * MB, 1920),
    "question_image": ContextRule(5 * MB, 1600),
    "notice": ContextRule(10 * MB, 1920),
    "news": ContextRule(10 * MB, 1920),
    "event": ContextRule(10 * MB, 1920),
    "gallery": ContextRule(10 * MB, 1920),
    "general": ContextRule(5 * MB, 1920),
}
DEFAULT_CONTEXT = "general"


class ImageValidationError(ValueError):
    """Message is safe to show to end users."""


def rule_for(context):
    return CONTEXT_RULES.get(context or DEFAULT_CONTEXT, CONTEXT_RULES[DEFAULT_CONTEXT])


@dataclass
class PreparedImage:
    data: bytes
    mime_type: str
    extension: str
    width: int
    height: int


def prepare_image(raw: bytes, context=None) -> PreparedImage:
    """Decode the real image (extension/Content-Type are not trusted), strip metadata,
    downscale oversized images and re-encode."""
    rule = rule_for(context)
    if not raw:
        raise ImageValidationError("The uploaded file is empty.")
    if len(raw) > rule.max_bytes:
        raise ImageValidationError(f"Image is too large. Maximum size is {rule.max_bytes // MB} MB.")
    try:
        probe = Image.open(io.BytesIO(raw))
        fmt = probe.format
        probe.verify()
    except (UnidentifiedImageError, OSError, SyntaxError, ValueError, Image.DecompressionBombError):
        raise ImageValidationError("The file is not a valid image.") from None
    if fmt not in ALLOWED_FORMATS:
        raise ImageValidationError("Unsupported image type. Use JPEG, PNG, WebP or GIF.")
    mime, ext = ALLOWED_FORMATS[fmt]
    try:
        img = Image.open(io.BytesIO(raw))
        orig_w, orig_h = img.size
        if orig_w * orig_h > MAX_PIXELS:
            raise ImageValidationError("Image dimensions are too large.")
        if bool(getattr(img, "is_animated", False)) and getattr(img, "n_frames", 1) > 1:
            # Preserve animation untouched (already size-checked); no re-encode.
            return PreparedImage(raw, mime, ext, orig_w, orig_h)
        img.load()
        img = ImageOps.exif_transpose(img)
        if max(img.size) > rule.max_dimension:
            img.thumbnail((rule.max_dimension, rule.max_dimension), Image.Resampling.LANCZOS)
        out = io.BytesIO()
        if fmt == "JPEG":
            img.convert("RGB").save(out, "JPEG", quality=85, optimize=True, progressive=True)
        elif fmt == "PNG":
            img.save(out, "PNG", optimize=True)
        elif fmt == "WEBP":
            img.save(out, "WEBP", quality=85, method=4)
        else:
            img.save(out, "GIF")
        data = out.getvalue()
        return PreparedImage(data, mime, ext, img.width, img.height)
    except ImageValidationError:
        raise
    except (OSError, ValueError, Image.DecompressionBombError):
        raise ImageValidationError("The image could not be processed.") from None
