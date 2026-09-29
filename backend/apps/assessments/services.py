from apps.courses.curriculum import content_is_released
from decimal import Decimal

from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from django.db.models import Avg, Count, Max, Min, Q, Sum, F, FloatField, ExpressionWrapper
from django.db.models.functions import NullIf
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied, ValidationError

from apps.courses.models import Enrollment, EnrollmentStatus
from apps.courses.services import ensure_teacher_subject_scope, teacher_scope  # noqa: F401 - re-exported for existing importers of apps.assessments.services
from . import models
from .validators import validate_submission_file

# Centralized academic-risk thresholds (spec §5) - the single source of truth so the
# frontend never hardcodes these numbers; exposed read-only via AnalyticsViewSet.
# Head-Teacher/Admin-editable UI is a documented follow-up, not built this pass.
RISK_THRESHOLDS = {
    "low_mcq_avg": 50,
    "low_assignment_avg": 50,
    "inactive_days": 7,
    "missing_assignments": 2,
    "failed_tests": 3,
}


def _notify_student(organization, student, actor, title, body, notification_type, target_url):
    """Every teacher/system action here has a clear student effect (spec §59) - deliver
    it through the existing Notification model/bell, same pattern as invite_teacher
    (apps/courses/views.py:770). Lives here (not views.py) so both view actions and
    this module's own publish_course_result can call the identical function."""
    from apps.accounts.models import User
    from apps.messaging.models import Notification

    recipient = User.objects.filter(organization=organization, email__iexact=student.email).first()
    if not recipient:
        return
    Notification.objects.create(
        organization=organization, recipient=recipient, title=title, body=body,
        notification_type=notification_type, target_url=target_url, created_by=actor, updated_by=actor,
    )


def notify_enrolled_students(course, course_section, organization, actor, title, body, notification_type, target_url):
    """Bulk version of _notify_student for "new content published" events (assessment/
    assignment/material becomes visible to students) - every actively-enrolled student
    for the course (optionally narrowed to one section) gets one Notification each."""
    enrollments = Enrollment.objects.filter(
        organization=organization, course=course, status=EnrollmentStatus.ACTIVE,
    ).select_related("student")
    if course_section_id := (course_section.id if course_section else None):
        enrollments = enrollments.filter(Q(course_section__isnull=True) | Q(course_section_id=course_section_id))
    seen_student_ids = set()
    for enrollment in enrollments:
        if enrollment.student_id in seen_student_ids:
            continue
        seen_student_ids.add(enrollment.student_id)
        _notify_student(organization, enrollment.student, actor, title, body, notification_type, target_url)


def _auto_complete_linked_interventions(assessment, student, user):
    """Spec §10: students never set an intervention's official status - completion is
    derived from the linked activity actually being submitted. Runs inside the same
    atomic submit_attempt/submit_assignment transaction (§54's "backend should
    coordinate authoritative state changes", not five separate frontend updates)."""
    (
        models.StudentIntervention.objects
        .filter(student=student, linked_practice_assessment=assessment)
        .exclude(status=models.InterventionStatus.COMPLETED)
        .update(status=models.InterventionStatus.COMPLETED, updated_by=user, updated_at=timezone.now())
    )



def students_in_scope(teacher, organization):
    """Active enrollments for every course the teacher is assigned to (any role) -
    mirrors TeacherDashboardViewSet.list()'s existing student-resolution logic."""
    scope = teacher_scope(teacher, organization)
    return Enrollment.objects.filter(
        organization=organization, course_id__in=scope["course_ids"], status=EnrollmentStatus.ACTIVE,
    ).select_related("student", "course")


def _last_activity_for_students(organization, student_ids):
    """Derived engagement signal - max timestamp across attempt/answer/material-view/
    submission events. No stored "last_active" field exists anywhere (confirmed); this
    stays consistent with that derive-don't-store convention."""
    from django.db.models import F

    latest = {}

    def _track(rows):
        for student_id, when in rows:
            if when and (student_id not in latest or when > latest[student_id]):
                latest[student_id] = when

    _track(models.AssessmentAttempt.objects.filter(organization=organization, student_id__in=student_ids).values_list("student_id", "started_at"))
    _track(models.StudentAnswer.objects.filter(organization=organization, attempt__student_id__in=student_ids).annotate(student_id_=F("attempt__student_id")).values_list("student_id_", "answered_at"))
    _track(models.MaterialView.objects.filter(organization=organization, student_id__in=student_ids).values_list("student_id", "viewed_at"))
    _track(models.AssignmentSubmission.objects.filter(organization=organization, student_id__in=student_ids).values_list("student_id", "submitted_at"))
    return latest


def performance_center_rows(teacher, organization, subject_id=None):
    """One row per enrolled-student-in-scope with real, derived academic metrics
    (spec §1). Batch-computed (not a per-student query loop) to stay reasonable for a
    teacher's whole roster."""
    scope = teacher_scope(teacher, organization)
    subject_ids = scope["subject_ids"]
    if subject_id:
        subject_ids = {int(subject_id)} & subject_ids

    enrollments = list(students_in_scope(teacher, organization).filter(course_id__in=scope["course_ids"]))
    student_ids = [row.student_id for row in enrollments]
    if not student_ids:
        return []

    assessments = models.Assessment.objects.filter(
        organization=organization, course_id__in=scope["course_ids"], subject_id__in=subject_ids,
        status__in=["published", "scheduled", "live", "closed"],
    )
    mcq_ids = list(assessments.filter(assessment_type=models.AssessmentType.MCQ).values_list("id", flat=True))
    assignment_ids = list(assessments.filter(assessment_type=models.AssessmentType.ASSIGNMENT).values_list("id", flat=True))

    attempts_by_student = {}
    for row in models.AssessmentAttempt.objects.filter(organization=organization, assessment_id__in=mcq_ids, student_id__in=student_ids).exclude(status=models.AttemptStatus.IN_PROGRESS).values("student_id", "score", "total_marks"):
        attempts_by_student.setdefault(row["student_id"], []).append(row)

    submissions_by_student = {}
    for row in models.AssignmentSubmission.objects.filter(organization=organization, assessment_id__in=assignment_ids, student_id__in=student_ids).values("student_id", "status", "marks_obtained", "total_marks"):
        submissions_by_student.setdefault(row["student_id"], []).append(row)

    material_totals = dict(
        models.CourseMaterial.objects.filter(organization=organization, course_id__in=scope["course_ids"], subject_id__in=subject_ids, is_published=True, status="published")
        .values("course_id").annotate(total=Count("id")).values_list("course_id", "total")
    )
    material_done = {}
    for row in models.MaterialView.objects.filter(organization=organization, student_id__in=student_ids, material__course_id__in=scope["course_ids"], material__subject_id__in=subject_ids).values("student_id", "material__course_id"):
        material_done.setdefault(row["student_id"], set()).add(row["material__course_id"])

    last_activity = _last_activity_for_students(organization, student_ids)
    now = timezone.now()

    seen = set()
    rows = []
    for enrollment in enrollments:
        student = enrollment.student
        if student.id in seen:
            continue
        seen.add(student.id)

        student_attempts = attempts_by_student.get(student.id, [])
        mcq_pcts = [float(row["score"]) / float(row["total_marks"]) * 100 for row in student_attempts if row["total_marks"]]
        mcq_average = round(sum(mcq_pcts) / len(mcq_pcts), 1) if mcq_pcts else None

        student_submissions = submissions_by_student.get(student.id, [])
        graded = [row for row in student_submissions if row["status"] == models.SubmissionStatus.EVALUATED and row["total_marks"]]
        assignment_pcts = [float(row["marks_obtained"] or 0) / float(row["total_marks"]) * 100 for row in graded]
        assignment_average = round(sum(assignment_pcts) / len(assignment_pcts), 1) if assignment_pcts else None
        missing_assignments = max(0, len(assignment_ids) - len(student_submissions))

        material_total = material_totals.get(enrollment.course_id, 0)
        materials_viewed = len(material_done.get(student.id, set()) & {enrollment.course_id})
        total_units = material_total + len(mcq_ids)
        done_units = materials_viewed + len(student_attempts)
        progress = round((done_units / total_units) * 100) if total_units else 0

        last_seen = last_activity.get(student.id)
        inactive_days = (now.date() - last_seen.date()).days if last_seen else None

        reasons = []
        if mcq_average is not None and mcq_average < RISK_THRESHOLDS["low_mcq_avg"]:
            reasons.append(f"MCQ average below {RISK_THRESHOLDS['low_mcq_avg']}%")
        if assignment_average is not None and assignment_average < RISK_THRESHOLDS["low_assignment_avg"]:
            reasons.append(f"Assignment average below {RISK_THRESHOLDS['low_assignment_avg']}%")
        if missing_assignments >= RISK_THRESHOLDS["missing_assignments"]:
            reasons.append(f"Missing {missing_assignments} assignment(s)")
        failed_tests = sum(1 for pct in mcq_pcts if pct < 40)
        if failed_tests >= RISK_THRESHOLDS["failed_tests"]:
            reasons.append(f"Failed {failed_tests} recent tests")
        if inactive_days is not None and inactive_days >= RISK_THRESHOLDS["inactive_days"]:
            reasons.append(f"No learning activity for {inactive_days} days")
        elif last_seen is None:
            reasons.append("No learning activity recorded yet")

        rows.append({
            "student_id": student.id,
            "student_name": student.full_name,
            "student_code": student.student_id,
            "course_id": enrollment.course_id,
            "course_title": enrollment.course.title,
            "enrollment_id": enrollment.id,
            "progress": progress,
            "mcq_average": mcq_average,
            "assignment_average": assignment_average,
            "tests_completed": len(student_attempts),
            "tests_total": len(mcq_ids),
            "missing_assignments": missing_assignments,
            "last_active": last_seen,
            "academic_status": "needs_attention" if reasons else "on_track",
            "reasons": reasons,
        })
    return rows


def weak_topics_for_student(student, organization, subject_ids=None):
    """Groups StudentAnswer by question topic/chapter to compute real accuracy -
    spec §6. Pure aggregation over existing data, no schema change."""
    answers = models.StudentAnswer.objects.filter(
        organization=organization, attempt__student=student,
    ).exclude(attempt__status=models.AttemptStatus.IN_PROGRESS).select_related("question")
    if subject_ids:
        answers = answers.filter(question__subject_id__in=subject_ids)

    buckets = {}
    for answer in answers:
        key = (answer.question.subject_id, answer.question.topic or answer.question.chapter or "General")
        entry = buckets.setdefault(key, {"subject_id": key[0], "topic": key[1], "correct": 0, "total": 0})
        entry["total"] += 1
        if answer.is_correct:
            entry["correct"] += 1

    results = []
    for entry in buckets.values():
        accuracy = round((entry["correct"] / entry["total"]) * 100) if entry["total"] else 0
        level = "weak" if accuracy < 50 else "needs_practice" if accuracy < 75 else "strong"
        results.append({
            "subject_id": entry["subject_id"],
            "topic": entry["topic"],
            "accuracy": accuracy,
            "question_count": entry["total"],
            "level": level,
        })
    results.sort(key=lambda row: row["accuracy"])
    return results


def create_practice_assessment(organization, title, course_id, course_section_id, subject_id, chapter_label, questions, student_ids, user, created_by_teacher=None, auto_publish=False):
    """Shared by the teacher's generate_practice action and the student's "Practice My
    Mistakes" - keeps both question-attaching code paths identical (spec §57's "don't
    duplicate" applies just as much within this feature as across it)."""
    assessment = models.Assessment.objects.create(
        organization=organization, title=title, assessment_type=models.AssessmentType.MCQ,
        timing_mode=models.TimingMode.PRACTICE, course_id=course_id, course_section_id=course_section_id,
        subject_id=subject_id, chapter=chapter_label, duration_minutes=max(10, len(questions) * 2),
        attempts_allowed=0, created_by_teacher=created_by_teacher,
        status=models.AssessmentStatus.PUBLISHED if auto_publish else models.AssessmentStatus.DRAFT,
        review_status=models.ContentReviewStatus.APPROVED if auto_publish else "pending",
        published_at=timezone.now() if auto_publish else None,
        created_by=user, updated_by=user,
    )
    assessment.allowed_students.set(student_ids)
    for order, question in enumerate(questions, start=1):
        models.AssessmentQuestion.objects.create(
            organization=organization, assessment=assessment, question=question,
            order=order, marks=question.marks, created_by=user, updated_by=user,
        )
    return assessment


def student_mistakes(student, organization, subject_id=None, chapter=None, topic=None):
    """Incorrect StudentAnswer rows the student is allowed to review (spec §22-23) -
    respects each assessment's own show_correct_answers/show_explanations flags, the
    same gate already enforced in the take-test flow, not a new/looser rule."""
    answers = models.StudentAnswer.objects.filter(
        organization=organization, attempt__student=student, is_correct=False,
    ).exclude(attempt__status=models.AttemptStatus.IN_PROGRESS).select_related(
        "question", "attempt", "attempt__assessment",
    ).prefetch_related("selected_options", "question__options")
    if subject_id:
        answers = answers.filter(question__subject_id=subject_id)
    if chapter:
        answers = answers.filter(question__chapter__iexact=chapter)
    if topic:
        answers = answers.filter(question__topic__iexact=topic)

    rows = []
    for answer in answers:
        assessment = answer.attempt.assessment
        can_review = assessment.show_correct_answers or assessment.show_explanations
        rows.append({
            "id": answer.id,
            "question_id": answer.question_id,
            "question_text": answer.question.text,
            "subject_id": answer.question.subject_id,
            "chapter": answer.question.chapter,
            "topic": answer.question.topic,
            "assessment_title": assessment.title,
            "attempted_at": answer.attempt.submitted_at,
            "can_review": can_review,
            "your_answer": [option.text for option in answer.selected_options.all()] if can_review else None,
            "correct_answer": [option.text for option in answer.question.options.all() if option.is_correct] if assessment.show_correct_answers else None,
            "explanation": answer.question.explanation if assessment.show_explanations else None,
        })
    return rows


def learning_timeline_for_student(student, organization, limit=40):
    """Chronological merge of real learning events - spec §3. Derived, not stored."""
    events = []
    for attempt in models.AssessmentAttempt.objects.filter(organization=organization, student=student).exclude(status=models.AttemptStatus.IN_PROGRESS).select_related("assessment")[:100]:
        pct = round(float(attempt.score) / float(attempt.total_marks) * 100) if attempt.total_marks else None
        events.append({
            "type": "test_completed" if pct is not None and pct >= 40 else "test_missed",
            "at": attempt.submitted_at,
            "title": f"Scored {attempt.score}/{attempt.total_marks} in {attempt.assessment.title}" if pct is not None else f"Attempted {attempt.assessment.title}",
        })
    for submission in models.AssignmentSubmission.objects.filter(organization=organization, student=student).select_related("assessment")[:100]:
        events.append({"type": "assignment_submitted", "at": submission.submitted_at, "title": f"Submitted {submission.assessment.title}"})
    for view in models.MaterialView.objects.filter(organization=organization, student=student).select_related("material")[:100]:
        events.append({"type": "material_viewed", "at": view.viewed_at, "title": f"Viewed {view.material.title}"})

    events = [event for event in events if event["at"]]
    events.sort(key=lambda event: event["at"], reverse=True)
    return events[:limit]


def _decimal(value, default="0"):
    if value is None:
        return Decimal(default)
    return Decimal(str(value))


def sync_component_from_source(component, student):
    """Auto-syncs one AUTO component's raw marks from real AssessmentAttempt/
    AssignmentSubmission rows (spec §9/§10) - never touches a row already marked
    is_manual=True. Returns (raw_obtained, raw_total, data_status); does not write
    to the DB itself so callers can batch inside one calculate_course_result call."""
    Status = models.ComponentDataStatus
    assessment_ids = list(component.source_assessments.values_list("id", flat=True))
    if not assessment_ids:
        return None, component.total_marks, Status.NOT_GRADED

    if component.source_type == models.ComponentSourceType.AUTO_TEST:
        rows = list(
            models.AssessmentAttempt.objects.filter(
                assessment_id__in=assessment_ids, student=student,
            ).exclude(status=models.AttemptStatus.IN_PROGRESS).values_list("score", "total_marks", "submitted_at")
        )
    elif component.source_type == models.ComponentSourceType.AUTO_ASSIGNMENT:
        rows = list(
            models.AssignmentSubmission.objects.filter(
                assessment_id__in=assessment_ids, student=student, status="evaluated",
            ).values_list("marks_obtained", "total_marks", "evaluated_at")
        )
    else:
        return None, component.total_marks, Status.NOT_GRADED

    if not rows:
        return None, component.total_marks, Status.NOT_ATTEMPTED

    scored_rows = [row for row in rows if row[0] is not None]
    if not scored_rows:
        return None, component.total_marks, Status.NOT_GRADED

    scores = [_decimal(row[0]) for row in scored_rows]
    rule = component.aggregation_rule
    if rule == models.AggregationRule.AVERAGE:
        obtained = sum(scores) / len(scores)
    elif rule == models.AggregationRule.LATEST:
        latest_row = max(scored_rows, key=lambda row: row[2] or timezone.now())
        obtained = _decimal(latest_row[0])
    elif rule == models.AggregationRule.BEST_N:
        n = component.best_n_count or len(scores)
        obtained = sum(sorted(scores, reverse=True)[:n])
    else:  # SUM_ALL
        obtained = sum(scores)

    data_status = Status.COMPLETE if len(scored_rows) == len(rows) else Status.MISSING
    return obtained, component.total_marks, data_status


def resolve_grade(percentage, grade_scale):
    """Looks up the grade/grade_point/is_fail for a percentage against one
    CourseGradeScale's items - the single place this lookup happens (spec §61)."""
    if percentage is None or grade_scale is None:
        return "", None, False
    for item in grade_scale.items.all():
        if item.min_percentage <= percentage <= item.max_percentage:
            return item.grade, item.grade_point, item.is_fail
    return "", None, False


@transaction.atomic
def calculate_course_result(enrollment, course_subject, user=None):
    """Spec §61: the ONE authoritative place a course result is computed - teacher
    gradebook and student result pages both read what this function wrote, never
    recompute independently. Never auto-publishes (status stays 'calculated')."""
    student = enrollment.student
    course_result, _ = models.StudentCourseResult.objects.get_or_create(
        enrollment=enrollment, course_subject=course_subject,
        defaults={"organization": enrollment.organization, "created_by": user, "updated_by": user},
    )
    if course_result.status == models.CourseResultStatus.LOCKED:
        raise ValidationError("This result is locked and cannot be recalculated.")

    components = list(course_subject.assessment_components.filter(status="active").order_by("order"))
    total_weighted = Decimal("0")
    any_weight_included = False

    for component in components:
        existing = models.StudentComponentResult.objects.filter(course_result=course_result, component=component).first()
        if existing and existing.is_manual:
            raw_obtained, raw_total, data_status = existing.raw_obtained, existing.raw_total, existing.data_status
        else:
            raw_obtained, raw_total, data_status = sync_component_from_source(component, student)

        weighted_score = None
        if raw_obtained is not None and raw_total:
            weighted_score = (_decimal(raw_obtained) / _decimal(raw_total)) * component.weight_percentage
            weighted_score = weighted_score.quantize(Decimal("0.01"))
            if component.include_in_final_grade:
                total_weighted += weighted_score
                any_weight_included = True

        models.StudentComponentResult.objects.update_or_create(
            course_result=course_result, component=component,
            defaults={
                "organization": enrollment.organization, "raw_obtained": raw_obtained, "raw_total": raw_total,
                "weighted_score": weighted_score, "data_status": data_status,
                "is_manual": existing.is_manual if existing else False,
                "manual_comment": existing.manual_comment if existing else "",
                "created_by": user, "updated_by": user,
            },
        )

    # Drop component results for components removed from the scheme since the last calc.
    models.StudentComponentResult.objects.filter(course_result=course_result).exclude(
        component_id__in=[c.id for c in components]
    ).delete()

    total_percentage = total_weighted.quantize(Decimal("0.01")) if any_weight_included else None
    grade_scale = course_subject.course_section.course.grade_scales.filter(is_active=True).first()
    grade, grade_point, is_fail = resolve_grade(total_percentage, grade_scale)
    pass_percentage = course_subject.course_section.course.pass_percentage
    pass_status = ""
    if total_percentage is not None:
        pass_status = "failed" if (is_fail or total_percentage < pass_percentage) else "passed"

    # Recalculating (e.g. a teacher pulls in a freshly-graded assignment for one student)
    # must not silently un-publish every other already-published student in the same
    # subject - the `calculate` action loops over the whole course's active enrollments.
    # Keep the numbers in sync, but only a status of draft/calculated advances to calculated.
    if course_result.status not in (models.CourseResultStatus.PUBLISHED, models.CourseResultStatus.LOCKED):
        course_result.status = models.CourseResultStatus.CALCULATED
    course_result.total_percentage = total_percentage
    course_result.grade = grade
    course_result.grade_point = grade_point
    course_result.pass_status = pass_status
    course_result.calculated_at = timezone.now()
    course_result.updated_by = user
    course_result.save()
    return course_result


def course_result_completeness(course_result):
    """Returns the list of required-but-incomplete components, used to block
    publish (spec §19) with a specific, actionable reason rather than a flat denial."""
    missing = []
    for component_result in course_result.component_results.select_related("component").filter(component__is_required=True):
        if component_result.data_status in (models.ComponentDataStatus.MISSING, models.ComponentDataStatus.NOT_ATTEMPTED, models.ComponentDataStatus.NOT_GRADED):
            missing.append(component_result.component.name)
    return missing


@transaction.atomic
def publish_course_result(course_result, user):
    """Idempotent: publishing an already-published result is a no-op (no duplicate
    notification), matching spec §58."""
    if course_result.status == models.CourseResultStatus.PUBLISHED:
        return course_result
    if course_result.status == models.CourseResultStatus.LOCKED:
        raise ValidationError("This result is locked.")
    missing = course_result_completeness(course_result)
    if missing:
        raise ValidationError(f"Cannot publish - missing required marks: {', '.join(missing)}.")

    from apps.people.models import Employee

    course_result.status = models.CourseResultStatus.PUBLISHED
    course_result.published_at = timezone.now()
    course_result.published_by = Employee.objects.filter(organization=course_result.organization, email__iexact=user.email, employee_type="teacher").first()
    course_result.updated_by = user
    course_result.save()

    _notify_student(
        course_result.enrollment.organization, course_result.enrollment.student, user,
        title=f"{course_result.course_subject.name} result published",
        body=f"Your {course_result.course_subject.name} course result is now available.",
        notification_type="course_result_published",
        target_url=f"/student/courses/{course_result.enrollment_id}/subjects/{course_result.course_subject_id}/result",
    )
    return course_result


class AssessmentService:
    @staticmethod
    def ensure_student_can_access(student, assessment):
        if not content_is_released(assessment):
            raise PermissionDenied("This week is not available yet.")
        if assessment.allowed_students.exists() and not assessment.allowed_students.filter(id=student.id).exists():
            raise PermissionDenied("This assessment is not assigned to you.")
        enrollments = Enrollment.objects.filter(
            organization=assessment.organization,
            student=student,
            course=assessment.course,
            status="active",
        )
        exists = enrollments.exists()
        if assessment.course_section_id:
            exists = enrollments.filter(course_section=assessment.course_section).exists()
        if not exists:
            raise PermissionDenied("You are not enrolled for this assessment.")

    @staticmethod
    def ensure_assessment_open(assessment):
        now = timezone.now()
        if assessment.publish_at and now < assessment.publish_at:
            raise ValidationError("Assessment has not been published yet.")
        if assessment.starts_at and now < assessment.starts_at:
            raise ValidationError("Assessment has not started yet.")
        if assessment.ends_at and now > assessment.ends_at:
            raise ValidationError("Assessment is already closed.")
        if assessment.status not in {
            models.AssessmentStatus.PUBLISHED,
            models.AssessmentStatus.SCHEDULED,
            models.AssessmentStatus.LIVE,
        }:
            raise ValidationError("Assessment is not open.")

    @staticmethod
    @transaction.atomic
    def start_attempt(assessment, student, user):
        AssessmentService.ensure_student_can_access(student, assessment)
        AssessmentService.ensure_assessment_open(assessment)
        attempt, created = models.AssessmentAttempt.objects.get_or_create(
            organization=assessment.organization,
            assessment=assessment,
            student=student,
            defaults={"created_by": user, "updated_by": user},
        )
        if attempt.status != models.AttemptStatus.IN_PROGRESS:
            return attempt
        if timezone.now() > attempt.deadline:
            return AssessmentService.submit_attempt(attempt, user, auto=True)
        return attempt

    @staticmethod
    @transaction.atomic
    def save_answer(attempt, question, selected_option_ids, user):
        if attempt.status != models.AttemptStatus.IN_PROGRESS:
            raise ValidationError("Submitted attempts cannot be changed.")
        if timezone.now() > attempt.deadline:
            AssessmentService.submit_attempt(attempt, user, auto=True)
            raise ValidationError("Attempt time has expired.")
        if not attempt.assessment.assessment_questions.filter(question=question).exists():
            raise ValidationError("Question does not belong to this assessment.")

        answer, _ = models.StudentAnswer.objects.get_or_create(
            organization=attempt.organization,
            attempt=attempt,
            question=question,
            defaults={"created_by": user, "updated_by": user},
        )
        answer.updated_by = user
        answer.save(update_fields=["updated_by", "updated_at"])
        options = models.QuestionOption.objects.filter(question=question, id__in=selected_option_ids)
        answer.selected_options.set(options)
        return answer

    @staticmethod
    @transaction.atomic
    def submit_attempt(attempt, user, auto=False):
        if attempt.status in {models.AttemptStatus.SUBMITTED, models.AttemptStatus.AUTO_SUBMITTED}:
            return attempt

        total = Decimal("0")
        score = Decimal("0")
        links = attempt.assessment.assessment_questions.select_related("question").prefetch_related("question__options")
        answer_map = {answer.question_id: answer for answer in attempt.answers.prefetch_related("selected_options")}

        for link in links:
            question = link.question
            total += link.marks
            answer = answer_map.get(question.id)
            if not answer:
                continue
            correct_ids = set(question.options.filter(is_correct=True).values_list("id", flat=True))
            selected_ids = set(answer.selected_options.values_list("id", flat=True))
            answer.is_correct = selected_ids == correct_ids and bool(correct_ids)
            answer.marks_obtained = link.marks if answer.is_correct else -question.negative_marks
            answer.updated_by = user
            answer.save(update_fields=["is_correct", "marks_obtained", "updated_by", "updated_at"])
            score += answer.marks_obtained

        attempt.score = score
        attempt.total_marks = total
        attempt.submitted_at = timezone.now()
        attempt.auto_submitted = auto
        attempt.status = models.AttemptStatus.AUTO_SUBMITTED if auto else models.AttemptStatus.SUBMITTED
        attempt.updated_by = user
        attempt.save(update_fields=["score", "total_marks", "submitted_at", "auto_submitted", "status", "updated_by", "updated_at"])
        _auto_complete_linked_interventions(attempt.assessment, attempt.student, user)
        return attempt

    @staticmethod
    @transaction.atomic
    def submit_assignment(assessment, student, files, user):
        AssessmentService.ensure_student_can_access(student, assessment)
        if assessment.assessment_type != models.AssessmentType.ASSIGNMENT:
            raise ValidationError("This assessment is not an assignment.")
        if assessment.ends_at and timezone.now() > assessment.ends_at:
            raise ValidationError("Assignment submission deadline has passed.")

        submission, created = models.AssignmentSubmission.objects.get_or_create(
            organization=assessment.organization,
            assessment=assessment,
            student=student,
            defaults={
                "submitted_at": timezone.now(),
                "created_by": user,
                "updated_by": user,
            },
        )
        if not created and submission.status == models.SubmissionStatus.EVALUATED:
            raise ValidationError("Evaluated submissions cannot be changed.")
        submission.status = models.SubmissionStatus.SUBMITTED
        submission.submitted_at = timezone.now()
        submission.updated_by = user
        submission.save(update_fields=["status", "submitted_at", "updated_by", "updated_at"])

        for upload in files:
            try:
                validate_submission_file(upload)
            except DjangoValidationError as error:
                raise ValidationError(error.messages)
            models.SubmissionAttachment.objects.create(
                organization=assessment.organization,
                submission=submission,
                file=upload,
                original_name=upload.name,
                content_type=getattr(upload, "content_type", ""),
                size=getattr(upload, "size", 0),
                created_by=user,
                updated_by=user,
            )
        _auto_complete_linked_interventions(assessment, student, user)
        return submission

    @staticmethod
    @transaction.atomic
    def evaluate_submission(submission, teacher, marks, feedback, user):
        if submission.status not in {models.SubmissionStatus.SUBMITTED, models.SubmissionStatus.RETURNED}:
            raise ValidationError("Only submitted assignments can be evaluated.")
        # Defense-in-depth: the real authorization boundary is already the caller's
        # scoped queryset (AssessmentAdminViewSet.get_queryset, scope_via="assessment"),
        # which already correctly lets a head teacher grade any subject-teacher's
        # submission in a course they head, and 404s a subject teacher outside their own
        # subject before this function ever runs. This just formalizes the same boundary
        # here too, for any future caller that reaches this service directly.
        if teacher is not None and not (user.is_staff or user.is_superuser):
            assessment = submission.assessment
            if assessment.subject_id:
                ensure_teacher_subject_scope(teacher, assessment.organization, assessment.subject)
            else:
                scope = teacher_scope(teacher, assessment.organization)
                if assessment.course_id not in scope["course_ids"] | scope["head_course_ids"]:
                    raise PermissionDenied("You are not assigned to this admission subject.")
        submission.marks_obtained = marks
        submission.total_marks = submission.total_marks or submission.assessment.assessment_questions.aggregate(total=Sum("marks"))["total"] or 100
        submission.feedback = feedback
        submission.evaluated_by = teacher
        submission.evaluated_at = timezone.now()
        submission.status = models.SubmissionStatus.EVALUATED
        submission.updated_by = user
        submission.save(update_fields=["marks_obtained", "total_marks", "feedback", "evaluated_by", "evaluated_at", "status", "updated_by", "updated_at"])
        _notify_student(
            submission.organization, submission.student, user,
            title="Assignment graded",
            body=f"Your submission for \"{submission.assessment.title}\" has been graded: {submission.marks_obtained}/{submission.total_marks}.",
            notification_type="assignment_graded",
            target_url="/student/assignments",
        )
        return submission

    @staticmethod
    def student_performance(student):
        attempts = models.AssessmentAttempt.objects.filter(student=student).exclude(status=models.AttemptStatus.IN_PROGRESS)
        submissions = models.AssignmentSubmission.objects.filter(student=student)
        summary = attempts.aggregate(
            count=Count("pk"), average=Avg("score"), total=Sum("score"),
            percentage=Avg(ExpressionWrapper(100.0 * F("score") / NullIf(F("total_marks"), 0), output_field=FloatField())),
        )
        return {
            "attempt_count": summary["count"],
            "assignment_count": submissions.count(),
            "average_score": summary["average"] or 0,
            "average_percentage": summary["percentage"] or 0,
            "total_score": summary["total"] or 0,
            "average_assignment_marks": submissions.aggregate(value=Avg("marks_obtained"))["value"] or 0,
        }

    @staticmethod
    def teacher_analytics(teacher):
        assessments = models.Assessment.objects.filter(created_by_teacher=teacher)
        attempts = models.AssessmentAttempt.objects.filter(assessment__in=assessments).exclude(status=models.AttemptStatus.IN_PROGRESS)
        return {
            "assessment_count": assessments.count(),
            "participant_count": attempts.values("student").distinct().count(),
            "average_score": attempts.aggregate(value=Avg("score"))["value"] or 0,
            "highest_score": attempts.aggregate(value=Max("score"))["value"] or 0,
            "lowest_score": attempts.aggregate(value=Min("score"))["value"] or 0,
        }

    @staticmethod
    def subject_performance(subject):
        assessments = models.Assessment.objects.filter(subject=subject)
        attempts = models.AssessmentAttempt.objects.filter(assessment__in=assessments).exclude(status=models.AttemptStatus.IN_PROGRESS)
        return {
            "assessment_count": assessments.count(),
            "attempt_count": attempts.count(),
            "average_score": attempts.aggregate(value=Avg("score"))["value"] or 0,
        }
