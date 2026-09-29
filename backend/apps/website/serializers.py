from rest_framework import serializers
from . import models


def serializer_for(model):
    return type(f"{model.__name__}Serializer", (serializers.ModelSerializer,), {"Meta": type("Meta", (), {"model": model, "fields": "__all__"})})


ContentCategorySerializer = serializer_for(models.ContentCategory)
ContentItemSerializer = serializer_for(models.ContentItem)
GalleryItemSerializer = serializer_for(models.GalleryItem)
WebsiteSettingSerializer = serializer_for(models.WebsiteSetting)
BannerSerializer = serializer_for(models.Banner)
SuccessStorySerializer = serializer_for(models.SuccessStory)
RenownedTeacherSerializer = serializer_for(models.RenownedTeacher)


class PublicBannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Banner
        fields = ("id", "title", "subtitle", "image", "link_url", "display_order")


class PublicSuccessStorySerializer(serializers.ModelSerializer):
    class Meta:
        model = models.SuccessStory
        fields = ("id", "name", "outcome", "quote", "photo", "display_order")


class PublicRenownedTeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.RenownedTeacher
        fields = ("id", "name", "designation", "subject", "image", "bio", "years_experience", "badge", "display_order")

