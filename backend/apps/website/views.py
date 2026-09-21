from rest_framework.permissions import AllowAny
from apps.core.permissions import HasActionPermission
from apps.core.viewsets import OrganizationScopedModelViewSet
from . import models, serializers


class WebsiteViewSet(OrganizationScopedModelViewSet):
    permission_classes = [HasActionPermission]

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

