from django.contrib import admin
from apps.core.admin_utils import OrganizationScopedAdmin
from .models import AdmissionPaymentTransaction, BkashAgreement, PaymentWebhookEvent


@admin.register(BkashAgreement)
class BkashAgreementAdmin(OrganizationScopedAdmin):
    list_display = ("agreement_id", "payer", "masked_account", "environment", "status", "verified_at")
    search_fields = ("agreement_id", "payer__email", "payer_reference")
    list_filter = ("organization", "status", "environment")
    readonly_fields = ("public_id", "agreement_id", "masked_account", "raw_metadata", "created_at", "updated_at", "verified_at")
    def has_delete_permission(self, request, obj=None): return False


@admin.register(AdmissionPaymentTransaction)
class PaymentTransactionAdmin(OrganizationScopedAdmin):
    list_display = ("merchant_invoice_number", "application", "amount", "environment", "status", "transaction_id", "created_at")
    search_fields = ("merchant_invoice_number", "transaction_id", "application__application_no")
    list_filter = ("organization", "status", "environment", "provider")
    readonly_fields = ("public_id", "merchant_invoice_number", "provider_payment_id", "transaction_id", "amount", "currency", "raw_metadata", "created_at", "updated_at", "completed_at", "verified_at")
    def has_delete_permission(self, request, obj=None): return False


@admin.register(PaymentWebhookEvent)
class PaymentWebhookEventAdmin(OrganizationScopedAdmin):
    list_display = ("event_key", "provider", "transaction", "processed_at", "created_at")
    readonly_fields = ("event_key", "payload", "processed_at", "created_at", "updated_at")
