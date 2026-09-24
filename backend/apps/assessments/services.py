from decimal import Decimal

from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from django.db.models import Avg, Count, Max, Min, Sum
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied, ValidationError

from apps.courses.models import Enrollment
from . import models
from .validators import validate_submission_file


class AssessmentService:
    @staticmethod
    def ensure_student_can_access(student, assessment):
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
        attempt, _ = models.AssessmentAttempt.objects.get_or_create(
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
        return submission

    @staticmethod
    @transaction.atomic
    def evaluate_submission(submission, teacher, marks, feedback, user):
        if submission.status not in {models.SubmissionStatus.SUBMITTED, models.SubmissionStatus.RETURNED}:
            raise ValidationError("Only submitted assignments can be evaluated.")
        submission.marks_obtained = marks
        submission.total_marks = submission.total_marks or submission.assessment.assessment_questions.aggregate(total=Sum("marks"))["total"] or 100
        submission.feedback = feedback
        submission.evaluated_by = teacher
        submission.evaluated_at = timezone.now()
        submission.status = models.SubmissionStatus.EVALUATED
        submission.updated_by = user
        submission.save(update_fields=["marks_obtained", "total_marks", "feedback", "evaluated_by", "evaluated_at", "status", "updated_by", "updated_at"])
        return submission

    @staticmethod
    def student_performance(student):
        attempts = models.AssessmentAttempt.objects.filter(student=student).exclude(status=models.AttemptStatus.IN_PROGRESS)
        submissions = models.AssignmentSubmission.objects.filter(student=student)
        return {
            "attempt_count": attempts.count(),
            "assignment_count": submissions.count(),
            "average_score": attempts.aggregate(value=Avg("score"))["value"] or 0,
            "total_score": attempts.aggregate(value=Sum("score"))["value"] or 0,
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
