from django.urls import path

from .views import ImageUploadView, ImgBBSettingsView, ImgBBTestView

urlpatterns = [
    path("integrations/imgbb/", ImgBBSettingsView.as_view(), name="integration-imgbb"),
    path("integrations/imgbb/test/", ImgBBTestView.as_view(), name="integration-imgbb-test"),
    path("uploads/images/", ImageUploadView.as_view(), name="image-upload"),
]
