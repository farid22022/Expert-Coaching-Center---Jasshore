import uuid

from django.db import models

from apps.core.models import OrganizationScopedModel


class PaymentProvider(models.TextChoices):
    BKASH = "bkash", "bKash"


class PaymentEnvironment(models.TextChoices):
    MOCK = "mock", "Mock"
    SANDBOX = "sandbox", "Sandbox"
    LIVE = "live", "Live"


class PaymentStatus(models.TextChoices):
    CREATED = "created", "Created"
    AGREEMENT_REQUIRED = "agreement_required", "Agreement required"
    AGREEMENT_PENDING = "agreement_pending", "Agreement pending"
    READY_FOR_PAYMENT = "ready_for_payment", "Ready for payment"
    PENDING = "pending", "Pending"
    PROCESSING = "processing", "Processing"
    COMPLETED = "completed", "Completed"
    FAILED = "failed", "Failed"
    CANCELLED = "cancelled", "Cancelled"
    EXPIRED = "expired", "Expired"
    REFUND_PENDING = "refund_pending", "Refund pending"
    PARTIALLY_REFUNDED = "partially_refunded", "Partially refunded"
    REFUNDED = "refunded", "Refunded"


class AgreementStatus(models.TextChoices):
    CREATED = "created", "Created"
    PENDING = "pending", "Pending"
    ACTIVE = "active", "Active"
    CANCELLED = "cancelled", "Cancelled"
    EXPIRED = "expired", "Expired"
    FAILED = "failed", "Failed"


class BkashAgreement(OrganizationScopedModel):
    public_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False, db_index=True)
    payer = models.ForeignKey("accounts.User", on_delete=models.PROTECT, related_name="bkash_agreements")
    student = models.ForeignKey("people.Student", null=True, blank=True, on_delete=models.SET_NULL, related_name="bkash_agreements")
    provider = models.CharField(max_length=20, choices=PaymentProvider.choices, default=PaymentProvider.BKASH)
    environment = models.CharField(max_length=20, choices=PaymentEnvironment.choices)
    payer_reference = models.CharField(max_length=120, db_index=True)
    agreement_id = models.CharField(max_length=180, null=True, blank=True, unique=True)
    status = models.CharField(max_length=20, choices=AgreementStatus.choices, default=AgreementStatus.CREATED, db_index=True)
    masked_account = models.CharField(max_length=30, blank=True)
    initiated_at = models.DateTimeField(null=True, blank=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    raw_metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["organization", "payer", "status"]),
            models.Index(fields=["environment", "agreement_id"]),
        ]
        ordering = ("-created_at",)


class AdmissionPaymentTransaction(OrganizationScopedModel):
    public_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False, db_index=True)
    application = models.ForeignKey("admissions.AdmissionApplication", on_delete=models.PROTECT, related_name="gateway_transactions")
    student = models.ForeignKey("people.Student", null=True, blank=True, on_delete=models.SET_NULL, related_name="payment_transactions")
    payer = models.ForeignKey("accounts.User", on_delete=models.PROTECT, related_name="payment_transactions")
    course = models.ForeignKey("courses.Course", on_delete=models.PROTECT, related_name="payment_transactions")
    agreement = models.ForeignKey(BkashAgreement, null=True, blank=True, on_delete=models.PROTECT, related_name="transactions")
    provider = models.CharField(max_length=20, choices=PaymentProvider.choices, default=PaymentProvider.BKASH)
    environment = models.CharField(max_length=20, choices=PaymentEnvironment.choices)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=8, default="BDT")
    merchant_invoice_number = models.CharField(max_length=120, unique=True)
    payer_reference = models.CharField(max_length=120, blank=True)
    provider_payment_id = models.CharField(max_length=180, null=True, blank=True, unique=True)
    transaction_id = models.CharField(max_length=180, null=True, blank=True, unique=True)
    status = models.CharField(max_length=30, choices=PaymentStatus.choices, default=PaymentStatus.CREATED, db_index=True)
    failure_code = models.CharField(max_length=100, blank=True)
    failure_message = models.CharField(max_length=500, blank=True)
    refund_status = models.CharField(max_length=40, blank=True)
    refunded_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    enrollment_activation_status = models.CharField(max_length=20, default="not_started", db_index=True)
    enrollment_failure_message = models.CharField(max_length=500, blank=True)
    enrollment_activated_at = models.DateTimeField(null=True, blank=True)
    initiated_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    failed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    raw_metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["organization", "status", "created_at"]),
            models.Index(fields=["organization", "application", "status"]),
        ]
        ordering = ("-created_at",)


class PaymentWebhookEvent(OrganizationScopedModel):
    provider = models.CharField(max_length=20, choices=PaymentProvider.choices, default=PaymentProvider.BKASH)
    event_key = models.CharField(max_length=180, unique=True)
    transaction = models.ForeignKey(AdmissionPaymentTransaction, null=True, blank=True, on_delete=models.SET_NULL, related_name="webhook_events")
    event_type = models.CharField(max_length=100, blank=True)
    payload = models.JSONField(default=dict, blank=True)
    processed_at = models.DateTimeField(null=True, blank=True)

