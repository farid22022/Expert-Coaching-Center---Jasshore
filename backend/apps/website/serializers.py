from rest_framework import serializers
from . import models


def serializer_for(model):
    return type(f"{model.__name__}Serializer", (serializers.ModelSerializer,), {"Meta": type("Meta", (), {"model": model, "fields": "__all__"})})


ContentCategorySerializer = serializer_for(models.ContentCategory)
ContentItemSerializer = serializer_for(models.ContentItem)
GalleryItemSerializer = serializer_for(models.GalleryItem)
WebsiteSettingSerializer = serializer_for(models.WebsiteSetting)

