from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("categories", views.ContentCategoryViewSet)
router.register("content", views.ContentItemViewSet)
router.register("gallery", views.GalleryItemViewSet)
router.register("settings", views.WebsiteSettingViewSet)
router.register("banners", views.BannerViewSet)
router.register("success-stories", views.SuccessStoryViewSet)
router.register("renowned-teachers", views.RenownedTeacherViewSet)

urlpatterns = router.urls

