from rest_framework.permissions import BasePermission, IsAuthenticated


class IsAuthenticatedAndScoped(IsAuthenticated):
    pass


class HasActionPermission(BasePermission):
    """
    Checks `required_permission` on a view, for example `student.view`.
    Superusers always pass.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True

        required = getattr(view, "required_permission", None)
        if not required:
            return True

        return request.user.has_app_permission(required)

