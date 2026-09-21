from django.contrib import admin

from apps.core.admin_utils import activate, deactivate
from .models import Branch, Organization


class BranchInline(admin.TabularInline):
    model = Branch
    extra = 0
    fields = ("name", "code", "phone", "is_active")


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "email", "phone", "established_year", "is_active", "created_at")
    list_filter = ("is_active", "established_year", "created_at")
    search_fields = ("name", "name_bn", "code", "email", "phone", "address")
    readonly_fields = ("created_at", "updated_at")
    inlines = (BranchInline,)
    actions = (activate, deactivate)
    list_per_page = 50


@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "organization", "phone", "is_active", "created_at")
    list_filter = ("organization", "is_active", "created_at")
    search_fields = ("name", "code", "phone", "address", "organization__name")
    raw_id_fields = ("organization",)
    readonly_fields = ("created_at", "updated_at")
    actions = (activate, deactivate)
    list_select_related = ("organization",)
    list_per_page = 50

