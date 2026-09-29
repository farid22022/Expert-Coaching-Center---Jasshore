from rest_framework import permissions
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny

from apps.core.permissions import HasActionPermission
from apps.core.responses import success_response
from apps.core.viewsets import OrganizationScopedModelViewSet
from . import models, serializers


class WebsiteViewSet(OrganizationScopedModelViewSet):
    permission_classes = [HasActionPermission]
    permission_module = "academic"

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return super().get_permissions()


class ContentCategoryViewSet(WebsiteViewSet):
    queryset = models.ContentCategory.objects.all()
    serializer_class = serializers.ContentCategorySerializer
    filterset_fields = ("type",)
    search_fields = ("name", "slug")


class ContentItemViewSet(WebsiteViewSet):
    queryset = models.ContentItem.objects.select_related("category")
    serializer_class = serializers.ContentItemSerializer
    filterset_fields = ("type", "category", "published")
    search_fields = ("title", "summary", "body")


class GalleryItemViewSet(WebsiteViewSet):
    queryset = models.GalleryItem.objects.all()
    serializer_class = serializers.GalleryItemSerializer
    filterset_fields = ("type", "published")


class WebsiteSettingViewSet(WebsiteViewSet):
    queryset = models.WebsiteSetting.objects.all()
    serializer_class = serializers.WebsiteSettingSerializer
    filterset_fields = ("key",)


class BannerViewSet(OrganizationScopedModelViewSet):
    queryset = models.Banner.objects.all()
    serializer_class = serializers.BannerSerializer
    permission_classes = [HasActionPermission]
    permission_module = "website"
    filterset_fields = ("is_active",)

    @action(detail=False, methods=["get"], permission_classes=[permissions.AllowAny], authentication_classes=[])
    def public(self, request):
        queryset = models.Banner.objects.filter(is_active=True).order_by("display_order", "id")
        return success_response(serializers.PublicBannerSerializer(queryset, many=True, context={"request": request}).data)


class SuccessStoryViewSet(OrganizationScopedModelViewSet):
    queryset = models.SuccessStory.objects.all()
    serializer_class = serializers.SuccessStorySerializer
    permission_classes = [HasActionPermission]
    permission_module = "website"
    filterset_fields = ("is_active",)

    @action(detail=False, methods=["get"], permission_classes=[permissions.AllowAny], authentication_classes=[])
    def public(self, request):
        queryset = models.SuccessStory.objects.filter(is_active=True).order_by("display_order", "id")
        return success_response(serializers.PublicSuccessStorySerializer(queryset, many=True, context={"request": request}).data)


class RenownedTeacherViewSet(OrganizationScopedModelViewSet):
    queryset = models.RenownedTeacher.objects.all()
    serializer_class = serializers.RenownedTeacherSerializer
    permission_classes = [HasActionPermission]
    permission_module = "website"
    filterset_fields = ("is_active",)

    @action(detail=False, methods=["get"], permission_classes=[permissions.AllowAny], authentication_classes=[])
    def public(self, request):
        queryset = models.RenownedTeacher.objects.filter(is_active=True).order_by("display_order", "id")
        return success_response(serializers.PublicRenownedTeacherSerializer(queryset, many=True, context={"request": request}).data)
