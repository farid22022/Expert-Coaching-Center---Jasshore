from django.db.models import Q
from rest_framework.exceptions import PermissionDenied

from .models import AssignmentRole, AssignmentStatus, CourseSubject, TeacherAssignment


def teacher_scope(teacher, organization):
    """Returns the courses/subjects a teacher can see, and which courses they head.
    A subject-teacher sees only their assigned subject(s); a head-teacher sees every
    subject in the course(s) they head - the same distinction enforced across
    AssessmentAdminViewSet/CourseSyllabusItemViewSet/TeacherDashboardViewSet and the
    course-structure ViewSets that grant head-teacher-only write access."""
    assignments = TeacherAssignment.objects.filter(
        organization=organization, teacher=teacher, is_active=True, assignment_status=AssignmentStatus.ACCEPTED,
    )
    course_ids = set(assignments.values_list("course_id", flat=True))
    head_course_ids = set(assignments.filter(role=AssignmentRole.HEAD_TEACHER).values_list("course_id", flat=True))
    subject_ids = set(assignments.exclude(subject__isnull=True).values_list("subject_id", flat=True))
    if head_course_ids:
        subject_ids |= set(
            CourseSubject.objects.filter(course_section__course_id__in=head_course_ids).values_list("id", flat=True)
        )
    return {"course_ids": course_ids, "subject_ids": subject_ids, "head_course_ids": head_course_ids}


def ensure_teacher_subject_scope(teacher, organization, course_subject):
    """Gradebook/grading-scheme access guard. teacher_scope()'s subject_ids only counts
    assignments with an explicit `subject` FK, so it misses a subject-teacher assigned at
    the section level (subject=None, meaning "every subject in this section" - the same
    semantics already used by AssessmentAdminViewSet._ensure_scope). Checked directly here
    rather than changing teacher_scope()'s return shape, which other already-tested
    callers rely on."""
    if not teacher:
        raise PermissionDenied("A teacher profile is required for this action.")
    scope = teacher_scope(teacher, organization)
    if course_subject.id in scope["subject_ids"] or course_subject.course_section.course_id in scope["head_course_ids"]:
        return
    section_scoped = TeacherAssignment.objects.filter(
        organization=organization, teacher=teacher, is_active=True, assignment_status=AssignmentStatus.ACCEPTED,
        course_id=course_subject.course_section.course_id, subject__isnull=True,
    ).filter(Q(course_section__isnull=True) | Q(course_section_id=course_subject.course_section_id))
    if not section_scoped.exists():
        raise PermissionDenied("You are not assigned to this admission subject.")


def ensure_head_teacher_of_course(teacher, organization, course_id):
    """Guard for course-structure management (Sections/Subjects/Academic Stages/
    Assessment Components/Grade Scales/subject-Teacher Assignments) - only a head
    teacher of the course may write here, unlike ensure_teacher_subject_scope which
    also allows ordinary subject teachers (content-delivery scope, not structure)."""
    if not teacher:
        raise PermissionDenied("A teacher profile is required for this action.")
    scope = teacher_scope(teacher, organization)
    if course_id not in scope["head_course_ids"]:
        raise PermissionDenied("You are not the head teacher of this admission.")
