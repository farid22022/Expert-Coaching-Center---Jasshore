from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("categories", views.ContentCategoryViewSet)
router.register("content", views.ContentItemViewSet)
router.register("gallery", views.GalleryItemViewSet)
router.register("settings", views.WebsiteSettingViewSet)

urlpatterns = router.urls

