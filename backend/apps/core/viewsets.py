from rest_framework import viewsets


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
        if hasattr(queryset.model, "organization_id"):
            return queryset.filter(organization=user.organization_id)
        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        kwargs = {"created_by": user, "updated_by": user}
        if hasattr(serializer.Meta.model, "organization_id"):
            kwargs["organization"] = user.organization
        serializer.save(**kwargs)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)
