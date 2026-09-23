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
