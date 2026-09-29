from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.core.permissions import HasActionPermission
from .models import Branch, Organization
from .serializers import BranchSerializer, OrganizationSerializer, PublicOrganizationSerializer


class OrganizationViewSet(viewsets.ModelViewSet):
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer
    permission_classes = [HasActionPermission]
    permission_module = "organization"
    search_fields = ("name", "code", "phone", "email")
    ordering_fields = ("name", "created_at")

    @action(detail=False, methods=["get"], permission_classes=[permissions.AllowAny], authentication_classes=[])
    def public(self, request):
        org = Organization.objects.filter(is_active=True).first()
        if not org:
            return Response({})
        return Response(PublicOrganizationSerializer(org, context={"request": request}).data)


class BranchViewSet(viewsets.ModelViewSet):
    queryset = Branch.objects.select_related("organization")
    serializer_class = BranchSerializer
    permission_classes = [HasActionPermission]
    search_fields = ("name", "code", "phone")
    filterset_fields = ("organization", "is_active")

