from rest_framework import permissions, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.generics import CreateAPIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken

from apps.core.permissions import HasActionPermission
from apps.core.responses import success_response
from .models import Permission, Role, User, UserLoginHistory
from .serializers import (
    LoginSerializer,
    PermissionSerializer,
    RegisterSerializer,
    RoleSerializer,
    UserLoginHistorySerializer,
    UserSerializer,
)


class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        user_data = response.data.get("user")
        if user_data:
            UserLoginHistory.objects.create(
                user_id=user_data["id"],
                ip_address=request.META.get("REMOTE_ADDR"),
                user_agent=request.META.get("HTTP_USER_AGENT", ""),
            )
        return response


class RefreshView(TokenRefreshView):
    from .session_views import ManagedRefreshSerializer
    serializer_class = ManagedRefreshSerializer


class RegisterView(CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        return success_response(response.data, message="Account created successfully.", status=response.status_code)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    refresh = request.data.get("refresh")
    if refresh:
        token = RefreshToken(refresh)
        if str(token["user_id"]) == str(request.user.pk):
            token.blacklist()
    from .sessions import validate_session
    from django.utils import timezone
    current = validate_session(request.auth, request.user.pk)
    if current:
        current.revoked_at = timezone.now()
        current.save(update_fields=["revoked_at"])
    return success_response(message="Logged out successfully.")


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def me_view(request):
    return success_response(UserSerializer(request.user).data)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.select_related("organization", "branch").prefetch_related("roles")
    serializer_class = UserSerializer
    permission_classes = [HasActionPermission]
    permission_module = "user"
    search_fields = ("username", "email", "first_name", "last_name", "phone")
    filterset_fields = ("organization", "branch", "is_active", "is_staff")


class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.prefetch_related("permissions")
    serializer_class = RoleSerializer
    permission_classes = [HasActionPermission]
    permission_module = "user"
    search_fields = ("name", "code")
    filterset_fields = ("organization", "is_system")


class PermissionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ("code", "name", "module")
    filterset_fields = ("module",)


class UserLoginHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = UserLoginHistory.objects.select_related("user")
    serializer_class = UserLoginHistorySerializer
    permission_classes = [HasActionPermission]
    permission_module = "user"
    search_fields = ("user__username", "user__email", "ip_address")
