from django.db import transaction
from django.utils import timezone
from apps.people.models import Guardian, Student
from .models import AdmissionApplication, AdmissionResult


class AdmissionService:
    @staticmethod
    def generate_application_no(organization_id):
        prefix = timezone.now().strftime("APP%Y%m")
        count = AdmissionApplication.objects.filter(
            organization_id=organization_id,
            application_no__startswith=prefix,
        ).count()
        return f"{prefix}{count + 1:05d}"

    @staticmethod
    @transaction.atomic
    def approve_application(application, approved_by):
        if application.status == "approved":
            return application.approved_student

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

        student = Student.objects.create(
            organization=application.organization,
            student_id=f"STU-{application.application_no}",
            admission_no=application.application_no,
            full_name=application.applicant_name,
            phone=application.applicant_phone,
            email=application.applicant_email,
            session=application.session,
            academic_class=application.academic_class,
            group=application.group,
            shift=application.shift,
            created_by=approved_by,
            updated_by=approved_by,
        )
        if guardian:
            student.guardians.add(guardian, through_defaults={"is_primary": True})
        application.status = "approved"
        application.approved_student = student
        application.updated_by = approved_by
        application.save(update_fields=["status", "approved_student", "updated_by", "updated_at"])
        return student

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

