"""Backend-authoritative student-facing state of a test. The frontend only renders this;
the same rules are re-enforced by `AssessmentService.ensure_assessment_open` on start."""
from datetime import timedelta

from django.utils import timezone

from . import models

STARTING_SOON_WINDOW = timedelta(minutes=15)

UPCOMING = "UPCOMING"
STARTING_SOON = "STARTING_SOON"
AVAILABLE_NOW = "AVAILABLE_NOW"
IN_PROGRESS = "IN_PROGRESS"
SUBMITTED = "SUBMITTED"
EXPIRED = "EXPIRED"
CANCELLED = "CANCELLED"
NOT_AVAILABLE = "NOT_AVAILABLE"


def compute_student_status(assessment, attempt, now=None):
    now = now or timezone.now()
    if attempt is not None:
        if attempt.status == models.AttemptStatus.IN_PROGRESS and now <= attempt.deadline:
            return IN_PROGRESS
        return SUBMITTED
    if assessment.status == models.AssessmentStatus.ARCHIVED:
        return CANCELLED
    if assessment.status == models.AssessmentStatus.CLOSED:
        return EXPIRED
    if assessment.review_status != models.ContentReviewStatus.APPROVED or assessment.status not in {
        models.AssessmentStatus.PUBLISHED, models.AssessmentStatus.SCHEDULED, models.AssessmentStatus.LIVE,
    }:
        return NOT_AVAILABLE
    if assessment.publish_at and now < assessment.publish_at:
        return NOT_AVAILABLE
    if assessment.starts_at and now < assessment.starts_at:
        return STARTING_SOON if assessment.starts_at - now <= STARTING_SOON_WINDOW else UPCOMING
    if assessment.ends_at and now > assessment.ends_at:
        return EXPIRED
    return AVAILABLE_NOW
