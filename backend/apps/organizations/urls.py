from rest_framework.routers import DefaultRouter
from .views import BranchViewSet, OrganizationViewSet

router = DefaultRouter()
router.register("branches", BranchViewSet)
router.register("", OrganizationViewSet)

urlpatterns = router.urls

