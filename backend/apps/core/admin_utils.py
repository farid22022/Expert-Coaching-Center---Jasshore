from django import forms
from django.contrib import admin, messages
from django.db import models
from django.utils.html import format_html


SENSITIVE_FIELD_NAMES = {
    "password",
    "api_key",
    "api_key_encrypted",
    "api_secret",
    "secret",
    "token",
    "access_token",
    "refresh_token",
    "smtp_password",
}


def model_field_names(model):
    return {field.name for field in model._meta.fields}


def fields_present(model, candidates):
    names = model_field_names(model)
    return tuple(field for field in candidates if field in names)


def related_fields_present(model):
    return tuple(
        field.name
        for field in model._meta.fields
        if isinstance(field, (models.ForeignKey, models.OneToOneField))
    )


def many_to_many_fields_present(model):
    return tuple(field.name for field in model._meta.many_to_many)


def first_date_field(model):
    preferred = (
        "created_at",
        "updated_at",
        "published_at",
        "sent_at",
        "paid_at",
        "exam_date",
        "starts_on",
        "expense_date",
        "income_date",
    )
    for field_name in preferred:
        if field_name in model_field_names(model):
            field = model._meta.get_field(field_name)
            if isinstance(field, (models.DateField, models.DateTimeField)):
                return field_name
    return None


def display_fields(model, preferred=()):
    base = ("id",) + tuple(preferred)
    fallback = (
        "name",
        "title",
        "code",
        "full_name",
        "student_id",
        "employee_id",
        "application_no",
        "email",
        "phone",
        "status",
        "is_active",
        "created_at",
    )
    fields = []
    for field_name in base + fallback:
        if (
            field_name in model_field_names(model)
            and field_name not in SENSITIVE_FIELD_NAMES
            and field_name not in fields
        ):
            fields.append(field_name)
    return tuple(fields[:8]) or ("id",)


def search_fields(model, preferred=()):
    searchable_types = (
        models.CharField,
        models.TextField,
        models.EmailField,
        models.SlugField,
        models.URLField,
    )
    fields = []
    for field_name in preferred:
        if field_name in model_field_names(model) and field_name not in SENSITIVE_FIELD_NAMES:
            fields.append(field_name)
    for field in model._meta.fields:
        if field.name in SENSITIVE_FIELD_NAMES:
            continue
        if isinstance(field, searchable_types) and field.name not in fields:
            fields.append(field.name)
    return tuple(fields[:10])


def filter_fields(model, preferred=()):
    names = model_field_names(model)
    filters = []
    for field_name in preferred:
        if field_name in names:
            filters.append(field_name)
    for field in model._meta.fields:
        if field.name in filters:
            continue
        if isinstance(field, (models.BooleanField, models.DateField, models.DateTimeField)):
            filters.append(field.name)
        elif isinstance(field, models.CharField) and (field.choices or field.name in {"status", "type", "employee_type"}):
            filters.append(field.name)
        elif isinstance(field, models.ForeignKey) and field.name in {
            "organization",
            "branch",
            "session",
            "academic_class",
            "section",
            "category",
            "department",
            "designation",
        }:
            filters.append(field.name)
    return tuple(filters[:10])


def readonly_fields(model, extra=()):
    names = model_field_names(model)
    candidates = (
        "id",
        "created_at",
        "updated_at",
        "created_by",
        "updated_by",
        "processed_at",
        "published_at",
        "sent_at",
        "paid_at",
    ) + tuple(extra)
    return tuple(field for field in candidates if field in names)


class OrganizationScopedAdmin(admin.ModelAdmin):
    list_per_page = 50
    save_on_top = True

    def get_list_display(self, request):
        return display_fields(self.model)

    def get_search_fields(self, request):
        return search_fields(self.model)

    def get_list_filter(self, request):
        return filter_fields(self.model)

    def get_raw_id_fields(self, request):
        return related_fields_present(self.model)

    def get_filter_horizontal(self, request):
        return many_to_many_fields_present(self.model)

    def get_readonly_fields(self, request, obj=None):
        return readonly_fields(self.model)

    def get_date_hierarchy(self, request):
        return None

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        related = related_fields_present(self.model)
        if related:
            qs = qs.select_related(*related)
        if request.user.is_superuser:
            return qs
        if "organization" in model_field_names(self.model) and getattr(request.user, "organization_id", None):
            return qs.filter(organization=request.user.organization)
        return qs

    def save_model(self, request, obj, form, change):
        if "organization" in model_field_names(obj.__class__) and not obj.organization_id:
            obj.organization = getattr(request.user, "organization", None)
        if "created_by" in model_field_names(obj.__class__) and not change and not obj.created_by_id:
            obj.created_by = request.user
        if "updated_by" in model_field_names(obj.__class__):
            obj.updated_by = request.user
        super().save_model(request, obj, form, change)


class SensitiveTextInput(forms.PasswordInput):
    def __init__(self, *args, **kwargs):
        kwargs.setdefault("render_value", False)
        super().__init__(*args, **kwargs)


class SensitiveFieldsMixin:
    def formfield_for_dbfield(self, db_field, request, **kwargs):
        if db_field.name in SENSITIVE_FIELD_NAMES and isinstance(db_field, models.TextField):
            kwargs["widget"] = SensitiveTextInput
        return super().formfield_for_dbfield(db_field, request, **kwargs)


def mark_status(status_value, label):
    def action(modeladmin, request, queryset):
        if "status" not in model_field_names(modeladmin.model):
            modeladmin.message_user(request, "This model has no status field.", messages.WARNING)
            return
        updated = queryset.update(status=status_value)
        modeladmin.message_user(request, f"{updated} record(s) marked as {label}.", messages.SUCCESS)

    action.__name__ = f"mark_selected_as_{status_value}"
    action.short_description = f"Mark selected as {label}"
    return action


def activate(modeladmin, request, queryset):
    field_name = "is_active" if "is_active" in model_field_names(modeladmin.model) else "status"
    if field_name == "is_active":
        updated = queryset.update(is_active=True)
    elif "status" in model_field_names(modeladmin.model):
        updated = queryset.update(status="active")
    else:
        modeladmin.message_user(request, "This model has no active/status field.", messages.WARNING)
        return
    modeladmin.message_user(request, f"{updated} record(s) activated.", messages.SUCCESS)


activate.short_description = "Activate selected records"


def deactivate(modeladmin, request, queryset):
    field_name = "is_active" if "is_active" in model_field_names(modeladmin.model) else "status"
    if field_name == "is_active":
        updated = queryset.update(is_active=False)
    elif "status" in model_field_names(modeladmin.model):
        updated = queryset.update(status="inactive")
    else:
        modeladmin.message_user(request, "This model has no active/status field.", messages.WARNING)
        return
    modeladmin.message_user(request, f"{updated} record(s) deactivated.", messages.SUCCESS)


deactivate.short_description = "Deactivate selected records"


@admin.display(description="Status")
def status_badge(obj):
    status = getattr(obj, "status", "")
    colors = {
        "active": "#137333",
        "approved": "#137333",
        "published": "#137333",
        "sent": "#137333",
        "inactive": "#5f6368",
        "pending": "#b06000",
        "queued": "#b06000",
        "draft": "#5f6368",
        "rejected": "#b3261e",
        "failed": "#b3261e",
    }
    color = colors.get(str(status).lower(), "#1f2937")
    return format_html(
        '<span style="border-radius:999px;padding:2px 8px;background:{}22;color:{};font-weight:600;">{}</span>',
        color,
        color,
        status or "-",
    )
