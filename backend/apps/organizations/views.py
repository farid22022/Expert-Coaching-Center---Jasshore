from rest_framework import viewsets
from apps.core.permissions import HasActionPermission
from .models import Branch, Organization
from .serializers import BranchSerializer, OrganizationSerializer


class OrganizationViewSet(viewsets.ModelViewSet):
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer
    permission_classes = [HasActionPermission]
    search_fields = ("name", "code", "phone", "email")
    ordering_fields = ("name", "created_at")


class BranchViewSet(viewsets.ModelViewSet):
    queryset = Branch.objects.select_related("organization")
    serializer_class = BranchSerializer
    permission_classes = [HasActionPermission]
    search_fields = ("name", "code", "phone")
    filterset_fields = ("organization", "is_active")

