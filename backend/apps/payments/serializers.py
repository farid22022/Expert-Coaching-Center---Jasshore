from rest_framework import serializers
from .models import AdmissionPaymentTransaction, BkashAgreement


class BkashAgreementSerializer(serializers.ModelSerializer):
    stage = serializers.SerializerMethodField()
    class Meta:
        model = BkashAgreement
        fields = ("public_id", "agreement_id", "environment", "status", "masked_account", "stage", "initiated_at", "verified_at", "cancelled_at")
    def get_stage(self, obj):
        return (obj.raw_metadata or {}).get("stage", "")


class PaymentTransactionSerializer(serializers.ModelSerializer):
    application_no = serializers.CharField(source="application.application_no", read_only=True)
    admission_name = serializers.CharField(source="course.title", read_only=True)
    applicant_name = serializers.CharField(source="application.applicant_name", read_only=True)
    agreement = BkashAgreementSerializer(read_only=True)
    enrollment_status = serializers.SerializerMethodField()

    class Meta:
        model = AdmissionPaymentTransaction
        fields = ("public_id", "application", "application_no", "admission_name", "applicant_name", "amount", "currency", "provider", "environment", "merchant_invoice_number", "provider_payment_id", "transaction_id", "status", "failure_code", "failure_message", "agreement", "enrollment_status", "enrollment_activation_status", "enrollment_failure_message", "enrollment_activated_at", "initiated_at", "completed_at", "verified_at", "cancelled_at", "created_at", "updated_at")

    def get_enrollment_status(self, obj):
        enrollment = obj.application.enrollments.order_by("-created_at").first()
        return enrollment.status if enrollment else "inactive"
