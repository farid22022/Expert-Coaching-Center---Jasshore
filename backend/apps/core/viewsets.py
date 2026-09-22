from rest_framework import viewsets


def model_has_field(model, field_name):
    return any(field.name == field_name for field in model._meta.fields)


class OrganizationScopedModelViewSet(viewsets.ModelViewSet):
    """
    Default viewset for organization-scoped admin CRUD pages.
    """

    search_fields = ("id",)
    ordering_fields = ("id", "created_at", "updated_at")
    ordering = ("-created_at",)

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if getattr(user, "is_superuser", False):
            return queryset
        if model_has_field(queryset.model, "organization"):
            return queryset.filter(organization=user.organization_id)
        return queryset

    def get_serializer(self, *args, **kwargs):
        if self.request.method == "POST" and "data" in kwargs and hasattr(kwargs["data"], "copy"):
            data = kwargs["data"].copy()
            model = self.get_queryset().model
            if model_has_field(model, "organization") and "organization" not in data:
                data["organization"] = self.request.user.organization_id
            kwargs["data"] = data
        elif self.request.method == "POST" and args and hasattr(args[0], "copy"):
            data = args[0].copy()
            model = self.get_queryset().model
            if model_has_field(model, "organization") and "organization" not in data:
                data["organization"] = self.request.user.organization_id
            args = (data, *args[1:])
        return super().get_serializer(*args, **kwargs)

    def perform_create(self, serializer):
        user = self.request.user
        kwargs = {"created_by": user, "updated_by": user}
        if model_has_field(serializer.Meta.model, "organization"):
            kwargs["organization"] = user.organization
        serializer.save(**kwargs)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)
