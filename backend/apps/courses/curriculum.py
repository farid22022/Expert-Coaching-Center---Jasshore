"""Shared curriculum access rules for every student delivery surface."""
from django.db.models import Q
from django.utils import timezone


def released_content(now=None):
    return Q(curriculum_chapter__isnull=True) | Q(
        curriculum_chapter__week__is_published=True,
        curriculum_chapter__week__release_at__lte=now or timezone.now(),
    )


def content_is_released(item):
    if not item.curriculum_chapter_id:
        return True
    week = item.curriculum_chapter.week
    return week.is_published and week.release_at <= timezone.now()
