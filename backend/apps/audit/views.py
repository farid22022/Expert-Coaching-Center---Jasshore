from rest_framework.viewsets import ReadOnlyModelViewSet
from apps.core.permissions import HasActionPermission
from .models import AuditLog
from .serializers import AuditLogSerializer


class AuditLogViewSet(ReadOnlyModelViewSet):
    queryset = AuditLog.objects.select_related("organization", "user")
    serializer_class = AuditLogSerializer
    permission_classes = [HasActionPermission]
    permission_module = "report"
    search_fields = ("action", "entity", "record_id", "user__username")
    filterset_fields = ("organization", "action", "entity", "user")
