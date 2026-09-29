"""Provider boundary. Admission logic never calls a gateway directly."""
import uuid
import hmac
from dataclasses import dataclass
from decimal import Decimal

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured


@dataclass
class ProviderResult:
    state: str
    payment_id: str
    transaction_id: str = ""
    checkout_url: str = ""
    message: str = ""
    amount: Decimal | None = None
    currency: str = ""
    merchant_invoice: str = ""
    agreement_id: str = ""


@dataclass
class AgreementResult:
    state: str
    agreement_id: str = ""
    masked_account: str = ""
    next_step: str = ""
    message: str = ""


class MockBkashProvider:
    def start_agreement(self, agreement):
        return AgreementResult("pending", next_step="account")

    def validate_account(self, agreement, account):
        if not hmac.compare_digest(str(account or ""), settings.BKASH_MOCK_ACCOUNT):
            return AgreementResult("failed", next_step="account", message="Invalid test bKash account number.")
        masked = f"{account[:3]}******{account[-2:]}"
        return AgreementResult("pending", masked_account=masked, next_step="otp")

    def validate_otp(self, agreement, otp):
        if not hmac.compare_digest(str(otp or ""), settings.BKASH_MOCK_OTP):
            return AgreementResult("failed", masked_account=agreement.masked_account, next_step="otp", message="Invalid test verification code.")
        return AgreementResult("pending", masked_account=agreement.masked_account, next_step="pin")

    def validate_pin(self, agreement, pin):
        if not hmac.compare_digest(str(pin or ""), settings.BKASH_MOCK_PIN):
            return AgreementResult("failed", masked_account=agreement.masked_account, next_step="pin", message="Invalid test PIN.")
        return AgreementResult("active", agreement_id=f"MOCK_AGR_{uuid.uuid4().hex.upper()}", masked_account=agreement.masked_account, next_step="complete")

    def cancel_agreement(self, agreement):
        return AgreementResult("cancelled", agreement_id=agreement.agreement_id or "", masked_account=agreement.masked_account)

    def create_payment(self, transaction):
        payment_id = f"MOCK_PAY_{uuid.uuid4().hex.upper()}"
        return ProviderResult("pending", payment_id, checkout_url=f"{settings.BKASH_FRONTEND_RETURN_URL}?transaction={transaction.public_id}", amount=transaction.amount, currency=transaction.currency, merchant_invoice=transaction.merchant_invoice_number, agreement_id=transaction.agreement.agreement_id)

    def execute_payment(self, transaction, simulation=None):
        # This state is server-side only. The browser can request a simulation in
        # DEBUG mock mode; it cannot provide money, invoice, or gateway IDs.
        state = simulation or transaction.raw_metadata.get("mock_result", "pending")
        if state == "complete":
            return ProviderResult("completed", transaction.provider_payment_id, f"MOCK_TRX_{uuid.uuid4().hex.upper()}", amount=transaction.amount, currency=transaction.currency, merchant_invoice=transaction.merchant_invoice_number, agreement_id=transaction.agreement.agreement_id)
        if state == "fail":
            return ProviderResult("failed", transaction.provider_payment_id, message="Mock provider declined the payment.")
        if state == "cancel":
            return ProviderResult("cancelled", transaction.provider_payment_id, message="Mock checkout was cancelled.")
        return ProviderResult("pending", transaction.provider_payment_id, message="Mock payment is still pending.")

    def query_payment(self, transaction):
        return self.execute_payment(transaction)


class RealBkashProvider:
    """Fail-closed boundary for merchant-issued Checkout API configuration.

    bKash issues endpoint/version details with each merchant integration. We do
    not guess those values here; configured sandbox/live URLs and credentials
    are required before an outbound request is permitted.
    """
    required = ("BKASH_APP_KEY", "BKASH_APP_SECRET", "BKASH_USERNAME", "BKASH_PASSWORD", "BKASH_TOKEN_URL", "BKASH_CREATE_PAYMENT_URL", "BKASH_EXECUTE_PAYMENT_URL", "BKASH_QUERY_PAYMENT_URL")

    def __init__(self):
        missing = [name for name in self.required if not getattr(settings, name, "") or str(getattr(settings, name)).startswith("mock_")]
        if missing:
            raise ImproperlyConfigured("bKash merchant configuration is incomplete. Payment initiation is disabled until the merchant-issued settings are supplied.")

    def create_payment(self, transaction):
        raise ImproperlyConfigured("Live bKash Checkout is intentionally disabled until merchant-issued API endpoint mappings are configured.")

    def start_agreement(self, agreement):
        raise ImproperlyConfigured("Official hosted bKash Agreement is disabled until merchant-issued API mappings are configured.")

    def cancel_agreement(self, agreement):
        raise ImproperlyConfigured("Official bKash Agreement cancellation is disabled until merchant-issued API mappings are configured.")

    def execute_payment(self, transaction, simulation=None):
        raise ImproperlyConfigured("Live bKash Checkout is intentionally disabled until merchant-issued API endpoint mappings are configured.")

    def query_payment(self, transaction):
        raise ImproperlyConfigured("Live bKash Checkout is intentionally disabled until merchant-issued API endpoint mappings are configured.")


def get_bkash_provider():
    if settings.BKASH_MODE == "mock":
        if not settings.DEBUG or not settings.BKASH_MOCK_ENABLED:
            raise ImproperlyConfigured("Mock bKash is available only when DEBUG=True and BKASH_MOCK_ENABLED=true.")
        return MockBkashProvider()
    return RealBkashProvider()
