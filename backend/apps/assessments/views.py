from apps.courses.curriculum import released_content
from django.utils import timezone
from django.db.models import Q
from rest_framework import status
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle

from apps.core.responses import success_response
from apps.core.viewsets import OrganizationScopedModelViewSet
from apps.people.models import Student
from apps.courses.models import CourseSubject, Enrollment, EnrollmentStatus, TeacherAssignment
from apps.courses.permissions import HeadTeacherCourseScopeMixin
from apps.people.models import Employee
from . import models, serializers
from .services import AssessmentService, _notify_student, notify_enrolled_students


class AssessmentAdminViewSet(OrganizationScopedModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    permission_module = "assessment"
    # Dotted attribute path from an instance/related-object of this ViewSet's model to the
    # object that actually carries course/course_section/subject (Question, Assessment, or
    # AssignmentSubmission). Used for models that don't have those fields directly:
    # QuestionOption -> "question", AssessmentQuestion/AssessmentAttempt/AssignmentSubmission
    # -> "assessment", SubmissionAttachment -> "submission.assessment". None means the model
    # itself has `course` directly (Question, CourseMaterial, Assessment) — the original
    # direct-field behavior. This closes the gap where those five models previously fell
    # through to organization-only scoping with no teacher/subject check at all.
    scope_via = None

    def check_permissions(self, request):
        super().check_permissions(request)
        if request.user.is_staff or request.user.is_superuser:
            return
        if self._teacher():
            return
        # No teacher record and not staff/superuser (e.g. a student) — this admin surface
        # is teacher/staff-only. Falling back to a coarse role-permission check here is what
        # let students with `assessment.view` reach org-wide answer keys/attempts/submissions.
        self.permission_denied(request, message="A teacher or staff account is required for this action.")

    def _teacher(self):
        return Employee.objects.filter(
            organization=self.get_request_organization(),
            email=self.request.user.email,
            employee_type="teacher",
        ).first()

    def _is_head_teacher(self, teacher, course_id, section_id=None):
        assignments = TeacherAssignment.objects.filter(
            organization=teacher.organization,
            teacher=teacher,
            course_id=course_id,
            role="head_teacher",
            is_active=True,
            assignment_status="accepted",
        )
        return assignments.filter(Q(course_section__isnull=True) | Q(course_section_id=section_id)).exists()

    def _ensure_scope(self, teacher, course_id, section_id=None, subject_id=None):
        if not teacher:
            raise PermissionDenied("A teacher profile is required for academic content.")
        if self._is_head_teacher(teacher, course_id, section_id):
            return True
        assignments = TeacherAssignment.objects.filter(
            organization=teacher.organization,
            teacher=teacher,
            course_id=course_id,
            is_active=True,
            assignment_status="accepted",
        )
        if section_id:
            assignments = assignments.filter(Q(course_section__isnull=True) | Q(course_section_id=section_id))
        if subject_id:
            assignments = assignments.filter(Q(subject__isnull=True) | Q(subject_id=subject_id))
        if not assignments.exists():
            raise PermissionDenied("You are not assigned to this admission subject.")
        return False

    def _scope_owner_from_data(self, validated_data):
        parts = self.scope_via.split(".")
        owner = validated_data[parts[0]]
        for part in parts[1:]:
            owner = getattr(owner, part)
        return owner

    def _scope_owner_from_instance(self, instance):
        owner = instance
        for part in self.scope_via.split("."):
            owner = getattr(owner, part)
        return owner

    def perform_create(self, serializer):
        teacher = self._teacher()
        model = serializer.Meta.model
        if self.scope_via:
            owner = self._scope_owner_from_data(serializer.validated_data)
            self._ensure_scope(teacher, owner.course_id, owner.course_section_id, owner.subject_id)
            serializer.save(organization=self.get_request_organization(), created_by=self.request.user, updated_by=self.request.user)
            return
        if not hasattr(model, "course"):
            serializer.save(
                organization=self.get_request_organization(),
                created_by=self.request.user,
                updated_by=self.request.user,
            )
            return
        values = serializer.validated_data
        course_id = values["course"].id
        section_id = values.get("course_section").id if values.get("course_section") else None
        subject_id = values.get("subject").id if values.get("subject") else None
        is_head = self._ensure_scope(teacher, course_id, section_id, subject_id)
        extra = {"created_by": self.request.user, "updated_by": self.request.user}
        if teacher and hasattr(model, "created_by_teacher"):
            extra["created_by_teacher"] = teacher
        if hasattr(model, "review_status"):
            extra["review_status"] = "approved" if is_head else "pending"
            if model is models.CourseMaterial:
                extra.update({"is_published": is_head, "status": "published" if is_head else "draft"})
            elif model is models.Assessment and not is_head:
                extra["status"] = "draft"
        instance = serializer.save(organization=self.get_request_organization(), **extra)
        # Only notify when the content is immediately live to students (head-teacher-
        # created, or a model with no review gate at all) - a subject teacher's draft/
        # pending-review content isn't visible to anyone yet, so notifying here would be
        # a false alarm before it's ever approved.
        if is_head and model in (models.Assessment, models.CourseMaterial):
            self._notify_enrolled_students_of_new_content(instance, model)
        return instance

    def _notify_enrolled_students_of_new_content(self, instance, model):
        type_label = {
            models.AssessmentType.MCQ: "MCQ test",
            models.AssessmentType.EXAM: "exam",
            models.AssessmentType.ASSIGNMENT: "assignment",
        }
        if model is models.Assessment:
            label = type_label.get(instance.assessment_type, "assessment")
            target_url = "/student/assignments" if instance.assessment_type == models.AssessmentType.ASSIGNMENT else "/student/dashboard/assessments"
            notify_enrolled_students(
                instance.course, instance.course_section, instance.organization, self.request.user,
                title=f"New {label}: {instance.title}",
                body=f"A new {label} \"{instance.title}\" has been published for {instance.course.title}.",
                notification_type="new_assessment",
                target_url=target_url,
            )
        elif model is models.CourseMaterial:
            notify_enrolled_students(
                instance.course, instance.course_section, instance.organization, self.request.user,
                title=f"New study material: {instance.title}",
                body=f"A new study material \"{instance.title}\" has been added to {instance.course.title}.",
                notification_type="new_material",
                target_url="/student/dashboard/materials",
            )

    def perform_update(self, serializer):
        teacher = self._teacher()
        instance = self.get_object()
        model = serializer.Meta.model
        if self.scope_via:
            owner = self._scope_owner_from_instance(instance)
            self._ensure_scope(teacher, owner.course_id, owner.course_section_id, owner.subject_id)
            serializer.save(updated_by=self.request.user)
            return
        if not hasattr(model, "course"):
            serializer.save(updated_by=self.request.user)
            return
        is_head = self._ensure_scope(teacher, instance.course_id, instance.course_section_id, instance.subject_id)
        target = serializer.validated_data
        self._ensure_scope(teacher,
            getattr(target.get("course", instance.course), "id", None),
            getattr(target.get("course_section", instance.course_section), "id", None),
            getattr(target.get("subject", instance.subject), "id", None))
        if not is_head and instance.created_by_teacher_id != teacher.id:
            raise PermissionDenied("Only the content owner or head teacher can edit this content.")
        extra = {"updated_by": self.request.user}
        if hasattr(model, "review_status") and not is_head:
            extra["review_status"] = "pending"
            if model is models.CourseMaterial:
                extra.update({"is_published": False, "status": "draft"})
            elif model is models.Assessment:
                extra["status"] = "draft"
        serializer.save(**extra)

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.is_staff or self.request.user.is_superuser:
            return queryset
        teacher = self._teacher()
        if not teacher:
            return queryset.none()
        if self.scope_via:
            prefix = self.scope_via.replace(".", "__") + "__"
            assignment_scope = TeacherAssignment.objects.filter(
                organization=teacher.organization, teacher=teacher, is_active=True, assignment_status="accepted"
            )
            course_ids = assignment_scope.values_list("course_id", flat=True)
            subject_ids = assignment_scope.exclude(subject__isnull=True).values_list("subject_id", flat=True)
            head_course_ids = assignment_scope.filter(role="head_teacher").values_list("course_id", flat=True)
            scoped = Q(**{f"{prefix}course_id__in": head_course_ids}) | (
                Q(**{f"{prefix}course_id__in": course_ids})
                & (Q(**{f"{prefix}subject__isnull": True}) | Q(**{f"{prefix}subject_id__in": subject_ids}))
            )
            return queryset.filter(scoped)
        if hasattr(queryset.model, "created_by_teacher"):
            head_course_ids = TeacherAssignment.objects.filter(
                organization=teacher.organization, teacher=teacher, role="head_teacher", is_active=True, assignment_status="accepted"
            ).values_list("course_id", flat=True)
            return queryset.filter(Q(created_by_teacher=teacher) | Q(course_id__in=head_course_ids))
        return queryset

    @action(detail=True, methods=["post"])
    def review(self, request, pk=None):
        item = self.get_object()
        if not isinstance(item, (models.CourseMaterial, models.Assessment)):
            return Response({"detail": "Only materials and assessments require head teacher review."}, status=status.HTTP_400_BAD_REQUEST)
        teacher = self._teacher()
        if not teacher or not self._is_head_teacher(teacher, item.course_id, item.course_section_id):
            return Response({"detail": "Only the head teacher can review this content."}, status=status.HTTP_403_FORBIDDEN)
        decision = request.data.get("decision")
        if decision not in {"approve", "reject"}:
            return Response({"detail": "Decision must be approve or reject."}, status=status.HTTP_400_BAD_REQUEST)
        item.review_status = "approved" if decision == "approve" else "rejected"
        item.reviewed_by = teacher
        item.reviewed_at = timezone.now()
        item.review_note = request.data.get("note", "")
        item.updated_by = request.user
        if decision == "approve":
            if isinstance(item, models.CourseMaterial):
                item.is_published = True
                item.status = "published"
            elif isinstance(item, models.Assessment):
                item.status = request.data.get("publish_status", "published")
                item.published_at = timezone.now()
        elif isinstance(item, models.CourseMaterial):
            item.is_published = False
            item.status = "draft"
        item.save()
        return Response(self.get_serializer(item).data)


class CourseMaterialViewSet(AssessmentAdminViewSet):
    queryset = models.CourseMaterial.objects.select_related("course", "course_section", "subject", "created_by_teacher")
    serializer_class = serializers.CourseMaterialSerializer
    search_fields = ("title", "description", "course__title", "subject__name")
    filterset_fields = ("course", "course_section", "subject", "material_type", "is_published")


class QuestionViewSet(AssessmentAdminViewSet):
    queryset = models.Question.objects.select_related("course", "course_section", "subject", "created_by_teacher").prefetch_related("options")
    serializer_class = serializers.QuestionSerializer
    search_fields = ("text", "course__title", "subject__name")
    filterset_fields = ("course", "course_section", "subject", "created_by_teacher", "question_type", "status")


class QuestionOptionViewSet(AssessmentAdminViewSet):
    queryset = models.QuestionOption.objects.select_related("question")
    serializer_class = serializers.QuestionOptionSerializer
    filterset_fields = ("question", "is_correct")
    scope_via = "question"


class AssessmentViewSet(AssessmentAdminViewSet):
    queryset = models.Assessment.objects.select_related("course", "course_section", "subject", "created_by_teacher")
    serializer_class = serializers.AssessmentSerializer
    search_fields = ("title", "course__title", "subject__name")
    filterset_fields = ("assessment_type", "course", "course_section", "subject", "status")

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        assessment = self.get_object()
        teacher = self._teacher()
        if not teacher or not self._is_head_teacher(teacher, assessment.course_id, assessment.course_section_id):
            return Response({"detail": "Head teacher approval is required before publishing."}, status=status.HTTP_403_FORBIDDEN)
        assessment.review_status = "approved"
        assessment.reviewed_by = teacher
        assessment.reviewed_at = timezone.now()
        assessment.status = models.AssessmentStatus.PUBLISHED
        assessment.published_at = timezone.now()
        assessment.updated_by = request.user
        assessment.save(update_fields=["status", "review_status", "reviewed_by", "reviewed_at", "published_at", "updated_by", "updated_at"])
        return success_response(self.get_serializer(assessment).data, "Assessment published.")

    @action(detail=False, methods=["post"], url_path="generate-practice")
    def generate_practice(self, request):
        """Rule-based practice-set generation (spec §10) - selects existing Question
        Bank rows matching teacher-chosen topics/difficulty, no AI. Created as a draft
        practice Assessment targeted at the given students via allowed_students, so the
        teacher reviews the auto-picked questions (in the existing AssessmentBuilder)
        before publishing - same review/publish flow as any other assessment."""
        teacher = self._teacher()
        if not teacher:
            return Response({"detail": "Teacher record not found."}, status=404)

        student_ids = request.data.get("student_ids") or []
        subject_id = request.data.get("subject_id")
        topics = request.data.get("topics") or []
        title = request.data.get("title") or "Recovery Practice"
        difficulty_mix = request.data.get("difficulty_mix") or {"easy": 5, "medium": 10, "hard": 5}

        if not student_ids or not subject_id:
            return Response({"detail": "student_ids and subject_id are required."}, status=400)

        subject = CourseSubject.objects.filter(organization=self.get_request_organization(), id=subject_id).select_related("course_section").first()
        if not subject:
            return Response({"detail": "Subject not found."}, status=404)
        course_id = subject.course_section.course_id
        self._ensure_scope(teacher, course_id, subject.course_section_id, subject.id)

        selected_questions = []
        for difficulty, count in difficulty_mix.items():
            if not count:
                continue
            pool = models.Question.objects.filter(organization=self.get_request_organization(), subject=subject, difficulty=difficulty, status="active")
            if topics:
                topic_filter = Q()
                for topic in topics:
                    topic_filter |= Q(topic__iexact=topic) | Q(chapter__iexact=topic)
                pool = pool.filter(topic_filter)
            selected_questions.extend(pool.order_by("?")[:int(count)])

        if not selected_questions:
            return Response({"detail": "No matching questions found in the Question Bank for these topics/difficulty."}, status=400)

        from .services import create_practice_assessment
        is_head = self._is_head_teacher(teacher, course_id, subject.course_section_id)
        assessment = create_practice_assessment(
            organization=self.get_request_organization(), title=title, course_id=course_id,
            course_section_id=subject.course_section_id, subject_id=subject.id,
            chapter_label=", ".join(topics) if topics else "", questions=selected_questions,
            student_ids=student_ids, user=request.user, created_by_teacher=teacher, auto_publish=is_head,
        )
        return success_response(self.get_serializer(assessment).data, f"Practice set created with {len(selected_questions)} questions - review and publish when ready.")


class AssessmentQuestionViewSet(AssessmentAdminViewSet):
    queryset = models.AssessmentQuestion.objects.select_related("assessment", "question")
    serializer_class = serializers.AssessmentQuestionSerializer
    filterset_fields = ("assessment", "question")
    scope_via = "assessment"


class AttemptViewSet(AssessmentAdminViewSet):
    queryset = models.AssessmentAttempt.objects.select_related("assessment", "student")
    serializer_class = serializers.AssessmentAttemptSerializer
    filterset_fields = ("assessment", "student", "status")
    scope_via = "assessment"


class AssignmentSubmissionViewSet(AssessmentAdminViewSet):
    queryset = models.AssignmentSubmission.objects.select_related("assessment", "student", "evaluated_by").prefetch_related("attachments")
    serializer_class = serializers.AssignmentSubmissionSerializer
    filterset_fields = ("assessment", "student", "status", "evaluated_by")
    scope_via = "assessment"

    @action(detail=True, methods=["post"])
    def evaluate(self, request, pk=None):
        teacher = self._teacher()
        if not teacher and not request.user.is_staff and not request.user.is_superuser:
            return Response({"detail": "Teacher record not found."}, status=status.HTTP_403_FORBIDDEN)
        # self.get_object() runs against the now subject-scoped get_queryset(), so a teacher
        # without an accepted assignment covering this submission's course/subject gets 404
        # here rather than being able to grade it.
        submission = self.get_object()
        submission = AssessmentService.evaluate_submission(
            submission,
            teacher,
            request.data.get("marks_obtained", 0),
            request.data.get("feedback", ""),
            request.user,
        )
        return Response(self.get_serializer(submission).data)


class SubmissionAttachmentViewSet(AssessmentAdminViewSet):
    queryset = models.SubmissionAttachment.objects.select_related("submission", "submission__assessment")
    serializer_class = serializers.SubmissionAttachmentSerializer
    filterset_fields = ("submission", "content_type")
    scope_via = "submission.assessment"


class StudentAssessmentViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = serializers.AssessmentSerializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "assessment_submit"

    def get_throttles(self):
        if self.action in {"submit", "submit_assignment"}:
            return super().get_throttles()
        return []

    def get_queryset(self):
        user = self.request.user
        student = Student.objects.filter(organization=user.organization, email=user.email).first()
        if not student:
            return models.Assessment.objects.none()
        active_enrollments = student.course_enrollments.filter(status="active")
        enrolled_course_ids = active_enrollments.values_list("course_id", flat=True)
        enrolled_section_ids = active_enrollments.values_list("course_section_id", flat=True)
        now = timezone.now()
        return models.Assessment.objects.filter(
            organization=user.organization,
            course_id__in=enrolled_course_ids,
            status__in=[models.AssessmentStatus.PUBLISHED, models.AssessmentStatus.SCHEDULED, models.AssessmentStatus.LIVE],
            review_status=models.ContentReviewStatus.APPROVED,
        ).filter(
            Q(course_section__isnull=True) | Q(course_section_id__in=enrolled_section_ids),
            released_content(now),
            Q(publish_at__isnull=True) | Q(publish_at__lte=now),
            # Deliberately NOT filtering starts_at__lte=now here - a published,
            # future-scheduled assessment must stay visible so the student portal
            # can show it under "Upcoming" (AssessmentService.ensure_assessment_open
            # independently re-validates starts_at before a student can actually
            # start an attempt, so this doesn't weaken the real start-time gate).
            Q(ends_at__isnull=True) | Q(ends_at__gte=now),
            # Individually-targeted assessments (e.g. personalized practice, allowed_students
            # non-empty) were previously visible to every enrolled student even though
            # start/submit already blocked them - this was a real visibility gap.
            Q(allowed_students__isnull=True) | Q(allowed_students=student),
        ).select_related("course", "course_section", "subject").distinct()

    @action(detail=False, methods=["get"])
    def materials(self, request):
        student = Student.objects.filter(organization=request.user.organization, email=request.user.email).first()
        if not student:
            return Response([])
        active_enrollments = student.course_enrollments.filter(status=EnrollmentStatus.ACTIVE)
        enrolled_course_ids = active_enrollments.values_list("course_id", flat=True)
        enrolled_section_ids = active_enrollments.values_list("course_section_id", flat=True)
        materials = models.CourseMaterial.objects.filter(
            organization=request.user.organization,
            course_id__in=enrolled_course_ids,
            is_published=True,
            status="published",
            review_status=models.ContentReviewStatus.APPROVED,
        ).filter(
            Q(course_section__isnull=True) | Q(course_section_id__in=enrolled_section_ids),
            released_content(),
            Q(publish_at__isnull=True) | Q(publish_at__lte=timezone.now()),
        ).select_related("course", "course_section", "subject", "created_by_teacher")
        return Response(serializers.CourseMaterialSerializer(materials, many=True).data)

    @action(detail=True, methods=["post"])
    def start(self, request, pk=None):
        student = Student.objects.filter(organization=request.user.organization, email=request.user.email).first()
        if not student:
            return Response({"detail": "Student record not found."}, status=404)
        attempt = AssessmentService.start_attempt(self.get_object(), student, request.user)
        return Response(serializers.StudentAttemptSerializer(attempt, context={"request": request}).data)

    @action(detail=True, methods=["post"])
    def answer(self, request, pk=None):
        student = Student.objects.filter(organization=request.user.organization, email=request.user.email).first()
        if not student:
            return Response({"detail": "Student record not found."}, status=404)
        attempt = models.AssessmentAttempt.objects.filter(
            id=request.data.get("attempt"),
            assessment=self.get_object(),
            student=student,
        ).first()
        if not attempt:
            return Response({"detail": "Active attempt not found for this assessment."}, status=400)
        question = models.Question.objects.filter(id=request.data.get("question")).first()
        if not question:
            return Response({"detail": "Question not found."}, status=400)
        answer = AssessmentService.save_answer(attempt, question, request.data.get("selected_options", []), request.user)
        return Response(serializers.StudentAnswerSerializer(answer).data)

    @action(detail=True, methods=["post"])
    def submit(self, request, pk=None):
        student = Student.objects.filter(organization=request.user.organization, email=request.user.email).first()
        if not student:
            return Response({"detail": "Student record not found."}, status=404)
        attempt = models.AssessmentAttempt.objects.filter(
            id=request.data.get("attempt"),
            assessment=self.get_object(),
            student=student,
        ).first()
        if not attempt:
            return Response({"detail": "Active attempt not found for this assessment."}, status=400)
        attempt = AssessmentService.submit_attempt(attempt, request.user)
        return Response(serializers.AssessmentAttemptSerializer(attempt).data)

    @action(detail=False, methods=["get"])
    def dashboard(self, request):
        student = Student.objects.filter(organization=request.user.organization, email=request.user.email).first()
        queryset = self.get_queryset()
        now = timezone.now()
        available = queryset.filter(
            status__in=[models.AssessmentStatus.PUBLISHED, models.AssessmentStatus.SCHEDULED, models.AssessmentStatus.LIVE]
        ).filter(
            Q(starts_at__isnull=True) | Q(starts_at__lte=now),
            Q(ends_at__isnull=True) | Q(ends_at__gte=now),
        )
        results = (
            models.AssessmentAttempt.objects.filter(student=student).exclude(status=models.AttemptStatus.IN_PROGRESS)[:10]
            if student
            else models.AssessmentAttempt.objects.none()
        )
        data = {
            "upcoming_tests": queryset.filter(starts_at__gt=now).count(),
            "live_tests": [serializers.AssessmentSerializer(item).data for item in available[:10]],
            "results": serializers.AssessmentAttemptSerializer(results, many=True).data,
        }
        return Response(data)

    @action(detail=True, methods=["post"])
    def submit_assignment(self, request, pk=None):
        student = Student.objects.filter(organization=request.user.organization, email=request.user.email).first()
        if not student:
            return Response({"detail": "Student record not found."}, status=404)
        submission = AssessmentService.submit_assignment(self.get_object(), student, request.FILES.getlist("files"), request.user)
        return Response(serializers.AssignmentSubmissionSerializer(submission).data)

    @action(detail=False, methods=["get"])
    def performance(self, request):
        student = Student.objects.filter(organization=request.user.organization, email=request.user.email).first()
        if not student:
            return Response({"detail": "Student record not found."}, status=404)
        return Response(AssessmentService.student_performance(student))

    @action(detail=False, methods=["get"])
    def history(self, request):
        student = Student.objects.filter(organization=request.user.organization, email=request.user.email).first()
        if not student:
            return Response({"attempts": [], "submissions": []})
        attempts = models.AssessmentAttempt.objects.filter(student=student).exclude(status=models.AttemptStatus.IN_PROGRESS)
        submissions = models.AssignmentSubmission.objects.filter(student=student)
        return Response({
            "attempts": serializers.AssessmentAttemptSerializer(attempts, many=True).data,
            "submissions": serializers.AssignmentSubmissionSerializer(submissions, many=True).data,
        })

    @action(detail=False, methods=["get"])
    def recommended(self, request):
        """"Recommended for You" (spec §13/§60) - open interventions with a linked
        practice set, plus recent feedback, for the logged-in student only."""
        student = Student.objects.filter(organization=request.user.organization, email=request.user.email).first()
        if not student:
            return Response({"interventions": [], "feedback": []})
        interventions = models.StudentIntervention.objects.filter(
            organization=request.user.organization, student=student,
        ).exclude(status=models.InterventionStatus.COMPLETED).select_related("subject", "linked_practice_assessment", "created_by_teacher").order_by("-created_at")[:10]
        feedback = models.StudentFeedback.objects.filter(
            organization=request.user.organization, student=student,
        ).select_related("subject", "created_by_teacher").order_by("-created_at")[:10]
        return Response({
            "interventions": serializers.StudentInterventionSerializer(interventions, many=True).data,
            "feedback": serializers.StudentFeedbackSerializer(feedback, many=True).data,
        })

    def _student(self, request):
        return Student.objects.filter(organization=request.user.organization, email=request.user.email).first()

    @action(detail=False, methods=["get"])
    def actions(self, request):
        """Spec §9-10: full list of the student's own interventions - read-only, no
        status field the student can write. Completion is server-derived only
        (see AssessmentService.submit_attempt/submit_assignment)."""
        student = self._student(request)
        if not student:
            return Response([])
        interventions = models.StudentIntervention.objects.filter(
            organization=request.user.organization, student=student,
        ).select_related("subject", "linked_practice_assessment", "created_by_teacher").order_by("-created_at")
        return Response(serializers.StudentInterventionSerializer(interventions, many=True).data)

    @action(detail=False, methods=["get"])
    def feedback(self, request):
        """Own-record read for the student (StudentFeedbackViewSet.get_queryset is
        teacher-roster-scoped, not usable here)."""
        student = self._student(request)
        if not student:
            return Response([])
        feedback = models.StudentFeedback.objects.filter(
            organization=request.user.organization, student=student,
        ).select_related("subject", "created_by_teacher").order_by("-created_at")
        subject_id = request.query_params.get("subject")
        if subject_id:
            feedback = feedback.filter(subject_id=subject_id)
        return Response(serializers.StudentFeedbackSerializer(feedback, many=True).data)

    @action(detail=False, methods=["get"], url_path="weak-topics")
    def weak_topics(self, request):
        """Spec §19-21 - calls the exact same function the teacher 360-profile
        endpoint calls (AnalyticsViewSet.student_profile), so a topic's accuracy
        number is provably identical for teacher and student (§20/§66)."""
        student = self._student(request)
        if not student:
            return Response([])
        from .services import weak_topics_for_student
        subject_id = request.query_params.get("subject")
        subject_ids = [subject_id] if subject_id else None
        return Response(weak_topics_for_student(student, request.user.organization, subject_ids=subject_ids))

    @action(detail=False, methods=["get"])
    def practice(self, request):
        """Practice-type assessments visible to the student (already correctly
        filtered by allowed_students via get_queryset), sectioned client-side into
        Recommended/Recovery/Regular by whether an open StudentIntervention links to them."""
        student = self._student(request)
        if not student:
            return Response([])
        assessments = self.get_queryset().filter(timing_mode=models.TimingMode.PRACTICE)
        linked_ids = set(
            models.StudentIntervention.objects.filter(
                organization=request.user.organization, student=student, linked_practice_assessment__isnull=False,
            ).values_list("linked_practice_assessment_id", "status")
        )
        recommended_ids = {aid for aid, status_ in linked_ids if status_ != models.InterventionStatus.COMPLETED}
        recovery_ids = {aid for aid, _ in linked_ids}
        data = serializers.AssessmentSerializer(assessments, many=True).data
        for row in data:
            row["is_recommended"] = row["id"] in recommended_ids
            row["is_recovery"] = row["id"] in recovery_ids
        return Response(data)

    @action(detail=False, methods=["get"])
    def mistakes(self, request):
        """Spec §22-24 - incorrect answers the student is allowed to review,
        gated by each assessment's own show_correct_answers/show_explanations flags."""
        student = self._student(request)
        if not student:
            return Response([])
        from .services import student_mistakes
        return Response(student_mistakes(
            student, request.user.organization,
            subject_id=request.query_params.get("subject"),
            chapter=request.query_params.get("chapter"),
            topic=request.query_params.get("topic"),
        ))

    @action(detail=False, methods=["post"], url_path="mistakes/practice")
    def mistakes_practice(self, request):
        """Spec §24 - creates a NEW auto-published practice assessment from selected
        wrong questions; never touches the original attempt/result."""
        student = self._student(request)
        if not student:
            return Response({"detail": "Student record not found."}, status=404)
        answer_ids = request.data.get("answer_ids") or []
        answers = models.StudentAnswer.objects.filter(
            id__in=answer_ids, attempt__student=student, is_correct=False,
        ).select_related("question", "attempt__assessment")
        if not answers:
            return Response({"detail": "No matching mistakes found."}, status=400)
        first_assessment = answers[0].attempt.assessment
        questions = [answer.question for answer in answers]
        from .services import create_practice_assessment
        assessment = create_practice_assessment(
            organization=request.user.organization, title=f"Practice: My Mistakes ({timezone.now().strftime('%b %d')})",
            course_id=first_assessment.course_id, course_section_id=first_assessment.course_section_id,
            subject_id=first_assessment.subject_id, chapter_label="My Mistakes",
            questions=questions, student_ids=[student.id], user=request.user, auto_publish=True,
        )
        return Response(serializers.AssessmentSerializer(assessment).data, status=201)


class AnalyticsViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def _teacher(self, request):
        return Employee.objects.filter(organization=request.user.organization, email=request.user.email, employee_type="teacher").first()

    @action(detail=False, methods=["get"])
    def teacher(self, request):
        teacher = self._teacher(request)
        if not teacher:
            return Response({"detail": "Teacher record not found."}, status=404)
        return Response(AssessmentService.teacher_analytics(teacher))

    @action(detail=False, methods=["get"], url_path="risk-thresholds")
    def risk_thresholds(self, request):
        from .services import RISK_THRESHOLDS
        return Response(RISK_THRESHOLDS)

    @action(detail=False, methods=["get"], url_path="students")
    def students(self, request):
        from .services import performance_center_rows
        teacher = self._teacher(request)
        if not teacher and not (request.user.is_staff or request.user.is_superuser):
            return Response({"detail": "Teacher record not found."}, status=404)
        if not teacher:
            return Response([])
        subject_id = request.query_params.get("subject")
        rows = performance_center_rows(teacher, request.user.organization, subject_id=subject_id)
        if request.query_params.get("flag") == "attention":
            rows = [row for row in rows if row["academic_status"] == "needs_attention"]
        return Response(rows)

    @action(detail=False, methods=["get"], url_path=r"students/(?P<student_id>[^/.]+)/profile")
    def student_profile(self, request, student_id=None):
        from .services import learning_timeline_for_student, performance_center_rows, teacher_scope, weak_topics_for_student

        teacher = self._teacher(request)
        if not teacher and not (request.user.is_staff or request.user.is_superuser):
            raise PermissionDenied("Teacher record not found.")

        student = Student.objects.filter(organization=request.user.organization, id=student_id).first()
        if not student:
            return Response({"detail": "Student not found."}, status=404)

        scope = teacher_scope(teacher, request.user.organization) if teacher else None
        enrollments = Enrollment.objects.filter(
            organization=request.user.organization, student=student, status=EnrollmentStatus.ACTIVE,
        ).select_related("course")
        if scope is not None:
            enrollments = enrollments.filter(course_id__in=scope["course_ids"])
        if not enrollments.exists() and not (request.user.is_staff or request.user.is_superuser):
            raise PermissionDenied("This student is not in your assigned courses.")

        subject_ids = scope["subject_ids"] if scope is not None else None

        summary = None
        if teacher:
            summary = next((row for row in performance_center_rows(teacher, request.user.organization) if row["student_id"] == student.id), None)

        tests_qs = models.AssessmentAttempt.objects.filter(organization=request.user.organization, student=student).exclude(status=models.AttemptStatus.IN_PROGRESS).select_related("assessment").order_by("-submitted_at")
        if subject_ids:
            tests_qs = tests_qs.filter(assessment__subject_id__in=subject_ids)
        assignments_qs = models.AssignmentSubmission.objects.filter(organization=request.user.organization, student=student).select_related("assessment").order_by("-submitted_at")
        if subject_ids:
            assignments_qs = assignments_qs.filter(assessment__subject_id__in=subject_ids)

        notes_qs = models.TeacherPrivateNote.objects.filter(organization=request.user.organization, student=student).select_related("created_by_teacher").order_by("-created_at")
        interventions_qs = models.StudentIntervention.objects.filter(organization=request.user.organization, student=student).select_related("created_by_teacher", "subject", "linked_practice_assessment").order_by("-created_at")
        feedback_qs = models.StudentFeedback.objects.filter(organization=request.user.organization, student=student).select_related("created_by_teacher", "subject").order_by("-created_at")

        return Response({
            "student": {
                "id": student.id, "student_id": student.student_id, "full_name": student.full_name,
                "email": student.email, "photo": student.photo.url if student.photo else "", "status": student.status,
            },
            "enrollments": [{"id": e.id, "course_id": e.course_id, "course_title": e.course.title} for e in enrollments],
            "summary": summary,
            "weak_topics": weak_topics_for_student(student, request.user.organization, subject_ids),
            "timeline": learning_timeline_for_student(student, request.user.organization),
            "tests": [{
                "id": a.id, "assessment": a.assessment.title, "subject_id": a.assessment.subject_id,
                "score": a.score, "total_marks": a.total_marks, "status": a.status, "submitted_at": a.submitted_at,
            } for a in tests_qs[:50]],
            "assignments": [{
                "id": s.id, "assessment": s.assessment.title, "subject_id": s.assessment.subject_id,
                "status": s.status, "marks_obtained": s.marks_obtained, "total_marks": s.total_marks, "submitted_at": s.submitted_at,
            } for s in assignments_qs[:50]],
            "teacher_notes": [{"id": n.id, "note": n.note, "teacher_name": n.created_by_teacher.full_name, "created_at": n.created_at} for n in notes_qs] if teacher else [],
            "interventions": serializers.StudentInterventionSerializer(interventions_qs, many=True).data,
            "feedback": serializers.StudentFeedbackSerializer(feedback_qs, many=True).data,
        })

    @action(detail=False, methods=["get"], url_path="subject/(?P<subject_id>[^/.]+)")
    def subject(self, request, subject_id=None):
        subject = CourseSubject.objects.filter(organization=request.user.organization, id=subject_id).select_related("course_section").first()
        if not subject:
            return Response({"detail": "Subject not found."}, status=404)
        if not request.user.is_staff and not request.user.is_superuser:
            teacher = Employee.objects.filter(organization=request.user.organization, email=request.user.email, employee_type="teacher").first()
            has_access = teacher and TeacherAssignment.objects.filter(
                organization=teacher.organization,
                teacher=teacher,
                is_active=True,
                assignment_status="accepted",
            ).filter(
                Q(subject_id=subject.id) | Q(subject__isnull=True, course_id=subject.course_section.course_id)
            ).exists()
            if not has_access:
                return Response({"detail": "You are not assigned to this subject."}, status=status.HTTP_403_FORBIDDEN)
        return Response(AssessmentService.subject_performance(subject))



class TeacherScopedStudentRecordViewSet(OrganizationScopedModelViewSet):
    """Shared base for StudentIntervention/StudentFeedback/TeacherPrivateNote: only
    visible/creatable for students within the requesting teacher's course scope
    (their assigned subjects, or every subject if they head the course)."""

    permission_classes = [permissions.IsAuthenticated]

    def _teacher(self):
        return Employee.objects.filter(organization=self.get_request_organization(), email=self.request.user.email, employee_type="teacher").first()

    def get_queryset(self):
        from .services import students_in_scope

        queryset = super().get_queryset()
        if self.request.user.is_staff or self.request.user.is_superuser:
            return queryset
        teacher = self._teacher()
        if not teacher:
            return queryset.none()
        student_ids = students_in_scope(teacher, self.get_request_organization()).values_list("student_id", flat=True)
        return queryset.filter(student_id__in=student_ids)

    def _ensure_student_in_scope(self, teacher, student_id):
        from .services import students_in_scope

        if self.request.user.is_staff or self.request.user.is_superuser:
            return
        if not teacher:
            raise PermissionDenied("Teacher record not found.")
        if not students_in_scope(teacher, self.get_request_organization()).filter(student_id=student_id).exists():
            raise PermissionDenied("This student is not in your assigned courses.")

    def perform_create(self, serializer):
        teacher = self._teacher()
        student = serializer.validated_data.get("student")
        self._ensure_student_in_scope(teacher, student.id)
        serializer.save(organization=self.get_request_organization(), created_by_teacher=teacher, created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)


class StudentInterventionViewSet(TeacherScopedStudentRecordViewSet):
    queryset = models.StudentIntervention.objects.select_related("student", "subject", "created_by_teacher", "linked_practice_assessment")
    serializer_class = serializers.StudentInterventionSerializer
    filterset_fields = ("student", "subject", "status", "intervention_type")

    def perform_create(self, serializer):
        super().perform_create(serializer)
        instance = serializer.instance
        _notify_student(
            self.get_request_organization(), instance.student, self.request.user,
            title="New academic intervention", body=instance.reason,
            notification_type="intervention_created", target_url="/student/dashboard",
        )


class StudentFeedbackViewSet(TeacherScopedStudentRecordViewSet):
    queryset = models.StudentFeedback.objects.select_related("student", "subject", "created_by_teacher")
    serializer_class = serializers.StudentFeedbackSerializer
    filterset_fields = ("student", "subject")
    http_method_names = ["get", "post", "head", "options"]

    def perform_create(self, serializer):
        super().perform_create(serializer)
        instance = serializer.instance
        _notify_student(
            self.get_request_organization(), instance.student, self.request.user,
            title="New feedback from your teacher", body=instance.body,
            notification_type="teacher_feedback", target_url="/student/dashboard",
        )


class TeacherPrivateNoteViewSet(TeacherScopedStudentRecordViewSet):
    """Private teacher/head-teacher observations - never exposed to any
    student-facing endpoint (enforced structurally: no student view references
    this model at all, not just a permission flag that could be forgotten)."""

    queryset = models.TeacherPrivateNote.objects.select_related("student", "created_by_teacher")
    serializer_class = serializers.TeacherPrivateNoteSerializer
    filterset_fields = ("student",)
    http_method_names = ["get", "post", "head", "options"]


class StudentBookmarkViewSet(OrganizationScopedModelViewSet):
    """Self-service only - a student bookmarking a question for later review.
    Always scoped to the requesting student's own records, never another student's."""

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = serializers.StudentBookmarkSerializer
    http_method_names = ["get", "post", "delete", "head", "options"]

    def _student(self):
        return Student.objects.filter(organization=self.get_request_organization(), email=self.request.user.email).first()

    def get_queryset(self):
        student = self._student()
        if not student:
            return models.StudentBookmark.objects.none()
        return models.StudentBookmark.objects.filter(
            organization=self.get_request_organization(), student=student,
        ).select_related("question").order_by("-created_at")

    def perform_create(self, serializer):
        student = self._student()
        if not student:
            raise PermissionDenied("Student record not found.")
        serializer.save(organization=self.get_request_organization(), student=student, created_by=self.request.user, updated_by=self.request.user)


class AssessmentComponentViewSet(HeadTeacherCourseScopeMixin, OrganizationScopedModelViewSet):
    """Head-teacher-managed assessment scheme rows for one course subject. Previously
    had NO write-scope check at all (any authenticated teacher could edit any course's
    grading scheme org-wide) - HeadTeacherCourseScopeMixin closes that gap."""

    queryset = models.AssessmentComponent.objects.select_related("course_subject").prefetch_related("source_assessments")
    serializer_class = serializers.AssessmentComponentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ("course_subject", "status")
    course_lookup = "course_subject__course_section__course_id"

    def _target_course_id(self, serializer):
        course_subject = serializer.validated_data.get("course_subject") or serializer.instance.course_subject
        return course_subject.course_section.course_id

    def _instance_course_id(self, instance):
        return instance.course_subject.course_section.course_id

    def perform_create(self, serializer):
        self.ensure_head_teacher_write(serializer)
        super().perform_create(serializer)

    def perform_update(self, serializer):
        self.ensure_head_teacher_write(serializer)
        super().perform_update(serializer)

    def perform_destroy(self, instance):
        self.ensure_head_teacher_destroy(instance)
        super().perform_destroy(instance)


class CourseGradeScaleViewSet(HeadTeacherCourseScopeMixin, OrganizationScopedModelViewSet):
    """Previously had NO write-scope check at all - see AssessmentComponentViewSet."""

    queryset = models.CourseGradeScale.objects.select_related("course").prefetch_related("items")
    serializer_class = serializers.CourseGradeScaleSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ("course", "is_active")

    def _target_course_id(self, serializer):
        course = serializer.validated_data.get("course") or serializer.instance.course
        return course.id

    def _instance_course_id(self, instance):
        return instance.course_id

    def perform_create(self, serializer):
        self.ensure_head_teacher_write(serializer)
        super().perform_create(serializer)

    def perform_update(self, serializer):
        self.ensure_head_teacher_write(serializer)
        super().perform_update(serializer)

    def perform_destroy(self, instance):
        self.ensure_head_teacher_destroy(instance)
        super().perform_destroy(instance)


class CourseGradeScaleItemViewSet(HeadTeacherCourseScopeMixin, OrganizationScopedModelViewSet):
    """Previously had NO write-scope check at all - see AssessmentComponentViewSet."""

    queryset = models.CourseGradeScaleItem.objects.select_related("grade_scale")
    serializer_class = serializers.CourseGradeScaleItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ("grade_scale",)
    course_lookup = "grade_scale__course_id"

    def _target_course_id(self, serializer):
        grade_scale = serializer.validated_data.get("grade_scale") or serializer.instance.grade_scale
        return grade_scale.course_id

    def _instance_course_id(self, instance):
        return instance.grade_scale.course_id

    def perform_create(self, serializer):
        self.ensure_head_teacher_write(serializer)
        super().perform_create(serializer)

    def perform_update(self, serializer):
        self.ensure_head_teacher_write(serializer)
        super().perform_update(serializer)

    def perform_destroy(self, instance):
        self.ensure_head_teacher_destroy(instance)
        super().perform_destroy(instance)


class CourseRatingViewSet(OrganizationScopedModelViewSet):
    """Self-service only - a student rating a course subject after real completion.
    Always scoped to the requesting student's own records."""

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = serializers.CourseRatingSerializer
    http_method_names = ["get", "post", "patch", "head", "options"]

    def _student(self):
        return Student.objects.filter(organization=self.get_request_organization(), email=self.request.user.email).first()

    def get_queryset(self):
        student = self._student()
        if not student:
            return models.CourseRating.objects.none()
        return models.CourseRating.objects.filter(organization=self.get_request_organization(), student=student)

    def perform_create(self, serializer):
        student = self._student()
        if not student:
            raise PermissionDenied("Student record not found.")
        enrollment = serializer.validated_data.get("enrollment")
        if not enrollment or enrollment.student_id != student.id:
            raise PermissionDenied("You can only rate your own enrollment.")
        course_result = models.StudentCourseResult.objects.filter(
            enrollment=enrollment, course_subject=serializer.validated_data.get("course_subject"),
            status=models.CourseResultStatus.PUBLISHED,
        ).first()
        if not course_result:
            raise ValidationError("Course rating is only available after your result is published.")
        serializer.save(organization=self.get_request_organization(), student=student, created_by=self.request.user, updated_by=self.request.user)


class GradebookViewSet(viewsets.ViewSet):
    """Teacher/head-teacher gradebook for one course subject - the single place raw
    marks, weighted marks, and final results are viewed/edited/calculated/published.
    Registered at the course-subject level (pk = CourseSubject id)."""

    permission_classes = [permissions.IsAuthenticated]

    def _teacher(self, request):
        return Employee.objects.filter(organization=request.user.organization, email=request.user.email, employee_type="teacher").first()

    def _subject(self, request, pk):
        subject = CourseSubject.objects.filter(
            organization=request.user.organization, id=pk,
        ).select_related("course_section__course").first()
        if not subject:
            raise NotFound("Course subject not found.")
        if not (request.user.is_staff or request.user.is_superuser):
            from .services import ensure_teacher_subject_scope
            ensure_teacher_subject_scope(self._teacher(request), request.user.organization, subject)
        return subject

    def retrieve(self, request, pk=None):
        subject = self._subject(request, pk)
        components = list(subject.assessment_components.filter(status="active").order_by("order"))
        enrollments = Enrollment.objects.filter(
            organization=request.user.organization, course=subject.course_section.course, status=EnrollmentStatus.ACTIVE,
        ).select_related("student").order_by("student__full_name")

        results_by_enrollment = {
            r.enrollment_id: r
            for r in models.StudentCourseResult.objects.filter(
                enrollment__in=enrollments, course_subject=subject,
            ).prefetch_related("component_results")
        }
        rows = []
        for enrollment in enrollments:
            course_result = results_by_enrollment.get(enrollment.id)
            component_by_id = {cr.component_id: cr for cr in course_result.component_results.all()} if course_result else {}
            rows.append({
                "enrollment_id": enrollment.id,
                "student_id": enrollment.student_id,
                "student_name": enrollment.student.full_name,
                "result_status": course_result.status if course_result else "not_calculated",
                "total_percentage": course_result.total_percentage if course_result else None,
                "grade": course_result.grade if course_result else "",
                "grade_point": course_result.grade_point if course_result else None,
                "components": [
                    {
                        "component_id": component.id,
                        "raw_obtained": component_by_id[component.id].raw_obtained if component.id in component_by_id else None,
                        "raw_total": component.total_marks,
                        "weighted_score": component_by_id[component.id].weighted_score if component.id in component_by_id else None,
                        "data_status": component_by_id[component.id].data_status if component.id in component_by_id else "not_attempted",
                        "is_manual": component_by_id[component.id].is_manual if component.id in component_by_id else False,
                    }
                    for component in components
                ],
            })
        return Response({
            "course_subject": {"id": subject.id, "name": subject.name, "course": subject.course_section.course.title},
            "components": serializers.AssessmentComponentSerializer(components, many=True).data,
            "students": rows,
        })

    @action(detail=True, methods=["post"])
    def calculate(self, request, pk=None):
        from .services import calculate_course_result

        subject = self._subject(request, pk)
        enrollments = Enrollment.objects.filter(
            organization=request.user.organization, course=subject.course_section.course, status=EnrollmentStatus.ACTIVE,
        )
        for enrollment in enrollments:
            calculate_course_result(enrollment, subject, user=request.user)
        return success_response(None, f"Recalculated results for {enrollments.count()} students.")

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        from .services import publish_course_result

        subject = self._subject(request, pk)
        enrollment_ids = request.data.get("enrollment_ids")
        results = models.StudentCourseResult.objects.filter(
            organization=request.user.organization, course_subject=subject,
            status__in=[models.CourseResultStatus.CALCULATED, models.CourseResultStatus.PUBLISHED],
        )
        if enrollment_ids:
            results = results.filter(enrollment_id__in=enrollment_ids)

        published, failed = 0, []
        for course_result in results:
            was_already_published = course_result.status == models.CourseResultStatus.PUBLISHED
            try:
                publish_course_result(course_result, request.user)
                if not was_already_published:
                    published += 1
            except ValidationError as error:
                detail = error.detail[0] if isinstance(error.detail, list) else error.detail
                failed.append({"enrollment_id": course_result.enrollment_id, "reason": str(detail)})
        return Response({"published": published, "failed": failed})

    @action(detail=True, methods=["post"], url_path="manual-mark")
    def manual_mark(self, request, pk=None):
        subject = self._subject(request, pk)
        enrollment_id = request.data.get("enrollment_id")
        component_id = request.data.get("component_id")
        obtained = request.data.get("obtained")
        comment = request.data.get("comment", "")

        component = models.AssessmentComponent.objects.filter(id=component_id, course_subject=subject).first()
        if not component:
            return Response({"detail": "Component not found for this subject."}, status=404)
        enrollment = Enrollment.objects.filter(id=enrollment_id, organization=request.user.organization, course=subject.course_section.course).first()
        if not enrollment:
            return Response({"detail": "Enrollment not found for this subject's course."}, status=404)
        try:
            obtained_decimal = None if obtained in (None, "") else round(float(obtained), 2)
        except (TypeError, ValueError):
            return Response({"detail": "Obtained marks must be a number."}, status=400)
        if obtained_decimal is not None and not (0 <= obtained_decimal <= float(component.total_marks)):
            return Response({"detail": f"Obtained marks must be between 0 and {component.total_marks}."}, status=400)

        course_result, _ = models.StudentCourseResult.objects.get_or_create(
            enrollment=enrollment, course_subject=subject,
            defaults={"organization": request.user.organization, "created_by": request.user, "updated_by": request.user},
        )
        if course_result.status == models.CourseResultStatus.LOCKED:
            return Response({"detail": "This result is locked."}, status=409)
        models.StudentComponentResult.objects.update_or_create(
            course_result=course_result, component=component,
            defaults={
                "organization": request.user.organization, "raw_obtained": obtained_decimal, "raw_total": component.total_marks,
                "data_status": models.ComponentDataStatus.COMPLETE if obtained_decimal is not None else models.ComponentDataStatus.MISSING,
                "is_manual": True, "manual_comment": comment,
                "updated_by_teacher": self._teacher(request), "created_by": request.user, "updated_by": request.user,
            },
        )
        from .services import calculate_course_result
        calculate_course_result(enrollment, subject, user=request.user)
        return success_response(None, "Manual mark saved.")

    @action(detail=True, methods=["post"], url_path="bulk-manual-marks")
    def bulk_manual_marks(self, request, pk=None):
        subject = self._subject(request, pk)
        component_id = request.data.get("component_id")
        marks = request.data.get("marks") or []
        component = models.AssessmentComponent.objects.filter(id=component_id, course_subject=subject).first()
        if not component:
            return Response({"detail": "Component not found for this subject."}, status=404)

        from .services import calculate_course_result
        saved, errors = 0, []
        for row in marks:
            enrollment = Enrollment.objects.filter(id=row.get("enrollment_id"), organization=request.user.organization, course=subject.course_section.course).first()
            if not enrollment:
                errors.append({"enrollment_id": row.get("enrollment_id"), "reason": "Enrollment not found."})
                continue
            try:
                obtained_decimal = round(float(row.get("obtained")), 2)
            except (TypeError, ValueError):
                errors.append({"enrollment_id": row.get("enrollment_id"), "reason": "Invalid mark."})
                continue
            if not (0 <= obtained_decimal <= float(component.total_marks)):
                errors.append({"enrollment_id": row.get("enrollment_id"), "reason": f"Must be between 0 and {component.total_marks}."})
                continue
            course_result, _ = models.StudentCourseResult.objects.get_or_create(
                enrollment=enrollment, course_subject=subject,
                defaults={"organization": request.user.organization, "created_by": request.user, "updated_by": request.user},
            )
            if course_result.status == models.CourseResultStatus.LOCKED:
                errors.append({"enrollment_id": row.get("enrollment_id"), "reason": "Result is locked."})
                continue
            models.StudentComponentResult.objects.update_or_create(
                course_result=course_result, component=component,
                defaults={
                    "organization": request.user.organization, "raw_obtained": obtained_decimal, "raw_total": component.total_marks,
                    "data_status": models.ComponentDataStatus.COMPLETE, "is_manual": True,
                    "updated_by_teacher": self._teacher(request), "created_by": request.user, "updated_by": request.user,
                },
            )
            calculate_course_result(enrollment, subject, user=request.user)
            saved += 1
        return Response({"saved": saved, "errors": errors})
