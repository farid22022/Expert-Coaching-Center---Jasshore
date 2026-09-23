from rest_framework import serializers

from . import models


class CourseMaterialSerializer(serializers.ModelSerializer):
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


class QuestionSerializer(serializers.ModelSerializer):
    options = QuestionOptionSerializer(many=True, read_only=True)

    class Meta:
        model = models.Question
        fields = "__all__"


class StudentQuestionSerializer(serializers.ModelSerializer):
    options = StudentQuestionOptionSerializer(many=True, read_only=True)

    class Meta:
        model = models.Question
        fields = ("id", "text", "question_type", "image", "diagram", "marks", "options")


class AssessmentSerializer(serializers.ModelSerializer):
    is_live_now = serializers.BooleanField(read_only=True)

    class Meta:
        model = models.Assessment
        fields = "__all__"


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

    class Meta:
        model = models.AssessmentAttempt
        fields = ("id", "assessment", "student", "started_at", "deadline", "status", "score", "total_marks", "questions")

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
