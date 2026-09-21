from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    LoginView,
    PermissionViewSet,
    RefreshView,
    RoleViewSet,
    UserLoginHistoryViewSet,
    UserViewSet,
    logout_view,
    me_view,
)

router = DefaultRouter()
router.register("users", UserViewSet)
router.register("roles", RoleViewSet)
router.register("permissions", PermissionViewSet)
router.register("login-history", UserLoginHistoryViewSet)

urlpatterns = [
    path("login/", LoginView.as_view(), name="token_obtain_pair"),
    path("refresh/", RefreshView.as_view(), name="token_refresh"),
    path("logout/", logout_view, name="logout"),
    path("me/", me_view, name="me"),
] + router.urls

