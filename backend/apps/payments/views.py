import hashlib

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.shortcuts import get_object_or_404
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AdmissionPaymentTransaction, PaymentWebhookEvent
from .serializers import BkashAgreementSerializer, PaymentTransactionSerializer
from .services import PaymentService


class IsPaymentAdmin(permissions.BasePermission):
    """Allow platform staff and organization administrators to audit payments."""

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (
                user.is_staff
                or user.is_superuser
                or user.roles.filter(code="institute-admin").exists()
            )
        )


def payment_response(record, created=False):
    data = PaymentTransactionSerializer(record).data
    data["mock_checkout"] = bool(settings.DEBUG and settings.BKASH_MODE == "mock")
    if data["mock_checkout"]:
        data["checkout_url"] = f"/student/payments/mock/{record.public_id}"
        data["mock_hints"] = {"account": settings.BKASH_MOCK_ACCOUNT, "otp": settings.BKASH_MOCK_OTP, "pin": settings.BKASH_MOCK_PIN}
    return Response({"data": data, "created": created})


class InitiateBkashPayment(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        try:
            record, created = PaymentService.initiate(request.data.get("application_id"), request.user)
        except (AdmissionPaymentTransaction.DoesNotExist, ImproperlyConfigured) as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return payment_response(record, created)


class ExecuteBkashPayment(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        try:
            record = PaymentService.execute(request.data.get("transaction_id"), request.user, request.data.get("simulation"))
        except ImproperlyConfigured:
            return Response({"detail": "Online payment is temporarily unavailable."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        return payment_response(record)


class StartBkashAgreement(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        try:
            agreement = PaymentService.start_agreement(request.data.get("transaction_id"), request.user)
        except ImproperlyConfigured:
            return Response({"detail": "Online payment is temporarily unavailable."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        return Response({"data": BkashAgreementSerializer(agreement).data})


class BkashAgreementStep(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, step):
        agreement = PaymentService.agreement_step(request.data.get("transaction_id"), request.user, step, request.data.get("value"))
        return Response({"data": BkashAgreementSerializer(agreement).data})


class CancelPayment(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, public_id):
        return payment_response(PaymentService.cancel(public_id, request.user))


class DisconnectAgreement(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, public_id):
        agreement = PaymentService.disconnect_agreement(public_id, request.user)
        return Response({"data": BkashAgreementSerializer(agreement).data})


class MyPaymentList(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        records = AdmissionPaymentTransaction.objects.filter(payer=request.user).select_related("application", "course")
        return Response({"data": PaymentTransactionSerializer(records, many=True).data})


class AdmissionPaymentContext(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, application_id):
        from apps.admissions.models import AdmissionApplication
        application = get_object_or_404(AdmissionApplication.objects.select_related("course"), pk=application_id, applicant=request.user)
        latest = AdmissionPaymentTransaction.objects.filter(application=application, payer=request.user).select_related("course", "application").first()
        data = PaymentTransactionSerializer(latest).data if latest else {
            "application": application.id,
            "application_no": application.application_no,
            "admission_name": application.course.title if application.course_id else "Admission",
            "amount": str(application.course.admission_fee if application.course_id else 0),
            "currency": settings.BKASH_CURRENCY,
            "environment": settings.BKASH_MODE,
            "status": application.payment_status,
        }
        data["application_status"] = application.status
        return Response({"data": data})


class PaymentDetail(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, public_id):
        record = get_object_or_404(AdmissionPaymentTransaction.objects.select_related("application", "course"), public_id=public_id, payer=request.user)
        return payment_response(record)


class PaymentStatusView(PaymentDetail):
    def post(self, request, public_id):
        record = PaymentService.execute(public_id, request.user)
        return payment_response(record)


class BkashCallback(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    def post(self, request):
        # A callback parameter is never treated as proof; provider query/execute
        # must validate the stored transaction before completion.
        public_id = request.data.get("transaction")
        if not public_id:
            return Response({"detail": "transaction is required"}, status=400)
        record = PaymentService.execute(public_id)
        # Redirect/callback callers receive no applicant or financial record.
        # The authenticated result page reads the owned transaction separately.
        return Response({"data": {"accepted": True, "status": record.status}})


class BkashWebhook(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        # Mock notifications are never accepted as a public payment-completion
        # mechanism. Live signature validation is intentionally unavailable
        # until bKash provides the merchant-specific webhook specification.
        if settings.BKASH_MODE == "mock" or not settings.BKASH_WEBHOOK_SECRET:
            return Response({"detail": "Webhook processing is not configured."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        supplied = request.headers.get("X-Bkash-Event-Id") or request.data.get("event_id")
        if not supplied:
            return Response({"detail": "Missing merchant webhook event identifier."}, status=400)
        transaction_id = request.data.get("merchant_invoice_number")
        record = AdmissionPaymentTransaction.objects.filter(merchant_invoice_number=transaction_id).first()
        if not record:
            return Response({"detail": "Unknown payment transaction."}, status=404)
        event_key = hashlib.sha256(str(supplied).encode()).hexdigest()
        event, created = PaymentWebhookEvent.objects.get_or_create(
            event_key=event_key,
            defaults={"organization": record.organization, "transaction": record, "event_type": str(request.data.get("event_type", "")), "payload": {}},
        )
        if not created:
            return Response({"data": {"accepted": True, "duplicate": True}})
        # No payload status is trusted. The merchant-specific verifier must
        # query the gateway and then call the same PaymentService path.
        return Response({"data": {"accepted": True, "verified": False}}, status=status.HTTP_202_ACCEPTED)


class AdminPaymentList(APIView):
    permission_classes = [IsPaymentAdmin]
    def get(self, request):
        records = AdmissionPaymentTransaction.objects.select_related("application", "course", "payer").all()
        if not request.user.is_superuser:
            records = records.filter(organization=request.user.organization_id)
        if request.query_params.get("status"):
            records = records.filter(status=request.query_params["status"])
        if request.query_params.get("application"):
            records = records.filter(application_id=request.query_params["application"])
        if request.query_params.get("course"):
            records = records.filter(course_id=request.query_params["course"])
        if request.query_params.get("date_from"):
            records = records.filter(created_at__date__gte=request.query_params["date_from"])
        if request.query_params.get("date_to"):
            records = records.filter(created_at__date__lte=request.query_params["date_to"])
        if request.query_params.get("search"):
            from django.db.models import Q
            query = request.query_params["search"]
            records = records.filter(Q(merchant_invoice_number__icontains=query) | Q(transaction_id__icontains=query) | Q(application__application_no__icontains=query) | Q(application__applicant_name__icontains=query))
        return Response({"data": PaymentTransactionSerializer(records[:200], many=True).data})
