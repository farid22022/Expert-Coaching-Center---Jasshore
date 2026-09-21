from django.contrib import admin

from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("created_at", "organization", "user", "action", "entity", "record_id", "ip_address")
    list_filter = ("organization", "action", "entity", "created_at")
    search_fields = ("action", "entity", "record_id", "user__email", "user__username", "ip_address")
    raw_id_fields = ("organization", "user")
    readonly_fields = ("organization", "user", "action", "entity", "record_id", "old_values", "new_values", "ip_address", "created_at")
    list_select_related = ("organization", "user")
    list_per_page = 50

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
