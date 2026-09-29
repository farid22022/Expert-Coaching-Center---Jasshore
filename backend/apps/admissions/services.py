from django.db import transaction
from django.utils import timezone
from apps.people.models import Guardian, Student
from apps.courses.models import Enrollment, EnrollmentStatus
from apps.messaging.models import Notification
from .models import AdmissionApplication, AdmissionResult, ApplicationStatus


class AdmissionService:
    @staticmethod
    def generate_application_no(organization_id, admission_program=False):
        prefix = timezone.now().strftime("ADM-%Y-") if admission_program else timezone.now().strftime("APP%Y%m")
        count = AdmissionApplication.objects.filter(
            organization_id=organization_id,
            application_no__startswith=prefix,
        ).count()
        return f"{prefix}{count + 1:06d}" if admission_program else f"{prefix}{count + 1:05d}"

    @staticmethod
    @transaction.atomic
    def approve_application(application, approved_by, activate_existing=False):
        application = AdmissionApplication.objects.select_for_update().select_related("course", "organization").get(pk=application.pk)
        if application.status == ApplicationStatus.APPROVED:
            enrollment = Enrollment.objects.filter(application=application, status=EnrollmentStatus.ACTIVE).first()
            if enrollment or not activate_existing:
                return application.approved_student, enrollment
        if application.status not in {ApplicationStatus.PENDING, ApplicationStatus.UNDER_REVIEW, ApplicationStatus.APPROVED}:
            raise ValueError("Only pending or under-review applications can be approved.")

        # Paid admissions stop here. Only the verified gateway completion
        # service may call this method again with activate_existing=True.
        if application.status != ApplicationStatus.APPROVED and application.course_id and application.course.admission_fee > 0:
            application.status = ApplicationStatus.APPROVED
            application.payment_status = "payment_required"
            application.reviewed_by = approved_by
            application.reviewed_at = timezone.now()
            application.approved_at = timezone.now()
            application.updated_by = approved_by
            application.save(update_fields=["status", "payment_status", "reviewed_by", "reviewed_at", "approved_at", "updated_by", "updated_at"])
            if application.applicant_id:
                Notification.objects.get_or_create(
                    organization=application.organization,
                    recipient=application.applicant,
                    notification_type=f"admission_payment_required_{application.id}",
                    title="Admission approved — payment required",
                    defaults={"body": f"Your admission to {application.course.title} has been approved. Please complete the admission payment.", "target_url": f"/student/admissions/{application.id}/payment", "created_by": approved_by, "updated_by": approved_by},
                )
            return application.approved_student, None

        guardian = None
        if application.guardian_name or application.guardian_phone:
            guardian = Guardian.objects.create(
                organization=application.organization,
                name=application.guardian_name or application.applicant_name,
                relation="Guardian",
                phone=application.guardian_phone or application.applicant_phone,
                created_by=approved_by,
                updated_by=approved_by,
            )

        # The Student record must key off the applicant's real account email
        # (application.applicant, the authenticated User who submitted this
        # application), not the free-text applicant_email typed into the form
        # - every other student-facing endpoint in this codebase resolves
        # "the current student" via Student.email == request.user.email, so
        # keying this off form text instead would silently disconnect the
        # approved student from their own enrollment whenever the two emails
        # differ. Only unauthenticated/offline applications (no linked User)
        # fall back to the typed email.
        account_email = application.applicant.email if application.applicant_id else application.applicant_email
        student = Student.objects.filter(organization=application.organization, email__iexact=account_email).first()
        if not student:
            student = Student.objects.create(
                organization=application.organization,
                student_id=f"STU-{application.application_no}",
                admission_no=application.application_no,
                full_name=application.applicant_name,
                full_name_bn=application.applicant_name_bn,
                gender=application.gender,
                date_of_birth=application.date_of_birth,
                phone=application.applicant_phone,
                email=account_email,
                session=application.session,
                academic_class=application.academic_class,
                group=application.group,
                shift=application.shift,
                created_by=approved_by,
                updated_by=approved_by,
            )
        if guardian:
            student.guardians.add(guardian, through_defaults={"is_primary": True})
        enrollment = None
        if application.course_id:
            section = application.course.sections.filter(status="active").order_by("order", "id").first()
            enrollment, _ = Enrollment.objects.get_or_create(
                organization=application.organization,
                student=student,
                course=application.course,
                defaults={
                    "course_section": section,
                    "application": application,
                    "enrollment_number": f"ENR-{application.application_no}",
                    "enrolled_at": timezone.now(),
                    "status": EnrollmentStatus.ACTIVE,
                    "created_by": approved_by,
                    "updated_by": approved_by,
                },
            )
            if enrollment.status != EnrollmentStatus.ACTIVE:
                enrollment.status = EnrollmentStatus.ACTIVE
                enrollment.application = application
                enrollment.enrolled_at = enrollment.enrolled_at or timezone.now()
                enrollment.updated_by = approved_by
                enrollment.save(update_fields=["status", "application", "enrolled_at", "updated_by", "updated_at"])
        application.status = ApplicationStatus.APPROVED
        application.approved_student = student
        application.reviewed_by = approved_by
        application.reviewed_at = timezone.now()
        application.approved_at = timezone.now()
        application.updated_by = approved_by
        application.save(update_fields=["status", "approved_student", "reviewed_by", "reviewed_at", "approved_at", "updated_by", "updated_at"])
        if application.applicant_id and application.course_id:
            Notification.objects.get_or_create(
                organization=application.organization,
                recipient=application.applicant,
                notification_type="admission_approved",
                title="Admission approved",
                defaults={"body": f"Your admission to {application.course.title} has been approved.", "target_url": "/student/dashboard", "created_by": approved_by, "updated_by": approved_by},
            )
        return student, enrollment

    @staticmethod
    def activate_application_enrollment(application, actor):
        """Single trusted activation bridge for verified gateway payments."""
        return AdmissionService.approve_application(application, actor, activate_existing=True)

    @staticmethod
    @transaction.atomic
    def process_exam_result(exam):
        marks = exam.marks.select_related("application").order_by("-obtained_marks")
        results = []
        for index, mark in enumerate(marks, start=1):
            results.append(AdmissionResult(
                organization=exam.organization,
                exam=exam,
                application=mark.application,
                obtained_marks=mark.obtained_marks,
                position=index,
                is_selected=mark.obtained_marks >= exam.pass_marks,
            ))
        AdmissionResult.objects.filter(exam=exam).delete()
        AdmissionResult.objects.bulk_create(results)
        return results

