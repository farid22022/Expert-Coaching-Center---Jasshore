from django.urls import path
from rest_framework.routers import DefaultRouter
from .session_views import sessions_view, session_detail_view, personal_info_view, change_password_view, avatar_view
from .views import (
    LoginView,
    PermissionViewSet,
    RefreshView,
    RegisterView,
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
    path("me/sessions/", sessions_view, name="my_sessions"),
    path("me/sessions/<uuid:session_id>/", session_detail_view, name="my_session_detail"),
    path("me/profile/", personal_info_view, name="my_personal_info"),
    path("me/password/", change_password_view, name="my_password"),
    path("me/avatar/", avatar_view, name="my_avatar"),
    path("login/", LoginView.as_view(), name="token_obtain_pair"),
    path("register/", RegisterView.as_view(), name="register"),
    path("refresh/", RefreshView.as_view(), name="token_refresh"),
    path("logout/", logout_view, name="logout"),
    path("me/", me_view, name="me"),
] + router.urls
