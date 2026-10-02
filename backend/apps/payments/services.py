import uuid
import logging
from decimal import Decimal

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import NotFound, ValidationError

from apps.admissions.models import AdmissionApplication, ApplicationStatus
from apps.admissions.services import AdmissionService
from apps.courses.models import Enrollment, EnrollmentStatus
from apps.messaging.models import Notification

from .models import AgreementStatus, BkashAgreement, PaymentStatus, AdmissionPaymentTransaction
from .providers import get_bkash_provider


logger = logging.getLogger("payments")
ACTIVE_STATUSES = (PaymentStatus.CREATED, PaymentStatus.AGREEMENT_REQUIRED, PaymentStatus.AGREEMENT_PENDING, PaymentStatus.READY_FOR_PAYMENT, PaymentStatus.PENDING, PaymentStatus.PROCESSING)


class PaymentService:
    @staticmethod
    def _get_record(public_id, user=None, for_update=False):
        queryset = AdmissionPaymentTransaction.objects
        if for_update:
            queryset = queryset.select_for_update(of=("self",))
        queryset = queryset.select_related("application__course", "application__organization", "agreement")
        if user is not None:
            queryset = queryset.filter(payer=user)
        try:
            return queryset.get(public_id=public_id)
        except AdmissionPaymentTransaction.DoesNotExist as exc:
            raise NotFound("Payment transaction not found.") from exc

    @staticmethod
    def _assert_owner(application, user):
        if application.applicant_id != user.id:
            raise ValidationError("You can only pay for your own admission application.")

    @staticmethod
    def _assert_eligible(application, user):
        PaymentService._assert_owner(application, user)
        if application.status != ApplicationStatus.APPROVED:
            raise ValidationError("This application must be approved before payment.")
        if application.payment_status == "paid":
            raise ValidationError("This admission has already been paid.")
        if not application.course_id or application.course.status not in {"admission_open", "running", "published"}:
            raise ValidationError("This admission is not active for payment.")
        if Enrollment.objects.filter(application=application, status=EnrollmentStatus.ACTIVE).exists():
            raise ValidationError("Your enrollment is already active.")
        amount = Decimal(application.course.admission_fee or 0)
        if amount <= 0:
            raise ValidationError("This is a free admission and does not require bKash payment.")
        return amount

    @staticmethod
    @transaction.atomic
    def initiate(application_id, user):
        application = AdmissionApplication.objects.select_for_update(of=("self",)).select_related("course", "organization").get(pk=application_id)
        amount = PaymentService._assert_eligible(application, user)
        existing = AdmissionPaymentTransaction.objects.select_for_update().filter(application=application, status__in=ACTIVE_STATUSES).first()
        if existing:
            return existing, False
        agreement = BkashAgreement.objects.select_for_update().filter(
            organization=application.organization,
            payer=user,
            environment=settings.BKASH_MODE,
            status=AgreementStatus.ACTIVE,
        ).first()
        transaction_record = AdmissionPaymentTransaction.objects.create(
            organization=application.organization,
            application=application,
            payer=user,
            course=application.course,
            agreement=agreement,
            environment=settings.BKASH_MODE,
            amount=amount,
            currency=settings.BKASH_CURRENCY,
            merchant_invoice_number=f"EXPERT_{application.id}_{uuid.uuid4().hex[:12].upper()}",
            payer_reference=application.application_no,
            status=PaymentStatus.READY_FOR_PAYMENT if agreement else PaymentStatus.AGREEMENT_REQUIRED,
            initiated_at=timezone.now(),
            created_by=user,
            updated_by=user,
        )
        transaction_record.raw_metadata = {"provider_state": "agreement_active" if agreement else "agreement_required"}
        transaction_record.save(update_fields=["raw_metadata", "updated_at"])
        application.payment_status = "payment_required"
        application.save(update_fields=["payment_status", "updated_at"])
        return transaction_record, True

    @staticmethod
    @transaction.atomic
    def start_agreement(transaction_public_id, user):
        record = PaymentService._get_record(transaction_public_id, user, for_update=True)
        if record.agreement_id and record.agreement.status == AgreementStatus.ACTIVE:
            record.status = PaymentStatus.READY_FOR_PAYMENT
            record.save(update_fields=["status", "updated_at"])
            return record.agreement
        if record.agreement_id and record.agreement.status == AgreementStatus.PENDING:
            return record.agreement
        active = BkashAgreement.objects.select_for_update().filter(organization=record.organization, payer=user, environment=settings.BKASH_MODE, status=AgreementStatus.ACTIVE).first()
        if active:
            record.agreement, record.status = active, PaymentStatus.READY_FOR_PAYMENT
            record.save(update_fields=["agreement", "status", "updated_at"])
            return active
        agreement = BkashAgreement.objects.create(
            organization=record.organization, payer=user, environment=settings.BKASH_MODE,
            payer_reference=record.application.application_no, status=AgreementStatus.PENDING,
            initiated_at=timezone.now(), raw_metadata={"stage": "account"}, created_by=user, updated_by=user,
        )
        result = get_bkash_provider().start_agreement(agreement)
        agreement.raw_metadata = {"stage": result.next_step}
        agreement.save(update_fields=["raw_metadata", "updated_at"])
        record.agreement, record.status = agreement, PaymentStatus.AGREEMENT_PENDING
        record.save(update_fields=["agreement", "status", "updated_at"])
        return agreement

    @staticmethod
    @transaction.atomic
    def agreement_step(transaction_public_id, user, step, value):
        record = PaymentService._get_record(transaction_public_id, user, for_update=True)
        if settings.BKASH_MODE != "mock" or not settings.DEBUG:
            raise ValidationError("Agreement credentials are handled only by the official bKash hosted checkout.")
        agreement = BkashAgreement.objects.select_for_update().get(pk=record.agreement_id, payer=user)
        if agreement.status != AgreementStatus.PENDING:
            raise ValidationError("This agreement session is no longer pending.")
        expected_stage = agreement.raw_metadata.get("stage")
        if expected_stage != step:
            raise ValidationError(f"Complete the {expected_stage or 'current'} agreement step first.")
        provider = get_bkash_provider()
        if step == "account":
            result = provider.validate_account(agreement, value)
        elif step == "otp":
            result = provider.validate_otp(agreement, value)
        elif step == "pin":
            result = provider.validate_pin(agreement, value)
        else:
            raise ValidationError("Unknown agreement step.")
        if result.state == "failed":
            raise ValidationError(result.message)
        agreement.masked_account = result.masked_account or agreement.masked_account
        agreement.raw_metadata = {"stage": result.next_step}
        if result.state == "active":
            agreement.status = AgreementStatus.ACTIVE
            agreement.agreement_id = result.agreement_id
            agreement.verified_at = timezone.now()
            record.status = PaymentStatus.READY_FOR_PAYMENT
            record.save(update_fields=["status", "updated_at"])
        agreement.save(update_fields=["masked_account", "raw_metadata", "status", "agreement_id", "verified_at", "updated_at"])
        return agreement

    @staticmethod
    @transaction.atomic
    def cancel(transaction_public_id, user):
        record = PaymentService._get_record(transaction_public_id, user, for_update=True)
        if record.status == PaymentStatus.COMPLETED:
            raise ValidationError("A completed payment cannot be cancelled.")
        if record.agreement_id and record.agreement.status == AgreementStatus.PENDING:
            get_bkash_provider().cancel_agreement(record.agreement)
            record.agreement.status = AgreementStatus.CANCELLED
            record.agreement.cancelled_at = timezone.now()
            record.agreement.save(update_fields=["status", "cancelled_at", "updated_at"])
        record.status, record.cancelled_at = PaymentStatus.CANCELLED, timezone.now()
        record.save(update_fields=["status", "cancelled_at", "updated_at"])
        return record

    @staticmethod
    @transaction.atomic
    def disconnect_agreement(agreement_public_id, user):
        try:
            agreement = BkashAgreement.objects.select_for_update().get(public_id=agreement_public_id, payer=user)
        except BkashAgreement.DoesNotExist as exc:
            raise NotFound("bKash agreement not found.") from exc
        if agreement.status == AgreementStatus.ACTIVE:
            get_bkash_provider().cancel_agreement(agreement)
            agreement.status, agreement.cancelled_at = AgreementStatus.CANCELLED, timezone.now()
            agreement.save(update_fields=["status", "cancelled_at", "updated_at"])
        AdmissionPaymentTransaction.objects.filter(
            agreement=agreement,
            payer=user,
            status__in=ACTIVE_STATUSES,
        ).update(status=PaymentStatus.AGREEMENT_REQUIRED)
        return agreement

    @staticmethod
    @transaction.atomic
    def execute(transaction_public_id, user=None, simulation=None):
        record = PaymentService._get_record(transaction_public_id, user, for_update=True)
        if record.status == PaymentStatus.COMPLETED:
            if record.enrollment_activation_status != "active":
                PaymentService.activate_enrollment_safely(record)
                record.refresh_from_db()
            return record
        if record.status not in ACTIVE_STATUSES:
            return record
        if not record.agreement_id or record.agreement.status != AgreementStatus.ACTIVE:
            raise ValidationError("A verified bKash agreement is required before payment.")
        if simulation and (settings.BKASH_MODE != "mock" or not settings.DEBUG):
            raise ValidationError("Mock payment simulation is unavailable.")
        provider = get_bkash_provider()
        if not record.provider_payment_id:
            created = provider.create_payment(record)
            record.provider_payment_id = created.payment_id
            record.status = PaymentStatus.PROCESSING
            record.save(update_fields=["provider_payment_id", "status", "updated_at"])
        result = provider.execute_payment(record, simulation=simulation)
        record.raw_metadata = {**record.raw_metadata, "provider_state": result.state}
        if result.state == "completed":
            if result.payment_id != record.provider_payment_id or result.amount != record.amount or result.currency != record.currency or result.merchant_invoice != record.merchant_invoice_number or result.agreement_id != record.agreement.agreement_id:
                logger.warning("Payment verification mismatch", extra={"payment_id": str(record.public_id), "invoice": record.merchant_invoice_number})
                record.status, record.failed_at = PaymentStatus.FAILED, timezone.now()
                record.failure_code, record.failure_message = "verification_mismatch", "Provider payment details did not match the expected transaction."
                record.save(update_fields=["status", "failed_at", "failure_code", "failure_message", "updated_at"])
                return record
            record.status = PaymentStatus.COMPLETED
            record.transaction_id = result.transaction_id
            record.completed_at = record.verified_at = timezone.now()
            record.failure_code = record.failure_message = ""
            record.save(update_fields=["status", "transaction_id", "completed_at", "verified_at", "failure_code", "failure_message", "raw_metadata", "updated_at"])
            PaymentService.activate_enrollment_safely(record)
            record.refresh_from_db()
        elif result.state == "failed":
            record.status, record.failed_at = PaymentStatus.FAILED, timezone.now()
            record.failure_message = result.message
            record.save(update_fields=["status", "failed_at", "failure_message", "raw_metadata", "updated_at"])
        elif result.state == "cancelled":
            record.status, record.cancelled_at = PaymentStatus.CANCELLED, timezone.now()
            record.failure_message = result.message
            record.save(update_fields=["status", "cancelled_at", "failure_message", "raw_metadata", "updated_at"])
        else:
            record.status = PaymentStatus.PENDING
            record.save(update_fields=["status", "raw_metadata", "updated_at"])
        return record

    @staticmethod
    def activate_enrollment_safely(record):
        """Persist financial success and make downstream activation retryable."""
        try:
            with transaction.atomic():
                PaymentService.complete_admission_payment(record)
        except Exception as exc:
            logger.exception(
                "Enrollment activation failed after verified payment",
                extra={"payment_id": str(record.public_id), "invoice": record.merchant_invoice_number},
            )
            record.refresh_from_db()
            record.enrollment_activation_status = "failed"
            record.enrollment_failure_message = str(exc)[:500]
            record.save(update_fields=["enrollment_activation_status", "enrollment_failure_message", "updated_at"])

    @staticmethod
    @transaction.atomic
    def complete_admission_payment(record):
        record = AdmissionPaymentTransaction.objects.select_for_update(of=("self",)).select_related("application__course", "application__organization").get(pk=record.pk)
        if record.status != PaymentStatus.COMPLETED:
            raise ValidationError("Only verified completed transactions can activate enrollment.")
        application = AdmissionApplication.objects.select_for_update(of=("self",)).select_related("course", "organization").get(pk=record.application_id)
        if application.payment_status != "paid":
            application.payment_status = "paid"
            application.payment_reference = record.transaction_id or record.merchant_invoice_number
            application.save(update_fields=["payment_status", "payment_reference", "updated_at"])
        student, enrollment = AdmissionService.activate_application_enrollment(application, record.payer)
        if application.applicant_id:
            Notification.objects.get_or_create(
                organization=application.organization, recipient_id=application.applicant_id,
                notification_type=f"admission_payment_verified_{application.id}", title="Admission payment verified",
                defaults={"body": f"Your payment of ৳{record.amount} has been verified successfully.", "target_url": "/student/courses", "created_by": record.payer, "updated_by": record.payer},
            )
            Notification.objects.get_or_create(
                organization=application.organization, recipient_id=application.applicant_id,
                notification_type=f"admission_enrollment_active_{application.id}", title="Enrollment active",
                defaults={"body": f"Your enrollment in {application.course.title} is now active.", "target_url": "/student/courses", "created_by": record.payer, "updated_by": record.payer},
            )
        record.student = student
        record.enrollment_activation_status = "active"
        record.enrollment_failure_message = ""
        record.enrollment_activated_at = timezone.now()
        record.save(update_fields=["student", "enrollment_activation_status", "enrollment_failure_message", "enrollment_activated_at", "updated_at"])
        return enrollment
