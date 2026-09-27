from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("contact-categories", views.ContactCategoryViewSet)
router.register("contacts", views.ContactViewSet)
router.register("providers", views.SmsProviderViewSet)
router.register("templates", views.SmsTemplateViewSet)
router.register("campaigns", views.SmsCampaignViewSet)
router.register("recipients", views.SmsRecipientViewSet)
router.register("logs", views.SmsLogViewSet)
router.register("email-templates", views.EmailTemplateViewSet)
router.register("email-logs", views.EmailLogViewSet)
router.register("notifications", views.NotificationViewSet, basename="notification")
router.register("notices", views.NoticeViewSet, basename="notice")

urlpatterns = router.urls
