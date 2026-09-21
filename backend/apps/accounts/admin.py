from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from apps.core.admin_utils import OrganizationScopedAdmin
from .models import Permission, Role, User, UserLoginHistory


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "module")
    list_filter = ("module",)
    search_fields = ("code", "name", "module", "description")
    ordering = ("module", "code")
    list_per_page = 50


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "organization", "is_system")
    list_filter = ("organization", "is_system")
    search_fields = ("name", "code", "permissions__code", "permissions__name")
    raw_id_fields = ("organization",)
    filter_horizontal = ("permissions",)
    ordering = ("organization", "name")
    list_per_page = 50


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = (
        "email",
        "username",
        "first_name",
        "last_name",
        "phone",
        "organization",
        "branch",
        "is_active",
        "is_staff",
        "is_superuser",
    )
    list_filter = ("is_active", "is_staff", "is_superuser", "organization", "branch", "roles")
    search_fields = ("email", "username", "first_name", "last_name", "phone")
    ordering = ("email",)
    raw_id_fields = ("organization", "branch")
    filter_horizontal = ("groups", "user_permissions", "roles")
    readonly_fields = ("last_login", "date_joined")
    list_select_related = ("organization", "branch")
    fieldsets = UserAdmin.fieldsets + (
        (
            "School Access",
            {"fields": ("organization", "branch", "phone", "avatar", "roles")},
        ),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (
            "School Access",
            {"fields": ("email", "phone", "organization", "branch", "roles")},
        ),
    )

    def get_queryset(self, request):
        qs = super().get_queryset(request).select_related("organization", "branch").prefetch_related("roles")
        if request.user.is_superuser:
            return qs
        if getattr(request.user, "organization_id", None):
            return qs.filter(organization=request.user.organization)
        return qs.none()


@admin.register(UserLoginHistory)
class UserLoginHistoryAdmin(OrganizationScopedAdmin):
    list_display = ("user", "ip_address", "created_at")
    list_filter = ("created_at",)
    search_fields = ("user__email", "user__username", "ip_address", "user_agent")
    raw_id_fields = ("user",)
    readonly_fields = ("user", "ip_address", "user_agent", "created_at")

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
