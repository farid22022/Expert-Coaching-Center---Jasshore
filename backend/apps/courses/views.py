from .curriculum import released_content
from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.response import Response

from apps.core.permissions import HasActionPermission
from apps.core.responses import success_response
from apps.core.viewsets import OrganizationScopedModelViewSet
from apps.messaging.models import Notice
from apps.people.models import Employee, Student
from . import models, serializers
from .permissions import HeadTeacherCourseScopeMixin
from .material_media import student_material_url


def _is_teacher(request):
    return Employee.objects.filter(
        organization=request.user.organization,
        email=request.user.email,
        employee_type="teacher",
    ).exists()


class StaffOrTeacherScopedQuerysetMixin:
    """Restricts list/retrieve to staff/superuser or an org-matched teacher record.

    These are back-office/teacher-management endpoints (courses, sections, subjects,
    teacher assignments, enrollments). A student holding only the coarse `course.view`
    role-permission must not reach them at all — the base OrganizationScopedModelViewSet
    queryset filters by organization only, so without this guard any authenticated
    non-staff/non-teacher user could list every enrollment/course/assignment org-wide.
    """

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return queryset
        if _is_teacher(self.request):
            return queryset
        return queryset.none()


class StudentPortalViewSet(viewsets.ViewSet):
    """Read-only learning data derived from the student's approved enrollments."""

    permission_classes = [permissions.IsAuthenticated]

    def _student(self, request):
        from apps.core.request_cache import student_for_user
        return student_for_user(request.user)

    def _progress(self, student, course):
        return self._progress_by_course(None, student, [course.id], organization=course.organization_id)[course.id]

    def _progress_by_course(self, request, student, course_ids, organization=None):
        """Counts materials (viewed) + assessments (attempted) together as "units" so
        percentage/activity-count reflects everything published, not just quizzes."""
        from apps.assessments import models as assessment_models

        organization = organization or request.user.organization
        now = timezone.now()
        section_ids = models.Enrollment.objects.filter(student=student, status="active", course_id__in=course_ids).values_list("course_section_id", flat=True)
        scope = Q(course_section__isnull=True) | Q(course_section_id__in=section_ids)
        assessments = assessment_models.Assessment.objects.filter(
            released_content(now), scope, Q(publish_at__isnull=True) | Q(publish_at__lte=now),
            organization=organization, course_id__in=course_ids, review_status="approved",
            status__in=["published", "scheduled", "live"],
        )
        materials = assessment_models.CourseMaterial.objects.filter(
            released_content(now), scope, Q(publish_at__isnull=True) | Q(publish_at__lte=now),
            organization=organization, course_id__in=course_ids, is_published=True, status="published", review_status="approved",
        )
        assessment_totals = dict(assessments.values("course_id").annotate(total=Count("id")).values_list("course_id", "total"))
        completed_ids = assessment_models.AssessmentAttempt.objects.filter(student=student).exclude(status="in_progress").values_list("assessment_id", flat=True)
        submitted_ids = assessment_models.AssignmentSubmission.objects.filter(student=student).exclude(status="draft").values_list("assessment_id", flat=True)
        assessment_done = dict(assessments.filter(Q(id__in=completed_ids) | Q(id__in=submitted_ids)).values("course_id").annotate(total=Count("id", distinct=True)).values_list("course_id", "total"))
        material_totals = dict(materials.values("course_id").annotate(total=Count("id")).values_list("course_id", "total"))
        viewed_ids = assessment_models.MaterialView.objects.filter(student=student).values_list("material_id", flat=True)
        material_done = dict(materials.filter(id__in=viewed_ids).values("course_id").annotate(total=Count("id", distinct=True)).values_list("course_id", "total"))
        result = {}
        for course_id in course_ids:
            total = assessment_totals.get(course_id, 0) + material_totals.get(course_id, 0)
            done = assessment_done.get(course_id, 0) + material_done.get(course_id, 0)
            result[course_id] = {"completed_units": done, "total_units": total, "percentage": round((done / total) * 100) if total else 0}
        return result

    def list(self, request):
        from apps.admissions.models import AdmissionApplication, ApplicationStatus

        student = self._student(request)
        enrollments = models.Enrollment.objects.none()
        progress_by_course = {}
        if student:
            enrollments = models.Enrollment.objects.filter(
                organization=request.user.organization,
                student=student,
                status=models.EnrollmentStatus.ACTIVE,
            ).select_related("course", "course_section", "application")
            # Single pair of aggregate queries instead of _progress()'s 2 queries per
            # enrollment - was a 2N-query loop for N active enrollments.
            progress_by_course = self._progress_by_course(request, student, list(enrollments.values_list("course_id", flat=True)))
        pending = AdmissionApplication.objects.filter(
            organization=request.user.organization,
            applicant=request.user,
            status__in=[ApplicationStatus.DRAFT, ApplicationStatus.PENDING, ApplicationStatus.UNDER_REVIEW, ApplicationStatus.APPROVED, ApplicationStatus.REJECTED],
        ).select_related("course").order_by("-submitted_at", "-created_at")
        return Response({
            "student": {"id": student.id, "name": student.full_name} if student else {"id": None, "name": request.user.get_full_name() or request.user.email},
            "pending_applications": [{
                "id": application.id,
                "application_no": application.application_no,
                "program": application.course.title if application.course else "Admission program",
                "status": application.status,
                "payment_status": application.payment_status,
                "admission_fee": application.course.admission_fee if application.course else 0,
                "submitted_at": application.submitted_at or application.created_at,
                "rejection_reason": application.rejection_reason,
            } for application in pending],
            "enrollments": [{
                "id": enrollment.id,
                "program": enrollment.course.title,
                "cover_image": enrollment.course.thumbnail.url if enrollment.course.thumbnail else "",
                "course": enrollment.course_id,
                "session": enrollment.course.session.name if enrollment.course.session_id else "",
                "section": enrollment.course_section.name if enrollment.course_section_id else "",
                "status": enrollment.status,
                "enrolled_at": enrollment.enrolled_at,
                "progress": progress_by_course.get(enrollment.course_id, {"completed_units": 0, "total_units": 0, "percentage": 0}),
            } for enrollment in enrollments],
        })

    @action(detail=False, methods=["get", "patch"], url_path="me")
    def me(self, request):
        """Self-service profile: the current user's own Student record only - no id param,
        so there is no IDOR surface to reintroduce. Only `phone` is writable; student_id,
        enrollment, and academic fields are backend-managed and must not change here."""
        student = self._student(request)
        if not student:
            return Response({"detail": "Student record not found."}, status=404)

        if request.method == "PATCH":
            phone = request.data.get("phone")
            if phone is not None:
                student.phone = phone
                student.save(update_fields=["phone", "updated_at"])

        enrollments = models.Enrollment.objects.filter(
            organization=request.user.organization, student=student, status=models.EnrollmentStatus.ACTIVE,
        ).select_related("course")

        return Response({
            "id": student.id,
            "student_id": student.student_id,
            "full_name": student.full_name,
            "email": student.email,
            "phone": student.phone,
            "photo": student.photo.url if student.photo else "",
            "session": student.session.name if student.session_id else "",
            "academic_class": student.academic_class.name if student.academic_class_id else "",
            "section": student.section.name if student.section_id else "",
            "group": student.group.name if student.group_id else "",
            "shift": student.shift.name if student.shift_id else "",
            "status": student.status,
            "active_enrollments": [{"id": enrollment.id, "course": enrollment.course.title} for enrollment in enrollments],
        })

    @action(detail=True, methods=["get"])
    def content(self, request, pk=None):
        student = self._student(request)
        enrollment = models.Enrollment.objects.filter(
            organization=request.user.organization,
            pk=pk,
            student=student,
            status=models.EnrollmentStatus.ACTIVE,
        ).select_related("course", "course_section").first()
        if not enrollment:
            raise PermissionDenied("You do not have an active enrollment for this course.")

        from apps.assessments import models as assessment_models
        from apps.assessments import serializers as assessment_serializers
        from apps.assessments.services import AssessmentService
        now = timezone.now()
        materials = assessment_models.CourseMaterial.objects.filter(
            organization=request.user.organization,
            course=enrollment.course,
            is_published=True,
            status="published",
            review_status="approved",
        ).filter(
            Q(course_section__isnull=True) | Q(course_section=enrollment.course_section),
            Q(subject__isnull=True) | Q(subject__course_section=enrollment.course_section) if enrollment.course_section_id else Q(),
            released_content(now),
            Q(publish_at__isnull=True) | Q(publish_at__lte=now),
        ).select_related("subject", "created_by_teacher").order_by("-reviewed_at", "-updated_at", "-created_at")
        assessments = assessment_models.Assessment.objects.filter(
            organization=request.user.organization,
            course=enrollment.course,
            status__in=["published", "scheduled", "live"],
            review_status="approved",
        ).filter(
            Q(course_section__isnull=True) | Q(course_section=enrollment.course_section),
            released_content(now),
            Q(publish_at__isnull=True) | Q(publish_at__lte=now),
            Q(starts_at__isnull=True) | Q(starts_at__lte=now),
            Q(ends_at__isnull=True) | Q(ends_at__gte=now),
            # Individually-targeted tests (e.g. personalised practice) belong to their target student only,
            # exactly as in StudentAssessmentViewSet; without this, other students saw them and got a 404 on Start.
            Q(allowed_students__isnull=True) | Q(allowed_students=student),
        # allowed_students is serialized by AssessmentSerializer (fields="__all__"): prefetch it, otherwise it costs one query per assessment.
        ).select_related("subject", "created_by_teacher").prefetch_related("allowed_students").distinct().order_by("-published_at", "-reviewed_at", "-updated_at", "-created_at")
        sections = list(enrollment.course.sections.filter(pk=enrollment.course_section_id).prefetch_related("subjects").all()) if enrollment.course_section_id else list(enrollment.course.sections.prefetch_related("subjects").all())
        subjects_in_order = sorted(
            (subject for section in sections for subject in section.subjects.all()),
            key=lambda subject: (subject.order, subject.id),
        )
        subject_names = {subject.id: subject.name for subject in subjects_in_order}
        teacher_names = {assignment.teacher_id: assignment.teacher.full_name for assignment in enrollment.course.teacher_assignments.select_related("teacher")}
        material_data = assessment_serializers.CourseMaterialSerializer(materials, many=True).data
        material_files = {material.id: material for material in materials if material.file}
        assessment_data = assessment_serializers.AssessmentSerializer(assessments, many=True).data
        attempts = {
            attempt.assessment_id: attempt
            for attempt in assessment_models.AssessmentAttempt.objects.select_related("assessment").filter(
                organization=request.user.organization,
                student=student,
                assessment__in=assessments,
            )
        }
        submissions = {
            submission.assessment_id: submission
            for submission in assessment_models.AssignmentSubmission.objects.filter(
                organization=request.user.organization,
                student=student,
                assessment__in=assessments,
            )
        }
        viewed_material_ids = set(
            assessment_models.MaterialView.objects.filter(student=student, material__in=materials).values_list("material_id", flat=True)
        )
        for item in material_data:
            if item["id"] in material_files:
                material = material_files[item["id"]]
                item["file"] = student_material_url(request, material, enrollment)
                item["file_name"] = material.file.name.rsplit("/", 1)[-1]
            item["subject_name"] = subject_names.get(item.get("subject"), "General")
            item["teacher_name"] = teacher_names.get(item.get("created_by_teacher"), "Expert Coaching Center")
            item["unit_type"] = item.get("material_type") or "material"
            item["viewed"] = item["id"] in viewed_material_ids
        for item in assessment_data:
            item["subject_name"] = subject_names.get(item.get("subject"), "General")
            item["teacher_name"] = teacher_names.get(item.get("created_by_teacher"), "Expert Coaching Center")
            item["unit_type"] = item.get("assessment_type") or "test"
            attempt = attempts.get(item["id"])
            if attempt and attempt.status == assessment_models.AttemptStatus.IN_PROGRESS and now > attempt.deadline:
                attempt = AssessmentService.submit_attempt(attempt, request.user, auto=True)
            if attempt:
                item["attempt"] = {
                    "id": attempt.id,
                    "status": attempt.status,
                    "score": attempt.score,
                    "total_marks": attempt.total_marks,
                    "submitted_at": attempt.submitted_at,
                    "deadline": attempt.deadline,
                }
            submission = submissions.get(item["id"])
            if submission:
                item["submission"] = {
                    "id": submission.id,
                    "status": submission.status,
                    "marks_obtained": submission.marks_obtained,
                    "total_marks": submission.total_marks,
                    "submitted_at": submission.submitted_at,
                }
            item["is_done"] = bool(
                (attempt and attempt.status != assessment_models.AttemptStatus.IN_PROGRESS)
                or submission
            )

        # Subject-level sequencing: walk subjects in order, mark each complete once every
        # one of its published materials is viewed and every assessment/assignment is
        # attempted/submitted; the first non-complete subject that actually has content
        # is "current" so the student always has one clear next step.
        subject_status = {}
        found_current = False
        for subject in subjects_in_order:
            subject_materials = [item for item in material_data if item.get("subject") == subject.id]
            subject_assessments = [item for item in assessment_data if item.get("subject") == subject.id]
            item_count = len(subject_materials) + len(subject_assessments)
            if item_count == 0:
                subject_status[subject.id] = "empty"
                continue
            complete = all(item["viewed"] for item in subject_materials) and all(item["is_done"] for item in subject_assessments)
            if complete:
                subject_status[subject.id] = "completed"
            elif not found_current:
                subject_status[subject.id] = "current"
                found_current = True
            else:
                subject_status[subject.id] = "upcoming"
        notices = [
            {
                "id": f"notice-{notice.id}",
                "title": notice.title,
                "kind": notice.category or "Notice",
                "message": notice.summary or notice.body,
                "created_at": notice.publish_at or notice.created_at,
                "target_url": notice.target_url,
                "unit_type": "notice",
            }
            for notice in Notice.objects.filter(
                organization=request.user.organization,
                course=enrollment.course,
                is_published=True,
            ).filter(
                Q(course_section__isnull=True) | Q(course_section=enrollment.course_section),
                Q(publish_at__isnull=True) | Q(publish_at__lte=now),
                Q(expires_at__isnull=True) | Q(expires_at__gte=now),
            ).order_by("-publish_at", "-created_at")[:8]
        ] + [
            {
                "id": f"material-{item['id']}",
                "title": item["title"],
                "kind": "Study material",
                "message": f"{item.get('subject_name', 'General')} material is available.",
                "created_at": item.get("reviewed_at") or item.get("updated_at"),
                "unit_type": item.get("unit_type"),
            }
            for item in material_data[:8]
        ] + [
            {
                "id": f"assessment-{item['id']}",
                "title": item["title"],
                "kind": "MCQ / test",
                "message": f"{item.get('subject_name', 'General')} {item.get('unit_type', 'test')} is ready to perform.",
                "created_at": item.get("published_at") or item.get("reviewed_at") or item.get("updated_at"),
                "unit_type": item.get("unit_type"),
            }
            for item in assessment_data[:8]
        ]
        return Response({
            "enrollment": {
                **serializers.EnrollmentSerializer(enrollment).data,
                "course_title": enrollment.course.title,
                "section_name": enrollment.course_section.name if enrollment.course_section_id else "",
            },
            "weeks": [
                {"id": week.id, "subject": week.subject_id, "number": week.number,
                 "title": week.title, "release_at": week.release_at,
                 "locked": week.release_at > now,
                 "chapters": [{"id": chapter.id, "title": chapter.title, "description": chapter.description, "order": chapter.order} for chapter in week.chapters.all()] if week.release_at <= now else []}
                for week in models.SubjectWeek.objects.filter(subject__in=subjects_in_order, is_published=True).prefetch_related("chapters")
            ],
            "materials": material_data,
            "assessments": assessment_data,
            "notices": notices[:12],
            "progress": self._progress(student, enrollment.course),
            "outline": [{"section": section.name, "subjects": [{"id": subject.id, "name": subject.name, "order": subject.order, "status": subject_status.get(subject.id, "empty")} for subject in section.subjects.all()]} for section in sections],
        })

    @action(detail=True, methods=["get"], url_path="academic-overview")
    def academic_overview(self, request, pk=None):
        """Spec §23-28: stages -> subjects, with real percentage/grade shown only once
        a StudentCourseResult is actually published - never fabricated."""
        student = self._student(request)
        enrollment = models.Enrollment.objects.filter(
            organization=request.user.organization, pk=pk, student=student, status=models.EnrollmentStatus.ACTIVE,
        ).select_related("course").first()
        if not enrollment:
            raise PermissionDenied("You do not have an active enrollment for this course.")

        from apps.assessments import models as assessment_models

        course_results = {
            r.course_subject_id: r
            for r in assessment_models.StudentCourseResult.objects.filter(enrollment=enrollment)
        }

        def subject_status(subject, result):
            if subject.academic_stage_id:
                return subject.academic_stage.status
            if result and result.status == assessment_models.CourseResultStatus.PUBLISHED:
                return "completed"
            has_activity = (
                assessment_models.AssessmentAttempt.objects.filter(student=student, assessment__subject=subject).exists()
                or assessment_models.MaterialView.objects.filter(student=student, material__subject=subject).exists()
            )
            return "in_progress" if has_activity else "upcoming"

        def subject_row(subject):
            result = course_results.get(subject.id)
            published = bool(result and result.status == assessment_models.CourseResultStatus.PUBLISHED)
            return {
                "id": subject.id,
                "name": subject.name,
                "status": subject_status(subject, result),
                "percentage": str(result.total_percentage) if published and result.total_percentage is not None else None,
                "grade": result.grade if published else None,
                "result_status": result.status if result else "not_started",
            }

        stages = list(
            models.AcademicStage.objects.filter(organization=request.user.organization, course=enrollment.course)
            .prefetch_related("subjects__academic_stage").order_by("order")
        )
        grouped_subject_ids = set()
        stage_payload = []
        for stage in stages:
            subjects = list(stage.subjects.all())
            grouped_subject_ids.update(s.id for s in subjects)
            stage_payload.append({
                "id": stage.id, "name": stage.name, "display_label": stage.display_label,
                "stage_type": stage.stage_type, "status": stage.status,
                "subjects": [subject_row(s) for s in subjects],
            })

        all_subjects = [s for section in enrollment.course.sections.prefetch_related("subjects").all() for s in section.subjects.all()]
        ungrouped = [s for s in all_subjects if s.id not in grouped_subject_ids]
        if ungrouped:
            stage_payload.append({
                "id": None, "name": "General", "display_label": "", "stage_type": "custom", "status": "in_progress",
                "subjects": [subject_row(s) for s in ungrouped],
            })

        published_results = [r for r in course_results.values() if r.status == assessment_models.CourseResultStatus.PUBLISHED]
        return Response({
            "enrollment": {"id": enrollment.id, "course_title": enrollment.course.title, "status": enrollment.status},
            "summary": {
                "courses_completed": len(published_results),
                "total_courses": len(all_subjects),
                "average_percentage": (
                    round(sum(float(r.total_percentage or 0) for r in published_results) / len(published_results), 2)
                    if published_results else None
                ),
            },
            "stages": stage_payload,
        })

    @action(detail=True, methods=["get"], url_path=r"subjects/(?P<subject_id>[^/.]+)/result")
    def course_result(self, request, pk=None, subject_id=None):
        """Spec §30-38, §59-60: enrollment ownership and course-membership are both
        verified server-side - a manipulated subject_id outside this enrollment's
        course returns 404, never another course's data."""
        student = self._student(request)
        enrollment = models.Enrollment.objects.filter(
            organization=request.user.organization, pk=pk, student=student, status=models.EnrollmentStatus.ACTIVE,
        ).select_related("course").first()
        if not enrollment:
            raise PermissionDenied("You do not have an active enrollment for this course.")

        subject = models.CourseSubject.objects.filter(
            id=subject_id, course_section__course=enrollment.course,
        ).select_related("course_section__course", "academic_stage").first()
        if not subject:
            raise NotFound("This subject does not belong to your enrollment.")

        from apps.assessments import models as assessment_models
        from apps.assessments import serializers as assessment_serializers

        course_result = assessment_models.StudentCourseResult.objects.filter(
            enrollment=enrollment, course_subject=subject,
        ).prefetch_related("component_results__component").first()
        published = bool(course_result and course_result.status == assessment_models.CourseResultStatus.PUBLISHED)

        components_payload = []
        if course_result:
            for component_result in course_result.component_results.select_related("component").filter(
                component__is_visible_to_student=True
            ).order_by("component__order"):
                components_payload.append({
                    "id": component_result.component.id,
                    "name": component_result.component.name,
                    "component_type": component_result.component.component_type,
                    "raw_obtained": component_result.raw_obtained,
                    "raw_total": component_result.raw_total,
                    "weight_percentage": component_result.component.weight_percentage,
                    "weighted_score": component_result.weighted_score if published else None,
                    "data_status": component_result.data_status,
                })

        teacher_names = list(
            models.TeacherAssignment.objects.filter(organization=request.user.organization, course=enrollment.course)
            .filter(Q(subject=subject) | Q(subject__isnull=True, course_section=subject.course_section))
            .select_related("teacher").values_list("teacher__full_name", flat=True).distinct()
        )
        rating = assessment_models.CourseRating.objects.filter(student=student, enrollment=enrollment, course_subject=subject).first()

        return Response({
            "course_subject": {
                "id": subject.id,
                "name": subject.name,
                "stage_name": subject.academic_stage.name if subject.academic_stage_id else None,
                "teachers": teacher_names,
                "admission": enrollment.course.title,
            },
            "result_status": course_result.status if course_result else "not_started",
            "total_percentage": course_result.total_percentage if published else None,
            "grade": course_result.grade if published else None,
            "grade_point": course_result.grade_point if published else None,
            "pass_status": course_result.pass_status if published else None,
            "teacher_comment": course_result.teacher_comment if course_result else "",
            "components": components_payload,
            "rating": assessment_serializers.CourseRatingSerializer(rating).data if rating else None,
            "rating_eligible": published and not rating,
        })

    @action(detail=True, methods=["post"], url_path=r"materials/(?P<material_id>[^/.]+)/view")
    def mark_material_viewed(self, request, pk=None, material_id=None):
        """Records that the student opened this material - the signal real completion/
        progress tracking is built on. Ownership-checked the same way content() is."""
        from apps.assessments import models as assessment_models

        student = self._student(request)
        enrollment = models.Enrollment.objects.filter(
            organization=request.user.organization,
            pk=pk,
            student=student,
            status=models.EnrollmentStatus.ACTIVE,
        ).first()
        if not enrollment:
            raise PermissionDenied("You do not have an active enrollment for this course.")

        material = assessment_models.CourseMaterial.objects.filter(
            organization=request.user.organization,
            id=material_id,
            course=enrollment.course,
            is_published=True, status="published", review_status="approved",
        ).filter(
            released_content(),
            Q(course_section__isnull=True) | Q(course_section=enrollment.course_section),
            Q(publish_at__isnull=True) | Q(publish_at__lte=timezone.now()),
        ).first()
        if not material:
            return Response({"detail": "Material not found."}, status=404)

        assessment_models.MaterialView.objects.get_or_create(
            organization=request.user.organization, student=student, material=material,
        )
        return Response({"viewed": True})


class CourseViewSet(StaffOrTeacherScopedQuerysetMixin, OrganizationScopedModelViewSet):
    queryset = models.Course.objects.select_related("session").prefetch_related(
        "sections",
        "sections__subjects",
        "syllabus_items",
        "syllabus_items__course_section",
        "syllabus_items__subject",
        "teacher_assignments__teacher",
    )
    serializer_class = serializers.CourseSerializer
    permission_classes = [HasActionPermission]
    permission_module = "course"
    search_fields = ("title", "code", "description")
    filterset_fields = ("course_type", "status", "is_published", "session")

    def _public_admission_queryset(self):
        return self.queryset.filter(
            is_published=True,
            status__in=[
                models.CourseStatus.PUBLISHED,
                models.CourseStatus.ADMISSION_OPEN,
                models.CourseStatus.RUNNING,
            ],
        ).filter(
            Q(course_type=models.CourseType.ADMISSION) |
            Q(status=models.CourseStatus.ADMISSION_OPEN)
        ).order_by("-created_at", "title")

    @action(
        detail=False,
        methods=["get"],
        url_path="public-admissions",
        permission_classes=[permissions.AllowAny],
    )
    def public_admissions(self, request):
        serializer = serializers.PublicAdmissionCardSerializer(self._public_admission_queryset(), many=True, context={"request": request})
        return success_response(serializer.data, "Admission cards loaded.")

    @action(
        detail=False,
        methods=["get"],
        url_path=r"public-admissions/(?P<identifier>[^/.]+)",
        permission_classes=[permissions.AllowAny],
    )
    def public_admission_detail(self, request, identifier=None):
        lookup = Q(slug=identifier)
        if str(identifier).isdigit():
            lookup |= Q(pk=int(identifier))

        course = self._public_admission_queryset().filter(lookup).first()
        if not course:
            is_preview = request.query_params.get("preview") == "1"
            user = request.user
            if is_preview and user.is_authenticated and (user.is_staff or user.is_superuser):
                course = self.queryset.filter(lookup).first()
        if not course:
            return Response({"detail": "Admission card not found."}, status=404)
        serializer = serializers.PublicAdmissionDetailSerializer(course, context={"request": request})
        return success_response(serializer.data, "Admission card loaded.")

    @action(
        detail=False,
        methods=["get"],
        url_path="public-stats",
        permission_classes=[permissions.AllowAny],
        authentication_classes=[],
    )
    def public_stats(self, request):
        from apps.organizations.models import Organization

        org = Organization.objects.filter(is_active=True).first()
        students_guided = Student.objects.filter(organization=org).count() if org else 0
        return success_response({"students_guided": students_guided}, "Public stats loaded.")


class CourseSectionViewSet(HeadTeacherCourseScopeMixin, OrganizationScopedModelViewSet):
    queryset = models.CourseSection.objects.select_related("course", "head_teacher")
    serializer_class = serializers.CourseSectionSerializer
    permission_classes = [HasActionPermission]
    permission_module = "course"
    search_fields = ("name", "description", "course__title")
    filterset_fields = ("course", "head_teacher", "status")

    def _target_course_id(self, serializer):
        course = serializer.validated_data.get("course") or serializer.instance.course
        return course.id

    def _instance_course_id(self, instance):
        return instance.course_id

    def _sync_head_teacher_assignment(self, section, previous_head_teacher_id=None):
        if previous_head_teacher_id and previous_head_teacher_id != section.head_teacher_id:
            models.TeacherAssignment.objects.filter(
                organization=section.organization,
                teacher_id=previous_head_teacher_id,
                course=section.course,
                course_section=section,
                subject__isnull=True,
                role=models.AssignmentRole.HEAD_TEACHER,
                is_active=True,
            ).update(
                is_active=False,
                updated_by=self.request.user,
                updated_at=timezone.now(),
            )

        if not section.head_teacher_id:
            return

        assignment, _ = models.TeacherAssignment.objects.get_or_create(
            organization=section.organization,
            teacher=section.head_teacher,
            course=section.course,
            course_section=section,
            subject=None,
            role=models.AssignmentRole.HEAD_TEACHER,
            defaults={
                "assigned_by": self.request.user,
                "created_by": self.request.user,
                "updated_by": self.request.user,
            },
        )
        changed = []
        if not assignment.is_active:
            assignment.is_active = True
            changed.append("is_active")
        if assignment.assignment_status != models.AssignmentStatus.ACCEPTED:
            assignment.assignment_status = models.AssignmentStatus.ACCEPTED
            assignment.responded_at = timezone.now()
            changed.extend(["assignment_status", "responded_at"])
        if assignment.assigned_by_id is None:
            assignment.assigned_by = self.request.user
            changed.append("assigned_by")
        assignment.updated_by = self.request.user
        changed.extend(["updated_by", "updated_at"])
        if changed:
            assignment.save(update_fields=changed)

    def perform_create(self, serializer):
        self.ensure_head_teacher_write(serializer)
        section = serializer.save(
            organization=self.get_request_organization(),
            created_by=self.request.user,
            updated_by=self.request.user,
        )
        self._sync_head_teacher_assignment(section)

    def perform_update(self, serializer):
        self.ensure_head_teacher_write(serializer)
        previous_head_teacher_id = None
        if serializer.instance:
            previous_head_teacher_id = serializer.instance.head_teacher_id
        section = serializer.save(updated_by=self.request.user)
        self._sync_head_teacher_assignment(section, previous_head_teacher_id)

    def perform_destroy(self, instance):
        self.ensure_head_teacher_destroy(instance)
        super().perform_destroy(instance)


class CourseSubjectViewSet(HeadTeacherCourseScopeMixin, OrganizationScopedModelViewSet):
    queryset = models.CourseSubject.objects.select_related("course_section", "course_section__course")
    serializer_class = serializers.CourseSubjectSerializer
    permission_classes = [HasActionPermission]
    permission_module = "course"
    search_fields = ("name", "code", "description", "course_section__name", "course_section__course__title")
    filterset_fields = ("course_section", "status")
    course_lookup = "course_section__course_id"

    def _target_course_id(self, serializer):
        section = serializer.validated_data.get("course_section") or serializer.instance.course_section
        return section.course_id

    def _instance_course_id(self, instance):
        return instance.course_section.course_id

    def perform_create(self, serializer):
        self.ensure_head_teacher_write(serializer)
        super().perform_create(serializer)

    def perform_update(self, serializer):
        self.ensure_head_teacher_write(serializer)
        super().perform_update(serializer)

    def perform_destroy(self, instance):
        self.ensure_head_teacher_destroy(instance)
        super().perform_destroy(instance)


class AcademicStageViewSet(HeadTeacherCourseScopeMixin, OrganizationScopedModelViewSet):
    """Head-Teacher-managed sequential curriculum phase within a Course they head -
    e.g. "Phase 01 - Foundation" - deliberately separate from CourseSection (see
    models.py docstring)."""

    queryset = models.AcademicStage.objects.select_related("course")
    serializer_class = serializers.AcademicStageSerializer
    permission_classes = [HasActionPermission]
    permission_module = "course"
    search_fields = ("name", "display_label", "course__title")
    filterset_fields = ("course", "status")

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


class CourseSyllabusItemViewSet(OrganizationScopedModelViewSet):
    queryset = models.CourseSyllabusItem.objects.select_related("course", "course_section", "subject")
    serializer_class = serializers.CourseSyllabusItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ("title", "summary", "content", "course__title", "subject__name")
    filterset_fields = ("course", "course_section", "subject", "content_type", "is_public")

    def _teacher(self):
        return Employee.objects.filter(
            organization=self.get_request_organization(),
            email=self.request.user.email,
            employee_type="teacher",
        ).first()

    def _is_head_teacher(self, teacher, course_id, section_id=None):
        return models.TeacherAssignment.objects.filter(
            organization=teacher.organization,
            teacher=teacher,
            course_id=course_id,
            role=models.AssignmentRole.HEAD_TEACHER,
            is_active=True,
            assignment_status=models.AssignmentStatus.ACCEPTED,
        ).filter(Q(course_section__isnull=True) | Q(course_section_id=section_id)).exists()

    def _ensure_teacher_scope(self, course_id, section_id=None, subject_id=None):
        if self.request.user.is_staff or self.request.user.is_superuser:
            return
        teacher = self._teacher()
        if not teacher:
            # No permission_module is set on this ViewSet, so falling back to a generic
            # HasActionPermission check here always passed (no required permission = allow)
            # for ANY authenticated user, letting students create/edit any chapter. Only
            # staff/superuser (handled above) or an assigned teacher may manage outlines.
            raise PermissionDenied("A teacher profile is required for course outline management.")
        if self._is_head_teacher(teacher, course_id, section_id):
            return
        assignments = models.TeacherAssignment.objects.filter(
            organization=teacher.organization,
            teacher=teacher,
            course_id=course_id,
            is_active=True,
            assignment_status=models.AssignmentStatus.ACCEPTED,
        )
        if section_id:
            assignments = assignments.filter(Q(course_section__isnull=True) | Q(course_section_id=section_id))
        if subject_id:
            assignments = assignments.filter(Q(subject__isnull=True) | Q(subject_id=subject_id))
        if not assignments.exists():
            raise PermissionDenied("You are not assigned to manage this course outline.")

    def get_queryset(self):
        queryset = super().get_queryset()
        teacher = self._teacher()
        if self.request.user.is_staff or self.request.user.is_superuser:
            return queryset
        if not teacher:
            return queryset.none()
        if teacher:
            assignment_scope = models.TeacherAssignment.objects.filter(
                organization=teacher.organization,
                teacher=teacher,
                is_active=True,
                assignment_status=models.AssignmentStatus.ACCEPTED,
            )
            course_ids = assignment_scope.values_list("course_id", flat=True)
            subject_ids = assignment_scope.exclude(subject__isnull=True).values_list("subject_id", flat=True)
            return queryset.filter(Q(course_id__in=course_ids), Q(subject__isnull=True) | Q(subject_id__in=subject_ids))
        return queryset

    def perform_create(self, serializer):
        values = serializer.validated_data
        self._ensure_teacher_scope(
            values["course"].id,
            values.get("course_section").id if values.get("course_section") else None,
            values.get("subject").id if values.get("subject") else None,
        )
        serializer.save(
            organization=self.get_request_organization(),
            created_by=self.request.user,
            updated_by=self.request.user,
        )

    def perform_update(self, serializer):
        instance = self.get_object()
        values = serializer.validated_data
        course = values.get("course") or instance.course
        section = values.get("course_section", instance.course_section)
        subject = values.get("subject", instance.subject)
        self._ensure_teacher_scope(course.id, section.id if section else None, subject.id if subject else None)
        serializer.save(updated_by=self.request.user)


class TeacherAssignmentViewSet(HeadTeacherCourseScopeMixin, OrganizationScopedModelViewSet):
    queryset = models.TeacherAssignment.objects.select_related("teacher", "course", "course_section", "subject")
    serializer_class = serializers.TeacherAssignmentSerializer
    permission_classes = [HasActionPermission]
    permission_module = "course"
    search_fields = ("teacher__full_name", "teacher__employee_id", "course__title", "subject__name")
    filterset_fields = ("teacher", "course", "course_section", "subject", "role", "is_active")

    def _target_course_id(self, serializer):
        course = serializer.validated_data.get("course") or serializer.instance.course
        return course.id

    def _instance_course_id(self, instance):
        return instance.course_id

    def _ensure_role_authority(self, serializer):
        """Assigning/removing a HEAD teacher is Admin-only - a head teacher may assign
        subject/assistant/coordinator teachers within their own course, but not appoint
        another head teacher (or themselves elsewhere), matching "Admin assigns Head
        Teacher / Head Teacher assigns subject Teachers"."""
        if self._is_role_based_admin(self.request.user):
            return
        role = serializer.validated_data.get("role", getattr(serializer.instance, "role", None))
        if role == models.AssignmentRole.HEAD_TEACHER:
            raise PermissionDenied("Only an administrator can assign a Head Teacher.")

    def perform_create(self, serializer):
        self.ensure_head_teacher_write(serializer)
        self._ensure_role_authority(serializer)
        assignment = serializer.save(
            organization=self.get_request_organization(),
            created_by=self.request.user,
            updated_by=self.request.user,
            assigned_by=self.request.user,
        )
        if assignment.role == models.AssignmentRole.HEAD_TEACHER and assignment.course_section_id:
            assignment.course_section.head_teacher = assignment.teacher
            assignment.course_section.save(update_fields=["head_teacher", "updated_at"])

    def perform_update(self, serializer):
        self.ensure_head_teacher_write(serializer)
        self._ensure_role_authority(serializer)
        assignment = serializer.save(updated_by=self.request.user)
        if assignment.role == models.AssignmentRole.HEAD_TEACHER and assignment.course_section_id:
            assignment.course_section.head_teacher = assignment.teacher
            assignment.course_section.save(update_fields=["head_teacher", "updated_at"])

    def perform_destroy(self, instance):
        self.ensure_head_teacher_destroy(instance)
        if not self._is_role_based_admin(self.request.user) and instance.role == models.AssignmentRole.HEAD_TEACHER:
            raise PermissionDenied("Only an administrator can remove a Head Teacher assignment.")
        super().perform_destroy(instance)


class EnrollmentViewSet(StaffOrTeacherScopedQuerysetMixin, OrganizationScopedModelViewSet):
    queryset = models.Enrollment.objects.select_related("student", "course", "course_section", "application", "payment")
    serializer_class = serializers.EnrollmentSerializer
    permission_classes = [HasActionPermission]
    permission_module = "course"
    search_fields = ("enrollment_number", "student__full_name", "student__student_id", "course__title")
    filterset_fields = ("student", "course", "course_section", "status")

    @action(detail=True, methods=["post"])
    def activate(self, request, pk=None):
        enrollment = self.get_object()
        enrollment.status = models.EnrollmentStatus.ACTIVE
        enrollment.enrolled_at = enrollment.enrolled_at or timezone.now()
        enrollment.updated_by = request.user
        enrollment.save(update_fields=["status", "enrolled_at", "updated_by", "updated_at"])
        return success_response(self.get_serializer(enrollment).data, "Enrollment activated.")


class TeacherDashboardViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def _assignments(self, request):
        return models.TeacherAssignment.objects.filter(
            organization=request.user.organization,
            teacher__email=request.user.email,
            is_active=True,
            assignment_status=models.AssignmentStatus.ACCEPTED,
        ).select_related("course", "course_section", "subject", "teacher")

    def _teacher(self, request):
        from apps.people.models import Employee
        return Employee.objects.filter(
            organization=request.user.organization,
            email=request.user.email,
            employee_type="teacher",
        ).first()

    def _head_can_manage(self, teacher, course_id, section_id=None):
        return models.TeacherAssignment.objects.filter(
            organization=teacher.organization,
            teacher=teacher,
            course_id=course_id,
            role=models.AssignmentRole.HEAD_TEACHER,
            is_active=True,
            assignment_status=models.AssignmentStatus.ACCEPTED,
        ).filter(Q(course_section__isnull=True) | Q(course_section_id=section_id)).exists()

    def list(self, request):
        assignments = self._assignments(request)
        teacher = self._teacher(request)
        courses = {item.course_id: item.course for item in assignments}
        sections = {item.course_section_id: item.course_section for item in assignments if item.course_section_id}
        subjects = {item.subject_id: item.subject for item in assignments if item.subject_id}
        head_course_ids = assignments.filter(role=models.AssignmentRole.HEAD_TEACHER).values_list("course_id", flat=True)
        section_wide_ids = set()
        if head_course_ids:
            for section in models.CourseSection.objects.filter(
                organization=request.user.organization, course_id__in=head_course_ids, status="active"
            ):
                sections[section.id] = section
                section_wide_ids.add(section.id)
        # A subject-teacher assignment with subject=None means "every subject in this
        # section" (the same semantics AssessmentAdminViewSet._ensure_scope already
        # applies). Only expand sections actually covered by a subject=None assignment or
        # a head-teacher assignment - a teacher explicitly scoped to one subject in a
        # shared section must not see sibling subjects in that same section.
        section_wide_ids |= set(
            assignments.filter(subject__isnull=True, course_section__isnull=False).values_list("course_section_id", flat=True)
        )
        if section_wide_ids:
            for subject in models.CourseSubject.objects.filter(
                organization=request.user.organization,
                course_section_id__in=section_wide_ids,
                status="active",
            ):
                subjects[subject.id] = subject
        students = models.Enrollment.objects.filter(
            organization=request.user.organization,
            course_id__in=courses.keys(),
            status=models.EnrollmentStatus.ACTIVE,
        ).select_related("student").values(
            "student_id", "student__student_id", "student__full_name", "student__email", "course_id"
        )
        return Response({
            "assigned_courses": serializers.CourseSerializer(courses.values(), many=True).data,
            "assigned_sections": serializers.CourseSectionSerializer(sections.values(), many=True).data,
            "assigned_subjects": serializers.CourseSubjectSerializer(subjects.values(), many=True).data,
            "assignments": serializers.TeacherAssignmentSerializer(assignments, many=True).data,
            "available_teachers": list(Employee.objects.filter(
                organization=request.user.organization, employee_type="teacher", status="active"
            ).exclude(pk=teacher.pk if teacher else None).values("id", "full_name", "email", "employee_id")) if head_course_ids else [],
            "pending_invitations": serializers.TeacherAssignmentSerializer(
                models.TeacherAssignment.objects.filter(
                    organization=request.user.organization,
                    teacher=teacher,
                    assignment_status=models.AssignmentStatus.PENDING,
                ).select_related("course", "course_section", "subject"), many=True
            ).data if teacher else [],
            "students": list(students),
            "is_head_teacher": bool(head_course_ids),
        })

    @action(detail=False, methods=["post"])
    def invite_teacher(self, request):
        teacher = self._teacher(request)
        if not teacher:
            raise PermissionDenied("Teacher profile not found.")
        target_id = request.data.get("teacher")
        course_id = request.data.get("course")
        section_id = request.data.get("course_section") or None
        subject_id = request.data.get("subject") or None
        from apps.people.models import Employee
        target = Employee.objects.filter(
            organization=request.user.organization, pk=target_id, employee_type="teacher", status="active"
        ).first()
        subject = models.CourseSubject.objects.filter(organization=request.user.organization, pk=subject_id).select_related("course_section").first() if subject_id else None
        if not target or not course_id or not self._head_can_manage(teacher, course_id, section_id):
            raise PermissionDenied("You cannot assign teachers for this admission.")
        if subject and (str(subject.course_section.course_id) != str(course_id) or (section_id and str(subject.course_section_id) != str(section_id))):
            return Response({"detail": "The selected subject does not belong to this admission."}, status=400)
        assignment, created = models.TeacherAssignment.objects.get_or_create(
            organization=request.user.organization,
            teacher=target,
            course_id=course_id,
            course_section_id=section_id or (subject.course_section_id if subject else None),
            subject=subject,
            role=request.data.get("role", models.AssignmentRole.SUBJECT_TEACHER),
            defaults={
                "assigned_by": request.user,
                "created_by": request.user,
                "updated_by": request.user,
                "is_active": False,
                "assignment_status": models.AssignmentStatus.PENDING,
            },
        )
        if not created and assignment.assignment_status != models.AssignmentStatus.ACCEPTED:
            assignment.assignment_status = models.AssignmentStatus.PENDING
            assignment.is_active = False
            assignment.assigned_by = request.user
            assignment.updated_by = request.user
            assignment.save(update_fields=["assignment_status", "is_active", "assigned_by", "updated_by", "updated_at"])
        if created:
            from apps.accounts.models import User
            from apps.messaging.models import Notification
            recipient = User.objects.filter(organization=request.user.organization, email__iexact=target.email).first()
            if recipient:
                Notification.objects.create(
                    organization=request.user.organization,
                    recipient=recipient,
                    title="Teaching assignment invitation",
                    body=f"You have been invited to teach {subject.name if subject else 'an admission subject'}.",
                    notification_type="teacher_assignment",
                    target_url="/teacher/dashboard",
                    created_by=request.user,
                    updated_by=request.user,
                )
        return Response(serializers.TeacherAssignmentSerializer(assignment).data, status=201 if created else 200)

    @action(detail=False, methods=["post"])
    def respond_to_invitation(self, request):
        teacher = self._teacher(request)
        assignment = models.TeacherAssignment.objects.filter(
            organization=request.user.organization,
            pk=request.data.get("assignment"),
            teacher=teacher,
            assignment_status=models.AssignmentStatus.PENDING,
        ).first()
        decision = request.data.get("decision")
        if not assignment or decision not in {"accept", "decline"}:
            return Response({"detail": "A pending assignment and valid decision are required."}, status=400)
        assignment.assignment_status = models.AssignmentStatus.ACCEPTED if decision == "accept" else models.AssignmentStatus.DECLINED
        assignment.is_active = decision == "accept"
        assignment.responded_at = timezone.now()
        assignment.updated_by = request.user
        assignment.save(update_fields=["assignment_status", "is_active", "responded_at", "updated_by", "updated_at"])
        return Response(serializers.TeacherAssignmentSerializer(assignment).data)
