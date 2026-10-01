from pathlib import Path

from django.core.exceptions import ValidationError


ALLOWED_SUBMISSION_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".webp"}
ALLOWED_SUBMISSION_CONTENT_TYPES = {
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/webp",
}
MAX_SUBMISSION_FILE_SIZE = 10 * 1024 * 1024

MATERIAL_FILE_LIMIT = 25 * 1024 * 1024
MATERIAL_VIDEO_LIMIT = 100 * 1024 * 1024


def validate_material_upload(upload, material_type):
    """Check stored lesson files, including their signature, before accepting an upload."""
    extension = Path(upload.name).suffix.lower()
    allowed = {".pdf", ".png", ".jpg", ".jpeg", ".webp", ".mp4", ".webm"}
    if extension not in allowed:
        raise ValidationError("Upload a PDF, image, MP4, or WebM file.")
    video = extension in {".mp4", ".webm"}
    if video and material_type != "video":
        raise ValidationError("Choose Video lesson for a video upload.")
    if material_type == "video" and not video:
        raise ValidationError("Video lessons require an MP4 or WebM upload.")
    if upload.size > (MATERIAL_VIDEO_LIMIT if video else MATERIAL_FILE_LIMIT):
        raise ValidationError("Video files must be 100 MB or less; other files must be 25 MB or less.")
    position = upload.tell()
    try:
        upload.seek(0)
        header = upload.read(16)
    finally:
        upload.seek(position)
    signatures = {
        ".pdf": header.startswith(b"%PDF-"),
        ".png": header.startswith(b"\x89PNG\r\n\x1a\n"),
        ".jpg": header.startswith(b"\xff\xd8\xff"),
        ".jpeg": header.startswith(b"\xff\xd8\xff"),
        ".webp": header.startswith(b"RIFF") and header[8:12] == b"WEBP",
        ".mp4": header[4:8] == b"ftyp",
        ".webm": header.startswith(b"\x1a\x45\xdf\xa3"),
    }
    if not signatures[extension]:
        raise ValidationError("The file content does not match its extension.")


def validate_submission_file(upload):
    extension = Path(upload.name).suffix.lower()
    content_type = getattr(upload, "content_type", "")
    size = getattr(upload, "size", 0)

    if extension not in ALLOWED_SUBMISSION_EXTENSIONS:
        raise ValidationError("Only PDF and image files are allowed.")
    if content_type and content_type not in ALLOWED_SUBMISSION_CONTENT_TYPES:
        raise ValidationError("Invalid file content type.")
    if size > MAX_SUBMISSION_FILE_SIZE:
        raise ValidationError("Submission file size must be 10MB or less.")
    position = upload.tell()
    try:
        upload.seek(0)
        header = upload.read(16)
    finally:
        upload.seek(position)
    valid_signature = {
        ".pdf": header.startswith(b"%PDF-"),
        ".png": header.startswith(b"\x89PNG\r\n\x1a\n"),
        ".jpg": header.startswith(b"\xff\xd8\xff"),
        ".jpeg": header.startswith(b"\xff\xd8\xff"),
        ".webp": header.startswith(b"RIFF") and header[8:12] == b"WEBP",
    }.get(extension, False)
    if not valid_signature:
        raise ValidationError("The uploaded file content does not match its extension.")
