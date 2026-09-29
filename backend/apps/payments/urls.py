from django.urls import path
from . import views

urlpatterns = [
    path("bkash/initiate/", views.InitiateBkashPayment.as_view()),
    path("bkash/execute/", views.ExecuteBkashPayment.as_view()),
    path("bkash/agreement/start/", views.StartBkashAgreement.as_view()),
    path("bkash/agreement/<str:step>/", views.BkashAgreementStep.as_view()),
    path("bkash/callback/", views.BkashCallback.as_view()),
    path("bkash/webhook/", views.BkashWebhook.as_view()),
    path("me/", views.MyPaymentList.as_view()),
    path("admissions/<int:application_id>/", views.AdmissionPaymentContext.as_view()),
    path("<uuid:public_id>/cancel/", views.CancelPayment.as_view()),
    path("agreements/<uuid:public_id>/disconnect/", views.DisconnectAgreement.as_view()),
    path("<uuid:public_id>/", views.PaymentDetail.as_view()),
    path("<uuid:public_id>/status/", views.PaymentStatusView.as_view()),
    path("admin/", views.AdminPaymentList.as_view()),
]
