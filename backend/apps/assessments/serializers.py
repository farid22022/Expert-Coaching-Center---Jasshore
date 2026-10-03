from django.db.models import Sum
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from . import models
from .validators import validate_material_upload


class CurriculumContentSerializer(serializers.ModelSerializer):
    def validate(self, attrs):
        attrs = super().validate(attrs)
        chapter = attrs.get("curriculum_chapter", getattr(self.instance, "curriculum_chapter", None))
        if not chapter:
            return attrs
        subject = chapter.week.subject
        request = self.context.get("request")
        if request and chapter.organization_id != request.user.organization_id:
            raise serializers.ValidationError({"curriculum_chapter": "Choose a chapter in your organization."})
        expected = {"course": subject.course_section.course, "course_section": subject.course_section, "subject": subject}
        for field, target in expected.items():
            value = attrs.get(field, getattr(self.instance, field, None))
            if value and value.pk != target.pk:
                raise serializers.ValidationError({"curriculum_chapter": "The chapter must belong to the selected admission, section and subject."})
            attrs[field] = target
        attrs["chapter"] = chapter.title
        return attrs


class CourseMaterialSerializer(CurriculumContentSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get("request")
        if request and instance.file and request.user.is_authenticated:
            from apps.courses.material_media import staff_material_url
            data["file"] = staff_material_url(request, instance)
        return data

    def validate(self, attrs):
        attrs = super().validate(attrs)
        material_type = attrs.get("material_type", getattr(self.instance, "material_type", "note"))
        upload = attrs.get("file")
        if upload:
            try:
                validate_material_upload(upload, material_type)
            except DjangoValidationError as exc:
                raise serializers.ValidationError({"file": exc.messages}) from exc
        if material_type == "video" and not (upload or attrs.get("url") or (self.instance and (self.instance.file or self.instance.url))):
            raise serializers.ValidationError({"file": "Upload a video or enter a video URL."})
        return attrs

    class Meta:
        model = models.CourseMaterial
        fields = "__all__"


class QuestionOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.QuestionOption
        fields = "__all__"


class StudentQuestionOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.QuestionOption
        fields = ("id", "text", "image", "order")


class QuestionSerializer(CurriculumContentSerializer):
    options = QuestionOptionSerializer(many=True, read_only=True)

    class Meta:
        model = models.Question
        fields = "__all__"


class StudentQuestionSerializer(serializers.ModelSerializer):
    options = StudentQuestionOptionSerializer(many=True, read_only=True)

    class Meta:
        model = models.Question
        fields = ("id", "text", "question_type", "image", "diagram", "marks", "options")


class AssessmentSerializer(CurriculumContentSerializer):
    is_live_now = serializers.BooleanField(read_only=True)

    class Meta:
        model = models.Assessment
        fields = "__all__"


class StudentAssessmentSerializer(AssessmentSerializer):
    """Student view of a test: the stored fields plus server-computed state, so the browser
    never decides availability from its own clock. `server_time` lets the client compute a
    clock offset for the pre-start countdown."""
    server_time = serializers.SerializerMethodField()
    student_status = serializers.SerializerMethodField()
    can_start = serializers.SerializerMethodField()
    attempt = serializers.SerializerMethodField()
    enrollment_id = serializers.SerializerMethodField()
    subject_name = serializers.SerializerMethodField()
    teacher_name = serializers.SerializerMethodField()
    course_title = serializers.CharField(source="course.title", read_only=True)
    question_count = serializers.SerializerMethodField()

    class Meta(AssessmentSerializer.Meta):
        pass

    def _now(self):
        if "now" not in self.context:
            from django.utils import timezone
            self.context["now"] = timezone.now()
        return self.context["now"]

    # Cached per serializer context so a list response costs two extra queries, not two per row.
    def _attempts(self):
        cache = self.context.get("_attempts")
        if cache is None:
            student = self.context.get("student")
            cache = {a.assessment_id: a for a in models.AssessmentAttempt.objects.filter(student=student).select_related("assessment")} if student else {}
            self.context["_attempts"] = cache
        return cache

    def _enrollments(self):
        cache = self.context.get("_enrollments")
        if cache is None:
            student = self.context.get("student")
            cache = {}
            if student:
                for enrollment in student.course_enrollments.filter(status="active").order_by("id"):
                    cache.setdefault((enrollment.course_id, enrollment.course_section_id), enrollment.id)
                    cache.setdefault((enrollment.course_id, None), enrollment.id)
            self.context["_enrollments"] = cache
        return cache

    def get_server_time(self, obj):
        return self._now().isoformat()

    def get_student_status(self, obj):
        from .student_status import compute_student_status
        return compute_student_status(obj, self._attempts().get(obj.id), self._now())

    def get_can_start(self, obj):
        return self.get_student_status(obj) in {"AVAILABLE_NOW", "IN_PROGRESS"}

    def get_attempt(self, obj):
        attempt = self._attempts().get(obj.id)
        if not attempt:
            return None
        return {"id": attempt.id, "status": attempt.status, "score": attempt.score, "total_marks": attempt.total_marks,
                "started_at": attempt.started_at, "submitted_at": attempt.submitted_at, "deadline": attempt.deadline}

    def get_enrollment_id(self, obj):
        enrollments = self._enrollments()
        return enrollments.get((obj.course_id, obj.course_section_id)) or enrollments.get((obj.course_id, None))

    def get_subject_name(self, obj):
        return obj.subject.name if obj.subject_id else ""

    def get_teacher_name(self, obj):
        return obj.created_by_teacher.full_name if obj.created_by_teacher_id else ""

    def get_question_count(self, obj):
        # len(.all()) uses the prefetch cache when the queryset prefetches assessment_questions (one query
        # for the whole list); .count() would issue one query per row.
        return len(obj.assessment_questions.all())


class AssessmentQuestionSerializer(serializers.ModelSerializer):
    question_detail = QuestionSerializer(source="question", read_only=True)

    class Meta:
        model = models.AssessmentQuestion
        fields = "__all__"


class AssessmentAttemptSerializer(serializers.ModelSerializer):
    deadline = serializers.DateTimeField(read_only=True)

    class Meta:
        model = models.AssessmentAttempt
        fields = "__all__"


class StudentAttemptSerializer(serializers.ModelSerializer):
    deadline = serializers.DateTimeField(read_only=True)
    questions = serializers.SerializerMethodField()
    saved_answers = serializers.SerializerMethodField()

    class Meta:
        model = models.AssessmentAttempt
        fields = ("id", "assessment", "student", "started_at", "deadline", "status", "score", "total_marks", "questions", "saved_answers")

    def get_saved_answers(self, obj):
        # Only the student's own selections; never correctness or marking data.
        return {str(answer.question_id): [option.id for option in answer.selected_options.all()]
                for answer in obj.answers.prefetch_related("selected_options")}

    def get_questions(self, obj):
        questions = [link.question for link in obj.assessment.assessment_questions.select_related("question").prefetch_related("question__options")]
        return StudentQuestionSerializer(questions, many=True, context=self.context).data


class StudentAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.StudentAnswer
        fields = "__all__"


class SubmissionAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.SubmissionAttachment
        fields = "__all__"
        read_only_fields = ("original_name", "content_type", "size")


class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    attachments = SubmissionAttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = models.AssignmentSubmission
        fields = "__all__"
        read_only_fields = ("evaluated_by", "evaluated_at")


class StudentInterventionSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source="created_by_teacher.full_name", read_only=True)
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    practice_assessment_title = serializers.CharField(source="linked_practice_assessment.title", read_only=True)

    class Meta:
        model = models.StudentIntervention
        fields = "__all__"
        read_only_fields = ("organization", "created_by_teacher", "created_at", "updated_at")


class StudentFeedbackSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source="created_by_teacher.full_name", read_only=True)
    subject_name = serializers.CharField(source="subject.name", read_only=True)

    class Meta:
        model = models.StudentFeedback
        fields = "__all__"
        read_only_fields = ("organization", "created_by_teacher", "created_at")


class TeacherPrivateNoteSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source="created_by_teacher.full_name", read_only=True)

    class Meta:
        model = models.TeacherPrivateNote
        fields = "__all__"
        read_only_fields = ("organization", "created_by_teacher", "created_at")


class StudentBookmarkSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source="question.text", read_only=True)
    subject_name = serializers.CharField(source="question.subject.name", read_only=True, default=None)

    class Meta:
        model = models.StudentBookmark
        fields = "__all__"
        read_only_fields = ("organization", "student", "created_at")


class AssessmentComponentSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.AssessmentComponent
        fields = "__all__"

    def validate(self, attrs):
        source_assessments = attrs.get("source_assessments")
        course_subject = attrs.get("course_subject") or getattr(self.instance, "course_subject", None)
        if source_assessments and course_subject:
            bad = [a for a in source_assessments if a.subject_id != course_subject.id]
            if bad:
                raise serializers.ValidationError({"source_assessments": "All linked assessments must belong to this course subject."})

        status = attrs.get("status", getattr(self.instance, "status", "active"))
        include_in_final_grade = attrs.get("include_in_final_grade", getattr(self.instance, "include_in_final_grade", True))
        weight = attrs.get("weight_percentage", getattr(self.instance, "weight_percentage", None))
        if course_subject and status == "active" and include_in_final_grade and weight is not None:
            other_total = models.AssessmentComponent.objects.filter(
                course_subject=course_subject, status="active", include_in_final_grade=True,
            ).exclude(pk=getattr(self.instance, "pk", None)).aggregate(total=Sum("weight_percentage"))["total"] or 0
            if other_total + weight > 100:
                raise serializers.ValidationError({"weight_percentage": f"Active component weights for this subject would total {other_total + weight}%, which exceeds 100%. Reduce this weight or adjust other components first."})
        return attrs


class CourseGradeScaleItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.CourseGradeScaleItem
        fields = "__all__"

    def validate(self, attrs):
        min_pct = attrs.get("min_percentage", getattr(self.instance, "min_percentage", None))
        max_pct = attrs.get("max_percentage", getattr(self.instance, "max_percentage", None))
        if min_pct is not None and max_pct is not None and min_pct > max_pct:
            raise serializers.ValidationError({"min_percentage": "Minimum percentage cannot exceed maximum percentage."})
        return attrs


class CourseGradeScaleSerializer(serializers.ModelSerializer):
    items = CourseGradeScaleItemSerializer(many=True, read_only=True)

    class Meta:
        model = models.CourseGradeScale
        fields = "__all__"


class CourseRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.CourseRating
        fields = "__all__"
        # enrollment/course_subject are client-supplied (which enrollment the student is
        # rating) - only student/organization are server-derived in perform_create.
        read_only_fields = ("organization", "student", "created_at", "updated_at")

    def validate_rating(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value


class StudentComponentResultSerializer(serializers.ModelSerializer):
    component_name = serializers.CharField(source="component.name", read_only=True)
    component_type = serializers.CharField(source="component.component_type", read_only=True)
    weight_percentage = serializers.DecimalField(source="component.weight_percentage", read_only=True, max_digits=5, decimal_places=2)
    is_visible_to_student = serializers.BooleanField(source="component.is_visible_to_student", read_only=True)

    class Meta:
        model = models.StudentComponentResult
        fields = "__all__"


class StudentCourseResultSerializer(serializers.ModelSerializer):
    course_subject_name = serializers.CharField(source="course_subject.name", read_only=True)
    student_name = serializers.CharField(source="enrollment.student.full_name", read_only=True)
    component_results = StudentComponentResultSerializer(many=True, read_only=True)

    class Meta:
        model = models.StudentCourseResult
        fields = "__all__"
