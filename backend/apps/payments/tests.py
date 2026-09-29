from django.contrib.auth import get_user_model
from django.test import override_settings
from rest_framework.test import APITestCase
from unittest.mock import patch

from apps.admissions.models import AdmissionApplication, ApplicationStatus
from apps.admissions.services import AdmissionService
from apps.courses.models import Course, CourseStatus, CourseType, Enrollment, EnrollmentStatus
from apps.organizations.models import Organization
from apps.messaging.models import Notification
from apps.payments.models import AdmissionPaymentTransaction, AgreementStatus, BkashAgreement, PaymentStatus


@override_settings(DEBUG=True, BKASH_MODE="mock", BKASH_MOCK_ENABLED=True)
class MockAdmissionPaymentTests(APITestCase):
    def setUp(self):
        self.organization = Organization.objects.create(name="Payment tests", code="payment-tests")
        User = get_user_model()
        self.student_user = User.objects.create_user(username="payment_student", email="payment.student@example.test", password="safe-password", organization=self.organization)
        self.other_user = User.objects.create_user(username="payment_other", email="payment.other@example.test", password="safe-password", organization=self.organization)
        self.course = Course.objects.create(organization=self.organization, title="Paid admission", slug="paid-admission", course_type=CourseType.ADMISSION, status=CourseStatus.ADMISSION_OPEN, is_published=True, admission_fee="1500.00")
        self.application = AdmissionApplication.objects.create(organization=self.organization, application_no="ADM-PAY-001", applicant=self.student_user, course=self.course, applicant_name="Payment Student", applicant_phone="01700000000", applicant_email=self.student_user.email, status=ApplicationStatus.PENDING)
        AdmissionService.approve_application(self.application, self.student_user)
        self.client.force_authenticate(self.student_user)

    def initiate(self):
        response = self.client.post("/api/v1/payments/bkash/initiate/", {"application_id": self.application.id}, format="json")
        self.assertEqual(response.status_code, 200, response.data)
        return response.data["data"]

    def create_agreement(self, record):
        started = self.client.post("/api/v1/payments/bkash/agreement/start/", {"transaction_id": record["public_id"]}, format="json")
        self.assertEqual(started.status_code, 200, started.data)
        for step, value in (("account", "01700000000"), ("otp", "123456"), ("pin", "12121")):
            response = self.client.post(f"/api/v1/payments/bkash/agreement/{step}/", {"transaction_id": record["public_id"], "value": value}, format="json")
            self.assertEqual(response.status_code, 200, response.data)
        agreement = BkashAgreement.objects.get()
        self.assertEqual(agreement.status, AgreementStatus.ACTIVE)
        self.assertTrue(agreement.agreement_id.startswith("MOCK_AGR_"))
        self.assertNotIn("123456", str(agreement.raw_metadata))
        self.assertNotIn("12121", str(agreement.raw_metadata))
        return agreement

    def test_mock_success_is_verified_once_and_activates_one_enrollment(self):
        record = self.initiate()
        self.create_agreement(record)
        response = self.client.post("/api/v1/payments/bkash/execute/", {"transaction_id": record["public_id"], "simulation": "complete"}, format="json")
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data["data"]["status"], PaymentStatus.COMPLETED)
        self.assertEqual(Enrollment.objects.filter(application=self.application, status=EnrollmentStatus.ACTIVE).count(), 1)
        # Duplicate execute cannot create another enrollment or payment completion.
        self.client.post("/api/v1/payments/bkash/execute/", {"transaction_id": record["public_id"], "simulation": "complete"}, format="json")
        self.assertEqual(Enrollment.objects.filter(application=self.application, status=EnrollmentStatus.ACTIVE).count(), 1)
        self.assertEqual(Notification.objects.filter(recipient=self.student_user, notification_type=f"admission_payment_verified_{self.application.id}").count(), 1)
        self.assertEqual(Notification.objects.filter(recipient=self.student_user, notification_type=f"admission_enrollment_active_{self.application.id}").count(), 1)

    def test_manual_success_callback_does_not_complete_payment(self):
        record = self.initiate()
        response = self.client.post("/api/v1/payments/bkash/callback/", {"transaction": record["public_id"], "status": "success"}, format="json")
        self.assertEqual(response.status_code, 400, response.data)
        duplicate = self.client.post("/api/v1/payments/bkash/callback/", {"transaction": record["public_id"], "status": "success"}, format="json")
        self.assertEqual(duplicate.status_code, 400, duplicate.data)
        self.assertFalse(Enrollment.objects.filter(application=self.application, status=EnrollmentStatus.ACTIVE).exists())
        self.assertEqual(AdmissionPaymentTransaction.objects.filter(application=self.application).count(), 1)

    def test_amount_cannot_be_tampered_and_other_student_cannot_pay(self):
        response = self.client.post("/api/v1/payments/bkash/initiate/", {"application_id": self.application.id, "amount": "1.00"}, format="json")
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(str(AdmissionPaymentTransaction.objects.get().amount), "1500.00")
        self.client.force_authenticate(self.other_user)
        forbidden = self.client.post("/api/v1/payments/bkash/initiate/", {"application_id": self.application.id}, format="json")
        self.assertEqual(forbidden.status_code, 400)

    def test_wrong_mock_credentials_are_rejected_and_not_persisted(self):
        record = self.initiate()
        self.client.post("/api/v1/payments/bkash/agreement/start/", {"transaction_id": record["public_id"]}, format="json")
        wrong_account = self.client.post("/api/v1/payments/bkash/agreement/account/", {"transaction_id": record["public_id"], "value": "01999999999"}, format="json")
        self.assertEqual(wrong_account.status_code, 400)
        self.client.post("/api/v1/payments/bkash/agreement/account/", {"transaction_id": record["public_id"], "value": "01700000000"}, format="json")
        wrong_otp = self.client.post("/api/v1/payments/bkash/agreement/otp/", {"transaction_id": record["public_id"], "value": "000000"}, format="json")
        self.assertEqual(wrong_otp.status_code, 400)
        self.client.post("/api/v1/payments/bkash/agreement/otp/", {"transaction_id": record["public_id"], "value": "123456"}, format="json")
        wrong_pin = self.client.post("/api/v1/payments/bkash/agreement/pin/", {"transaction_id": record["public_id"], "value": "00000"}, format="json")
        self.assertEqual(wrong_pin.status_code, 400)
        agreement = BkashAgreement.objects.get()
        self.assertEqual(agreement.raw_metadata, {"stage": "pin"})
        for secret in ("01999999999", "000000", "00000", "123456"):
            self.assertNotIn(secret, str(agreement.raw_metadata))

    def test_active_agreement_is_reused_for_second_admission(self):
        first = self.initiate()
        agreement = self.create_agreement(first)
        other_course = Course.objects.create(organization=self.organization, title="Second paid admission", slug="second-paid-admission", course_type=CourseType.ADMISSION, status=CourseStatus.ADMISSION_OPEN, is_published=True, admission_fee="500.00")
        other_application = AdmissionApplication.objects.create(organization=self.organization, application_no="ADM-PAY-002", applicant=self.student_user, course=other_course, applicant_name="Payment Student", applicant_phone="01700000000", applicant_email=self.student_user.email, status=ApplicationStatus.PENDING)
        AdmissionService.approve_application(other_application, self.student_user)
        response = self.client.post("/api/v1/payments/bkash/initiate/", {"application_id": other_application.id}, format="json")
        self.assertEqual(response.status_code, 200, response.data)
        second = AdmissionPaymentTransaction.objects.get(application=other_application)
        self.assertEqual(second.agreement, agreement)
        self.assertEqual(second.status, PaymentStatus.READY_FOR_PAYMENT)

    def test_failed_and_cancelled_payments_never_enroll_and_can_be_retried(self):
        failed = self.initiate()
        self.create_agreement(failed)
        response = self.client.post("/api/v1/payments/bkash/execute/", {"transaction_id": failed["public_id"], "simulation": "fail"}, format="json")
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data["data"]["status"], PaymentStatus.FAILED)
        self.assertFalse(Enrollment.objects.filter(application=self.application).exists())

        retry = self.initiate()
        self.assertNotEqual(retry["public_id"], failed["public_id"])
        response = self.client.post("/api/v1/payments/bkash/execute/", {"transaction_id": retry["public_id"], "simulation": "cancel"}, format="json")
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data["data"]["status"], PaymentStatus.CANCELLED)
        self.assertFalse(Enrollment.objects.filter(application=self.application).exists())

    def test_pending_payment_does_not_enroll_until_later_verified_success(self):
        record = self.initiate()
        self.create_agreement(record)
        pending = self.client.post("/api/v1/payments/bkash/execute/", {"transaction_id": record["public_id"], "simulation": "pending"}, format="json")
        self.assertEqual(pending.status_code, 200, pending.data)
        self.assertEqual(pending.data["data"]["status"], PaymentStatus.PENDING)
        self.assertFalse(Enrollment.objects.filter(application=self.application).exists())
        completed = self.client.post("/api/v1/payments/bkash/execute/", {"transaction_id": record["public_id"], "simulation": "complete"}, format="json")
        self.assertEqual(completed.data["data"]["status"], PaymentStatus.COMPLETED)
        self.assertEqual(Enrollment.objects.filter(application=self.application, status=EnrollmentStatus.ACTIVE).count(), 1)

    def test_other_student_cannot_view_transaction_or_receipt(self):
        record = self.initiate()
        self.client.force_authenticate(self.other_user)
        detail = self.client.get(f"/api/v1/payments/{record['public_id']}/")
        status_check = self.client.post(f"/api/v1/payments/{record['public_id']}/status/")
        self.assertEqual(detail.status_code, 404)
        self.assertEqual(status_check.status_code, 404)

    def test_verified_payment_survives_enrollment_failure_and_retries_without_recharge(self):
        record = self.initiate()
        self.create_agreement(record)
        with patch("apps.payments.services.AdmissionService.activate_application_enrollment", side_effect=RuntimeError("temporary enrollment error")):
            response = self.client.post("/api/v1/payments/bkash/execute/", {"transaction_id": record["public_id"], "simulation": "complete"}, format="json")
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data["data"]["status"], PaymentStatus.COMPLETED)
        self.assertEqual(response.data["data"]["enrollment_activation_status"], "failed")
        self.assertFalse(Enrollment.objects.filter(application=self.application).exists())
        transaction_id = response.data["data"]["transaction_id"]
        provider_payment_id = response.data["data"]["provider_payment_id"]

        retried = self.client.post("/api/v1/payments/bkash/execute/", {"transaction_id": record["public_id"]}, format="json")
        self.assertEqual(retried.data["data"]["status"], PaymentStatus.COMPLETED)
        self.assertEqual(retried.data["data"]["enrollment_activation_status"], "active")
        self.assertEqual(retried.data["data"]["transaction_id"], transaction_id)
        self.assertEqual(retried.data["data"]["provider_payment_id"], provider_payment_id)
        self.assertEqual(Enrollment.objects.filter(application=self.application, status=EnrollmentStatus.ACTIVE).count(), 1)
