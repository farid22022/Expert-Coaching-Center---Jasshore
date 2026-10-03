"""Single entry point for "a test became visible / changed / was cancelled" -> student notifications.

Notifications are awareness + navigation only. Test access is always decided by
Enrollment + scope + schedule + attempt rules (`AssessmentService`, `StudentAssessmentViewSet`),
never by whether a student holds a notification.
"""
from datetime import timedelta

from django.db import transaction
from django.db.models import F
from django.db.models.functions import Lower
from django.utils import timezone

from apps.accounts.models import User
from apps.courses.models import Enrollment, EnrollmentStatus
from apps.messaging.models import Notification

from . import models

VISIBLE_STATUSES = {
    models.AssessmentStatus.PUBLISHED,
    models.AssessmentStatus.SCHEDULED,
    models.AssessmentStatus.LIVE,
}

TARGET_TEST = "ONLINE_TEST"
TARGET_ASSIGNMENT = "ASSIGNMENT"


def is_student_visible(assessment):
    return assessment.status in VISIBLE_STATUSES and assessment.review_status == models.ContentReviewStatus.APPROVED


def _when(moment):
    """Human text in the application timezone (Asia/Dhaka), e.g. '5 October at 7:00 PM'."""
    local = timezone.localtime(moment)
    return f"{local.day} {local.strftime('%B')} at {local.strftime('%I:%M %p').lstrip('0')}"


def _kind(assessment):
    if assessment.assessment_type == models.AssessmentType.ASSIGNMENT:
        return "assignment"
    if assessment.timing_mode == models.TimingMode.LIVE:
        return "live"
    if assessment.timing_mode == models.TimingMode.SCHEDULED:
        return "scheduled"
    return "practice"


def deep_link(assessment, enrollment_id=None):
    if assessment.assessment_type == models.AssessmentType.ASSIGNMENT:
        if enrollment_id:
            return f"/student/courses/{enrollment_id}?open=assignment:{assessment.id}"
        return "/student/assignments"
    return f"/student/tests/{assessment.id}"


def resolve_recipients(assessment):
    """Active, eligible students -> [(User, enrollment_id)]. Mirrors
    `AssessmentService.ensure_student_can_access` so exactly the students who may open the
    test are the ones notified: active enrollment in the course, the same section when the
    test is section-scoped, and inside `allowed_students` when the test is individually targeted."""
    enrollments = Enrollment.objects.filter(
        organization_id=assessment.organization_id, course_id=assessment.course_id, status=EnrollmentStatus.ACTIVE,
    )
    if assessment.course_section_id:
        enrollments = enrollments.filter(course_section_id=assessment.course_section_id)
    allowed = list(assessment.allowed_students.values_list("id", flat=True))
    if allowed:
        enrollments = enrollments.filter(student_id__in=allowed)
    rows = {}
    for enrollment_id, student_id, email in enrollments.order_by("id").values_list("id", "student_id", "student__email"):
        if email and student_id not in rows:
            rows[student_id] = (enrollment_id, email.strip().lower())
    if not rows:
        return []
    users = {
        user.email_lower: user
        for user in User.objects.filter(organization_id=assessment.organization_id, is_active=True)
        .annotate(email_lower=Lower("email"))
        .filter(email_lower__in={email for _, email in rows.values()})
    }
    return [(users[email], enrollment_id) for enrollment_id, email in rows.values() if email in users]


def _deliver(assessment, actor, *, dedupe_key, notification_type, title, body, priority, extra_meta=None):
    """Bulk-create one notification per eligible student, skipping anyone who already has this
    dedupe_key (idempotent). Returns the number of notifications created."""
    recipients = resolve_recipients(assessment)
    if not recipients:
        return 0
    already = set(Notification.objects.filter(dedupe_key=dedupe_key, recipient_id__in=[user.id for user, _ in recipients]).values_list("recipient_id", flat=True))
    metadata = {
        "admission_id": assessment.course_id,
        "subject_id": assessment.subject_id,
        "subject_name": assessment.subject.name if assessment.subject_id else "",
        "test_title": assessment.title,
        "test_type": assessment.assessment_type,
        "timing_mode": assessment.timing_mode,
        "starts_at": assessment.starts_at.isoformat() if assessment.starts_at else None,
        "ends_at": assessment.ends_at.isoformat() if assessment.ends_at else None,
        **(extra_meta or {}),
    }
    target_type = TARGET_ASSIGNMENT if assessment.assessment_type == models.AssessmentType.ASSIGNMENT else TARGET_TEST
    rows = [
        Notification(
            organization_id=assessment.organization_id, recipient=user, title=title, body=body,
            notification_type=notification_type, target_url=deep_link(assessment, enrollment_id),
            target_type=target_type, target_id=assessment.id, priority=priority,
            metadata={**metadata, "enrollment_id": enrollment_id}, dedupe_key=dedupe_key,
            created_by=actor, updated_by=actor,
        )
        for user, enrollment_id in recipients if user.id not in already
    ]
    Notification.objects.bulk_create(rows, batch_size=500, ignore_conflicts=True)
    return len(rows)


def _subject_prefix(assessment):
    return f"{assessment.subject.name}: " if assessment.subject_id else ""


class TestPublicationService:
    __test__ = False  # not a pytest/unittest class despite the name

    @classmethod
    @transaction.atomic
    def notify_published(cls, assessment, actor, now=None):
        """Create the "new test" notification once the test is genuinely student-visible.
        Safe to call repeatedly (publish double-click, retried request, create + publish)."""
        now = now or timezone.now()
        if not is_student_visible(assessment):
            return 0
        if assessment.publish_at and assessment.publish_at > now:
            return 0  # still hidden from students; delivered later by deliver_due()
        kind = _kind(assessment)
        title_text = assessment.title
        prefix = _subject_prefix(assessment)
        if kind == "assignment":
            ntype, priority = "ASSIGNMENT_PUBLISHED", "important"
            title = f"New assignment: {title_text}"
            body = f"{prefix}A new assignment \"{title_text}\" is available." + (f" Due by {_when(assessment.ends_at)}." if assessment.ends_at else "")
        elif kind == "live":
            ntype, priority = "LIVE_TEST_PUBLISHED", "urgent"
            title = f"Live test: {title_text}"
            body = f"New live {prefix.rstrip(': ') + ' ' if prefix else ''}test: {title_text}." + (f" Starts {_when(assessment.starts_at)}." if assessment.starts_at else "")
        elif kind == "scheduled":
            ntype, priority = "SCHEDULED_TEST_PUBLISHED", "important"
            title = f"Test scheduled: {title_text}"
            body = f"{prefix}{title_text} has been scheduled." + (f" Starts on {_when(assessment.starts_at)}." if assessment.starts_at else "")
        else:
            ntype, priority = "MCQ_PUBLISHED", "normal"
            title = f"New MCQ available: {title_text}"
            body = f"New {prefix.rstrip(': ') + ' ' if prefix else ''}MCQ available: {title_text}."
        created = _deliver(
            assessment, actor, dedupe_key=f"assessment:{assessment.id}:published",
            notification_type=ntype, title=title, body=body, priority=priority,
        )
        models.Assessment.objects.filter(pk=assessment.pk, notified_at__isnull=True).update(notified_at=now)
        return created

    @classmethod
    @transaction.atomic
    def publish(cls, assessment, actor, reviewer, now=None, status=None):
        """Head-teacher publication (the existing review gate is kept): flip to published and
        notify in one transaction. Returns (assessment, notifications_created)."""
        now = now or timezone.now()
        assessment.review_status = models.ContentReviewStatus.APPROVED
        assessment.reviewed_by = reviewer
        assessment.reviewed_at = now
        assessment.status = status or models.AssessmentStatus.PUBLISHED
        assessment.published_at = assessment.published_at or now
        assessment.updated_by = actor
        assessment.save(update_fields=["status", "review_status", "reviewed_by", "reviewed_at", "published_at", "updated_by", "updated_at"])
        return assessment, cls.notify_published(assessment, actor, now)

    @classmethod
    @transaction.atomic
    def notify_rescheduled(cls, assessment, actor):
        if not is_student_visible(assessment) or not assessment.starts_at:
            return 0
        stamp = int(assessment.starts_at.timestamp())
        prefix = _subject_prefix(assessment)
        return _deliver(
            assessment, actor, dedupe_key=f"assessment:{assessment.id}:resched:{stamp}",
            notification_type="TEST_UPDATED", priority="important",
            title=f"Test rescheduled: {assessment.title}",
            body=f"{prefix}{assessment.title} has been rescheduled to {_when(assessment.starts_at)}.",
        )

    @classmethod
    @transaction.atomic
    def notify_cancelled(cls, assessment, actor):
        prefix = _subject_prefix(assessment)
        return _deliver(
            assessment, actor, dedupe_key=f"assessment:{assessment.id}:cancelled",
            notification_type="TEST_CANCELLED", priority="important",
            title=f"Test cancelled: {assessment.title}",
            body=f"{prefix}{assessment.title} has been cancelled.",
        )

    @classmethod
    def deliver_due_throttled(cls):
        """At most one sweep per minute per process (cache.add is atomic)."""
        from django.core.cache import cache
        if cache.add("test-publication-sweep", 1, 60):
            return cls.deliver_due()
        return 0

    @classmethod
    def deliver_due(cls, now=None, actor=None):
        """Deliver publish notifications for tests whose `publish_at` has now passed.
        No background worker exists in this deployment, so this is idempotent and cheap enough
        to be called lazily (student assessment list) and from the management command."""
        now = now or timezone.now()
        due = models.Assessment.objects.filter(
            notified_at__isnull=True, published_at__isnull=False, publish_at__isnull=False,
            publish_at__lte=now, publish_at__gte=now - timedelta(days=7),
            status__in=VISIBLE_STATUSES, review_status=models.ContentReviewStatus.APPROVED,
        ).filter(publish_at__gt=F("published_at")).select_related("subject")
        total = 0
        for assessment in due:
            total += cls.notify_published(assessment, actor or assessment.updated_by, now)
        return total
