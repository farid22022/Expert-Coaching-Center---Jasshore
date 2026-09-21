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

        required = self.get_required_permission(view)
        if not required:
            return True

        return request.user.has_app_permission(required)

    def get_required_permission(self, view):
        explicit = getattr(view, "required_permission", None)
        if explicit:
            return explicit

        module = getattr(view, "permission_module", None)
        if not module:
            return None

        action = getattr(view, "action", None)
        action_map = {
            "list": "view",
            "retrieve": "view",
            "create": "create",
            "update": "edit",
            "partial_update": "edit",
            "destroy": "delete",
            "approve": "approve",
            "reject": "reject",
            "process": "process",
            "process_result": "process",
            "publish": "publish",
            "queue": "send",
            "generate_salary": "create",
        }
        permission_action = action_map.get(action)
        if not permission_action:
            return f"{module}.view"
        return f"{module}.{permission_action}"
