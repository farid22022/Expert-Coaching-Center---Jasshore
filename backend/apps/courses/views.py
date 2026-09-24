from django.db.models import Q
from django.utils import timezone
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from apps.core.permissions import HasActionPermission
from apps.core.responses import success_response
from apps.core.viewsets import OrganizationScopedModelViewSet
from apps.people.models import Employee
from . import models, serializers


class StudentPortalViewSet(viewsets.ViewSet):
    """Read-only learning data derived from the student's approved enrollments."""

    permission_classes = [permissions.IsAuthenticated]

    def _student(self, request):
        from apps.people.models import Student
        return Student.objects.filter(
            organization=request.user.organization,
            email__iexact=request.user.email,
        ).first()

    def _progress(self, student, course):
        from apps.assessments import models as assessment_models
        total = assessment_models.Assessment.objects.filter(
            organization=course.organization,
            course=course,
            status__in=["published", "scheduled", "live"],
        ).count()
        completed = assessment_models.AssessmentAttempt.objects.filter(
            student=student,
            assessment__course=course,
        ).exclude(status="in_progress").count()
        return {"completed_units": completed, "total_units": total, "percentage": round((completed / total) * 100) if total else 0}

    def list(self, request):
        from apps.admissions.models import AdmissionApplication, ApplicationStatus

        student = self._student(request)
        enrollments = models.Enrollment.objects.none()
        if student:
            enrollments = models.Enrollment.objects.filter(
                organization=request.user.organization,
                student=student,
                status=models.EnrollmentStatus.ACTIVE,
            ).select_related("course", "course_section", "application")
        pending = AdmissionApplication.objects.filter(
            organization=request.user.organization,
            applicant=request.user,
            status__in=[ApplicationStatus.DRAFT, ApplicationStatus.PENDING, ApplicationStatus.UNDER_REVIEW, ApplicationStatus.REJECTED],
        ).select_related("course").order_by("-submitted_at", "-created_at")
        return Response({
            "student": {"id": student.id, "name": student.full_name} if student else {"id": None, "name": request.user.get_full_name() or request.user.email},
            "pending_applications": [{
                "id": application.id,
                "application_no": application.application_no,
                "program": application.course.title if application.course else "Admission program",
                "status": application.status,
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
                "progress": self._progress(student, enrollment.course),
            } for enrollment in enrollments],
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
        now = timezone.now()
        materials = assessment_models.CourseMaterial.objects.filter(
            organization=request.user.organization,
            course=enrollment.course,
            is_published=True,
            status="published",
            review_status="approved",
        ).filter(Q(publish_at__isnull=True) | Q(publish_at__lte=now)).select_related("subject", "created_by_teacher")
        assessments = assessment_models.Assessment.objects.filter(
            organization=request.user.organization,
            course=enrollment.course,
            status__in=["published", "scheduled", "live"],
            review_status="approved",
        ).filter(Q(publish_at__isnull=True) | Q(publish_at__lte=now)).select_related("subject")
        subject_names = {subject.id: subject.name for section in enrollment.course.sections.all() for subject in section.subjects.all()}
        teacher_names = {assignment.teacher_id: assignment.teacher.full_name for assignment in enrollment.course.teacher_assignments.select_related("teacher")}
        material_data = assessment_serializers.CourseMaterialSerializer(materials, many=True).data
        assessment_data = assessment_serializers.AssessmentSerializer(assessments, many=True).data
        for item in material_data:
            item["subject_name"] = subject_names.get(item.get("subject"), "General")
            item["teacher_name"] = teacher_names.get(item.get("created_by_teacher"), "Expert Coaching Center")
            item["unit_type"] = item.get("material_type") or "material"
        for item in assessment_data:
            item["subject_name"] = subject_names.get(item.get("subject"), "General")
            item["teacher_name"] = teacher_names.get(item.get("created_by_teacher"), "Expert Coaching Center")
            item["unit_type"] = item.get("assessment_type") or "test"
        return Response({
            "enrollment": {
                **serializers.EnrollmentSerializer(enrollment).data,
                "course_title": enrollment.course.title,
                "section_name": enrollment.course_section.name if enrollment.course_section_id else "",
            },
            "materials": material_data,
            "assessments": assessment_data,
            "progress": self._progress(student, enrollment.course),
            "outline": [{"section": section.name, "subjects": [{"id": subject.id, "name": subject.name, "order": subject.order} for subject in section.subjects.all()]} for section in enrollment.course.sections.all()],
        })


class CourseViewSet(OrganizationScopedModelViewSet):
    queryset = models.Course.objects.select_related("session").prefetch_related(
        "sections",
        "sections__subjects",
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
        authentication_classes=[],
    )
    def public_admissions(self, request):
        serializer = self.get_serializer(self._public_admission_queryset(), many=True)
        return success_response(serializer.data, "Admission cards loaded.")

    @action(
        detail=False,
        methods=["get"],
        url_path=r"public-admissions/(?P<identifier>[^/.]+)",
        permission_classes=[permissions.AllowAny],
        authentication_classes=[],
    )
    def public_admission_detail(self, request, identifier=None):
        queryset = self._public_admission_queryset()
        lookup = Q(slug=identifier)
        if str(identifier).isdigit():
            lookup |= Q(pk=int(identifier))
        course = queryset.filter(lookup).first()
        if not course:
            return Response({"detail": "Admission card not found."}, status=404)
        return success_response(self.get_serializer(course).data, "Admission card loaded.")


class CourseSectionViewSet(OrganizationScopedModelViewSet):
    queryset = models.CourseSection.objects.select_related("course", "head_teacher")
    serializer_class = serializers.CourseSectionSerializer
    permission_classes = [HasActionPermission]
    permission_module = "course"
    search_fields = ("name", "description", "course__title")
    filterset_fields = ("course", "head_teacher", "status")


class CourseSubjectViewSet(OrganizationScopedModelViewSet):
    queryset = models.CourseSubject.objects.select_related("course_section", "course_section__course")
    serializer_class = serializers.CourseSubjectSerializer
    permission_classes = [HasActionPermission]
    permission_module = "course"
    search_fields = ("name", "code", "description", "course_section__name", "course_section__course__title")
    filterset_fields = ("course_section", "status")


class TeacherAssignmentViewSet(OrganizationScopedModelViewSet):
    queryset = models.TeacherAssignment.objects.select_related("teacher", "course", "course_section", "subject")
    serializer_class = serializers.TeacherAssignmentSerializer
    permission_classes = [HasActionPermission]
    permission_module = "course"
    search_fields = ("teacher__full_name", "teacher__employee_id", "course__title", "subject__name")
    filterset_fields = ("teacher", "course", "course_section", "subject", "role", "is_active")

    def perform_create(self, serializer):
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
        assignment = serializer.save(updated_by=self.request.user)
        if assignment.role == models.AssignmentRole.HEAD_TEACHER and assignment.course_section_id:
            assignment.course_section.head_teacher = assignment.teacher
            assignment.course_section.save(update_fields=["head_teacher", "updated_at"])


class EnrollmentViewSet(OrganizationScopedModelViewSet):
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
        if head_course_ids:
            for section in models.CourseSection.objects.filter(
                organization=request.user.organization, course_id__in=head_course_ids, status="active"
            ):
                sections[section.id] = section
            for subject in models.CourseSubject.objects.filter(
                organization=request.user.organization,
                course_section_id__in=sections.keys(),
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
